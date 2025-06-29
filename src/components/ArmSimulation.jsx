import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text, Html } from "@react-three/drei";
import * as THREE from "three";
import { RoboticArm } from "./Robotic Arm/RoboticArm";
import { OrderItemsPanel } from "./Robotic Arm/OrderItemPanel";
import { Tooltip } from "./Robotic Arm/ToolTip";
import io from "socket.io-client";
// Constants
const GRID_SIZE = 5;
const GRID_SPACING = 1.5;
const GRID_OFFSET = ((GRID_SIZE - 1) * GRID_SPACING) / 2;

// Updated Box Component with Edge Labels + Medicine Names Above
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
    // Few medicine types - show all names and brands only
    return medicines.map((med) => `${med.name}\n(${med.brand})`).join("\n\n");
  } else {
    // Many medicine types - show first 2 + count
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
          opacity={hovered ? 0.8 : 1.0}
        />
      </mesh>

      {/* Container Label on Front Edge */}
      <Text
        position={[0, 0.1, 0.51]}
        fontSize={0.18}
        color="black"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.002}
        outlineColor="white"
      >
        {boxId}
      </Text>

      {/* Medicine Names Above Container */}
      <Text
        position={[0, 0.34, 0]} // Floating above the container
        fontSize={0.18}
        color={medicines.length === 0 ? "#666666" : "#000000"}
        anchorX="center"
        anchorY="bottom"
        outlineWidth={0.003}
        outlineColor="white"
        lineHeight={1.2}
        maxWidth={2.5} // Wrap text if too long
      >
        {getMedicineDisplayText()}
      </Text>

      {/* Quantity Badge */}
      {/* {totalQuantity > 0 && (
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
      )} */}

      {/* Empty Status Indicator */}
      {totalQuantity === 0 && (
        <mesh position={[-0.4, 0.26, 0.4]}>
          <sphereGeometry args={[0.04]} />
          <meshBasicMaterial color="#f44336" />
        </mesh>
      )}
      <Text
        position={[0, 0.35, 0]}
        fontSize={0.2}
        color="black"
        anchorX="center"
        anchorY="middle"
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
  // Create grid of storage boxes
  const storageBoxes = [];
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let z = 0; z < GRID_SIZE; z++) {
      const posX = x * GRID_SPACING - GRID_OFFSET;
      const posZ = z * GRID_SPACING - GRID_OFFSET;
      const label = `${String.fromCharCode(65 + x)}${z + 1}`;
      storageBoxes.push({
        id: label,
        position: [posX, 0, posZ],
        label: label,
      });
    }
  }

  // Define other locations
  const orderTray = { position: [3, 0, 6], label: "Order Tray" };
  const dumpTray = { position: [-3, 0, 6], label: "Dump Tray" };

  // States
  const [phase, setPhase] = useState("idle");
  const [currentTargetPos, setCurrentTargetPos] = useState(null);
  const [boxContents, setBoxContents] = useState({});
  const [orderQueue, setOrderQueue] = useState([]);
  const [currentOrderItem, setCurrentOrderItem] = useState(null);
  const [deliveredItems, setDeliveredItems] = useState([]);
  const [dumpedItems, setDumpedItems] = useState([]);
  const [highlightedBox, setHighlightedBox] = useState(null);
  const [status, setStatus] = useState("Loading medicines...");
  const [medicines, setMedicines] = useState([]);
  const [currentMedicine, setCurrentMedicine] = useState(null);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [orderTimer, setOrderTimer] = useState(null);
  const [orderId, setOrderId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [socket, setSocket] = useState(null);
  const [robotConnected, setRobotConnected] = useState(false);
  const [robotStatus, setRobotStatus] = useState("disconnected");
  const [syncMode, setSyncMode] = useState(true); // true = wait for robot, false = simulation only
  // Tooltip states
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState([0, 0, 0]);
  const [tooltipMedicines, setTooltipMedicines] = useState([]);
  const [tooltipBoxId, setTooltipBoxId] = useState("");
  const [isManualProcessing, setIsManualProcessing] = useState(false);

  useEffect(() => {
    const initialBoxContents = {};
    storageBoxes.forEach((box) => {
      initialBoxContents[box.id] = [];
    });
    setBoxContents(initialBoxContents);
  }, []);
  useEffect(() => {
    const newSocket = io("http://localhost:3001"); // Your robot control server

    newSocket.on("connect", () => {
      setRobotConnected(true);
      setRobotStatus("connected");
      console.log("Connected to robot control server");
    });

    newSocket.on("disconnect", () => {
      setRobotConnected(false);
      setRobotStatus("disconnected");
    });

    // newSocket.on("robot_movement_complete", (data) => {
    //   console.log("Robot completed movement:", data.phase);
    //   // Trigger simulation phase completion when robot completes
    //   if (data.phase === phase) {
    //     handlePhaseComplete();
    //   }
    // });
    newSocket.on("robot_movement_complete", (data) => {
      console.log("Robot completed movement:", data.phase);
      // Always trigger phase completion when robot completes
      handlePhaseComplete();
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

        // Then organize medicines into their designated containers
        data.medicines.forEach((medicine) => {
          const boxId = medicine.containerLabel;
          if (organizedBoxes[boxId]) {
            organizedBoxes[boxId].push({
              ...medicine,
              quantity: medicine.availableQuantity, // Use availableQuantity as quantity
            });
          } else {
            // If containerLabel doesn't exist, add it
            organizedBoxes[boxId] = [
              {
                ...medicine,
                quantity: medicine.availableQuantity, // Use availableQuantity as quantity
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
  const handleManualProcessOrder = async () => {
    setIsManualProcessing(true);
    await processOrder();
    setIsManualProcessing(false);
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
    return () => {
      if (orderTimer) {
        clearInterval(orderTimer);
      }
    };
  }, [orderTimer]);
  useEffect(() => {
    console.log("Phase changed to:", phase);
  }, [phase]);
  // Replace the processOrder function with this fixed version
  const processOrder = async () => {
    if (!orderId || isProcessing) return;
    if (orderTimer) {
      clearInterval(orderTimer);
      setOrderTimer(null);
    }
    setIsProcessing(true);
    try {
      setStatus(`Processing order ${orderId}...`);
      const response = await fetch(
        `http://localhost:3000/api/orders/orders/${orderId}/process`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();

      if (data.status === "processed" && data.items) {
        setStatus(`Order #${data.orderId} processed and ready for pickup`);
        setCurrentOrder({
          id: data.orderId,
          status: data.status,
          processedAt: data.processedAt,
          items: data.items,
        });

        // Create order queue from processed order items
        const newOrderQueue = [];
        data.items.forEach((item) => {
          for (let i = 0; i < item.quantity; i++) {
            newOrderQueue.push({
              containerLabel: item.containerLabel,
              medicineName: item.medicineName,
              brand: item.brand,
              orderItemId: item.orderItemId,
              scannerCode: item.scannerCodes[i], // Each item gets its unique scanner code
            });
          }
        });

        // Reset states first
        setDeliveredItems([]);
        setDumpedItems([]);

        // Set order queue and process first item in the same callback
        setOrderQueue(newOrderQueue);

        // Use setTimeout to ensure state has been updated
        setTimeout(() => {
          if (newOrderQueue.length > 0) {
            processFirstOrderItem(newOrderQueue);
          }
        }, 100);
      } else {
        setStatus(`Failed to process order ${orderId} or order not found`);
      }
    } catch (error) {
      console.error("Error processing order:", error);
      setStatus("Error processing order");
    } finally {
      setIsProcessing(false);
    }
  };

  // Add this new helper function
  const processFirstOrderItem = (queue) => {
    if (queue.length > 0) {
      const nextItem = queue[0];
      const targetBox = storageBoxes.find(
        (box) => box.id === nextItem.containerLabel
      );

      if (
        targetBox &&
        boxContents[targetBox.id] &&
        boxContents[targetBox.id].length > 0
      ) {
        // Find the medicine that matches the order item
        const matchingMedicineIndex = boxContents[targetBox.id].findIndex(
          (medicine) =>
            medicine.name === nextItem.medicineName &&
            medicine.brand === nextItem.brand &&
            medicine.quantity > 0
        );

        if (matchingMedicineIndex !== -1) {
          const medicine = boxContents[targetBox.id][matchingMedicineIndex];

          // Create a copy for processing
          const medicineForProcessing = { ...medicine };

          setOrderQueue((prev) => prev.slice(1));
          setCurrentOrderItem(nextItem);
          setCurrentMedicine(medicineForProcessing);
          setHighlightedBox(targetBox.id);
          setCurrentTargetPos(
            new THREE.Vector3(targetBox.position[0], 0, targetBox.position[2])
          );
          setStatus(
            `Moving to container ${targetBox.id} for ${nextItem.medicineName} (${nextItem.brand}) - ${medicine.quantity} available`
          );
          setPhase("moveToPick");
        } else {
          setStatus(
            `No matching medicines available in container ${nextItem.containerLabel} for ${nextItem.medicineName} (${nextItem.brand})`
          );
          setOrderQueue((prev) => prev.slice(1));
          setTimeout(() => processNextOrderItem(), 1000);
        }
      } else {
        setStatus(`Container ${nextItem.containerLabel} is empty`);
        setOrderQueue((prev) => prev.slice(1));
        setTimeout(() => processNextOrderItem(), 1000);
      }
    }
  };
  // Simulate scanning and matching medicine
  const scanAndMatchMedicine = (medicine, expectedItem) => {
    return (
      medicine.name === expectedItem.medicineName &&
      medicine.brand === expectedItem.brand
    );
  };

  // Handle phase completion
  const handlePhaseComplete = () => {
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
    switch (phase) {
      case "moveToPick":
        setStatus("Scanning medicine...");
        setPhase("lift");
        break;
      case "lift":
        const isCorrectMedicine = scanAndMatchMedicine(
          currentMedicine,
          currentOrderItem
        );

        if (isCorrectMedicine) {
          setStatus(
            `Correct medicine scanned: ${currentMedicine.name} (${currentMedicine.brand}). Moving to order tray.`
          );
          setCurrentTargetPos(
            new THREE.Vector3(orderTray.position[0], 0, orderTray.position[2])
          );
        } else {
          setStatus(
            `Incorrect medicine scanned: ${currentMedicine.name} (${currentMedicine.brand}). Moving to dump tray.`
          );
          setCurrentTargetPos(
            new THREE.Vector3(dumpTray.position[0], 0, dumpTray.position[2])
          );
        }

        setPhase("moveToDrop");
        break;
      case "moveToDrop":
        setPhase("drop");
        break;
      case "drop":
        const wasCorrectMedicine = scanAndMatchMedicine(
          currentMedicine,
          currentOrderItem
        );

        if (wasCorrectMedicine) {
          setDeliveredItems((prev) => [...prev, currentMedicine]);
          setStatus("Medicine delivered to order tray.");

          // Decrease quantity in the container
          setBoxContents((prev) => {
            const newContents = { ...prev };
            const targetBoxId = currentOrderItem.containerLabel;

            if (newContents[targetBoxId]) {
              newContents[targetBoxId] = newContents[targetBoxId]
                .map((medicine) => {
                  if (
                    medicine.name === currentMedicine.name &&
                    medicine.brand === currentMedicine.brand
                  ) {
                    return { ...medicine, quantity: medicine.quantity - 1 };
                  }
                  return medicine;
                })
                .filter((medicine) => medicine.quantity > 0); // Remove medicines with 0 quantity
            }

            return newContents;
          });
        } else {
          setDumpedItems((prev) => [...prev, currentMedicine]);
          setStatus("Incorrect medicine dumped.");

          // Still decrease quantity even if dumped (medicine was taken from container)
          setBoxContents((prev) => {
            const newContents = { ...prev };
            const targetBoxId = currentOrderItem.containerLabel;

            if (newContents[targetBoxId]) {
              newContents[targetBoxId] = newContents[targetBoxId]
                .map((medicine) => {
                  if (
                    medicine.name === currentMedicine.name &&
                    medicine.brand === currentMedicine.brand
                  ) {
                    return { ...medicine, quantity: medicine.quantity - 1 };
                  }
                  return medicine;
                })
                .filter((medicine) => medicine.quantity > 0);
            }

            return newContents;
          });
        }
        setCurrentMedicine(null);
        setPhase("return");
        break;
      case "return":
        if (orderQueue.length === 0) {
          setTimeout(() => processNextOrderItem(), 500);
          setPhase("idle");
        } else {
          // Directly process next item without returning to original position
          setTimeout(() => processNextOrderItem(), 500);
        }
        break;
      default:
        break;
    }
  };
  // Process the next item in the order
  const processNextOrderItem = () => {
    if (orderQueue.length > 0) {
      const nextItem = orderQueue[0];
      const targetBox = storageBoxes.find(
        (box) => box.id === nextItem.containerLabel
      );

      if (
        targetBox &&
        boxContents[targetBox.id] &&
        boxContents[targetBox.id].length > 0
      ) {
        // Find the medicine that matches the order item
        const matchingMedicineIndex = boxContents[targetBox.id].findIndex(
          (medicine) =>
            medicine.name === nextItem.medicineName &&
            medicine.brand === nextItem.brand &&
            medicine.quantity > 0
        );

        if (matchingMedicineIndex !== -1) {
          const medicine = boxContents[targetBox.id][matchingMedicineIndex];

          // Create a copy for processing
          const medicineForProcessing = { ...medicine };

          setOrderQueue((prev) => prev.slice(1));
          setCurrentOrderItem(nextItem);
          setCurrentMedicine(medicineForProcessing);
          setHighlightedBox(targetBox.id);
          setCurrentTargetPos(
            new THREE.Vector3(targetBox.position[0], 0, targetBox.position[2])
          );
          setStatus(
            `Moving to container ${targetBox.id} for ${nextItem.medicineName} (${nextItem.brand}) - ${medicine.quantity} available`
          );
          setPhase("moveToPick");
        } else {
          setStatus(
            `No matching medicines available in container ${nextItem.containerLabel} for ${nextItem.medicineName} (${nextItem.brand})`
          );
          setOrderQueue((prev) => prev.slice(1));
          if (orderQueue.length > 1) {
            setTimeout(() => processNextOrderItem(), 1000);
          }
        }
      } else {
        setStatus(`Container ${nextItem.containerLabel} is empty`);
        setOrderQueue((prev) => prev.slice(1));
        if (orderQueue.length > 1) {
          setTimeout(() => processNextOrderItem(), 1000);
        }
      }
    } else {
      setStatus("All items processed!");
    }
  };

  const getBoxItemPositions = () => {
    const result = [];

    Object.entries(boxContents).forEach(([boxId, medicines]) => {
      const box = storageBoxes.find((b) => b.id === boxId);
      if (box && medicines.length > 0) {
        let itemIndex = 0;

        medicines.forEach((medicine) => {
          // Create individual items based on actual quantity
          for (let i = 0; i < medicine.quantity; i++) {
            const xOffset = (itemIndex % 3) * 0.25 - 0.25;
            const zOffset = Math.floor((itemIndex % 9) / 3) * 0.25 - 0.25;
            const yOffset = 0.3;

            result.push({
              medicine: {
                ...medicine,
                uniqueId: `${medicine.id}-${i}`, // Unique ID for each individual item
              },
              position: [
                box.position[0] + xOffset,
                yOffset,
                box.position[2] + zOffset,
              ],
            });
            itemIndex++;

            // Limit visual items per box to prevent overcrowding
            if (itemIndex >= 9) break; // 3x3x3 = 27 items max per box
          }

          if (itemIndex >= 9) return; // Break outer loop too
        });
      }
    });

    return result;
  };
  // Get box color based on medicine type
  const getBoxColor = (boxId) => {
    return "#81a2be";
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
              onClick={handleManualProcessOrder}
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
                    currentOrder.items.reduce(
                      (sum, item) => sum + item.quantity,
                      0
                    ) > 0
                      ? (deliveredItems.length /
                          currentOrder.items.reduce(
                            (sum, item) => sum + item.quantity,
                            0
                          )) *
                        100
                      : 0
                  }%`,
                }}
              ></div>
            </div>
            <div className="text-xs text-gray-300">
              Remaining: {orderQueue.length} | Delivered:{" "}
              {deliveredItems.length} | Dumped: {dumpedItems.length}
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
            <div className="text-xs text-gray-300">Current Phase: {phase}</div>
          </div>
          {!robotConnected && (
            <div className="text-xs text-yellow-400">
              Running in simulation-only mode
            </div>
          )}
        </div>
      </div>
      <OrderItemsPanel
        currentOrder={currentOrder}
        orderQueue={orderQueue}
        deliveredItems={deliveredItems}
        dumpedItems={dumpedItems}
        currentOrderItem={currentOrderItem}
      />

      <Canvas
        camera={{ position: [15, 15, 15], fov: 50 }}
        shadows
        className="w-full h-screen"
      >
        <color attach="background" args={["#f0f0f0"]} />
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

        {/* Ground */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.05, 0]}
          receiveShadow
        >
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial color="#e0e0e0" />
        </mesh>

        {/* Grid lines */}
        <gridHelper
          args={[50, 50, "#999999", "#dddddd"]}
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

        {/* Medicines in boxes */}
        {getBoxItemPositions().map((item, index) => (
          <MedicineItem
            key={item.medicine.uniqueId || `${item.medicine.id}-${index}`}
            position={item.position}
            medicine={item.medicine}
            isInMotion={currentMedicine?.id === item.medicine.id}
          />
        ))}

        {/* Delivered medicines in order tray */}
        {deliveredItems.map((medicine, index) => {
          const offsetX = (index % 4) * 0.5 - 0.75;
          const offsetZ = Math.floor(index / 4) * 0.5 - 0.25;
          return (
            <MedicineItem
              key={`delivered-${medicine.id}-${index}`}
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
              key={`dumped-${medicine.id}-${index}`}
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
