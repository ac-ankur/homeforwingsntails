import React, {
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text, Html } from "@react-three/drei";
import * as THREE from "three";
import { RoboticArm } from "./Robotic Arm/RoboticArm";
import OrderItemsPanel from "./Robotic Arm/OrderItemPanel";
import { Tooltip } from "./Robotic Arm/ToolTip";
import io from "socket.io-client";
// Constants
const GRID_SIZE = 15;
const GRID_SPACING = 1.5;
const GRID_OFFSET = ((GRID_SIZE - 1) * GRID_SPACING) / 2;

function Box({
  position,
  color = "lightblue",
  label,
  isHighlighted = false,
  medicines = [],
  boxId,
  onHover,
  onHoverEnd,
}) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  const handlePointerOver = (e) => {
    e.stopPropagation();
    setHovered(true);
    onHover && onHover(boxId, position);
  };

  const handlePointerOut = (e) => {
    e.stopPropagation();
    setHovered(false);
    onHoverEnd && onHoverEnd();
  };

  const totalQuantity = medicines.reduce((sum, med) => sum + med.quantity, 0);

  // Get medicine names for display above container
  const getMedicineDisplayText = () => {
    if (medicines.length === 0) return "";

    if (medicines.length === 1) {
      // Single medicine type - only show name and brand
      const med = medicines[0];
      return `${med.name}\n(${med.brand})`;
    } else if (medicines.length <= 3) {
      return medicines.map((med) => `${med.name}\n(${med.brand})`).join("\n\n");
    } else {
      const firstTwo = medicines.slice(0, 2);
      const remaining = medicines.length - 2;
      return `${firstTwo
        .map((med) => `${med.name}\n(${med.brand})`)
        .join("\n\n")}\n\n+${remaining} more`;
    }
  };

  return (
    <group position={position}>
      {/* Main Box */}
      <mesh
        ref={meshRef}
        castShadow
        receiveShadow
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <boxGeometry args={[1, 0.5, 1]} />
        <meshStandardMaterial
          color={isHighlighted ? "#ff9d9d" : hovered ? "#ffeb3b" : color}
          transparent
          opacity={
            color === "#ffffff"
              ? 0.1 // Very transparent for empty containers
              : isHighlighted
              ? 0.8
              : hovered
              ? 0.8
              : 1.0 // Normal opacity for others
          }
        />
      </mesh>

      {/* Container Label on Front Edge */}
      {/* <Text
        position={[0, 0.1, 0.51]}
        fontSize={0.18}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.002}
        outlineColor="white"
      >
        {boxId}
      </Text> */}

      {/* Medicine Names Above Container */}
      <Text
        position={[0, 0.4, 0]} // Floating above the container
        fontSize={0.18}
        color={medicines.length === 0 ? "white" : "white"}
        anchorX="center"
        anchorY="bottom"
        outlineWidth={0.003}
        outlineColor="white"
        lineHeight={1.2}
        maxWidth={2.5} // Wrap text if too long
      >
        {getMedicineDisplayText()}
      </Text>

      {/* Empty Status Indicator */}
      {totalQuantity === 0 && (
        <mesh position={[-0.4, 0.26, 0.4]}>
          <sphereGeometry args={[0.04]} />
          <meshBasicMaterial color="#f44336" />
        </mesh>
      )}
      <Text
        position={[0, 0.1, 0.51]}
        fontSize={0.18}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.002}
        outlineColor="white"
      >
        {label}
      </Text>
    </group>
  );
}

function MedicineItem({ position, medicine, isInMotion = false }) {
  const color = medicine ? getMedicineColor(medicine.name) : "#cccccc";

  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[0.35, 0.15, 0.35]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.1} />
      </mesh>

      {isInMotion && (
        <mesh>
          <ringGeometry args={[0.2, 0.25, 16]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={1} />
        </mesh>
      )}
    </group>
  );
}
// Get color based on medicine name
function getMedicineColor(medicineName) {
  const colors = [
    "#f44336",
    "#2196f3",
    "#ffeb3b",
    "#4caf50",
    "#9c27b0",
    "#ff9800",
    "#00bcd4",
    "#795548",
  ];
  const hash = medicineName
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

export default function MedicineWarehouseSimulation() {
  function CameraLogger() {
    const { camera } = useThree();

    useEffect(() => {
      const handleKeyPress = (event) => {
        if (event.key.toLowerCase() === "l") {
          console.log("=== CAMERA POSITION ===");
          console.log("Position:", [
            parseFloat(camera.position.x.toFixed(2)),
            parseFloat(camera.position.y.toFixed(2)),
            parseFloat(camera.position.z.toFixed(2)),
          ]);
        }
      };

      document.addEventListener("keydown", handleKeyPress);
      return () => document.removeEventListener("keydown", handleKeyPress);
    }, [camera]);

    return null;
  }
  const storageBoxes = useMemo(() => {
    const boxes = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let z = 0; z < GRID_SIZE; z++) {
        const posX = x * GRID_SPACING - GRID_OFFSET;
        const posZ = z * GRID_SPACING - GRID_OFFSET;
        const label = `${String.fromCharCode(65 + x)}${z + 1}`;
        boxes.push({
          id: label,
          position: [posX, 0, posZ],
          label: label,
        });
      }
    }
    return boxes;
  }, []);

  // Define other locations
  const orderTray = { position: [15, 0, 3], label: "Order Tray" };
  const dumpTray = { position: [15, 0, 0], label: "Dump Tray" };

  // States
  const [phase, setPhase] = useState("idle");
  const [currentTargetPos, setCurrentTargetPos] = useState(null);
  const [boxContents, setBoxContents] = useState({});

  const [currentOrderItem, setCurrentOrderItem] = useState(null);
  const [deliveredItems, setDeliveredItems] = useState([]);
  const [dumpedItems, setDumpedItems] = useState([]);
  const [highlightedBox, setHighlightedBox] = useState(null);
  const [status, setStatus] = useState("Loading medicines...");
  const [medicines, setMedicines] = useState([]);
  const [currentMedicine, setCurrentMedicine] = useState(null);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [orderId, setOrderId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [socket, setSocket] = useState(null);
  const [robotConnected, setRobotConnected] = useState(false);
  const [robotStatus, setRobotStatus] = useState("disconnected");
  const [syncMode, setSyncMode] = useState(true);

  // Tooltip states
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState([0, 0, 0]);
  const [tooltipMedicines, setTooltipMedicines] = useState([]);
  const [tooltipBoxId, setTooltipBoxId] = useState("");

  const [instructions, setInstructions] = useState([]);
  const [currentInstruction, setCurrentInstruction] = useState(null);
  const [instructionMode, setInstructionMode] = useState(true);

  const [instructionMedicine, setInstructionMedicine] = useState(null);
  const [instructionOrderItem, setInstructionOrderItem] = useState(null);

  useEffect(() => {
    const initialBoxContents = {};
    storageBoxes.forEach((box) => {
      initialBoxContents[box.id] = [];
    });
    setBoxContents(initialBoxContents);
  }, []);

  useEffect(() => {
    console.log("DeliveredItems changed:", deliveredItems);
    console.log("DeliveredItems length:", deliveredItems.length);
  }, [deliveredItems]);

  const logAndStoreContainerPositions = async () => {
    const containerPositions = storageBoxes.map((box) => ({
      // containerId: box.id,
      label: box.label,
      position: {
        x: box.position[0],
        y: box.position[1],
        z: box.position[2],
      },
    }));

    console.log("Container Positions:", containerPositions);

    try {
      // Send to backend
      const response = await fetch(
        "http://localhost:3000/api/containers/positions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ containers: containerPositions }),
        }
      );

      if (response.ok) {
        console.log("Container positions saved to backend");
      } else {
        console.error("Failed to save container positions");
      }
    } catch (error) {
      console.error("Error saving container positions:", error);
    }

    return containerPositions;
  };
  React.useEffect(() => {
  console.log('=== DEBUG ORDER ITEMS PANEL ===');
  console.log('orderItems structure:', orderItems[0]);
  console.log('deliveredItems structure:', deliveredItems[0]);
  console.log('currentOrderItem structure:', currentOrderItem);
  
  if (orderItems.length > 0 && deliveredItems.length > 0) {
    const firstOrder = orderItems[0];
    const firstDelivered = deliveredItems[0];
    console.log('Comparing:');
    console.log('Order item name:', firstOrder.medicine.name);
    console.log('Delivered item name:', firstDelivered.name);
    console.log('Order item brand:', firstOrder.medicine.brand);
    console.log('Delivered item brand:', firstDelivered.brand);
  }
}, [orderItems, deliveredItems, dumpedItems, currentOrderItem]);
  useEffect(() => {
    const newSocket = io("http://localhost:3000");

    newSocket.on("connect", () => {
      setRobotConnected(true);
      setRobotStatus("connected");
      console.log("Connected to robot control server");
    });

    newSocket.on("disconnect", () => {
      setRobotConnected(false);
      setRobotStatus("disconnected");
    });

    newSocket.on("robot_movement_complete", (data) => {
      console.log("Robot completed movement:", data.phase);
      // Always trigger phase completion when robot completes
      handlePhaseComplete();
    });

    newSocket.on("robot_instruction_complete", async (result) => {
      console.log("Robot completed instruction:", result);

      // Update instruction status in backend
      try {
        await fetch(
          `http://localhost:3000/api/instructions/${result.instructionId}/status`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: result.status }),
          }
        );

        // Update local state
        setInstructions((prev) =>
          prev.map((instr) =>
            instr.id === result.instructionId
              ? { ...instr, status: result.status }
              : instr
          )
        );

        // Process next instruction
        processNextInstruction();
      } catch (error) {
        console.error("Error updating instruction status:", error);
      }
    });

    newSocket.on("robot_status", (status) => {
      setRobotStatus(status);
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/medicines");
        const data = await response.json();
        setMedicines(data.medicines);
        setStatus("Medicines loaded. Organizing into containers...");

        const organizedBoxes = {};
        storageBoxes.forEach((box) => {
          organizedBoxes[box.id] = [];
        });

        // Updated to handle new container structure
        data.medicines.forEach((medicine) => {
          const boxId = medicine.container.label; // Changed from medicine.containerLabel
          if (organizedBoxes[boxId]) {
            organizedBoxes[boxId].push({
              ...medicine,
              quantity: medicine.availableQuantity,
              containerLabel: medicine.container.label, // Add this for backward compatibility
            });
          } else {
            // If containerLabel doesn't exist, add it
            organizedBoxes[boxId] = [
              {
                ...medicine,
                quantity: medicine.availableQuantity,
                containerLabel: medicine.container.label, // Add this for backward compatibility
              },
            ];
          }
        });

        setBoxContents(organizedBoxes);

        // Calculate total medicines placed
        const totalPlaced = Object.values(organizedBoxes).reduce(
          (sum, box) => sum + box.length,
          0
        );
        setStatus(
          `${totalPlaced} medicines organized into containers. Ready for orders.`
        );
      } catch (error) {
        console.error("Error fetching medicines:", error);
        setStatus(
          "Error loading medicines. Using mock data for demonstration."
        );
      }
    };

    fetchMedicines();
  }, []);

  const instructionsRef = useRef([]);
  const processNextInstruction = useCallback(() => {
    setInstructions((prevInstructions) => {
      const nextInstruction = prevInstructions.find(
        (instr) => instr.status === "pending"
      );

      if (!nextInstruction) {
        setCurrentInstruction(null);
        setStatus("All instructions completed!");
        setPhase("idle");
        return prevInstructions;
      }

      setCurrentInstruction(nextInstruction);
      setStatus(
        `Executing: ${nextInstruction.phase} - Step ${nextInstruction.stepNumber}`
      );

      // Handle metadata updates
      if (nextInstruction.metadata) {
        if (nextInstruction.metadata.position) {
          const pos = nextInstruction.metadata.position;
          setCurrentTargetPos(new THREE.Vector3(pos.x, pos.y, pos.z));
        }

        // NEW: Match scannerCode with order data to get medicine and orderItem
        if (nextInstruction.metadata.scannerCode && orderItems.length > 0) {
          console.log(
            "Looking for scannerCode:",
            nextInstruction.metadata.scannerCode
          );

          // Find the order item that matches the scanner code
          const matchingOrderItem = orderItems.find(
            (item) =>
              item.medicine.scannerCode === nextInstruction.metadata.scannerCode
          );

          if (matchingOrderItem) {
            console.log("Found matching order item:", matchingOrderItem);

            // Set the medicine data
            const medicine = {
              id: matchingOrderItem.medicine.id,
              name: matchingOrderItem.medicine.name,
              brand: matchingOrderItem.medicine.brand,
              containerLabel: matchingOrderItem.medicine.container.label,
              quantity: 1,
            };

            // Set the order item data
            const orderItem = {
              id: matchingOrderItem.id,
              medicineName: matchingOrderItem.medicine.name,
              brand: matchingOrderItem.medicine.brand,
              containerLabel: matchingOrderItem.medicine.container.label,
              quantity: matchingOrderItem.quantity,
            };

            console.log("Setting medicine:", medicine);
            console.log("Setting orderItem:", orderItem);

            setCurrentMedicine(medicine);
            setInstructionMedicine(medicine);
            setCurrentOrderItem(orderItem);
            setInstructionOrderItem(orderItem);
          } else {
            console.log(
              "No matching order item found for scannerCode:",
              nextInstruction.metadata.scannerCode
            );
          }
        }
      }

      const phaseMapping = {
        moveToPick: "moveToPick",
        clawClose: "lift",
        moveToDrop: "moveToDrop",
        clawOpen: "drop",
        return: "return",
      };

      const mappedPhase =
        phaseMapping[nextInstruction.phase] || nextInstruction.phase;
      setPhase(mappedPhase);

      return prevInstructions.map((instr) =>
        instr.id === nextInstruction.id
          ? { ...instr, status: "in_progress" }
          : instr
      );
    });
  }, [orderItems]);
  const processInstructions = useCallback(
    async (orderInstructions) => {
      instructionsRef.current = orderInstructions;
      setInstructions(orderInstructions);

      const firstInstruction = orderInstructions.find(
        (instr) => instr.status === "pending"
      );

      if (firstInstruction) {
        setCurrentInstruction(firstInstruction);
        setTimeout(() => processNextInstruction(), 500);
      }
    },
    [processNextInstruction]
  );

  const handlePhaseComplete = () => {
    console.log("handlePhaseComplete called, phase:", phase);

    // Send robot command if connected
    if (socket && robotConnected && syncMode) {
      const robotCommand = {
        phase: phase,
        targetPosition: currentTargetPos
          ? {
              x: currentTargetPos.x,
              y: currentTargetPos.y,
              z: currentTargetPos.z,
            }
          : null,
        medicine: currentMedicine
          ? {
              name: currentMedicine.name,
              brand: currentMedicine.brand,
              containerLabel: currentMedicine.containerLabel,
            }
          : null,
        orderItem: currentOrderItem
          ? {
              containerLabel: currentOrderItem.containerLabel,
              medicineName: currentOrderItem.medicineName,
              brand: currentOrderItem.brand,
            }
          : null,
        timestamp: new Date().toISOString(),
      };

      socket.emit("execute_movement", robotCommand);
    }
    console.log("About to deliver:", currentMedicine);
    console.log("Expected item:", currentOrderItem);
    // Handle instruction completion
    if (currentInstruction) {
      console.log("Completing instruction:", currentInstruction.id);

      // Handle medicine delivery for drop phase
      // Handle medicine delivery for drop phase
      if (phase === "drop" && instructionMedicine && instructionOrderItem) {
        const wasCorrectMedicine = scanAndMatchMedicine(
          instructionMedicine,
          instructionOrderItem
        );

        if (wasCorrectMedicine) {
          const deliveredItem = {
            ...instructionMedicine,
            id:
              instructionMedicine.id ||
              `${instructionMedicine.name}-${Date.now()}`,
            quantity: 1,
            uniqueId: `delivered-${instructionMedicine.id}-${Date.now()}`,
          };

          setDeliveredItems((prev) => [...prev, deliveredItem]);
          setStatus("Medicine delivered to order tray.");
        } else {
          const dumpedItem = {
            ...instructionMedicine,
            id:
              instructionMedicine.id ||
              `${instructionMedicine.name}-${Date.now()}`,
            quantity: 1,
            uniqueId: `dumped-${instructionMedicine.id}-${Date.now()}`,
          };

          setDumpedItems((prev) => [...prev, dumpedItem]);
          setStatus("Incorrect medicine dumped.");
        }

        // Update box contents using the persisted values
        setBoxContents((prev) => {
          const newContents = { ...prev };
          const targetBoxId = instructionOrderItem.containerLabel;

          if (newContents[targetBoxId]) {
            newContents[targetBoxId] = newContents[targetBoxId]
              .map((medicine) => {
                if (
                  medicine.name === instructionMedicine.name &&
                  medicine.brand === instructionMedicine.brand
                ) {
                  return { ...medicine, quantity: medicine.quantity - 1 };
                }
                return medicine;
              })
              .filter((medicine) => medicine.quantity > 0);
          }
          return newContents;
        });

        // Clear the instruction-specific data after processing
        setInstructionMedicine(null);
        setInstructionOrderItem(null);
        setCurrentMedicine(null);
        setCurrentOrderItem(null);
      }

      // Mark current instruction as completed
      setInstructions((prev) =>
        prev.map((instr) =>
          instr.id === currentInstruction.id
            ? { ...instr, status: "completed" }
            : instr
        )
      );

      // Update instruction status in backend
      updateInstructionStatus(currentInstruction.id, "completed");

      // Process next instruction
      setTimeout(() => {
        processNextInstruction();
      }, 500);
    }
  };

  // Add this helper function to update instruction status in backend
  const updateInstructionStatus = async (instructionId, status) => {
    try {
      await fetch(
        `http://localhost:3000/api/instructions/${instructionId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );
    } catch (error) {
      console.error("Error updating instruction status:", error);
    }
  };

  // Handle box hover
  const handleBoxHover = (boxId, position) => {
    const medicines = boxContents[boxId] || [];
    setTooltipVisible(true);
    setTooltipPosition([position[0], position[1] + 1, position[2]]);
    setTooltipMedicines(medicines);
    setTooltipBoxId(boxId);
  };

  const handleBoxHoverEnd = () => {
    setTooltipVisible(false);
    setTooltipMedicines([]);
    setTooltipBoxId("");
  };

  useEffect(() => {
    console.log("Phase changed to:", phase);
  }, [phase]);

  const processOrder = async () => {
    if (!orderId || isProcessing) return;

    setIsProcessing(true);

    try {
      setStatus(`Processing order ${orderId}...`);

      // First, fetch the order details to get the items
      const orderResponse = await fetch(
        `http://localhost:3000/api/orders/orders/${orderId}`
      );
      const orderData = await orderResponse.json();

      if (orderData && orderData.items) {
        // Set the order items for the panel
        setOrderItems(orderData.items);
      }

      // Process the order to generate instructions
      const processResponse = await fetch(
        `http://localhost:3000/api/orders/orders/${orderId}/process`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );
      const processData = await processResponse.json();

      if (processData && processData.orderId) {
        setStatus(
          `Order #${processData.orderId} processed. ${processData.instructionCount} instructions generated.`
        );

        // Fetch the generated instructions
        const instructionsResponse = await fetch(
          `http://localhost:3000/api/instructions/order/${processData.orderId}`
        );
        const instructionsData = await instructionsResponse.json();

        if (
          instructionsData &&
          instructionsData.instructions &&
          instructionsData.instructions.length > 0
        ) {
          setCurrentOrder({
            id: processData.orderId,
            status: "processing",
            processedAt: new Date().toISOString(),
            instructionCount: processData.instructionCount,
          });

          await processInstructions(instructionsData.instructions);
        } else {
          setStatus("No instructions found for this order");
        }
      } else {
        setStatus(
          `Failed to process order ${orderId}: ${
            processData.message || "Unknown error"
          }`
        );
      }
    } catch (error) {
      console.error("Error processing order:", error);
      setStatus(`Error processing order: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };
  // Simulate scanning and matching medicine
  const scanAndMatchMedicine = (medicine, expectedItem) => {
    return (
      medicine.name === expectedItem.medicineName &&
      medicine.brand === expectedItem.brand
    );
  };

  const getBoxColor = (boxId) => {
    const medicines = boxContents[boxId] || [];
    const totalQuantity = medicines.reduce((sum, med) => sum + med.quantity, 0);
    return totalQuantity > 0 ? "#4caf50" : "#811331";
  };

  return (
    <div
      className="w-full h-screen relative bg-gray-900"
      style={{ backgroundColor: "black" }}
    >
      {/* Controls Panel */}
      <div className="absolute top-0 left-0 z-10 bg-black bg-opacity-90 p-4 rounded-lg shadow-lg w-80 m-4">
        <div className="mb-2 font-bold text-lg text-white">
          Medicine Warehouse
        </div>

        <div className="mb-4 text-white">
          <div className="text-sm font-medium mb-1">
            Status: <span className="italic text-yellow-300">{status}</span>
          </div>
          <div className="text-sm font-medium mb-1">
            Phase: <span className="font-bold text-blue-300">{phase}</span>
          </div>

          <div className="mt-2">
            <label className="block text-sm font-medium mb-1">
              Order Number:
            </label>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white mb-2"
              placeholder="Enter order number"
            />
            <button
              onClick={processOrder}
              disabled={isProcessing}
              className={`w-full py-2 rounded font-medium text-white ${
                isProcessing ? "bg-gray-600" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isProcessing ? "Processing..." : "Process Order"}
            </button>
          </div>
        </div>
        {currentOrder && (
          <div className="mb-4 text-white">
            <div className="text-sm font-medium">Order Progress:</div>
            <div className="w-full bg-gray-700 rounded-full h-2.5 mt-1 mb-2">
              <div
                className="bg-green-600 h-2.5 rounded-full"
                style={{
                  width: `${
                    currentOrder.instructionCount > 0
                      ? (instructions.filter((i) => i.status === "completed")
                          .length /
                          currentOrder.instructionCount) *
                        100
                      : 0
                  }%`,
                }}
              ></div>
            </div>
            <div className="text-xs text-gray-300">
              {instructions.filter((i) => i.status === "completed").length} /{" "}
              {currentOrder.instructionCount} steps completed
            </div>
          </div>
        )}

        <div className="mb-4 text-white">
          <div className="text-sm font-medium mb-1">Current Task:</div>
          {currentOrderItem && (
            <div className="text-xs text-gray-300">
              Looking for: {currentOrderItem.medicineName} (
              {currentOrderItem.brand})
              <br />
              From: {currentOrderItem.containerLabel}
              {currentMedicine && (
                <>
                  <br />
                  Found: {currentMedicine.name} ({currentMedicine.brand})
                </>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Robot Control Panel */}
      <div className="absolute bottom-0 left-0 z-10 m-4">
        <OrderItemsPanel
          orderItems={orderItems}
          currentOrderItem={currentOrderItem}
          deliveredItems={deliveredItems}
          dumpedItems={dumpedItems}
        />
      </div>
      <div className="absolute top-0 right-0 z-10 bg-black bg-opacity-90 p-4 rounded-lg shadow-lg w-80 m-4">
        <div className="mb-4 p-3 border border-gray-600 rounded text-white">
          <div className="text-sm font-medium mb-2">Robot Control</div>
          <div
            className={`text-xs mb-2 ${
              robotConnected ? "text-green-400" : "text-red-400"
            }`}
          >
            Status: {JSON.stringify(robotStatus)}
          </div>
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              id="syncMode"
              checked={syncMode}
              onChange={(e) => setSyncMode(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="syncMode" className="text-xs">
              Wait for robot completion
            </label>
          </div>
          <div className="mt-4">
            <button
              onClick={handlePhaseComplete}
              className="w-full py-2 rounded font-medium text-white bg-green-600 hover:bg-green-700 mb-2"
            >
              Complete Current Phase (Manual)
            </button>
            <button
              onClick={logAndStoreContainerPositions}
              className="w-full py-2 rounded font-medium text-white bg-green-600 hover:bg-green-700 mb-2"
            >
              Update Container
            </button>
            <div className="text-xs text-gray-300">Current Phase: {phase}</div>
          </div>

          {!robotConnected && (
            <div className="text-xs text-yellow-400">
              Running in simulation-only mode
            </div>
          )}

          {/* Add instruction status display */}
          {instructionMode && currentInstruction && (
            <div className="mt-2 p-2 bg-gray-700 rounded">
              <div className="text-xs text-yellow-400">
                Current Instruction:
              </div>
              <div className="text-xs text-white">
                {currentInstruction.action}
              </div>
              <div className="text-xs text-gray-300">
                {currentInstruction.description}
              </div>
            </div>
          )}

          {/* Show instruction progress */}
          {instructionMode && instructions.length > 0 && (
            <div className="mt-2">
              <div className="text-xs text-white">
                Progress:{" "}
                {instructions.filter((i) => i.status === "completed").length}/
                {instructions.length}
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                <div
                  className="bg-blue-600 h-1.5 rounded-full"
                  style={{
                    width: `${
                      (instructions.filter((i) => i.status === "completed")
                        .length /
                        instructions.length) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Canvas
        camera={{ position: [-0.03, 10.3, 18.56], fov: 50 }}
        shadows
        className="w-full h-screen"
      >
        <color attach="background" args={["#847f82"]} />
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize={1024}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        <OrbitControls />
        <CameraLogger />

        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.05, 0]}
          receiveShadow
        >
          <planeGeometry args={[22.5, 22.5]} />
          <meshStandardMaterial color="white" />
        </mesh>

        {/* Grid lines */}
        <gridHelper
          args={[22.5, 22.5, "#999999", "black"]}
          position={[0, 0.01, 0]}
        />

        {/* Storage boxes */}
        {storageBoxes.map((box) => (
          <Box
            key={box.id}
            position={box.position}
            label={
              boxContents[box.id]?.length > 0
                ? `${box.label} (${boxContents[box.id].reduce(
                    (sum, med) => sum + med.quantity,
                    0
                  )})`
                : box.label
            }
            color={getBoxColor(box.id)}
            isHighlighted={highlightedBox === box.id}
            medicines={boxContents[box.id] || []}
            boxId={box.id}
            onHover={handleBoxHover}
            onHoverEnd={handleBoxHoverEnd}
          />
        ))}

        {/* Order tray */}
        <Box
          position={orderTray.position}
          label={`${orderTray.label} (${deliveredItems.length})`}
          color="#b5bd68"
        />

        {/* Dump tray */}
        <Box
          position={dumpTray.position}
          label={`${dumpTray.label} (${dumpedItems.length})`}
          color="#cc6666"
        />

        {deliveredItems.map((medicine, index) => {
          const offsetX = (index % 4) * 0.5 - 0.75;
          const offsetZ = Math.floor(index / 4) * 0.5 - 0.25;
          return (
            <MedicineItem
              key={`delivered-${medicine.uniqueId || index}`}
              position={[
                orderTray.position[0] + offsetX,
                0.3,
                orderTray.position[2] + offsetZ,
              ]}
              medicine={medicine}
            />
          );
        })}

        {/* Dumped medicines in dump tray */}
        {dumpedItems.map((medicine, index) => {
          const offsetX = (index % 4) * 0.5 - 0.75;
          const offsetZ = Math.floor(index / 4) * 0.5 - 0.25;
          return (
            <MedicineItem
              key={`dumped-${medicine.uniqueId || index}`}
              position={[
                dumpTray.position[0] + offsetX,
                0.3,
                dumpTray.position[2] + offsetZ,
              ]}
              medicine={medicine}
            />
          );
        })}

        <RoboticArm
          phase={phase}
          position={currentTargetPos}
          onPhaseComplete={handlePhaseComplete}
          currentMedicine={currentMedicine}
        />
        <Tooltip
          position={tooltipPosition}
          medicines={tooltipMedicines}
          visible={tooltipVisible}
          boxId={tooltipBoxId}
        />
      </Canvas>
    </div>
  );
}

{
  /* Quantity Badge */
}
{
  /* {totalQuantity > 0 && (
        <>
          <mesh position={[0.4, 0.26, 0.4]}>
            <cylinderGeometry args={[0.08, 0.08, 0.02, 16]} />
            <meshBasicMaterial color="#4caf50" />
          </mesh>
        
          <Text
            position={[0.4, 0.27, 0.4]}
            fontSize={0.06}
            color="white"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.001}
            outlineColor="black"
          >
            {totalQuantity}
          </Text>
        </>
      )} */
}
