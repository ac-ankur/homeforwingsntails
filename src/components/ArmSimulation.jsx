import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text, Html } from "@react-three/drei";
import * as THREE from "three";
import { RoboticArm } from "./Robotic Arm/RoboticArm";
import { OrderItemsPanel } from "./Robotic Arm/OrderItemPanel";
import { Tooltip } from "./Robotic Arm/ToolTip";

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
    if (medicines.length === 0) return "EMPTY";

    if (medicines.length === 1) {
      // Single medicine type
      const med = medicines[0];
      return `${med.name}\n(${med.brand})`;
    } else if (medicines.length <= 3) {
      // Few medicine types - show all names
      return medicines.map((med) => `${med.name} (${med.brand})`).join("\n");
    } else {
      // Many medicine types - show first 2 + count
      const firstTwo = medicines.slice(0, 2);
      const remaining = medicines.length - 2;
      return `${firstTwo
        .map((med) => `${med.name} (${med.brand})`)
        .join("\n")}\n+${remaining} more`;
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
        position={[0, 0.5, 0]} // Floating above the container
        fontSize={0.15}
        color={medicines.length === 0 ? "#666666" : "#000000"}
        anchorX="center"
        anchorY="bottom"
        outlineWidth={0.002}
        outlineColor="white"
        lineHeight={1.1}
        maxWidth={2} // Wrap text if too long
      >
        {getMedicineDisplayText()}
      </Text>

      {/* Quantity Badge */}
      {totalQuantity > 0 && (
        <>
          {/* Badge background */}
          <mesh position={[0.4, 0.26, 0.4]}>
            <cylinderGeometry args={[0.08, 0.08, 0.02, 16]} />
            <meshBasicMaterial color="#4caf50" />
          </mesh>
          {/* Badge text */}
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
      )}

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
        <meshStandardMaterial color={color} metalness={0.1} roughness={0.7} />
      </mesh>

      {isInMotion && (
        <mesh>
          <ringGeometry args={[0.2, 0.25, 16]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.7} />
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
  const orderTray = { position: [6, 0, 0], label: "Order Tray" };
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
            const yOffset = Math.floor(itemIndex / 9) * 0.15 + 0.3;

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
            if (itemIndex >= 27) break; // 3x3x3 = 27 items max per box
          }

          if (itemIndex >= 27) return; // Break outer loop too
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

// import React, { useRef, useState, useEffect } from 'react';
// import { Canvas, useFrame } from '@react-three/fiber';
// import { OrbitControls, Text } from '@react-three/drei';
// import * as THREE from 'three';

// function Box({ position, color = 'lightblue', label }) {
//   return (
//     <group position={position}>
//       <mesh castShadow receiveShadow>
//         <boxGeometry args={[1, 0.5, 1]} />
//         <meshStandardMaterial color={color} />
//       </mesh>
//       <Text
//         position={[0, 0.35, 0]}
//         fontSize={0.25}
//         color="black"
//         anchorX="center"
//         anchorY="middle"
//       >
//         {label}
//       </Text>
//     </group>
//   );
// }

// const itemColors = ["orange", "cyan", "yellow", "lime", "purple", "magenta", "tomato"];

// function Item({ position, label, color }) {
//   return (
//     <group position={position}>
//       <mesh castShadow>
//         <sphereGeometry args={[0.25, 16, 16]} />
//         <meshStandardMaterial color={color} />
//       </mesh>
//       <Text
//         position={[0, 0.4, 0]}
//         fontSize={0.18}
//         color="black"
//         anchorX="center"
//         anchorY="middle"
//       >
//         {label}
//       </Text>
//     </group>
//   );
// }

// function RoboticArm({ phase, position, onPhaseComplete }) {
//   // phase: 'idle' | 'moveToPick' | 'lift' | 'moveToDrop' | 'drop' | 'return'

//   const armRef = useRef();
//   const clawRef = useRef();

//   // Positions to move through for animation phases
//   const basePos = new THREE.Vector3(0, 0, 0);
//   const pickHeight = 2.5; // how high the arm lifts an item
//   const moveSpeed = 0.08;

//   // Local state for arm position and claw scale (to simulate open/close)
//   const pos = useRef(new THREE.Vector3().copy(basePos));
//   const targetPos = useRef(new THREE.Vector3().copy(basePos));
//   const clawScale = useRef(1);

//   useEffect(() => {
//     // Update targetPos based on phase and given position
//     if (phase === 'idle') {
//       targetPos.current.copy(basePos);
//       clawScale.current = 1; // open claw
//     }
//     else if (phase === 'moveToPick' && position) {
//       targetPos.current.set(position.x, 0.5, position.z);
//       clawScale.current = 1; // open claw
//     }
//     else if (phase === 'lift' && position) {
//       targetPos.current.set(position.x, pickHeight, position.z);
//       clawScale.current = 0.4; // claw closes to grip
//     }
//     else if (phase === 'moveToDrop' && position) {
//       targetPos.current.set(position.x, pickHeight, position.z);
//       clawScale.current = 0.4; // claw closed while moving
//     }
//     else if (phase === 'drop' && position) {
//       targetPos.current.set(position.x, 0.5, position.z);
//       clawScale.current = 1; // open claw to release
//     }
//     else if (phase === 'return') {
//       targetPos.current.copy(basePos);
//       clawScale.current = 1; // claw open
//     }
//   }, [phase, position]);

//   useFrame(() => {
//     if (!armRef.current || !clawRef.current) return;

//     // Move arm towards target position
//     pos.current.lerp(targetPos.current, moveSpeed);
//     armRef.current.position.copy(pos.current);

//     // Smooth claw scale
//     const currentScale = clawRef.current.scale.y;
//     clawRef.current.scale.y += (clawScale.current - currentScale) * 0.1;

//     // Check if arrived at target to move to next phase
//     if (pos.current.distanceTo(targetPos.current) < 0.05) {
//       onPhaseComplete();
//     }
//   });

//   return (
//     <group ref={armRef}>
//       {/* Arm base */}
//       <mesh position={[0, 0.5, 0]} castShadow>
//         <boxGeometry args={[1, 1, 1]} />
//         <meshStandardMaterial color="#666" />
//       </mesh>

//       {/* Vertical arm */}
//       <mesh position={[0, 1.8, 0]} castShadow>
//         <boxGeometry args={[0.2, 2.5, 0.2]} />
//         <meshStandardMaterial color="#444" />
//       </mesh>

//       {/* Claw */}
//       <mesh ref={clawRef} position={[0, 3.2, 0]} scale={[1, 1, 1]} castShadow>
//         <boxGeometry args={[0.8, 0.4, 0.8]} />
//         <meshStandardMaterial color="#222" />
//       </mesh>
//     </group>
//   );
// }

// export default function ArmSimulation() {
//   // Initial items
//   const initialItems = [
//     { id: 'a', position: [-4, 0.3, 0] },
//     { id: 'b', position: [-3, 0.3, 0] },
//     { id: 'c', position: [-2, 0.3, 0] },
//     { id: 'd', position: [-1, 0.3, 0] },
//     { id: 'e', position: [0, 0.3, 0] },
//     { id: 'f', position: [1, 0.3, 0] },
//     { id: 'g', position: [2, 0.3, 0] }
//   ];

//   // Storage boxes under where items come from
//   const storageBoxes = [
//     { label: 'Box A', position: [-4, 0, 0] },
//     { label: 'Box B', position: [-3, 0, 0] },
//     { label: 'Box C', position: [-2, 0, 0] },
//     { label: 'Box D', position: [-1, 0, 0] },
//     { label: 'Box E', position: [0, 0, 0] },
//     { label: 'Box F', position: [1, 0, 0] },
//     { label: 'Box G', position: [2, 0, 0] },
//       { label: 'Box H', position: [-4, 0, 1] },
//     { label: 'Box I', position: [-3, 0, 1] },
//     { label: 'Box J', position: [-2, 0, 1] },
//     { label: 'Box K', position: [-1, 0, 1] },
//     { label: 'Box L', position: [0, 0, 1] },
//     { label: 'Box M', position: [1, 0, 1] },
//     { label: 'Box N', position: [2, 0, 1] },
//         { label: 'Box O', position: [-4, 0, 2] },
//     { label: 'Box P', position: [-3, 0, 2] },
//     { label: 'Box Q', position: [-2, 0, 2] },
//     { label: 'Box R', position: [-1, 0, 2] },
//     { label: 'Box S', position: [0, 0, 2] },
//     { label: 'Box T', position: [1, 0, 2] },
//     { label: 'Box U', position: [2, 0, 2] }
//   ];

//   const itemBox = { label: 'Item Box', position: [-5, 0, -4] };
//   const orderTray = { label: 'Order Tray', position: [4, 0, 0] };

//   // States
//   const [items] = useState(initialItems);
//   const [orderInput, setOrderInput] = useState();
//   const [order, setOrder] = useState([]);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [phase, setPhase] = useState('idle'); // see RoboticArm phases
//   const [pickedItems, setPickedItems] = useState([]);
//   const [deliveredItems, setDeliveredItems] = useState([]);
//   const [currentTargetPos, setCurrentTargetPos] = useState(null);

//   // Start next cycle or finish
//   useEffect(() => {
//     if (currentIndex >= order.length) {
//       setPhase('idle');
//       setCurrentTargetPos(null);
//       return;
//     }

//     // Start picking the next item
//     if (phase === 'idle') {
//       const itemId = order[currentIndex];
//       const item = items.find(it => it.id === itemId);
//       if (item) {
//         setCurrentTargetPos(new THREE.Vector3(item.position[0], 0, item.position[2]));
//         setPhase('moveToPick');
//       }
//     }
//   }, [currentIndex, order, phase, items]);

//   // Called by RoboticArm on each phase complete to move to next phase
//   const handlePhaseComplete = () => {
//     switch (phase) {
//       case 'moveToPick':
//         setPhase('lift');
//         break;
//       case 'lift':
//         // Set drop position as order tray
//         setCurrentTargetPos(new THREE.Vector3(orderTray.position[0], 0, orderTray.position[2]));
//         setPhase('moveToDrop');
//         break;
//       case 'moveToDrop':
//         setPhase('drop');
//         break;
//       case 'drop':
//         setDeliveredItems(prev => [...prev, order[currentIndex]]);
//         setPickedItems(prev => [...prev, order[currentIndex]]);
//         setPhase('return');
//         break;
//       case 'return':
//         setCurrentIndex(prev => prev + 1);
//         setPhase('idle');
//         break;
//       default:
//         break;
//     }
//   };

//   // Handle new order submission
//   const handleOrderSubmit = () => {
//     const newOrder = orderInput
//       .split(',')
//       .map(s => s.trim().toLowerCase())
//       .filter(Boolean);

//     // Validate IDs exist in items
//     const validOrder = newOrder.filter(id => items.some(i => i.id === id));

//     setOrder(validOrder);
//     setCurrentIndex(0);
//     setPhase('idle');
//     setPickedItems([]);
//     setDeliveredItems([]);
//     setCurrentTargetPos(null);
//   };

//   return (
//     <>
//       {/* Controls */}
//       <div style={{
//         position: 'absolute',
//         top: 150,
//         left: 50,
//         zIndex: 10,
//         background: 'rgba(255 255 255 / 0.9)',
//         padding: 15,
//         borderRadius: 10,
//         fontFamily: 'Arial',
//         userSelect: 'none',
//         width: 280,
//         boxShadow: '0 0 10px rgba(0,0,0,0.2)'
//       }}>
//         <div style={{ marginBottom: 10, fontWeight: 'bold' }}>Enter Item IDs (comma separated):</div>
//         <input
//           type="text"
//           value={orderInput}
//           onChange={(e) => setOrderInput(e.target.value)}
//           style={{ width: '100%', padding: '8px', fontSize: 16, borderRadius: 6, border: '1px solid #aaa' }}
//           placeholder="e.g. a,b,f,g"
//           disabled={phase !== 'idle'}
//         />
//         <button
//           onClick={handleOrderSubmit}
//           style={{
//             marginTop: 10,
//             width: '100%',
//             padding: '10px',
//             fontSize: 16,
//             borderRadius: 6,
//             border: 'none',
//             backgroundColor: '#0077cc',
//             color: 'white',
//             cursor: phase === 'idle' ? 'pointer' : 'not-allowed',
//             opacity: phase === 'idle' ? 1 : 0.5,
//           }}
//           disabled={phase !== 'idle'}
//         >
//           Start Order
//         </button>
//         <div style={{ marginTop: 15, fontSize: 14, color: '#555' }}>
//           Current Phase: <b>{phase}</b>
//           <br />
//           Processing Item: <b>{order[currentIndex] || 'None'}</b>
//           <br />
//           Delivered: {deliveredItems.length}
//         </div>
//       </div>

//       {/* 3D Canvas */}
//       <Canvas camera={{ position: [6, 6, 8], fov: 50 }} shadows style={{ width: '100%', height: '100vh' ,}}>
//         <ambientLight intensity={0.6} />
//         <directionalLight
//           position={[10, 10, 5]}
//           intensity={1.2}
//           castShadow
//           shadow-mapSize={1024}
//           shadow-camera-far={50}
//           shadow-camera-left={-10}
//           shadow-camera-right={10}
//           shadow-camera-top={10}
//           shadow-camera-bottom={-10}
//         />
//         <OrbitControls />

//         {/* Ground */}
//         <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
//           <planeGeometry args={[20, 20]} />
//           <shadowMaterial opacity={0.3} />
//         </mesh>

//         {/* Storage Boxes */}
//         {storageBoxes.map((box, i) => (
//           <Box key={i} position={box.position} label={box.label} />
//         ))}

//         {/* Source Item Box */}
//         <Box position={itemBox.position} label={itemBox.label} color="#a0d995" />

//         {/* Order Tray */}
//         <Box position={orderTray.position} label={orderTray.label} color="#f48fb1" />

//         {/* Items that are NOT currently picked */}
//         {items
//           .filter(item => !pickedItems.includes(item.id))
//           .map((item, i) => (
//             <Item
//               key={item.id}
//               position={item.position}
//               label={item.id}
//               color={itemColors[i % itemColors.length]}
//             />
//           ))}

//         {/* Delivered Items in Order Tray */}
//         {deliveredItems.map((id, index) => {
//           const item = items.find(i => i.id === id);
//           const offsetX = index * 0.6;
//           return (
//             <Item
//               key={`delivered-${id}`}
//               position={[orderTray.position[0] + offsetX, 0.3, orderTray.position[2]]}
//               label={id}
//               color={itemColors[items.findIndex(i => i.id === id) % itemColors.length]}
//             />
//           );
//         })}

//         {/* Robotic Arm */}
//         <RoboticArm
//           phase={phase}
//           position={currentTargetPos}
//           onPhaseComplete={handlePhaseComplete}
//         />
//       </Canvas>
//     </>
//   );
// }

// import React, { useRef, useState, useEffect } from 'react';
// import { Canvas, useFrame } from '@react-three/fiber';
// import { OrbitControls, Text } from '@react-three/drei';
// import * as THREE from 'three';

// // Constants
// const ITEM_TYPES = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
// const ITEM_COLORS = {
//   'A': '#f44336', // red
//   'B': '#2196f3', // blue
//   'C': '#ffeb3b', // yellow
//   'D': '#4caf50', // green
//   'E': '#9c27b0', // purple
//   'F': '#ff9800', // orange
//   'G': '#00bcd4'  // cyan
// };

// // Box component representing storage locations
// function Box({ position, color = 'lightblue', label, isHighlighted = false }) {
//   return (
//     <group position={position}>
//       <mesh castShadow receiveShadow>
//         <boxGeometry args={[1, 0.5, 1]} />
//         <meshStandardMaterial color={isHighlighted ? '#ff9d9d' : color} />
//       </mesh>
//       <Text
//         position={[0, 0.35, 0]}
//         fontSize={0.2}
//         color="black"
//         anchorX="center"
//         anchorY="middle"
//       >
//         {label}
//       </Text>
//     </group>
//   );
// }

// // Item component representing products to be sorted/picked
// function Item({ position, itemType, isInMotion = false }) {
//   return (
//     <group position={position}>
//       <mesh castShadow>
//         <sphereGeometry args={[0.2, 16, 16]} />
//         <meshStandardMaterial color={ITEM_COLORS[itemType]} />
//       </mesh>
//       <Text
//         position={[0, 0.35, 0]}
//         fontSize={0.18}
//         color="black"
//         anchorX="center"
//         anchorY="middle"
//       >
//         {itemType}
//       </Text>
//       {isInMotion && (
//         <mesh>
//           <ringGeometry args={[0.25, 0.3, 16]} />
//           <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
//         </mesh>
//       )}
//     </group>
//   );
// }

// // Robotic arm component with animation logic
// function RoboticArm({ phase, position, onPhaseComplete }) {
//   const armRef = useRef();
//   const clawRef = useRef();

//   // Positions for animation phases
//   const basePos = new THREE.Vector3(0, 0, 0);
//   const pickHeight = 2.5;
//   const moveSpeed = 0.08;

//   // Local state for arm position and claw scale
//   const pos = useRef(new THREE.Vector3().copy(basePos));
//   const targetPos = useRef(new THREE.Vector3().copy(basePos));
//   const clawScale = useRef(1);

//   useEffect(() => {
//     // Update targetPos based on current phase
//     if (phase === 'idle') {
//       targetPos.current.copy(basePos);
//       clawScale.current = 1; // open claw
//     }
//     else if (phase === 'moveToPick' && position) {
//       targetPos.current.set(position.x, 0.5, position.z);
//       clawScale.current = 1; // open claw
//     }
//     else if (phase === 'lift' && position) {
//       targetPos.current.set(position.x, pickHeight, position.z);
//       clawScale.current = 0.4; // claw closes to grip
//     }
//     else if (phase === 'moveToDrop' && position) {
//       targetPos.current.set(position.x, pickHeight, position.z);
//       clawScale.current = 0.4; // claw closed while moving
//     }
//     else if (phase === 'drop' && position) {
//       targetPos.current.set(position.x, 0.5, position.z);
//       clawScale.current = 1; // open claw to release
//     }
//     else if (phase === 'return') {
//       targetPos.current.copy(basePos);
//       clawScale.current = 1; // claw open
//     }
//   }, [phase, position]);

//   useFrame(() => {
//     if (!armRef.current || !clawRef.current) return;

//     // Move arm towards target position
//     pos.current.lerp(targetPos.current, moveSpeed);
//     armRef.current.position.copy(pos.current);

//     // Smooth claw scale
//     const currentScale = clawRef.current.scale.y;
//     clawRef.current.scale.y += (clawScale.current - currentScale) * 0.1;

//     // Check if arrived at target to move to next phase
//     if (pos.current.distanceTo(targetPos.current) < 0.05) {
//       onPhaseComplete();
//     }
//   });

//   return (
//     <group ref={armRef}>
//       {/* Arm base */}
//       <mesh position={[0, 0.5, 0]} castShadow>
//         <boxGeometry args={[1.2, 1, 1.2]} />
//         <meshStandardMaterial color="#666" />
//       </mesh>

//       {/* Vertical arm */}
//       <mesh position={[0, 1.8, 0]} castShadow>
//         <boxGeometry args={[0.25, 2.6, 0.25]} />
//         <meshStandardMaterial color="#444" />
//       </mesh>

//       {/* Horizontal extension */}
//       <mesh position={[0, 3, 0]} castShadow>
//         <boxGeometry args={[0.8, 0.2, 0.2]} />
//         <meshStandardMaterial color="#444" />
//       </mesh>

//       {/* Claw */}
//       <group ref={clawRef} position={[0, 3.2, 0]}>
//         <mesh position={[-0.2, 0, 0]} castShadow>
//           <boxGeometry args={[0.1, 0.4, 0.1]} />
//           <meshStandardMaterial color="#222" />
//         </mesh>
//         <mesh position={[0.2, 0, 0]} castShadow>
//           <boxGeometry args={[0.1, 0.4, 0.1]} />
//           <meshStandardMaterial color="#222" />
//         </mesh>
//       </group>
//     </group>
//   );
// }

// // Main component for the simulation
// export default function EnhancedRoboticArmSimulation() {
//   // Define locations
//   const itemSourceContainer = { position: [-5, 0, -4], label: "Source Container" };
//   const sortingBoxes = ITEM_TYPES.map((type, i) => ({
//     type,
//     position: [-3 + i * 1.2, 0, -2],
//     label: `Box ${type}`,
//     items: []
//   }));
//   const orderTray = { position: [4, 0, 0], label: "Order Tray" };

//   // Simulation states
//   const [mode, setMode] = useState('sorting'); // 'sorting' or 'order-picking'
//   const [phase, setPhase] = useState('idle');
//   const [currentTargetPos, setCurrentTargetPos] = useState(null);
//   const [unsortedItems, setUnsortedItems] = useState([]);
//   const [boxContents, setBoxContents] = useState({});
//   const [orderQueue, setOrderQueue] = useState([]);
//   const [currentOrderItem, setCurrentOrderItem] = useState(null);
//   const [deliveredItems, setDeliveredItems] = useState([]);
//   const [orderInput, setOrderInput] = useState('');
//   const [currentSortItem, setCurrentSortItem] = useState(null);
//   const [highlightedBox, setHighlightedBox] = useState(null);
//   const [pendingItems, setPendingItems] = useState(10);
//   const [status, setStatus] = useState('Ready to start');

//   // Initialize box contents
//   useEffect(() => {
//     const initialBoxContents = {};
//     ITEM_TYPES.forEach(type => {
//       initialBoxContents[type] = [];
//     });
//     setBoxContents(initialBoxContents);
//   }, []);

//   // Generate random item for sorting
//   const generateRandomItem = () => {
//     const itemType = ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)];
//     return {
//       id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
//       type: itemType,
//       position: [
//         itemSourceContainer.position[0] + (Math.random() * 0.8 - 0.4),
//         0.3,
//         itemSourceContainer.position[2] + (Math.random() * 0.8 - 0.4)
//       ]
//     };
//   };

//   // Handle phase completion
//   const handlePhaseComplete = () => {
//     switch (phase) {
//       case 'moveToPick':
//         setPhase('lift');
//         break;
//       case 'lift':
//         // Determine where to drop based on mode
//         if (mode === 'sorting') {
//           // Find the right sorting box for this item type
//           const targetBox = sortingBoxes.find(box => box.type === currentSortItem.type);
//           if (targetBox) {
//             setHighlightedBox(targetBox.type);
//             setCurrentTargetPos(new THREE.Vector3(targetBox.position[0], 0, targetBox.position[2]));
//           }
//         } else {
//           // Move to order tray
//           setCurrentTargetPos(new THREE.Vector3(orderTray.position[0], 0, orderTray.position[2]));
//         }
//         setPhase('moveToDrop');
//         break;
//       case 'moveToDrop':
//         setPhase('drop');
//         break;
//       case 'drop':
//         if (mode === 'sorting') {
//           // Update the box contents with the sorted item
//           setBoxContents(prev => {
//             const newBoxContents = {...prev};
//             newBoxContents[currentSortItem.type] = [
//               ...newBoxContents[currentSortItem.type],
//               { ...currentSortItem, position: null } // Position will be calculated later
//             ];
//             return newBoxContents;
//           });
//           setCurrentSortItem(null);
//           setHighlightedBox(null);
//         } else {
//           // Add to delivered items for order picking
//           setDeliveredItems(prev => [...prev, currentOrderItem]);
//           setCurrentOrderItem(null);
//         }
//         setPhase('return');
//         break;
//       case 'return':
//         setPhase('idle');

//         // Determine next action based on mode
//         if (mode === 'sorting') {
//           if (unsortedItems.length > 0) {
//             // Continue sorting next item
//             startNextSorting();
//           } else if (pendingItems > 0) {
//             // Generate new items to sort
//             generateNewItems();
//           } else {
//             setStatus('Sorting complete. Ready for orders.');
//           }
//         } else {
//           if (orderQueue.length > 0) {
//             // Continue with next order item
//             processNextOrderItem();
//           } else {
//             setStatus('Order complete. Ready for new order.');
//           }
//         }
//         break;
//       default:
//         break;
//     }
//   };

//   // Generate new items for sorting
//   const generateNewItems = () => {
//     const newItems = Array(3).fill().map(() => generateRandomItem());
//     setUnsortedItems(prev => [...prev, ...newItems]);
//     setPendingItems(prev => prev - 3);
//     setStatus('Sorting items...');
//   };

//   // Start sorting the next item
//   const startNextSorting = () => {
//     if (unsortedItems.length > 0 && phase === 'idle') {
//       const nextItem = unsortedItems[0];
//       setUnsortedItems(prev => prev.slice(1));
//       setCurrentSortItem(nextItem);
//       setCurrentTargetPos(new THREE.Vector3(nextItem.position[0], 0, nextItem.position[2]));
//       setPhase('moveToPick');
//     }
//   };

//   // Process an order
//   const handleOrderSubmit = () => {
//     if (orderInput.trim() === '') return;

//     // Parse the order input
//     const newOrder = orderInput
//       .toUpperCase()
//       .split(',')
//       .map(s => s.trim())
//       .filter(type => ITEM_TYPES.includes(type) && boxContents[type].length > 0);

//     setOrderQueue(newOrder);
//     setDeliveredItems([]);
//     setMode('order-picking');
//     setStatus('Processing order...');
//     setOrderInput('');
//   };

//   // Process the next item in the order
//   const processNextOrderItem = () => {
//     if (orderQueue.length > 0 && phase === 'idle') {
//       const nextItemType = orderQueue[0];
//       setOrderQueue(prev => prev.slice(1));

//       // Get item from box contents
//       if (boxContents[nextItemType].length > 0) {
//         const nextItem = boxContents[nextItemType][0];
//         setBoxContents(prev => {
//           const newBoxContents = {...prev};
//           newBoxContents[nextItemType] = newBoxContents[nextItemType].slice(1);
//           return newBoxContents;
//         });

//         // Find the box position for this item type
//         const targetBox = sortingBoxes.find(box => box.type === nextItemType);
//         setCurrentOrderItem({...nextItem, type: nextItemType});
//         setHighlightedBox(nextItemType);
//         setCurrentTargetPos(new THREE.Vector3(targetBox.position[0], 0, targetBox.position[2]));
//         setPhase('moveToPick');
//       }
//     }
//   };

//   // Start initial sorting
//   useEffect(() => {
//     if (mode === 'sorting' && phase === 'idle' && unsortedItems.length === 0 && pendingItems > 0) {
//       generateNewItems();
//     }
//   }, [mode, phase, unsortedItems.length, pendingItems]);

//   // Start sorting when items are available
//   useEffect(() => {
//     if (mode === 'sorting' && phase === 'idle' && unsortedItems.length > 0) {
//       startNextSorting();
//     }
//   }, [mode, phase, unsortedItems]);

//   // Start order processing when order is submitted
//   useEffect(() => {
//     if (mode === 'order-picking' && phase === 'idle' && orderQueue.length > 0) {
//       processNextOrderItem();
//     }
//   }, [mode, phase, orderQueue]);

//   // Calculate positions for items in boxes
//   const getBoxItemPositions = () => {
//     const result = [];

//     Object.entries(boxContents).forEach(([type, items]) => {
//       const box = sortingBoxes.find(b => b.type === type);
//       if (box) {
//         items.forEach((item, index) => {
//           const xOffset = (index % 3) * 0.25 - 0.25;
//           const zOffset = Math.floor(index / 3) * 0.25 - 0.1;
//           result.push({
//             ...item,
//             position: [box.position[0] + xOffset, 0.3, box.position[2] + zOffset],
//             type
//           });
//         });
//       }
//     });

//     return result;
//   };

//   // Start new sorting session
//   const handleStartSorting = () => {
//     setMode('sorting');
//     setPendingItems(10);
//     setUnsortedItems([]);
//     setDeliveredItems([]);
//     setOrderQueue([]);
//     setCurrentOrderItem(null);
//     setCurrentSortItem(null);
//     setHighlightedBox(null);
//     setPhase('idle');
//     setBoxContents(prev => {
//       const emptyBoxes = {};
//       ITEM_TYPES.forEach(type => {
//         emptyBoxes[type] = [];
//       });
//       return emptyBoxes;
//     });
//     setStatus('Started new sorting session');
//   };

//   return (
//     <div className="w-full h-screen relative bg-gray-900">
//       {/* Controls Panel */}
//       <div className="absolute top-5 left-4 z-10 bg-white bg-opacity-90 p-4 rounded-lg shadow-lg w-80" style={{marginTop: '100px'}}>
//         <div className="mb-2 font-bold text-lg">Robotic Arm Warehouse Simulation</div>

//         <div className="mb-4">
//           <div className="text-sm font-medium mb-1">Current Mode: <span className="font-bold text-blue-600">{mode === 'sorting' ? 'Sorting Items' : 'Order Picking'}</span></div>
//           <div className="text-sm font-medium mb-1">Current Phase: <span className="font-bold">{phase}</span></div>
//           <div className="text-sm font-medium mb-1">Status: <span className="italic">{status}</span></div>
//         </div>

//         {mode === 'sorting' ? (
//           <div className="mb-4">
//             <div className="text-sm font-medium">Sorting Progress:</div>
//             <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1 mb-2">
//               <div className="bg-blue-600 h-2.5 rounded-full" style={{
//                 width: `${Math.min(100, ((10 - pendingItems + unsortedItems.length) / 10) * 100)}%`
//               }}></div>
//             </div>
//             <div className="text-xs text-gray-600">
//               Pending: {pendingItems} | Unsorted: {unsortedItems.length} |
//               Sorted: {Object.values(boxContents).flat().length}
//             </div>
//           </div>
//         ) : (
//           <div className="mb-4">
//             <div className="text-sm font-medium">Order Progress:</div>
//             <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1 mb-2">
//               <div className="bg-green-600 h-2.5 rounded-full" style={{
//                 width: `${orderQueue.length + deliveredItems.length > 0 ?
//                   (deliveredItems.length / (orderQueue.length + deliveredItems.length)) * 100 : 0}%`
//               }}></div>
//             </div>
//             <div className="text-xs text-gray-600">
//               Remaining: {orderQueue.length} | Delivered: {deliveredItems.length}
//             </div>
//           </div>
//         )}

//         {/* Order input form - only enabled when in order-picking mode or sorting is complete */}
//         <div className="mb-4">
//           <label className="block text-sm font-medium mb-1">
//             Order Items (comma separated):
//           </label>
//           <input
//             type="text"
//             value={orderInput}
//             onChange={(e) => setOrderInput(e.target.value)}
//             placeholder="e.g. A,B,C,A,D"
//             disabled={mode === 'sorting' && (pendingItems > 0 || unsortedItems.length > 0 || phase !== 'idle')}
//             className="w-full p-2 border border-gray-300 rounded text-sm"
//           />
//           <button
//             onClick={handleOrderSubmit}
//             disabled={mode === 'sorting' && (pendingItems > 0 || unsortedItems.length > 0 || phase !== 'idle')}
//             className={`w-full mt-2 py-2 rounded font-medium text-white
//               ${(mode === 'sorting' && (pendingItems > 0 || unsortedItems.length > 0 || phase !== 'idle'))
//                 ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
//           >
//             Process Order
//           </button>
//         </div>

//         {/* Mode switch button */}
//         <button
//           onClick={handleStartSorting}
//           disabled={phase !== 'idle'}
//           className={`w-full py-2 rounded font-medium text-white ${phase !== 'idle'
//             ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
//         >
//           Start New Sorting Session
//         </button>

//         {/* Inventory display */}
//         <div className="mt-4 text-sm">
//           <div className="font-medium mb-1">Current Inventory:</div>
//           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 3fr)', gap: '40px' }}>
//             {ITEM_TYPES.map(type => (
//               <div key={type}
//                 className="flex flex-col items-center p-1 rounded"
//                 style={{ backgroundColor: ITEM_COLORS[type] + '40' }}>
//                 <div className="font-bold">{type}</div>
//                 <div>{boxContents[type]?.length || 0}</div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* 3D Canvas */}
//       <Canvas camera={{ position: [8, 8, 8], fov: 50 }} shadows style={{ width: '100%', height: '100vh' }}>
//         <color attach="background" args={['#f0f0f0']} />
//         <ambientLight intensity={0.6} />
//         <directionalLight
//           position={[10, 10, 5]}
//           intensity={1.2}
//           castShadow
//           shadow-mapSize={1024}
//           shadow-camera-far={50}
//           shadow-camera-left={-10}
//           shadow-camera-right={10}
//           shadow-camera-top={10}
//           shadow-camera-bottom={-10}
//         />
//         <OrbitControls />

//         {/* Ground */}
//         <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
//           <planeGeometry args={[30, 30]} />
//           <meshStandardMaterial color="#e0e0e0" />
//         </mesh>

//         {/* Grid lines */}
//         <gridHelper args={[30, 30, '#999999', '#dddddd']} position={[0, 0.01, 0]} />

//         {/* Source container */}
//         <Box
//           position={itemSourceContainer.position}
//           label={itemSourceContainer.label}
//           color="#f0c674"
//         />

//         {/* Sorting boxes */}
//         {sortingBoxes.map((box) => (
//           <Box
//             key={box.type}
//             position={box.position}
//             label={box.label}
//             color="#81a2be"
//             isHighlighted={highlightedBox === box.type}
//           />
//         ))}

//         {/* Order tray */}
//         <Box position={orderTray.position} label={orderTray.label} color="#b5bd68" />

//         {/* Unsorted items in container */}
//         {unsortedItems.map((item) => (
//           <Item
//             key={item.id}
//             position={item.position}
//             itemType={item.type}
//             isInMotion={currentSortItem?.id === item.id}
//           />
//         ))}

//         {/* Sorted items in boxes */}
//         {getBoxItemPositions().map((item) => (
//           <Item
//             key={item.id}
//             position={item.position}
//             itemType={item.type}
//             isInMotion={currentOrderItem?.id === item.id}
//           />
//         ))}

//         {/* Delivered items in order tray */}
//         {deliveredItems.map((item, index) => {
//           const offsetX = (index % 4) * 0.5 - 0.75;
//           const offsetZ = Math.floor(index / 4) * 0.5 - 0.25;
//           return (
//             <Item
//               key={`delivered-${item.id || index}`}
//               position={[orderTray.position[0] + offsetX, 0.3, orderTray.position[2] + offsetZ]}
//               itemType={item.type}
//             />
//           );
//         })}

//         {/* Robotic Arm */}
//         <RoboticArm
//           phase={phase}
//           position={currentTargetPos}
//           onPhaseComplete={handlePhaseComplete}
//         />
//       </Canvas>
//     </div>
//   );
// }

// import React, { useRef, useState, useEffect } from "react";
// import { Canvas, useFrame } from "@react-three/fiber";
// import { OrbitControls, Text } from "@react-three/drei";
// import * as THREE from "three";

// // Constants (Keep these the same)
// const ITEM_TYPES = ["A", "B", "C", "D", "E", "F", "G"];
// const ITEM_COLORS = {
//   A: "#f44336", // red
//   B: "#2196f3", // blue
//   C: "#ffeb3b", // yellow
//   D: "#4caf50", // green
//   E: "#9c27b0", // purple
//   F: "#ff9800", // orange
//   G: "#00bcd4", // cyan
// };

// // Box component (Keep this the same)
// function Box({ position, color = "lightblue", label, isHighlighted = false }) {
//   return (
//     <group position={position}>
//       <mesh castShadow receiveShadow>
//         <boxGeometry args={[1, 0.5, 1]} />
//         <meshStandardMaterial color={isHighlighted ? "#ff9d9d" : color} />
//       </mesh>
//       <Text
//         position={[0, 0.35, 0]}
//         fontSize={0.2}
//         color="black"
//         anchorX="center"
//         anchorY="middle"
//       >
//         {label}
//       </Text>
//     </group>
//   );
// }

// // Item component (Keep this the same)
// function Item({ position, itemType, isInMotion = false }) {
//   return (
//     <group position={position}>
//       <mesh castShadow>
//         <sphereGeometry args={[0.2, 16, 16]} />
//         <meshStandardMaterial color={ITEM_COLORS[itemType]} />
//       </mesh>
//       <Text
//         position={[0, 0.35, 0]}
//         fontSize={0.18}
//         color="black"
//         anchorX="center"
//         anchorY="middle"
//       >
//         {itemType}
//       </Text>
//       {isInMotion && (
//         <mesh>
//           <ringGeometry args={[0.25, 0.3, 16]} />
//           <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
//         </mesh>
//       )}
//     </group>
//   );
// }

// // Robotic arm component with animation logic
// function RoboticArm({ phase, position, onPhaseComplete }) {
//   const armRef = useRef();
//   const clawRef = useRef();

//   // Constants for arm behavior
//   const basePosY = 0.5; // Base Y position for horizontal movement
//   const pickDropY = 0.5; // Y position when picking or dropping an item
//   const travelHeight = 2.5; // Y position when arm is moving horizontally between locations
//   const moveSpeed = 0.08;
//   const tolerance = 0.05; // How close the arm needs to be to a target to consider it "arrived"

//   // Current actual position of the arm's base group
//   const currentArmPos = useRef(new THREE.Vector3());
//   // The final desired destination for the arm's end-effector
//   const finalTargetPos = useRef(new THREE.Vector3());
//   // The intermediate target for the current axis-aligned movement step
//   const intermediateTargetPos = useRef(new THREE.Vector3());
//   const clawScale = useRef(1); // 1 = open, 0.4 = closed

//   // State to manage the sequential sub-phases of movement for efficiency
//   const [movementSubPhase, setMovementSubPhase] = useState("idle"); // 'moveX', 'moveZ', 'moveY', 'clawAction', 'complete'

//   useEffect(() => {
//     if (!armRef.current) return;
//     // Initialize currentArmPos from arm's actual position
//     currentArmPos.current.copy(armRef.current.position);
//   }, []);

//   useEffect(() => {
//     // This effect is triggered when the main `phase` or `position` prop changes.
//     // It sets up the `finalTargetPos` and initiates the first `movementSubPhase`.

//     if (phase === "idle") {
//       finalTargetPos.current.copy(new THREE.Vector3(0, basePosY, 0)); // Go to main base position
//       clawScale.current = 1; // Open claw
//       setMovementSubPhase("moveX_return"); // Initiate return sequence
//     } else if (phase === "moveToPick" && position) {
//       // Pick: First move up to travel height, then horizontally to X, then Z, then down to pickY.
//       // But for `moveToPick`, we are moving FROM the source container TO the item's X/Z.
//       // So first bring arm to travel height at current X/Z, then move X/Z.
//       finalTargetPos.current.set(position.x, pickDropY, position.z); // Item's ground position
//       clawScale.current = 1; // Ensure claw is open for picking

//       // First, elevate to travel height at current horizontal position
//       intermediateTargetPos.current.set(
//         currentArmPos.current.x,
//         travelHeight,
//         currentArmPos.current.z
//       );
//       setMovementSubPhase("moveY_up");
//     } else if (phase === "lift" && position) {
//       // Lift: Just move vertically up from pick position to travel height
//       finalTargetPos.current.set(position.x, travelHeight, position.z); // Lifted position
//       clawScale.current = 0.4; // Claw closes to grip *during* lift

//       intermediateTargetPos.current.copy(finalTargetPos.current); // Direct Y movement
//       setMovementSubPhase("moveY");
//     } else if (phase === "moveToDrop" && position) {
//       // Drop: Arm is already at travel height with item. Move horizontally to drop location.
//       finalTargetPos.current.set(position.x, travelHeight, position.z); // Drop location at travel height
//       clawScale.current = 0.4; // Claw remains closed while moving

//       // First align X at travel height
//       intermediateTargetPos.current.set(
//         finalTargetPos.current.x,
//         travelHeight,
//         currentArmPos.current.z
//       );
//       setMovementSubPhase("moveX");
//     } else if (phase === "drop" && position) {
//       // Drop item: Move vertically down from travel height to drop position
//       finalTargetPos.current.set(position.x, pickDropY, position.z); // Ground position for dropping
//       clawScale.current = 1; // Open claw to release *during* drop

//       intermediateTargetPos.current.copy(finalTargetPos.current); // Direct Y movement
//       setMovementSubPhase("moveY");
//     } else if (phase === "return") {
//       // Return: Arm is at drop position. First lift to travel height, then go to base X/Z.
//       finalTargetPos.current.copy(new THREE.Vector3(0, pickDropY, 0)); // Base pickDropY
//       clawScale.current = 1; // Ensure claw is open

//       // First, elevate to travel height at current X/Z
//       intermediateTargetPos.current.set(
//         currentArmPos.current.x,
//         travelHeight,
//         currentArmPos.current.z
//       );
//       setMovementSubPhase("moveY_up");
//     }
//   }, [phase, position]); // Depend on phase and position

//   useFrame(() => {
//     if (!armRef.current || !clawRef.current) return;

//     // Update current position from the actual mesh position
//     currentArmPos.current.copy(armRef.current.position);

//     // Smooth claw scale
//     const currentClawScale = clawRef.current.scale.y;
//     clawRef.current.scale.y += (clawScale.current - currentClawScale) * 0.1;

//     let movementCompleted = false;

//     switch (movementSubPhase) {
//       case "moveY_up": // For initial lift to travel height (e.g., at start of moveToPick or return)
//         currentArmPos.current.y = THREE.MathUtils.lerp(
//           currentArmPos.current.y,
//           intermediateTargetPos.current.y,
//           moveSpeed
//         );
//         if (
//           Math.abs(currentArmPos.current.y - intermediateTargetPos.current.y) <
//           tolerance
//         ) {
//           currentArmPos.current.y = intermediateTargetPos.current.y;
//           movementCompleted = true;
//           // After moving up, proceed to horizontal X movement (or Z if X is already aligned)
//           intermediateTargetPos.current.set(
//             finalTargetPos.current.x,
//             travelHeight,
//             currentArmPos.current.z
//           );
//           setMovementSubPhase("moveX");
//         }
//         break;

//       case "moveX": // Horizontal X movement
//         currentArmPos.current.x = THREE.MathUtils.lerp(
//           currentArmPos.current.x,
//           intermediateTargetPos.current.x,
//           moveSpeed
//         );
//         if (
//           Math.abs(currentArmPos.current.x - intermediateTargetPos.current.x) <
//           tolerance
//         ) {
//           currentArmPos.current.x = intermediateTargetPos.current.x;
//           movementCompleted = true;
//           // After X, proceed to horizontal Z movement
//           intermediateTargetPos.current.set(
//             finalTargetPos.current.x,
//             travelHeight,
//             finalTargetPos.current.z
//           );
//           setMovementSubPhase("moveZ");
//         }
//         break;

//       case "moveZ": // Horizontal Z movement
//         currentArmPos.current.z = THREE.MathUtils.lerp(
//           currentArmPos.current.z,
//           intermediateTargetPos.current.z,
//           moveSpeed
//         );
//         if (
//           Math.abs(currentArmPos.current.z - intermediateTargetPos.current.z) <
//           tolerance
//         ) {
//           currentArmPos.current.z = intermediateTargetPos.current.z;
//           movementCompleted = true;
//           // After Z, if `phase` is 'moveToPick' or 'drop' (which need a final Y drop), then moveY_down.
//           // Otherwise, if `phase` is 'moveToDrop' or 'lift' (which are already at travel height), then mark as complete.
//           if (phase === "moveToPick" || phase === "drop") {
//             intermediateTargetPos.current.set(
//               finalTargetPos.current.x,
//               pickDropY,
//               finalTargetPos.current.z
//             );
//             setMovementSubPhase("moveY_down");
//           } else {
//             // For moveToDrop, lift, return, we just finished horizontal travel.
//             // The main phase logic will take it to 'drop' or 'return'
//             setMovementSubPhase("complete");
//           }
//         }
//         break;

//       case "moveY": // Direct vertical movement (used for lift and drop)
//         currentArmPos.current.y = THREE.MathUtils.lerp(
//           currentArmPos.current.y,
//           intermediateTargetPos.current.y,
//           moveSpeed
//         );
//         if (
//           Math.abs(currentArmPos.current.y - intermediateTargetPos.current.y) <
//           tolerance
//         ) {
//           currentArmPos.current.y = intermediateTargetPos.current.y;
//           movementCompleted = true;
//           setMovementSubPhase("complete");
//         }
//         break;

//       case "moveY_down": // Final vertical drop for pick/drop
//         currentArmPos.current.y = THREE.MathUtils.lerp(
//           currentArmPos.current.y,
//           intermediateTargetPos.current.y,
//           moveSpeed
//         );
//         if (
//           Math.abs(currentArmPos.current.y - intermediateTargetPos.current.y) <
//           tolerance
//         ) {
//           currentArmPos.current.y = intermediateTargetPos.current.y;
//           movementCompleted = true;
//           setMovementSubPhase("complete");
//         }
//         break;

//       case "moveX_return": // First horizontal X movement during return to base
//         currentArmPos.current.x = THREE.MathUtils.lerp(
//           currentArmPos.current.x,
//           finalTargetPos.current.x,
//           moveSpeed
//         );
//         if (
//           Math.abs(currentArmPos.current.x - finalTargetPos.current.x) <
//           tolerance
//         ) {
//           currentArmPos.current.x = finalTargetPos.current.x;
//           movementCompleted = true;
//           // After X, proceed to horizontal Z movement for return
//           setMovementSubPhase("moveZ_return");
//         }
//         break;

//       case "moveZ_return": // Second horizontal Z movement during return to base
//         currentArmPos.current.z = THREE.MathUtils.lerp(
//           currentArmPos.current.z,
//           finalTargetPos.current.z,
//           moveSpeed
//         );
//         if (
//           Math.abs(currentArmPos.current.z - finalTargetPos.current.z) <
//           tolerance
//         ) {
//           currentArmPos.current.z = finalTargetPos.current.z;
//           movementCompleted = true;
//           // After Z, if current Y is not pickDropY, move Y down for return. Otherwise, complete.
//           if (Math.abs(currentArmPos.current.y - pickDropY) > tolerance) {
//             intermediateTargetPos.current.set(
//               finalTargetPos.current.x,
//               pickDropY,
//               finalTargetPos.current.z
//             );
//             setMovementSubPhase("moveY_down");
//           } else {
//             setMovementSubPhase("complete");
//           }
//         }
//         break;

//       case "complete":
//         // Wait for claw to reach its final scale before calling onPhaseComplete
//         if (Math.abs(clawRef.current.scale.y - clawScale.current) < 0.1) {
//           onPhaseComplete();
//           setMovementSubPhase("idle"); // Reset for next operation
//         }
//         break;

//       case "idle":
//       default:
//         // No movement
//         break;
//     }

//     armRef.current.position.copy(currentArmPos.current);
//   });

//   return (
//     <group ref={armRef}>
//       {/* Arm base */}
//       <mesh position={[0, 0.5, 0]} castShadow>
//         <boxGeometry args={[1.2, 1, 1.2]} />
//         <meshStandardMaterial color="#666" />
//       </mesh>

//       {/* Vertical arm (gantry column) */}
//       <mesh position={[0, 1.8, 0]} castShadow>
//         <boxGeometry args={[0.25, 2.6, 0.25]} />
//         <meshStandardMaterial color="#444" />
//       </mesh>

//       {/* Horizontal extension (gantry beam) */}
//       <mesh position={[0, 3, 0]} castShadow>
//         <boxGeometry args={[0.8, 0.2, 0.2]} />
//         <meshStandardMaterial color="#444" />
//       </mesh>

//       {/* Claw */}
//       <group ref={clawRef} position={[0, 3.2, 0]}>
//         <mesh position={[-0.2, 0, 0]} castShadow>
//           <boxGeometry args={[0.1, 0.4, 0.1]} />
//           <meshStandardMaterial color="#222" />
//         </mesh>
//         <mesh position={[0.2, 0, 0]} castShadow>
//           <boxGeometry args={[0.1, 0.4, 0.1]} />
//           <meshStandardMaterial color="#222" />
//         </mesh>
//       </group>
//     </group>
//   );
// }

// // Main component for the simulation (Rest of this file remains the same)
// export default function EnhancedRoboticArmSimulation() {
//   // Create 6x6 grid of boxes
//   const gridSize = 10;
//   const gridSpacing = 1.5;
//   const gridOffset = ((gridSize - 1) * gridSpacing) / 2; // Center the grid

//   const storageBoxes = [];
//   for (let x = 0; x < gridSize; x++) {
//     for (let z = 0; z < gridSize; z++) {
//       const posX = x * gridSpacing - gridOffset;
//       const posZ = z * gridSpacing - gridOffset;

//       // Create box label with coordinates
//       const label = `${String.fromCharCode(65 + x)}${z + 1}`;

//       storageBoxes.push({
//         id: label,
//         position: [posX, 0, posZ],
//         label: label,
//         items: [],
//       });
//     }
//   }

//   // Define locations
//   const itemSourceContainer = { position: [-10, 0, 0], label: "Source" };
//   const orderTray = { position: [10, 0, 0], label: "Order Tray" };

//   // Simulation states
//   const [mode, setMode] = useState("sorting"); // 'sorting' or 'order-picking'
//   const [phase, setPhase] = useState("idle");
//   const [currentTargetPos, setCurrentTargetPos] = useState(null);
//   const [unsortedItems, setUnsortedItems] = useState([]);
//   const [boxContents, setBoxContents] = useState({});
//   const [orderQueue, setOrderQueue] = useState([]);
//   const [currentOrderItem, setCurrentOrderItem] = useState(null);
//   const [deliveredItems, setDeliveredItems] = useState([]);
//   const [orderInput, setOrderInput] = useState("");
//   const [currentSortItem, setCurrentSortItem] = useState(null);
//   const [highlightedBox, setHighlightedBox] = useState(null);
//   const [pendingItems, setPendingItems] = useState(10);
//   const [status, setStatus] = useState("Ready to start");
//   const [sourceItems, setSourceItems] = useState({});
//   const [gridMap, setGridMap] = useState({});

//   // Initialize box contents and grid map
//   useEffect(() => {
//     const initialBoxContents = {};
//     const initialSourceItems = {};
//     const initialGridMap = {};

//     // Initialize source items (inventory counts)
//     ITEM_TYPES.forEach((type) => {
//       initialSourceItems[type] = 0;
//     });

//     // Initialize box contents
//     storageBoxes.forEach((box) => {
//       initialBoxContents[box.id] = [];
//       initialGridMap[box.id] = { type: null, count: 0 };
//     });

//     setBoxContents(initialBoxContents);
//     setSourceItems(initialSourceItems);
//     setGridMap(initialGridMap);
//   }, []);

//   const generateRandomItem = () => {
//     const itemType = ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)];

//     // Update source items count
//     setSourceItems((prev) => ({
//       ...prev,
//       [itemType]: (prev[itemType] || 0) + 1,
//     }));

//     return {
//       id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
//       type: itemType,
//       position: [
//         itemSourceContainer.position[0] + (Math.random() * 0.8 - 0.4),
//         0.3,
//         itemSourceContainer.position[2] + (Math.random() * 0.8 - 0.4),
//       ],
//     };
//   };

//   // Assign a target box for an item type
//   const getTargetBoxForItemType = (itemType) => {
//     // First check if there's already a box assigned for this type
//     const existingBox = Object.entries(gridMap).find(
//       ([_, value]) => value.type === itemType
//     );

//     if (existingBox) {
//       return storageBoxes.find((box) => box.id === existingBox[0]);
//     }

//     // If not, find an empty box to assign
//     const emptyBoxKey = Object.entries(gridMap).find(
//       ([_, value]) => value.type === null
//     )?.[0];

//     if (emptyBoxKey) {
//       // Assign this type to the box
//       setGridMap((prev) => ({
//         ...prev,
//         [emptyBoxKey]: { type: itemType, count: 0 },
//       }));

//       return storageBoxes.find((box) => box.id === emptyBoxKey);
//     }

//     // If all boxes are assigned, find the one with this type or first one
//     return storageBoxes[0];
//   };

//   // Handle phase completion
//   const handlePhaseComplete = () => {
//     switch (phase) {
//       case "moveToPick":
//         setPhase("lift");
//         break;
//       case "lift":
//         // Determine where to drop based on mode
//         if (mode === "sorting") {
//           // Find the right sorting box for this item type
//           const targetBox = getTargetBoxForItemType(currentSortItem.type);

//           if (targetBox) {
//             setHighlightedBox(targetBox.id);
//             setCurrentTargetPos(
//               new THREE.Vector3(targetBox.position[0], 0, targetBox.position[2])
//             );
//           }
//         } else {
//           // Move to order tray
//           setCurrentTargetPos(
//             new THREE.Vector3(orderTray.position[0], 0, orderTray.position[2])
//           );
//         }
//         setPhase("moveToDrop");
//         break;
//       case "moveToDrop":
//         setPhase("drop");
//         break;
//       case "drop":
//         if (mode === "sorting") {
//           // Update source items (decrease count)
//           setSourceItems((prev) => ({
//             ...prev,
//             [currentSortItem.type]: Math.max(0, prev[currentSortItem.type] - 1),
//           }));

//           // Find box ID
//           const targetBox = getTargetBoxForItemType(currentSortItem.type);
//           const boxId = targetBox.id;

//           // Update the box contents with the sorted item
//           setBoxContents((prev) => {
//             const newBoxContents = { ...prev };
//             if (!newBoxContents[boxId]) {
//               newBoxContents[boxId] = [];
//             }
//             newBoxContents[boxId] = [
//               ...newBoxContents[boxId],
//               { ...currentSortItem, position: null },
//             ];
//             return newBoxContents;
//           });

//           // Update grid map count
//           setGridMap((prev) => ({
//             ...prev,
//             [boxId]: {
//               type: currentSortItem.type,
//               count: (prev[boxId].count || 0) + 1,
//             },
//           }));

//           setCurrentSortItem(null);
//           setHighlightedBox(null);
//         } else {
//           // Add to delivered items for order picking
//           setDeliveredItems((prev) => [...prev, currentOrderItem]);
//           setCurrentOrderItem(null);
//         }
//         setPhase("return");
//         break;
//       case "return":
//         setPhase("idle");

//         // Determine next action based on mode
//         if (mode === "sorting") {
//           if (unsortedItems.length > 0) {
//             // Continue sorting next item
//             startNextSorting();
//           } else if (pendingItems > 0) {
//             // Generate new items to sort
//             generateNewItems();
//           } else {
//             setStatus("Sorting complete. Ready for orders.");
//           }
//         } else {
//           if (orderQueue.length > 0) {
//             // Continue with next order item
//             processNextOrderItem();
//           } else {
//             setStatus("Order complete. Ready for new order.");
//           }
//         }
//         break;
//       default:
//         break;
//     }
//   };

//   // Generate new items for sorting
//   const generateNewItems = () => {
//     const newItems = Array(3)
//       .fill()
//       .map(() => generateRandomItem());
//     setUnsortedItems((prev) => [...prev, ...newItems]);
//     setPendingItems((prev) => prev - 3);
//     setStatus("Sorting items...");
//   };

//   // Start sorting the next item
//   const startNextSorting = () => {
//     if (unsortedItems.length > 0 && phase === "idle") {
//       const nextItem = unsortedItems[0];
//       setUnsortedItems((prev) => prev.slice(1));
//       setCurrentSortItem(nextItem);
//       setCurrentTargetPos(
//         new THREE.Vector3(nextItem.position[0], 0, nextItem.position[2])
//       );
//       setPhase("moveToPick");
//     }
//   };
// const [orderMessage,setOrderMessage]=useState("")
//   // Process an order
//   const handleOrderSubmit = () => {
//     if (orderInput.trim() === "") return;

//     // Parse the order input
//     const newOrder = orderInput
//       .toUpperCase()
//       .split(",")
//       .map((s) => s.trim())
//       .filter(
//         (type) =>
//           ITEM_TYPES.includes(type) &&
//           Object.values(gridMap).some(
//             (box) => box.type === type && box.count > 0
//           )
//       );

//     setOrderQueue(newOrder);
//     setDeliveredItems([]);
//     setMode("order-picking");
//     setStatus("Processing order...");
//     setOrderInput("");
//     alert("order completed")
//   };

//   // Process the next item in the order
//   const processNextOrderItem = () => {
//     if (orderQueue.length > 0 && phase === "idle") {
//       const nextItemType = orderQueue[0];
//       setOrderQueue((prev) => prev.slice(1));

//       // Find box containing this item type
//       const boxEntry = Object.entries(gridMap).find(
//         ([_, value]) => value.type === nextItemType && value.count > 0
//       );

//       if (boxEntry) {
//         const boxId = boxEntry[0];
//         const targetBox = storageBoxes.find((box) => box.id === boxId);

//         // Get item from box contents
//         if (boxContents[boxId] && boxContents[boxId].length > 0) {
//           const nextItem = boxContents[boxId][0];

//           // Update box contents
//           setBoxContents((prev) => {
//             const newBoxContents = { ...prev };
//             newBoxContents[boxId] = newBoxContents[boxId].slice(1);
//             return newBoxContents;
//           });

//           // Update grid map count
//           setGridMap((prev) => ({
//             ...prev,
//             [boxId]: {
//               ...prev[boxId],
//               count: Math.max(0, prev[boxId].count - 1),
//             },
//           }));

//           setCurrentOrderItem({ ...nextItem, type: nextItemType });
//           setHighlightedBox(boxId);
//           setCurrentTargetPos(
//             new THREE.Vector3(targetBox.position[0], 0, targetBox.position[2])
//           );
//           setPhase("moveToPick");
//         }
//       }
//     }
//   };

//   // Start initial sorting
//   useEffect(() => {
//     if (
//       mode === "sorting" &&
//       phase === "idle" &&
//       unsortedItems.length === 0 &&
//       pendingItems > 0
//     ) {
//       generateNewItems();
//     }
//   }, [mode, phase, unsortedItems.length, pendingItems]);

//   // Start sorting when items are available
//   useEffect(() => {
//     if (mode === "sorting" && phase === "idle" && unsortedItems.length > 0) {
//       startNextSorting();
//     }
//   }, [mode, phase, unsortedItems]);

//   // Start order processing when order is submitted
//   useEffect(() => {
//     if (mode === "order-picking" && phase === "idle" && orderQueue.length > 0) {
//       processNextOrderItem();
//     }
//   }, [mode, phase, orderQueue]);

//   // Calculate positions for items in boxes
//   const getBoxItemPositions = () => {
//     const result = [];

//     Object.entries(boxContents).forEach(([boxId, items]) => {
//       const box = storageBoxes.find((b) => b.id === boxId);
//       if (box) {
//         items.forEach((item, index) => {
//           const xOffset = (index % 3) * 0.25 - 0.25;
//           const zOffset = Math.floor(index / 3) * 0.25 - 0.1;
//           result.push({
//             ...item,
//             position: [
//               box.position[0] + xOffset,
//               0.3,
//               box.position[2] + zOffset,
//             ],
//             type: gridMap[boxId]?.type || item.type,
//           });
//         });
//       }
//     });

//     return result;
//   };

//   // Start new sorting session
//   const handleStartSorting = () => {
//     setMode("sorting");
//     setPendingItems(21); // Increased to have more items
//     setUnsortedItems([]);
//     setDeliveredItems([]);
//     setOrderQueue([]);
//     setCurrentOrderItem(null);
//     setCurrentSortItem(null);
//     setHighlightedBox(null);
//     setPhase("idle");

//     // Reset box contents
//     const initialBoxContents = {};
//     storageBoxes.forEach((box) => {
//       initialBoxContents[box.id] = [];
//     });
//     setBoxContents(initialBoxContents);

//     // Reset source items
//     const resetSourceItems = {};
//     ITEM_TYPES.forEach((type) => {
//       resetSourceItems[type] = 0;
//     });
//     setSourceItems(resetSourceItems);

//     // Reset grid map but keep type assignments
//     setGridMap((prev) => {
//       const newGridMap = {};
//       Object.entries(prev).forEach(([boxId, value]) => {
//         newGridMap[boxId] = { type: value.type, count: 0 };
//       });
//       return newGridMap;
//     });

//     setStatus("Started new sorting session");
//   };

//   // Get box color based on content type
//   const getBoxColor = (boxId) => {
//     const type = gridMap[boxId]?.type;
//     return type ? ITEM_COLORS[type] : "#81a2be";
//   };

//   return (
//     <div className="w-full h-screen relative bg-gray-900">
//       {/* Controls Panel */}
//       <div
//         className="absolute top-0 left-0 z-10 bg-white bg-opacity-90 p-4 rounded-lg shadow-lg w-80 m-4"
//         style={{ backgroundColor: "black" }}
//       >
//         <div className="mb-2 font-bold text-lg">Warehouse Simulation</div>

//         <div className="mb-4">
//           <div className="text-sm font-medium mb-1">
//             Mode:{" "}
//             <span className="font-bold text-blue-600">
//               {mode === "sorting" ? "Sorting Items" : "Order Picking"}
//             </span>
//           </div>
//           <div className="text-sm font-medium mb-1">
//             Phase: <span className="font-bold">{phase}</span>
//           </div>
//           <div className="text-sm font-medium mb-1">
//             Status: <span className="italic">{status}</span>
//           </div>
//         </div>

//         {mode === "sorting" ? (
//           <div className="mb-4">
//             <div className="text-sm font-medium">Sorting Progress:</div>
//             <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1 mb-2">
//               <div
//                 className="bg-blue-600 h-2.5 rounded-full"
//                 style={{
//                   width: `${Math.min(
//                     100,
//                     ((21 - pendingItems + unsortedItems.length) / 21) * 100
//                   )}%`,
//                 }}
//               ></div>
//             </div>
//             <div className="text-xs text-gray-600">
//               Pending: {pendingItems} | Unsorted: {unsortedItems.length} |
//               Sorted:{" "}
//               {Object.values(boxContents).reduce(
//                 (sum, items) => sum + items.length,
//                 0
//               )}
//             </div>
//           </div>
//         ) : (
//           <div className="mb-4">
//             <div className="text-sm font-medium">Order Progress:</div>
//             <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1 mb-2">
//               <div
//                 className="bg-green-600 h-2.5 rounded-full"
//                 style={{
//                   width: `${
//                     orderQueue.length + deliveredItems.length > 0
//                       ? (deliveredItems.length /
//                           (orderQueue.length + deliveredItems.length)) *
//                         100
//                       : 0
//                   }%`,
//                 }}
//               ></div>
//             </div>
//             <div className="text-xs text-gray-600">
//               Remaining: {orderQueue.length} | Delivered:{" "}
//               {deliveredItems.length}
//             </div>
//           </div>
//         )}

//         {/* Source Items (Inventory) */}
//         <div className="mb-4">
//           <div className="text-sm font-medium mb-1">Source Items:</div>
//           <div className="grid grid-cols-7 gap-1">
//             {ITEM_TYPES.map((type) => (
//               <div
//                 key={type}
//                 className="flex flex-col items-center p-1 rounded text-white text-xs"
//                 style={{ backgroundColor: ITEM_COLORS[type] }}
//               >
//                 <div>{type}</div>
//                 <div>{sourceItems[type] || 0}</div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Order input form */}
//         <div className="mb-4">
//           <label className="block text-sm font-medium mb-1">
//             Order Items (comma separated):
//           </label>
//           <input
//             type="text"
//             value={orderInput}
//             onChange={(e) => setOrderInput(e.target.value)}
//             placeholder="e.g. A,B,C,A,D"
//             disabled={
//               mode === "sorting" &&
//               (pendingItems > 0 || unsortedItems.length > 0 || phase !== "idle")
//             }
//             className="w-full p-2 border border-gray-300 rounded text-sm"
//           />
//           <button
//             onClick={handleOrderSubmit}
//             disabled={
//               mode === "sorting" &&
//               (pendingItems > 0 || unsortedItems.length > 0 || phase !== "idle")
//             }
//             className={`w-full mt-2 py-2 rounded font-medium text-white
//               ${
//                 mode === "sorting" &&
//                 (pendingItems > 0 ||
//                   unsortedItems.length > 0 ||
//                   phase !== "idle")
//                   ? "bg-gray-400"
//                   : "bg-green-600 hover:bg-green-700"
//               }`}
//           >
//             Process Order
//           </button>
//         </div>

//         {/* Mode switch button */}
//         <button
//           onClick={handleStartSorting}
//           disabled={phase !== "idle"}
//           className={`w-full py-2 rounded font-medium text-white ${
//             phase !== "idle" ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
//           }`}
//         >
//           Start New Sorting Session
//         </button>

//         {/* Legend */}
//         <div className="mt-4 text-xs text-gray-600">
//           <div>Box coordinates: Letter (X) + Number (Y)</div>
//           <div>Highlighted box: Currently targeted</div>
//         </div>
//       </div>

//       {/* 3D Canvas */}
//       <Canvas
//         camera={{ position: [15, 15, 15], fov: 50 }}
//         shadows
//         className="w-full h-screen"
//       >
//         <color attach="background" args={["#f0f0f0"]} />
//         <ambientLight intensity={0.6} />
//         <directionalLight
//           position={[10, 10, 5]}
//           intensity={1.2}
//           castShadow
//           shadow-mapSize={1024}
//           shadow-camera-far={50}
//           shadow-camera-left={-10}
//           shadow-camera-right={10}
//           shadow-camera-top={10}
//           shadow-camera-bottom={-10}
//         />
//         <OrbitControls />

//         {/* Ground */}
//         <mesh
//           rotation={[-Math.PI / 2, 0, 0]}
//           position={[0, -0.05, 0]}
//           receiveShadow
//         >
//           <planeGeometry args={[50, 50]} />
//           <meshStandardMaterial color="#e0e0e0" />
//         </mesh>

//         {/* Grid lines */}
//         <gridHelper
//           args={[50, 50, "#999999", "#dddddd"]}
//           position={[0, 0.01, 0]}
//         />

//         {/* Source container */}
//         <Box
//           position={itemSourceContainer.position}
//           label={itemSourceContainer.label}
//           color="#f0c674"
//         />

//         {/* Grid of storage boxes */}
//         {storageBoxes.map((box) => {
//           const contents = gridMap[box.id] || { type: null, count: 0 };
//           const boxLabel = contents.type
//             ? `${box.label} (${contents.type}:${contents.count})`
//             : box.label;

//           return (
//             <Box
//               key={box.id}
//               position={box.position}
//               label={boxLabel}
//               color={getBoxColor(box.id)}
//               isHighlighted={highlightedBox === box.id}
//             />
//           );
//         })}

//         {/* Order tray */}
//         <Box
//           position={orderTray.position}
//           label={orderTray.label}
//           color="#b5bd68"
//         />

//         {/* Unsorted items in container */}
//         {unsortedItems.map((item) => (
//           <Item
//             key={item.id}
//             position={item.position}
//             itemType={item.type}
//             isInMotion={currentSortItem?.id === item.id}
//           />
//         ))}

//         {/* Sorted items in boxes */}
//         {getBoxItemPositions().map((item) => (
//           <Item
//             key={item.id}
//             position={item.position}
//             itemType={item.type}
//             isInMotion={currentOrderItem?.id === item.id}
//           />
//         ))}

//         {/* Delivered items in order tray */}
//         {deliveredItems.map((item, index) => {
//           const offsetX = (index % 4) * 0.5 - 0.75;
//           const offsetZ = Math.floor(index / 4) * 0.5 - 0.25;
//           return (
//             <Item
//               key={`delivered-${item.id || index}`}
//               position={[
//                 orderTray.position[0] + offsetX,
//                 0.3,
//                 orderTray.position[2] + offsetZ,
//               ]}
//               itemType={item.type}
//             />
//           );
//         })}
//         {/* Robotic Arm */}
//         <RoboticArm
//           phase={phase}
//           position={currentTargetPos}
//           onPhaseComplete={handlePhaseComplete}
//         />
//       </Canvas>
//     </div>
//   );
// }

//--------------------------working------------------------------------------//

// import React, { useRef, useState, useEffect } from "react";
// import { Canvas, useFrame, useThree } from "@react-three/fiber";
// import { OrbitControls, Text, Html } from "@react-three/drei";
// import * as THREE from "three";

// // Constants
// const GRID_SIZE = 5;
// const GRID_SPACING = 1.5;
// const GRID_OFFSET = ((GRID_SIZE - 1) * GRID_SPACING) / 2;

// // Tooltip component
// function Tooltip({ position, medicines, visible, boxId }) {
//   if (!visible || !medicines || medicines.length === 0) return null;

//   return (
//     <Html position={position} center>
//       <div className="bg-black bg-opacity-90 text-white p-3 rounded-lg shadow-lg max-w-xs text-sm z-50 pointer-events-none">
//         <div className="font-bold text-yellow-300 mb-2">Container {boxId}</div>
//         <div className="max-h-32 overflow-y-auto">
//           {medicines.slice(0, 5).map((medicine, index) => (
//             <div key={`${medicine.id}-${index}`} className="mb-1">
//               <div className="font-medium text-blue-300">{medicine.name}</div>
//               <div className="text-gray-300 text-xs">
//                 Brand: {medicine.brand} | Qty: {medicine.quantity}
//               </div>
//               {medicine.expiryDate && (
//                 <div className="text-gray-400 text-xs">
//                   Exp: {new Date(medicine.expiryDate).toLocaleDateString()}
//                 </div>
//               )}
//             </div>
//           ))}
//           {medicines.length > 5 && (
//             <div className="text-gray-400 text-xs mt-2">
//               ... and {medicines.length - 5} more types
//             </div>
//           )}
//         </div>
//         <div className="mt-2 pt-2 border-t border-gray-600">
//           <div className="text-xs text-gray-300">
//             Total types: {medicines.length} | Total items:{" "}
//             {medicines.reduce((sum, med) => sum + med.quantity, 0)}
//           </div>
//         </div>
//       </div>
//     </Html>
//   );
// }

// // Box component with hover detection
// function Box({
//   position,
//   color = "lightblue",
//   label,
//   isHighlighted = false,
//   medicines = [],
//   boxId,
//   onHover,
//   onHoverEnd,
// }) {
//   const meshRef = useRef();
//   const [hovered, setHovered] = useState(false);

//   const handlePointerOver = (e) => {
//     e.stopPropagation();
//     setHovered(true);
//     onHover && onHover(boxId, position);
//   };

//   const handlePointerOut = (e) => {
//     e.stopPropagation();
//     setHovered(false);
//     onHoverEnd && onHoverEnd();
//   };

//   return (
//     <group position={position}>
//       <mesh
//         ref={meshRef}
//         castShadow
//         receiveShadow
//         onPointerOver={handlePointerOver}
//         onPointerOut={handlePointerOut}
//       >
//         <boxGeometry args={[1, 0.5, 1]} />
//         <meshStandardMaterial
//           color={isHighlighted ? "#ff9d9d" : hovered ? "#ffeb3b" : color}
//           transparent
//           opacity={hovered ? 0.8 : 1.0}
//         />
//       </mesh>
//       <Text
//         position={[0, 0.35, 0]}
//         fontSize={0.2}
//         color="black"
//         anchorX="center"
//         anchorY="middle"
//       >
//         {label}
//       </Text>
//     </group>
//   );
// }

// // Medicine item component
// function MedicineItem({ position, medicine, isInMotion = false }) {
//   const color = medicine ? getMedicineColor(medicine.name) : "#cccccc";

//   return (
//     <group position={position}>
//       <mesh castShadow>
//         <boxGeometry args={[0.4, 0.2, 0.4]} />
//         <meshStandardMaterial color={color} />
//       </mesh>
//       <Text
//         position={[0, 0.15, 0]}
//         fontSize={0.1}
//         color="black"
//         anchorX="center"
//         anchorY="middle"
//       >
//         {medicine
//           ? `${medicine.name.substr(0, 3)}-${medicine.brand.substr(0, 2)}`
//           : "Empty"}
//       </Text>
//       {isInMotion && (
//         <mesh>
//           <ringGeometry args={[0.25, 0.3, 16]} />
//           <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
//         </mesh>
//       )}
//     </group>
//   );
// }

// // Get color based on medicine name
// function getMedicineColor(medicineName) {
//   const colors = [
//     "#f44336",
//     "#2196f3",
//     "#ffeb3b",
//     "#4caf50",
//     "#9c27b0",
//     "#ff9800",
//     "#00bcd4",
//     "#795548",
//   ];
//   const hash = medicineName
//     .split("")
//     .reduce((acc, char) => acc + char.charCodeAt(0), 0);
//   return colors[hash % colors.length];
// }

// // Robotic arm component
// function RoboticArm({ phase, position, onPhaseComplete, currentMedicine }) {
//   const armRef = useRef();
//   const clawRef = useRef();

//   const basePosY = 0.9;
//   const pickDropY = 0.5;
//   const travelHeight = 2.5;
//   const moveSpeed = 0.3;
//   const tolerance = 0.05;

//   const currentArmPos = useRef(new THREE.Vector3());
//   const finalTargetPos = useRef(new THREE.Vector3());
//   const intermediateTargetPos = useRef(new THREE.Vector3());
//   const clawScale = useRef(1);

//   const [movementSubPhase, setMovementSubPhase] = useState("idle");

//   useEffect(() => {
//     if (!armRef.current) return;
//     currentArmPos.current.copy(armRef.current.position);
//   }, []);

//   useEffect(() => {
//     if (phase === "idle") {
//       finalTargetPos.current.copy(new THREE.Vector3(0, basePosY, 0));
//       clawScale.current = 1;
//       setMovementSubPhase("moveX_return");
//     } else if (phase === "moveToPick" && position) {
//       finalTargetPos.current.set(position.x, pickDropY, position.z);
//       clawScale.current = 1;
//       intermediateTargetPos.current.set(
//         currentArmPos.current.x,
//         travelHeight,
//         currentArmPos.current.z
//       );
//       setMovementSubPhase("moveY_up");
//     } else if (phase === "lift" && position) {
//       finalTargetPos.current.set(position.x, travelHeight, position.z);
//       clawScale.current = 0.4;
//       intermediateTargetPos.current.copy(finalTargetPos.current);
//       setMovementSubPhase("moveY");
//     } else if (phase === "moveToDrop" && position) {
//       finalTargetPos.current.set(position.x, travelHeight, position.z);
//       clawScale.current = 0.4;
//       intermediateTargetPos.current.set(
//         finalTargetPos.current.x,
//         travelHeight,
//         currentArmPos.current.z
//       );
//       setMovementSubPhase("moveX");
//     } else if (phase === "drop" && position) {
//       finalTargetPos.current.set(position.x, pickDropY, position.z);
//       clawScale.current = 1;
//       intermediateTargetPos.current.copy(finalTargetPos.current);
//       setMovementSubPhase("moveY");
//     } else if (phase === "return") {
//       finalTargetPos.current.copy(new THREE.Vector3(0, pickDropY, 0));
//       clawScale.current = 1;
//       intermediateTargetPos.current.set(
//         currentArmPos.current.x,
//         travelHeight,
//         currentArmPos.current.z
//       );
//       setMovementSubPhase("moveY_up");
//     }
//   }, [phase, position]);

//   useFrame(() => {
//     if (!armRef.current || !clawRef.current) return;
//     currentArmPos.current.copy(armRef.current.position);

//     const currentClawScale = clawRef.current.scale.y;
//     clawRef.current.scale.y += (clawScale.current - currentClawScale) * 0.1;

//     let movementCompleted = false;

//     switch (movementSubPhase) {
//       case "moveY_up":
//         currentArmPos.current.y = THREE.MathUtils.lerp(
//           currentArmPos.current.y,
//           intermediateTargetPos.current.y,
//           moveSpeed
//         );
//         if (
//           Math.abs(currentArmPos.current.y - intermediateTargetPos.current.y) <
//           tolerance
//         ) {
//           currentArmPos.current.y = intermediateTargetPos.current.y;
//           movementCompleted = true;
//           intermediateTargetPos.current.set(
//             finalTargetPos.current.x,
//             travelHeight,
//             currentArmPos.current.z
//           );
//           setMovementSubPhase("moveX");
//         }
//         break;

//       case "moveX":
//         currentArmPos.current.x = THREE.MathUtils.lerp(
//           currentArmPos.current.x,
//           intermediateTargetPos.current.x,
//           moveSpeed
//         );
//         if (
//           Math.abs(currentArmPos.current.x - intermediateTargetPos.current.x) <
//           tolerance
//         ) {
//           currentArmPos.current.x = intermediateTargetPos.current.x;
//           movementCompleted = true;
//           intermediateTargetPos.current.set(
//             finalTargetPos.current.x,
//             travelHeight,
//             finalTargetPos.current.z
//           );
//           setMovementSubPhase("moveZ");
//         }
//         break;

//       case "moveZ":
//         currentArmPos.current.z = THREE.MathUtils.lerp(
//           currentArmPos.current.z,
//           intermediateTargetPos.current.z,
//           moveSpeed
//         );
//         if (
//           Math.abs(currentArmPos.current.z - intermediateTargetPos.current.z) <
//           tolerance
//         ) {
//           currentArmPos.current.z = intermediateTargetPos.current.z;
//           movementCompleted = true;
//           if (phase === "moveToPick" || phase === "drop") {
//             intermediateTargetPos.current.set(
//               finalTargetPos.current.x,
//               pickDropY,
//               finalTargetPos.current.z
//             );
//             setMovementSubPhase("moveY_down");
//           } else {
//             setMovementSubPhase("complete");
//           }
//         }
//         break;

//       case "moveY":
//         currentArmPos.current.y = THREE.MathUtils.lerp(
//           currentArmPos.current.y,
//           intermediateTargetPos.current.y,
//           moveSpeed
//         );
//         if (
//           Math.abs(currentArmPos.current.y - intermediateTargetPos.current.y) <
//           tolerance
//         ) {
//           currentArmPos.current.y = intermediateTargetPos.current.y;
//           movementCompleted = true;
//           setMovementSubPhase("complete");
//         }
//         break;

//       case "moveY_down":
//         currentArmPos.current.y = THREE.MathUtils.lerp(
//           currentArmPos.current.y,
//           intermediateTargetPos.current.y,
//           moveSpeed
//         );
//         if (
//           Math.abs(currentArmPos.current.y - intermediateTargetPos.current.y) <
//           tolerance
//         ) {
//           currentArmPos.current.y = intermediateTargetPos.current.y;
//           movementCompleted = true;
//           setMovementSubPhase("complete");
//         }
//         break;

//       case "moveX_return":
//         currentArmPos.current.x = THREE.MathUtils.lerp(
//           currentArmPos.current.x,
//           finalTargetPos.current.x,
//           moveSpeed
//         );
//         if (
//           Math.abs(currentArmPos.current.x - finalTargetPos.current.x) <
//           tolerance
//         ) {
//           currentArmPos.current.x = finalTargetPos.current.x;
//           movementCompleted = true;
//           setMovementSubPhase("moveZ_return");
//         }
//         break;

//       case "moveZ_return":
//         currentArmPos.current.z = THREE.MathUtils.lerp(
//           currentArmPos.current.z,
//           finalTargetPos.current.z,
//           moveSpeed
//         );
//         if (
//           Math.abs(currentArmPos.current.z - finalTargetPos.current.z) <
//           tolerance
//         ) {
//           currentArmPos.current.z = finalTargetPos.current.z;
//           movementCompleted = true;
//           if (Math.abs(currentArmPos.current.y - pickDropY) > tolerance) {
//             intermediateTargetPos.current.set(
//               finalTargetPos.current.x,
//               pickDropY,
//               finalTargetPos.current.z
//             );
//             setMovementSubPhase("moveY_down");
//           } else {
//             setMovementSubPhase("complete");
//           }
//         }
//         break;

//       case "complete":
//         if (Math.abs(clawRef.current.scale.y - clawScale.current) < 0.1) {
//           onPhaseComplete();
//           setMovementSubPhase("idle");
//         }
//         break;

//       default:
//         break;
//     }

//     armRef.current.position.copy(currentArmPos.current);
//   });

//   return (
//     <group ref={armRef}>
//       {/* Base */}
//       <mesh position={[0, 0.5, 0]} castShadow>
//         <boxGeometry args={[1.2, 1, 1.2]} />
//         <meshStandardMaterial color="#666" />
//       </mesh>

//       {/* Arm */}
//       <mesh position={[0, 1.8, 0]} castShadow>
//         <boxGeometry args={[0.25, 2.6, 0.25]} />
//         <meshStandardMaterial color="#444" />
//       </mesh>

//       {/* Horizontal arm */}
//       <mesh position={[0, 3, 0]} castShadow>
//         <boxGeometry args={[0.8, 0.2, 0.2]} />
//         <meshStandardMaterial color="#444" />
//       </mesh>

//       {/* Claw */}
//       {/* <group ref={clawRef} position={[0, 3.2, 0]}>
//         <mesh position={[-0.2, 0, 0]} castShadow>
//           <boxGeometry args={[0.1, 0.4, 0.1]} />
//           <meshStandardMaterial color="#222" />
//         </mesh>
//         <mesh position={[0.2, 0, 0]} castShadow>
//           <boxGeometry args={[0.1, 0.4, 0.1]} />
//           <meshStandardMaterial color="#222" />
//         </mesh>
//       </group> */}
//       <group ref={clawRef} position={[0, 3.2, 0]}>
//         {/* Left claw */}
//         <mesh position={[-0.2, 0, 0]} castShadow>
//           <boxGeometry args={[0.1, 0.4, 0.1]} />
//           <meshStandardMaterial
//             color={currentMedicine ? "#4CAF50" : "#222"}
//             emissive={currentMedicine ? "#004d00" : "#000000"}
//           />
//         </mesh>

//         {/* Right claw */}
//         <mesh position={[0.2, 0, 0]} castShadow>
//           <boxGeometry args={[0.1, 0.4, 0.1]} />
//           <meshStandardMaterial
//             color={currentMedicine ? "#4CAF50" : "#222"}
//             emissive={currentMedicine ? "#004d00" : "#000000"}
//           />
//         </mesh>

//         {/* Visual medicine item between claws */}
//         {currentMedicine && (
//           <mesh position={[0, -0.1, 0]}>
//             <boxGeometry args={[0.15, 0.15, 0.15]} />
//             <meshStandardMaterial
//               color={getMedicineColor(currentMedicine.name)}
//               transparent
//               opacity={0.8}
//             />
//           </mesh>
//         )}

//         {/* Glowing effect */}
//         {currentMedicine && (
//           <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
//             <ringGeometry args={[0.3, 0.35, 16]} />
//             <meshBasicMaterial color="#00ff00" transparent opacity={0.6} />
//           </mesh>
//         )}
//       </group>

//       {/* ADD THIS HERE - Medicine name display */}
//       {phase !== "idle" && currentMedicine && (
//         <Html position={[0, 4, 0]} center>
//           <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold shadow-lg">
//             {currentMedicine.name}
//           </div>
//         </Html>
//       )}
//     </group>
//   );
// }

// export default function MedicineWarehouseSimulation() {
//   // Create grid of storage boxes
//   const storageBoxes = [];
//   for (let x = 0; x < GRID_SIZE; x++) {
//     for (let z = 0; z < GRID_SIZE; z++) {
//       const posX = x * GRID_SPACING - GRID_OFFSET;
//       const posZ = z * GRID_SPACING - GRID_OFFSET;
//       const label = `${String.fromCharCode(65 + x)}${z + 1}`;
//       storageBoxes.push({
//         id: label,
//         position: [posX, 0, posZ],
//         label: label,
//       });
//     }
//   }

//   // Define other locations
//   const orderTray = { position: [8, 0, 0], label: "Order Tray" };
//   const dumpTray = { position: [-3, 0, 6], label: "Dump Tray" };

//   // States
//   const [phase, setPhase] = useState("idle");
//   const [currentTargetPos, setCurrentTargetPos] = useState(null);
//   const [boxContents, setBoxContents] = useState({});
//   const [orderQueue, setOrderQueue] = useState([]);
//   const [currentOrderItem, setCurrentOrderItem] = useState(null);
//   const [deliveredItems, setDeliveredItems] = useState([]);
//   const [dumpedItems, setDumpedItems] = useState([]);
//   const [highlightedBox, setHighlightedBox] = useState(null);
//   const [status, setStatus] = useState("Loading medicines...");
//   const [medicines, setMedicines] = useState([]);
//   const [currentMedicine, setCurrentMedicine] = useState(null);
//   const [currentOrder, setCurrentOrder] = useState(null);
//   const [orderTimer, setOrderTimer] = useState(null);
//   const [orderId, setOrderId] = useState("");
//   const [isProcessing, setIsProcessing] = useState(false);

//   // Tooltip states
//   const [tooltipVisible, setTooltipVisible] = useState(false);
//   const [tooltipPosition, setTooltipPosition] = useState([0, 0, 0]);
//   const [tooltipMedicines, setTooltipMedicines] = useState([]);
//   const [tooltipBoxId, setTooltipBoxId] = useState("");
//   const [isManualProcessing, setIsManualProcessing] = useState(false);

//   useEffect(() => {
//     const initialBoxContents = {};
//     storageBoxes.forEach((box) => {
//       initialBoxContents[box.id] = [];
//     });
//     setBoxContents(initialBoxContents);
//   }, []);

//   // Fetch medicines from API
//   useEffect(() => {
//     const fetchMedicines = async () => {
//       try {
//         const response = await fetch("http://localhost:3000/api/medicines");
//         const data = await response.json();
//         setMedicines(data.medicines);
//         setStatus("Medicines loaded. Organizing into containers...");

//         // Initialize all boxes first
//         const organizedBoxes = {};
//         storageBoxes.forEach((box) => {
//           organizedBoxes[box.id] = [];
//         });

//         // Then organize medicines into their designated containers
//         data.medicines.forEach((medicine) => {
//           const boxId = medicine.containerLabel;
//           if (organizedBoxes[boxId]) {
//             organizedBoxes[boxId].push({
//               ...medicine,
//               quantity: medicine.availableQuantity, // Use availableQuantity as quantity
//             });
//           } else {
//             // If containerLabel doesn't exist, add it
//             organizedBoxes[boxId] = [
//               {
//                 ...medicine,
//                 quantity: medicine.availableQuantity, // Use availableQuantity as quantity
//               },
//             ];
//           }
//         });

//         setBoxContents(organizedBoxes);

//         // Calculate total medicines placed
//         const totalPlaced = Object.values(organizedBoxes).reduce(
//           (sum, box) => sum + box.length,
//           0
//         );
//         setStatus(
//           `${totalPlaced} medicines organized into containers. Ready for orders.`
//         );
//       } catch (error) {
//         console.error("Error fetching medicines:", error);
//         setStatus(
//           "Error loading medicines. Using mock data for demonstration."
//         );
//       }
//     };

//     fetchMedicines();

//     // Set up timer to check for orders every 10 seconds
//     // const timer = setInterval(() => {
//     //   if (orderId && !isProcessing) {
//     //     processOrder();
//     //   }
//     // }, 10000);
//     // setOrderTimer(timer);

//     // return () => {
//     //   if (orderTimer) clearInterval(orderTimer);
//     // };
//   }, []);
//   const handleManualProcessOrder = async () => {
//     setIsManualProcessing(true);
//     await processOrder();
//     setIsManualProcessing(false);
//   };

//   // Handle box hover
//   const handleBoxHover = (boxId, position) => {
//     const medicines = boxContents[boxId] || [];
//     setTooltipVisible(true);
//     setTooltipPosition([position[0], position[1] + 1, position[2]]);
//     setTooltipMedicines(medicines);
//     setTooltipBoxId(boxId);
//   };

//   const handleBoxHoverEnd = () => {
//     setTooltipVisible(false);
//     setTooltipMedicines([]);
//     setTooltipBoxId("");
//   };
//   // useEffect(() => {
//   //   if (orderQueue.length > 0 && phase === "idle") {
//   //     processNextOrderItem();
//   //   }
//   // }, [orderQueue, phase]);
//   useEffect(() => {
//     return () => {
//       if (orderTimer) {
//         clearInterval(orderTimer);
//       }
//     };
//   }, [orderTimer]);
//   // Check for order from API
//   // Process order from API
//   const processOrder = async () => {
//     if (!orderId || isProcessing) return;
//     if (orderTimer) {
//       clearInterval(orderTimer);
//       setOrderTimer(null);
//     }
//     setIsProcessing(true);
//     try {
//       setStatus(`Processing order ${orderId}...`);
//       const response = await fetch(
//         `http://localhost:3000/api/orders/orders/${orderId}/process`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//       );
//       const data = await response.json();

//       if (data.status === "processed" && data.items) {
//         setStatus(`Order #${data.orderId} processed and ready for pickup`);
//         setCurrentOrder({
//           id: data.orderId,
//           status: data.status,
//           processedAt: data.processedAt,
//           items: data.items,
//         });

//         // Create order queue from processed order items
//         const newOrderQueue = [];
//         data.items.forEach((item) => {
//           for (let i = 0; i < item.quantity; i++) {
//             newOrderQueue.push({
//               containerLabel: item.containerLabel,
//               medicineName: item.medicineName,
//               brand: item.brand,
//               orderItemId: item.orderItemId,
//               scannerCode: item.scannerCodes[i], // Each item gets its unique scanner code
//             });
//           }
//         });

//         setOrderQueue(newOrderQueue);
//         setDeliveredItems([]);
//         setDumpedItems([]);

//         // Start processing immediately
//         // setTimeout(() => {
//         //   processNextOrderItem();
//         // }, 500);
//         const newTimer = setInterval(() => {
//           if (orderId && !isProcessing) {
//             processOrder();
//           }
//         }, 10000);
//         setOrderTimer(newTimer);
//       } else {
//         setStatus(`Failed to process order ${orderId} or order not found`);
//       }
//     } catch (error) {
//       console.error("Error processing order:", error);
//       setStatus("Error processing order");
//     } finally {
//       setIsProcessing(false);
//     }
//   };
//   // Simulate scanning and matching medicine
//   const scanAndMatchMedicine = (medicine, expectedItem) => {
//     return (
//       medicine.name === expectedItem.medicineName &&
//       medicine.brand === expectedItem.brand
//     );
//   };

//   // Handle phase completion
//   const handlePhaseComplete = () => {
//     switch (phase) {
//       case "moveToPick":
//         setStatus("Scanning medicine...");
//         setPhase("lift");
//         break;
//       case "lift":
//         const isCorrectMedicine = scanAndMatchMedicine(
//           currentMedicine,
//           currentOrderItem
//         );

//         if (isCorrectMedicine) {
//           setStatus(
//             `Correct medicine scanned: ${currentMedicine.name} (${currentMedicine.brand}). Moving to order tray.`
//           );
//           setCurrentTargetPos(
//             new THREE.Vector3(orderTray.position[0], 0, orderTray.position[2])
//           );
//         } else {
//           setStatus(
//             `Incorrect medicine scanned: ${currentMedicine.name} (${currentMedicine.brand}). Moving to dump tray.`
//           );
//           setCurrentTargetPos(
//             new THREE.Vector3(dumpTray.position[0], 0, dumpTray.position[2])
//           );
//         }

//         setPhase("moveToDrop");
//         break;
//       case "moveToDrop":
//         setPhase("drop");
//         break;
//       case "drop":
//         const wasCorrectMedicine = scanAndMatchMedicine(
//           currentMedicine,
//           currentOrderItem
//         );

//         if (wasCorrectMedicine) {
//           setDeliveredItems((prev) => [...prev, currentMedicine]);
//           setStatus("Medicine delivered to order tray.");

//           // Decrease quantity in the container
//           setBoxContents((prev) => {
//             const newContents = { ...prev };
//             const targetBoxId = currentOrderItem.containerLabel;

//             if (newContents[targetBoxId]) {
//               newContents[targetBoxId] = newContents[targetBoxId]
//                 .map((medicine) => {
//                   if (
//                     medicine.name === currentMedicine.name &&
//                     medicine.brand === currentMedicine.brand
//                   ) {
//                     return { ...medicine, quantity: medicine.quantity - 1 };
//                   }
//                   return medicine;
//                 })
//                 .filter((medicine) => medicine.quantity > 0); // Remove medicines with 0 quantity
//             }

//             return newContents;
//           });
//         } else {
//           setDumpedItems((prev) => [...prev, currentMedicine]);
//           setStatus("Incorrect medicine dumped.");

//           // Still decrease quantity even if dumped (medicine was taken from container)
//           setBoxContents((prev) => {
//             const newContents = { ...prev };
//             const targetBoxId = currentOrderItem.containerLabel;

//             if (newContents[targetBoxId]) {
//               newContents[targetBoxId] = newContents[targetBoxId]
//                 .map((medicine) => {
//                   if (
//                     medicine.name === currentMedicine.name &&
//                     medicine.brand === currentMedicine.brand
//                   ) {
//                     return { ...medicine, quantity: medicine.quantity - 1 };
//                   }
//                   return medicine;
//                 })
//                 .filter((medicine) => medicine.quantity > 0);
//             }

//             return newContents;
//           });
//         }
//         setCurrentMedicine(null);
//         setPhase("return");
//         break;
//       case "return":
//         if (orderQueue.length === 0) {
//           setTimeout(() => processNextOrderItem(), 500);
//           setPhase("idle");
//         } else {
//           // Directly process next item without returning to original position
//           setTimeout(() => processNextOrderItem(), 500);
//         }
//         break;
//       default:
//         break;
//     }
//   };
//   // Process the next item in the order
//   const processNextOrderItem = () => {
//     if (orderQueue.length > 0) {
//       const nextItem = orderQueue[0];
//       const targetBox = storageBoxes.find(
//         (box) => box.id === nextItem.containerLabel
//       );

//       if (
//         targetBox &&
//         boxContents[targetBox.id] &&
//         boxContents[targetBox.id].length > 0
//       ) {
//         // Find the medicine that matches the order item
//         const matchingMedicineIndex = boxContents[targetBox.id].findIndex(
//           (medicine) =>
//             medicine.name === nextItem.medicineName &&
//             medicine.brand === nextItem.brand &&
//             medicine.quantity > 0
//         );

//         if (matchingMedicineIndex !== -1) {
//           const medicine = boxContents[targetBox.id][matchingMedicineIndex];

//           // Create a copy for processing
//           const medicineForProcessing = { ...medicine };

//           setOrderQueue((prev) => prev.slice(1));
//           setCurrentOrderItem(nextItem);
//           setCurrentMedicine(medicineForProcessing);
//           setHighlightedBox(targetBox.id);
//           setCurrentTargetPos(
//             new THREE.Vector3(targetBox.position[0], 0, targetBox.position[2])
//           );
//           setStatus(
//             `Moving to container ${targetBox.id} for ${nextItem.medicineName} (${nextItem.brand}) - ${medicine.quantity} available`
//           );
//           setPhase("moveToPick");
//         } else {
//           setStatus(
//             `No matching medicines available in container ${nextItem.containerLabel} for ${nextItem.medicineName} (${nextItem.brand})`
//           );
//           setOrderQueue((prev) => prev.slice(1));
//           if (orderQueue.length > 1) {
//             setTimeout(() => processNextOrderItem(), 1000);
//           }
//         }
//       } else {
//         setStatus(`Container ${nextItem.containerLabel} is empty`);
//         setOrderQueue((prev) => prev.slice(1));
//         if (orderQueue.length > 1) {
//           setTimeout(() => processNextOrderItem(), 1000);
//         }
//       }
//     } else {
//       setStatus("All items processed!");
//       //  setPhase("return");
//     }
//   };

//   // Calculate positions for medicines in boxes
//   const getBoxItemPositions = () => {
//     const result = [];

//     Object.entries(boxContents).forEach(([boxId, medicines]) => {
//       const box = storageBoxes.find((b) => b.id === boxId);
//       if (box) {
//         let itemIndex = 0;
//         medicines.forEach((medicine) => {
//           // Show visual representation based on quantity (max 5 visual items per medicine type)
//           const visualCount = Math.min(medicine.quantity, 5);

//           for (let i = 0; i < visualCount; i++) {
//             const xOffset = (itemIndex % 3) * 0.25 - 0.25;
//             const zOffset = Math.floor(itemIndex / 3) * 0.25 - 0.1;
//             const yOffset = Math.floor(itemIndex / 9) * 0.2 + 0.3;

//             result.push({
//               medicine: {
//                 ...medicine,
//                 displayName:
//                   medicine.quantity > 5
//                     ? `${medicine.name} (${medicine.quantity})`
//                     : medicine.name,
//               },
//               position: [
//                 box.position[0] + xOffset,
//                 yOffset,
//                 box.position[2] + zOffset,
//               ],
//             });
//             itemIndex++;
//           }
//         });
//       }
//     });

//     return result;
//   };
//   // Get box color based on medicine type
//   const getBoxColor = (boxId) => {
//     // const medicinesInBox = boxContents[boxId] || [];
//     // if (medicinesInBox.length > 0) {
//     //   return getMedicineColor(medicinesInBox[0].name);
//     // }
//     return "#81a2be";
//   };

//   return (
//     <div
//       className="w-full h-screen relative bg-gray-900"
//       style={{ backgroundColor: "black" }}
//     >
//       {/* Controls Panel */}
//       <div className="absolute top-0 left-0 z-10 bg-black bg-opacity-90 p-4 rounded-lg shadow-lg w-80 m-4">
//         <div className="mb-2 font-bold text-lg text-white">
//           Medicine Warehouse
//         </div>

//         <div className="mb-4 text-white">
//           <div className="text-sm font-medium mb-1">
//             Status: <span className="italic text-yellow-300">{status}</span>
//           </div>
//           <div className="text-sm font-medium mb-1">
//             Phase: <span className="font-bold text-blue-300">{phase}</span>
//           </div>

//           <div className="mt-2">
//             <label className="block text-sm font-medium mb-1">
//               Order Number:
//             </label>
//             <input
//               type="text"
//               value={orderId}
//               onChange={(e) => setOrderId(e.target.value)}
//               className="w-full p-2 rounded bg-gray-700 text-white mb-2"
//               placeholder="Enter order number"
//             />
//             <button
//               onClick={handleManualProcessOrder}
//               disabled={isProcessing}
//               className={`w-full py-2 rounded font-medium text-white ${
//                 isProcessing ? "bg-gray-600" : "bg-blue-600 hover:bg-blue-700"
//               }`}
//             >
//               {isProcessing ? "Processing..." : "Process Order"}
//             </button>
//           </div>
//         </div>

//         {currentOrder && (
//           <div className="mb-4 text-white">
//             <div className="text-sm font-medium">Order Progress:</div>
//             <div className="w-full bg-gray-700 rounded-full h-2.5 mt-1 mb-2">
//               <div
//                 className="bg-green-600 h-2.5 rounded-full"
//                 style={{
//                   width: `${
//                     currentOrder.items.reduce(
//                       (sum, item) => sum + item.quantity,
//                       0
//                     ) > 0
//                       ? (deliveredItems.length /
//                           currentOrder.items.reduce(
//                             (sum, item) => sum + item.quantity,
//                             0
//                           )) *
//                         100
//                       : 0
//                   }%`,
//                 }}
//               ></div>
//             </div>
//             <div className="text-xs text-gray-300">
//               Remaining: {orderQueue.length} | Delivered:{" "}
//               {deliveredItems.length} | Dumped: {dumpedItems.length}
//             </div>
//           </div>
//         )}

//         <div className="mb-4 text-white">
//           <div className="text-sm font-medium mb-1">Current Task:</div>
//           {currentOrderItem && (
//             <div className="text-xs text-gray-300">
//               Looking for: {currentOrderItem.medicineName} (
//               {currentOrderItem.brand})
//               <br />
//               From: {currentOrderItem.containerLabel}
//               {currentMedicine && (
//                 <>
//                   <br />
//                   Found: {currentMedicine.name} ({currentMedicine.brand})
//                 </>
//               )}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* 3D Canvas */}
//       <Canvas
//         camera={{ position: [15, 15, 15], fov: 50 }}
//         shadows
//         className="w-full h-screen"
//       >
//         <color attach="background" args={["#f0f0f0"]} />
//         <ambientLight intensity={0.6} />
//         <directionalLight
//           position={[10, 10, 5]}
//           intensity={1.2}
//           castShadow
//           shadow-mapSize={1024}
//           shadow-camera-far={50}
//           shadow-camera-left={-10}
//           shadow-camera-right={10}
//           shadow-camera-top={10}
//           shadow-camera-bottom={-10}
//         />
//         <OrbitControls />

//         {/* Ground */}
//         <mesh
//           rotation={[-Math.PI / 2, 0, 0]}
//           position={[0, -0.05, 0]}
//           receiveShadow
//         >
//           <planeGeometry args={[50, 50]} />
//           <meshStandardMaterial color="#e0e0e0" />
//         </mesh>

//         {/* Grid lines */}
//         <gridHelper
//           args={[50, 50, "#999999", "#dddddd"]}
//           position={[0, 0.01, 0]}
//         />

//         {/* Storage boxes */}
//         {storageBoxes.map((box) => (
//           <Box
//             key={box.id}
//             position={box.position}
//             label={
//               boxContents[box.id]?.length > 0
//                 ? `${box.label} (${boxContents[box.id].reduce(
//                     (sum, med) => sum + med.quantity,
//                     0
//                   )})`
//                 : box.label
//             }
//             color={getBoxColor(box.id)}
//             isHighlighted={highlightedBox === box.id}
//             medicines={boxContents[box.id] || []}
//             boxId={box.id}
//             onHover={handleBoxHover}
//             onHoverEnd={handleBoxHoverEnd}
//           />
//         ))}

//         {/* Order tray */}
//         <Box
//           position={orderTray.position}
//           label={`${orderTray.label} (${deliveredItems.length})`}
//           color="#b5bd68"
//         />

//         {/* Dump tray */}
//         <Box
//           position={dumpTray.position}
//           label={`${dumpTray.label} (${dumpedItems.length})`}
//           color="#cc6666"
//         />

//         {/* Medicines in boxes */}
//         {getBoxItemPositions().map((item, index) => (
//           <MedicineItem
//             key={`${item.medicine.id}-${index}`}
//             position={item.position}
//             medicine={item.medicine}
//             isInMotion={currentMedicine?.id === item.medicine.id}
//           />
//         ))}

//         {/* Delivered medicines in order tray */}
//         {deliveredItems.map((medicine, index) => {
//           const offsetX = (index % 4) * 0.5 - 0.75;
//           const offsetZ = Math.floor(index / 4) * 0.5 - 0.25;
//           return (
//             <MedicineItem
//               key={`delivered-${medicine.id}-${index}`}
//               position={[
//                 orderTray.position[0] + offsetX,
//                 0.3,
//                 orderTray.position[2] + offsetZ,
//               ]}
//               medicine={medicine}
//             />
//           );
//         })}

//         {/* Dumped medicines in dump tray */}
//         {dumpedItems.map((medicine, index) => {
//           const offsetX = (index % 4) * 0.5 - 0.75;
//           const offsetZ = Math.floor(index / 4) * 0.5 - 0.25;
//           return (
//             <MedicineItem
//               key={`dumped-${medicine.id}-${index}`}
//               position={[
//                 dumpTray.position[0] + offsetX,
//                 0.3,
//                 dumpTray.position[2] + offsetZ,
//               ]}
//               medicine={medicine}
//             />
//           );
//         })}

//         {/* Robotic Arm */}
//         <RoboticArm
//           phase={phase}
//           position={currentTargetPos}
//           onPhaseComplete={handlePhaseComplete}
//           currentMedicine={currentMedicine}
//         />
//         <Tooltip
//           position={tooltipPosition}
//           medicines={tooltipMedicines}
//           visible={tooltipVisible}
//           boxId={tooltipBoxId}
//         />
//       </Canvas>
//     </div>
//   );
// }

// // --------------------working code--------------------//
