// import React, { useState, useEffect, useRef } from 'react';
// import * as THREE from 'three';
// import { Canvas, useFrame } from '@react-three/fiber';
// import { OrbitControls, Text } from '@react-three/drei';
// import RoboticArm from './Robotic Arm/RoboticArm';
// import ProductBox from './Robotic Arm/ProductBox';
// import OrderTray from './Robotic Arm/OrderTray';
// import ConveyorBelt from './Robotic Arm/ConveyorBelt';

// const WarehouseSimulation = () => {
//  const [simulationState, setSimulationState] = useState({
//     items: [],
//     boxes: {
//       'A': { position: [5, 0.5, 3], items: [], color: '#FF5733' },
//       'B': { position: [5, 0.5, 0], items: [], color: '#33FF57' },
//       'C': { position: [5, 0.5, -3], items: [], color: '#3357FF' }
//     },
//     orderTray: { position: [-4, 0.5, 0], items: [] },
//     armPosition: [0, 0, 0],
//     armAngles: { shoulder: 0, elbow: 0, wrist: 0, gripper: 0 },
//     isGripperOpen: false,
//     currentAction: 'idle',
//     orders: []
//   });

//   // Add a new random item to the conveyor
//   const addRandomItem = () => {
//     const productTypes = ['A', 'B', 'C'];
//     const type = productTypes[Math.floor(Math.random() * productTypes.length)];
    
//     const newItem = {
//       id: Date.now(),
//       type,
//       position: [-6, 0.5, Math.random() * 2 - 1], // Random position on conveyor
//       status: 'onConveyor',
//       color: simulationState.boxes[type].color
//     };
    
//     setSimulationState(prev => ({
//       ...prev,
//       items: [...prev.items, newItem]
//     }));
//   };

//   // Create a new random order
//   const addRandomOrder = () => {
//     const productTypes = ['A', 'B', 'C'];
//     const orderItems = Array.from({ length: Math.floor(Math.random() * 3) + 1 }, 
//       () => productTypes[Math.floor(Math.random() * productTypes.length)]);
    
//     setSimulationState(prev => ({
//       ...prev,
//       orders: [...prev.orders, { id: Date.now(), items: orderItems, status: 'pending' }]
//     }));
//   };

//   // Process all pending orders
//   const processOrders = async () => {
//     const pendingOrders = simulationState.orders.filter(o => o.status === 'pending');
//     if (pendingOrders.length === 0 || simulationState.currentAction !== 'idle') return;

//     const order = pendingOrders[0];
//     setSimulationState(prev => ({
//       ...prev,
//       currentAction: `processing order ${order.id}`
//     }));

//     for (const itemType of order.items) {
//       await pickItemFromBox(itemType);
//       await placeItemInOrderTray();
//     }

//     setSimulationState(prev => ({
//       ...prev,
//       orders: prev.orders.map(o => 
//         o.id === order.id ? { ...o, status: 'completed' } : o),
//       currentAction: 'idle'
//     }));
//   };

//   // Pick item from box
//   const pickItemFromBox = async (itemType) => {
//     const box = simulationState.boxes[itemType];
//     if (box.items.length === 0) return;

//     // Move arm to box position
//     await moveArmTo(box.position);
    
//     // Close gripper to pick item
//     setSimulationState(prev => ({
//       ...prev,
//       isGripperOpen: false,
//       boxes: {
//         ...prev.boxes,
//         [itemType]: {
//           ...prev.boxes[itemType],
//           items: prev.boxes[itemType].items.slice(1)
//         }
//       },
//       currentAction: `picking ${itemType} from box`
//     }));

//     await delay(1000); // Simulate pickup time
//   };

//   // Place item in order tray
//   const placeItemInOrderTray = async () => {
//     await moveArmTo(simulationState.orderTray.position);
    
//     // Open gripper to release item
//     setSimulationState(prev => ({
//       ...prev,
//       isGripperOpen: true,
//       orderTray: {
//         ...prev.orderTray,
//         items: [...prev.orderTray.items, { 
//           id: Date.now(), 
//           type: 'item', 
//           position: [...prev.orderTray.position] 
//         }]
//       },
//       currentAction: 'placing item in order tray'
//     }));

//     await delay(1000); // Simulate placement time
//   };

//   // Move arm to target position with inverse kinematics
//   const moveArmTo = async (targetPosition) => {
//     const angles = calculateArmAngles(targetPosition);
    
//     setSimulationState(prev => ({
//       ...prev,
//       currentAction: 'moving arm',
//       armAngles: {
//         ...prev.armAngles,
//         shoulder: angles.shoulder,
//         elbow: angles.elbow,
//         wrist: angles.wrist
//       },
//       armPosition: targetPosition
//     }));

//     await delay(1500); // Simulate movement time
//   };

//   // Helper function for delays
//   const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

//   // Inverse kinematics calculations
//   const calculateArmAngles = (targetPosition) => {
//     const [x, y, z] = targetPosition;
//     const baseHeight = 1;
//     const upperArmLength = 3;
//     const forearmLength = 3;

//     // Shoulder rotation (base rotation)
//     const shoulderRotation = Math.atan2(x, z);
    
//     // Distance in horizontal plane
//     const horizontalDistance = Math.sqrt(x * x + z * z);
    
//     // Distance to target
//     const distanceToTarget = Math.sqrt(
//       horizontalDistance * horizontalDistance + 
//       (y - baseHeight) * (y - baseHeight)
//     );
    
//     // Law of cosines for angles
//     const elbowAngle = Math.PI - Math.acos(
//       (upperArmLength * upperArmLength + forearmLength * forearmLength - 
//       distanceToTarget * distanceToTarget) / 
//       (2 * upperArmLength * forearmLength)
//     );
    
//     const shoulderAngle = Math.atan2(y - baseHeight, horizontalDistance) - 
//       Math.asin(
//         (forearmLength * Math.sin(Math.PI - elbowAngle)) / 
//         distanceToTarget
//       );
    
//     // Wrist angle to keep gripper level
//     const wristAngle = - (shoulderAngle + elbowAngle);
    
//     return {
//       shoulder: shoulderRotation,
//       elbow: elbowAngle,
//       wrist: wristAngle,
//       gripper: 0
//     };
//   };

//   // Auto-sort items when they arrive on conveyor
//   useEffect(() => {
//     const timer = setInterval(() => {
//       if (simulationState.currentAction !== 'idle') return;
      
//       const itemToSort = simulationState.items.find(item => item.status === 'onConveyor');
//       if (!itemToSort) return;

//       // Mark item as being sorted
//       setSimulationState(prev => ({
//         ...prev,
//         items: prev.items.map(item => 
//           item.id === itemToSort.id ? { ...item, status: 'sorting' } : item),
//         currentAction: `sorting item ${itemToSort.id}`
//       }));

//       // Process sorting
//       setTimeout(async () => {
//         const box = simulationState.boxes[itemToSort.type];
//         await moveArmTo(itemToSort.position);
        
//         setSimulationState(prev => ({
//           ...prev,
//           isGripperOpen: false,
//           currentAction: 'picking item from conveyor'
//         }));
        
//         await delay(1000);
//         await moveArmTo(box.position);
        
//         setSimulationState(prev => ({
//           ...prev,
//           isGripperOpen: true,
//           items: prev.items.filter(i => i.id !== itemToSort.id),
//           boxes: {
//             ...prev.boxes,
//             [itemToSort.type]: {
//               ...prev.boxes[itemToSort.type],
//               items: [...prev.boxes[itemToSort.type].items, itemToSort]
//             }
//           },
//           currentAction: 'idle'
//         }));
//       }, 500);
//     }, 3000);

//     return () => clearInterval(timer);
//   }, [simulationState]);

//   // Process orders when they arrive
//   useEffect(() => {
//     const timer = setInterval(() => {
//       processOrders();
//     }, 2000);

//     return () => clearInterval(timer);
//   }, [simulationState.orders]);
// return (
//     <div className="simulation-container">
//       <div className="controls">
//         <button onClick={addRandomItem}>Add Random Item</button>
//         <button onClick={addRandomOrder}>Create Random Order</button>
//         <div className="status">
//           <p>Current Action: {simulationState.currentAction}</p>
//           <p>Items on conveyor: {simulationState.items.filter(i => i.status === 'onConveyor').length}</p>
//           <p>Pending orders: {simulationState.orders.filter(o => o.status === 'pending').length}</p>
//         </div>
//       </div>

//       <Canvas camera={{ position: [10, 10, 10], fov: 50 }}>
//         <ambientLight intensity={0.5} />
//         <pointLight position={[10, 10, 10]} />
//         <OrbitControls />
        
//         {/* Warehouse floor */}
//         <mesh rotation={[-Math.PI / 2, 0, 0]}>
//           <planeGeometry args={[20, 20]} />
//           <meshStandardMaterial color="#f0f0f0" />
//         </mesh>
        
//         {/* Robotic Arm */}
//         <RoboticArm 
//           position={[0, 0, 0]}
//           angles={simulationState.armAngles}
//           isGripperOpen={simulationState.isGripperOpen}
//         />
        
//         {/* Conveyor Belt */}
//         <ConveyorBelt items={simulationState.items.filter(i => i.status === 'onConveyor')} />
        
//         {/* Product Boxes */}
//         {Object.entries(simulationState.boxes).map(([type, box]) => (
//           <ProductBox 
//             key={type} 
//             position={box.position} 
//             items={box.items} 
//             color={box.color}
//             type={type}
//           />
//         ))}
        
//         {/* Order Tray */}
//         <OrderTray 
//           position={simulationState.orderTray.position}
//           items={simulationState.orderTray.items}
//         />
//       </Canvas>
//     </div>
//   );
// };

// export default WarehouseSimulation;







import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Helper function to generate a unique ID
const generateId = () => Math.random().toString(36).substring(2, 9);

// Robotic Arm Component with improved kinematics
function RoboticArm({ targetPosition, onActionComplete, onGripperStateChange, currentAction, pickedItemId, setPickedItemId, itemsData, setItemsData, gripperCommand }) {
    const armRef = useRef();
    const baseRef = useRef();
    const shoulderRef = useRef();
    const upperArmRef = useRef();
    const forearmRef = useRef();
    const wristRef = useRef();
    const gripperRef = useRef();
    const leftGripperRef = useRef();
    const rightGripperRef = useRef();
    
    const [armAngles, setArmAngles] = useState({
        base: 0,
        shoulder: 0,
        upperArm: 0,
        forearm: 0,
        wrist: 0,
        gripper: 0
    });
    
    const [gripperOpen, setGripperOpen] = useState(true);
    const [isMoving, setIsMoving] = useState(false);
    const armAnimationRef = useRef(null);

    // Enhanced inverse kinematics with better reach calculations
    const calculateArmAngles = useCallback((targetPos) => {
        const [x, y, z] = targetPos;
        
        // Base rotation (Y-axis rotation to face target)
        const baseAngle = Math.atan2(x, z);
        
        // Distance from base to target
        const horizontalDistance = Math.sqrt(x * x + z * z);
        const verticalDistance = y - 0.2; // Adjust for base height
        const totalDistance = Math.sqrt(horizontalDistance * horizontalDistance + verticalDistance * verticalDistance);
        
        // Arm segment lengths
        const upperArmLength = 1.5;
        const forearmLength = 1.2;
        const maxReach = upperArmLength + forearmLength - 0.1; // Small buffer
        
        // Clamp target to reachable area
        const clampedDistance = Math.min(totalDistance, maxReach);
        
        // Check if target is reachable
        if (totalDistance < 0.5) { // Too close
            return armAngles; // Keep current position
        }
        
        // Calculate shoulder and elbow angles using law of cosines
        const cosElbow = (upperArmLength * upperArmLength + forearmLength * forearmLength - clampedDistance * clampedDistance) / 
                        (2 * upperArmLength * forearmLength);
        
        const cosShoulder = (upperArmLength * upperArmLength + clampedDistance * clampedDistance - forearmLength * forearmLength) / 
                           (2 * upperArmLength * clampedDistance);
        
        // Ensure values are within valid range for acos
        const clampedCosElbow = Math.max(-1, Math.min(1, cosElbow));
        const clampedCosShoulder = Math.max(-1, Math.min(1, cosShoulder));
        
        const elbowAngle = Math.acos(clampedCosElbow);
        const shoulderAngle = Math.atan2(verticalDistance, horizontalDistance) + Math.acos(clampedCosShoulder);
        
        return {
            base: baseAngle,
            shoulder: shoulderAngle - Math.PI / 2,
            upperArm: 0,
            forearm: elbowAngle - Math.PI,
            wrist: -shoulderAngle - elbowAngle + Math.PI * 1.5,
            gripper: gripperOpen ? 0.4 : 0.05
        };
    }, [gripperOpen, armAngles]);

    // Smooth animation with realistic movement speed
    const animateToTarget = useCallback((targetPos, duration = 3000) => {
        const startAngles = { ...armAngles };
        const endAngles = calculateArmAngles(targetPos);
        const startTime = Date.now();
        
        setIsMoving(true);

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Smooth S-curve easing for more realistic movement
            const easeProgress = progress < 0.5 
                ? 4 * progress * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;
            
            const currentAngles = {};
            Object.keys(startAngles).forEach(key => {
                currentAngles[key] = startAngles[key] + (endAngles[key] - startAngles[key]) * easeProgress;
            });
            
            setArmAngles(currentAngles);
            
            if (progress < 1) {
                armAnimationRef.current = requestAnimationFrame(animate);
            } else {
                setIsMoving(false);
                onActionComplete?.();
            }
        };
        
        if (armAnimationRef.current) {
            cancelAnimationFrame(armAnimationRef.current);
        }
        armAnimationRef.current = requestAnimationFrame(animate);
    }, [armAngles, calculateArmAngles, onActionComplete]);

    // Handle gripper commands
    useEffect(() => {
        if (gripperCommand === 'open' && !gripperOpen) {
            setGripperOpen(true);
            onGripperStateChange?.('open');
        } else if (gripperCommand === 'close' && gripperOpen) {
            setGripperOpen(false);
            onGripperStateChange?.('closed');
        }
    }, [gripperCommand, gripperOpen, onGripperStateChange]);

    // Update arm when target position changes
    useEffect(() => {
        if (targetPosition && !isMoving) {
            animateToTarget(targetPosition);
        }
    }, [targetPosition, animateToTarget, isMoving]);

    // Update arm segment rotations and handle picked items
    useFrame(() => {
        if (baseRef.current) baseRef.current.rotation.y = armAngles.base;
        if (shoulderRef.current) shoulderRef.current.rotation.z = armAngles.shoulder;
        if (upperArmRef.current) upperArmRef.current.rotation.z = armAngles.upperArm;
        if (forearmRef.current) forearmRef.current.rotation.z = armAngles.forearm;
        if (wristRef.current) wristRef.current.rotation.z = armAngles.wrist;
        
        // Smooth gripper animation
        if (leftGripperRef.current && rightGripperRef.current) {
            const targetGripperAngle = armAngles.gripper;
            const currentLeftX = leftGripperRef.current.position.x;
            const currentRightX = rightGripperRef.current.position.x;
            
            leftGripperRef.current.position.x = THREE.MathUtils.lerp(currentLeftX, -targetGripperAngle, 0.1);
            rightGripperRef.current.position.x = THREE.MathUtils.lerp(currentRightX, targetGripperAngle, 0.1);
        }

        // Update picked item position with realistic attachment
        if (pickedItemId && gripperRef.current) {
            const item = itemsData.find(i => i.id === pickedItemId);
            if (item && item.meshRef?.current) {
                const worldPos = new THREE.Vector3();
                const worldQuat = new THREE.Quaternion();
                
                gripperRef.current.getWorldPosition(worldPos);
                gripperRef.current.getWorldQuaternion(worldQuat);
                
                // Position item slightly above gripper center
                worldPos.y += 0.15;
                
                // Smooth movement for picked item
                item.meshRef.current.position.lerp(worldPos, 0.2);
                item.meshRef.current.quaternion.slerp(worldQuat, 0.1);
            }
        }
    });

    // Expose control functions
    React.useImperativeHandle(armRef, () => ({
        isMoving: () => isMoving,
        getCurrentPosition: () => {
            if (gripperRef.current) {
                const worldPos = new THREE.Vector3();
                gripperRef.current.getWorldPosition(worldPos);
                return [worldPos.x, worldPos.y, worldPos.z];
            }
            return [0, 0, 0];
        }
    }));

    return (
        <group ref={armRef} position={[0, 0, 0]}>
            {/* Base with improved styling */}
            <group ref={baseRef}>
                <mesh position={[0, 0.1, 0]} castShadow>
                    <cylinderGeometry args={[0.6, 0.6, 0.2, 32]} />
                    <meshStandardMaterial color="#37474F" metalness={0.3} roughness={0.4} />
                </mesh>
                
                {/* Shoulder */}
                <group ref={shoulderRef} position={[0, 0.2, 0]}>
                    <mesh position={[0, 0.5, 0]} castShadow>
                        <cylinderGeometry args={[0.25, 0.25, 1, 16]} />
                        <meshStandardMaterial color="#455A64" metalness={0.4} roughness={0.3} />
                    </mesh>
                    
                    {/* Upper Arm */}
                    <group ref={upperArmRef} position={[0, 1, 0]}>
                        <mesh position={[0, 0.75, 0]} castShadow>
                            <boxGeometry args={[0.35, 1.5, 0.35]} />
                            <meshStandardMaterial color="#546E7A" metalness={0.4} roughness={0.3} />
                        </mesh>
                        
                        {/* Forearm */}
                        <group ref={forearmRef} position={[0, 1.5, 0]}>
                            <mesh position={[0, 0.6, 0]} castShadow>
                                <boxGeometry args={[0.25, 1.2, 0.25]} />
                                <meshStandardMaterial color="#607D8B" metalness={0.4} roughness={0.3} />
                            </mesh>
                            
                            {/* Wrist */}
                            <group ref={wristRef} position={[0, 1.2, 0]}>
                                <mesh position={[0, 0.25, 0]} castShadow>
                                    <cylinderGeometry args={[0.18, 0.18, 0.5, 16]} />
                                    <meshStandardMaterial color="#78909C" metalness={0.4} roughness={0.3} />
                                </mesh>
                                
                                {/* Gripper */}
                                <group ref={gripperRef} position={[0, 0.5, 0]}>
                                    <mesh position={[0, 0.1, 0]} castShadow>
                                        <boxGeometry args={[0.3, 0.2, 0.3]} />
                                        <meshStandardMaterial color="#FF9800" metalness={0.3} roughness={0.4} />
                                    </mesh>
                                    
                                    {/* Gripper fingers */}
                                    <mesh ref={leftGripperRef} position={[-0.2, 0.25, 0]} castShadow>
                                        <boxGeometry args={[0.06, 0.4, 0.12]} />
                                        <meshStandardMaterial color="#FFB74D" metalness={0.2} roughness={0.5} />
                                    </mesh>
                                    <mesh ref={rightGripperRef} position={[0.2, 0.25, 0]} castShadow>
                                        <boxGeometry args={[0.06, 0.4, 0.12]} />
                                        <meshStandardMaterial color="#FFB74D" metalness={0.2} roughness={0.5} />
                                    </mesh>
                                </group>
                            </group>
                        </group>
                    </group>
                </group>
            </group>
        </group>
    );
}

// Enhanced Item Component
function Item({ id, type, position, isPicked, meshRef, isMoving }) {
    const colorMap = {
        ProductA: '#E53E3E',
        ProductB: '#3182CE',
        ProductC: '#38A169',
        ProductD: '#D69E2E',
        ProductE: '#805AD5',
    };
    const itemColor = colorMap[type] || '#718096';

    return (
        <mesh 
            ref={meshRef} 
            position={position} 
            visible={!isPicked} 
            castShadow 
            receiveShadow
        >
            <boxGeometry args={[0.25, 0.25, 0.25]} />
            <meshStandardMaterial 
                color={itemColor} 
                metalness={0.1} 
                roughness={0.8}
                transparent={isMoving}
                opacity={isMoving ? 0.8 : 1}
            />
        </mesh>
    );
}

// Enhanced Box Component with labels
function Box({ position, type, itemsCount, label }) {
    const colorMap = {
        ProductA: '#FED7D7',
        ProductB: '#BEE3F8',
        ProductC: '#C6F6D5',
        ProductD: '#FAECC5',
        ProductE: '#E9D8FD',
        OrderTray: '#FFFBEB',
        Storage: '#F7FAFC',
    };
    const boxColor = colorMap[type] || '#EDF2F7';

    return (
        <group position={position}>
            <mesh castShadow receiveShadow>
                <boxGeometry args={[1.2, 0.6, 1.2]} />
                <meshStandardMaterial 
                    color={boxColor} 
                    transparent 
                    opacity={0.8}
                    metalness={0.1}
                    roughness={0.9}
                />
            </mesh>
            <lineSegments>
                <edgesGeometry args={[new THREE.BoxGeometry(1.2, 0.6, 1.2)]} />
                <lineBasicMaterial color="#2D3748" linewidth={2} />
            </lineSegments>
            
            {/* Label */}
            {label && (
                <mesh position={[0, 0.4, 0.61]} rotation={[-Math.PI / 6, 0, 0]}>
                    <planeGeometry args={[1, 0.3]} />
                    <meshStandardMaterial color="white" />
                </mesh>
            )}
            
            {/* Item count indicator */}
            {itemsCount > 0 && (
                <mesh position={[0, 0.35, 0]}>
                    <cylinderGeometry args={[0.1, 0.1, 0.05, 8]} />
                    <meshStandardMaterial color="#2B6CB0" />
                </mesh>
            )}
        </group>
    );
}

// Order Input Component
function OrderInput({ onSubmitOrder, isProcessing }) {
    const [orderItems, setOrderItems] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('ProductA');
    const [quantity, setQuantity] = useState(1);

    const productTypes = ['ProductA', 'ProductB', 'ProductC', 'ProductD', 'ProductE'];

    const addToOrder = () => {
        const existingIndex = orderItems.findIndex(item => item.type === selectedProduct);
        if (existingIndex >= 0) {
            setOrderItems(prev => prev.map((item, index) => 
                index === existingIndex 
                    ? { ...item, quantity: item.quantity + quantity }
                    : item
            ));
        } else {
            setOrderItems(prev => [...prev, { type: selectedProduct, quantity }]);
        }
    };

    const removeFromOrder = (index) => {
        setOrderItems(prev => prev.filter((_, i) => i !== index));
    };

    const submitOrder = () => {
        if (orderItems.length > 0) {
            onSubmitOrder(orderItems);
            setOrderItems([]);
        }
    };

    return (
        <div className="p-4 bg-gray-50 rounded-lg mb-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Create Order</h3>
            
            <div className="flex gap-2 mb-3">
                <select 
                    value={selectedProduct} 
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="flex-1 p-2 border rounded-md"
                >
                    {productTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
                <input 
                    type="number" 
                    min="1" 
                    max="10" 
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="w-16 p-2 border rounded-md"
                />
                <button 
                    onClick={addToOrder}
                    className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                    Add
                </button>
            </div>

            {orderItems.length > 0 && (
                <div className="mb-3">
                    <p className="font-medium mb-2">Current Order:</p>
                    {orderItems.map((item, index) => (
                        <div key={index} className="flex justify-between items-center bg-white p-2 rounded mb-1">
                            <span>{item.type} × {item.quantity}</span>
                            <button 
                                onClick={() => removeFromOrder(index)}
                                className="text-red-500 hover:text-red-700"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <button 
                onClick={submitOrder}
                disabled={orderItems.length === 0 || isProcessing}
                className="w-full py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Submit Order
            </button>
        </div>
    );
}

// Main Enhanced Warehouse Simulation
function WarehouseSimulation() {
    const armRef = useRef();
    const [armTarget, setArmTarget] = useState([0, 2, 1]);
    const [currentAction, setCurrentAction] = useState('Idle');
    const [gripperState, setGripperState] = useState('open');
    const [gripperCommand, setGripperCommand] = useState(null);
    const [pickedItemId, setPickedItemId] = useState(null);
    const [actionInProgress, setActionInProgress] = useState(false);
    const [currentOrder, setCurrentOrder] = useState([]);

    const [itemsData, setItemsData] = useState([]);
    const [boxesData, setBoxesData] = useState({});

    // Initialize warehouse with more boxes and items
    useEffect(() => {
        // Create storage boxes in a grid layout
        const boxes = {};
        const productTypes = ['ProductA', 'ProductB', 'ProductC', 'ProductD', 'ProductE'];
        
        // Product storage boxes (3x2 grid on the right)
        productTypes.forEach((type, index) => {
            const row = Math.floor(index / 3);
            const col = index % 3;
            boxes[type] = {
                position: [3 + col * 1.5, 0.3, -1.5 + row * 1.5],
                items: [],
                label: type
            };
        });

        // Additional storage boxes
        for (let i = 0; i < 6; i++) {
            const row = Math.floor(i / 3);
            const col = i % 3;
            boxes[`Storage${i + 1}`] = {
                position: [3 + col * 1.5, 0.3, 1.5 + row * 1.5],
                items: [],
                label: `Storage ${i + 1}`
            };
        }

        // Order fulfillment area (left side)
        for (let i = 0; i < 4; i++) {
            boxes[`OrderTray${i + 1}`] = {
                position: [-3 - (i % 2) * 1.5, 0.3, -1.5 + Math.floor(i / 2) * 3],
                items: [],
                label: `Order ${i + 1}`
            };
        }

        setBoxesData(boxes);

        // Create initial items scattered around
        const initialItems = [];
        const positions = [
            [-1, 0.125, -1], [0, 0.125, -1.5], [1, 0.125, -0.5],
            [-0.5, 0.125, 0.5], [0.5, 0.125, 1], [1.5, 0.125, 0],
            [-1.5, 0.125, 1.5], [0, 0.125, 2], [1, 0.125, 1.5],
            [-0.5, 0.125, -2], [0.5, 0.125, -1.5], [1.5, 0.125, -1]
        ];

        positions.forEach((pos, index) => {
            const type = productTypes[index % productTypes.length];
            initialItems.push({
                id: generateId(),
                type: type,
                position: pos,
                inBox: null,
                meshRef: React.createRef()
            });
        });

        setItemsData(initialItems);
    }, []);

    // Enhanced movement with realistic timing
    const moveArmTo = useCallback((targetPos) => {
        return new Promise((resolve) => {
            setArmTarget(targetPos);
            
            // Calculate movement time based on distance
            const currentPos = armRef.current?.getCurrentPosition() || [0, 2, 1];
            const distance = Math.sqrt(
                Math.pow(targetPos[0] - currentPos[0], 2) +
                Math.pow(targetPos[1] - currentPos[1], 2) +
                Math.pow(targetPos[2] - currentPos[2], 2)
            );
            
            const moveTime = Math.max(2000, Math.min(4000, distance * 1000));
            setTimeout(resolve, moveTime);
        });
    }, []);

    // Enhanced gripper control
    const controlGripper = useCallback((command) => {
        return new Promise((resolve) => {
            setGripperCommand(command);
            setTimeout(() => {
                setGripperCommand(null);
                resolve();
            }, 1000);
        });
    }, []);

    // Enhanced pick up function with precise positioning
    const pickUpItem = useCallback(async (item) => {
        setCurrentAction(`Moving to ${item.type}`);
        
        // Move to position above item
        const approachPos = [item.position[0], item.position[1] + 1.5, item.position[2]];
        await moveArmTo(approachPos);
        
        // Move down to item
        const pickPos = [item.position[0], item.position[1] + 0.5, item.position[2]];
        await moveArmTo(pickPos);
        
        setCurrentAction(`Picking up ${item.type}`);
        await controlGripper('close');
        setPickedItemId(item.id);
        
        // Update item state
        setItemsData(prev => prev.map(i =>
            i.id === item.id ? { ...i, inBox: 'picked' } : i
        ));
        
        // Move up after picking
        await moveArmTo(approachPos);
    }, [moveArmTo, controlGripper]);

    // Enhanced place function with proper box placement
    const placeItemInBox = useCallback(async (targetBoxKey) => {
        if (!pickedItemId) return;

        const itemToPlace = itemsData.find(item => item.id === pickedItemId);
        if (!itemToPlace) return;

        const targetBox = boxesData[targetBoxKey];
        if (!targetBox) return;

        setCurrentAction(`Moving to place in ${targetBoxKey}`);
        
        // Move above box
        const approachPos = [targetBox.position[0], targetBox.position[1] + 1.5, targetBox.position[2]];
        await moveArmTo(approachPos);
        
        // Move down to place
        const placePos = [targetBox.position[0], targetBox.position[1] + 0.5, targetBox.position[2]];
        await moveArmTo(placePos);

        setCurrentAction(`Placing ${itemToPlace.type}`);
        await controlGripper('open');
        
        // Calculate final item position in box with stacking
        const itemsInBox = targetBox.items.length;
        const finalPos = [
            targetBox.position[0] + (Math.random() - 0.5) * 0.4,
            targetBox.position[1] + 0.4 + itemsInBox * 0.3,
            targetBox.position[2] + (Math.random() - 0.5) * 0.4
        ];

        // Update states
        setItemsData(prev => prev.map(item =>
            item.id === pickedItemId 
                ? { ...item, inBox: targetBoxKey, position: finalPos }
                : item
        ));
        
        setBoxesData(prev => ({
            ...prev,
            [targetBoxKey]: {
                ...prev[targetBoxKey],
                items: [...prev[targetBoxKey].items, { ...itemToPlace, position: finalPos }]
            }
        }));
        
        setPickedItemId(null);
        
        // Move arm away
        await moveArmTo(approachPos);
    }, [pickedItemId, itemsData, boxesData, moveArmTo, controlGripper]);

    // Enhanced sorting with better logic
    const startSorting = useCallback(async () => {
        if (actionInProgress) return;
        setActionInProgress(true);
        
        const itemsOnFloor = itemsData.filter(item => item.inBox === null);
        setCurrentAction(`Starting sort of ${itemsOnFloor.length} items`);

        for (const item of itemsOnFloor) {
            await pickUpItem(item);
            await placeItemInBox(item.type);
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        setCurrentAction('Sorting complete!');
        await new Promise(resolve => setTimeout(resolve, 2000));
        setCurrentAction('Idle');
        setActionInProgress(false);
    }, [actionInProgress, itemsData, pickUpItem, placeItemInBox]);

    // Enhanced order processing
    const processOrder = useCallback(async (order) => {
        if (actionInProgress) return;
        setActionInProgress(true);
        setCurrentOrder(order);

        let orderTrayIndex = 1;
        
        for (const orderItem of order) {
            setCurrentAction(`Processing ${orderItem.quantity}x ${orderItem.type}`);
            
            for (let i = 0; i < orderItem.quantity; i++) {
                // Find item in storage box
                const availableItems = itemsData.filter(item => 
                    item.type === orderItem.type && item.inBox === orderItem.type
                );
                
                if (availableItems.length > 0) {
                    const itemToPick = availableItems[0];
                    
                    // Temporarily move item to accessible position
                    const tempPos = boxesData[itemToPick.type].position;
                    const pickupPos = [tempPos[0], tempPos[1] + 0.4, tempPos[2]];
                    
                    setItemsData(prev => prev.map(i =>
                        i.id === itemToPick.id 
                            ? { ...i, position: pickupPos, inBox: null }
                            : i
                    ));
                    
                    // Remove from source box
                    setBoxesData(prev => ({
                        ...prev,
                        [itemToPick.type]: {
                            ...prev[itemToPick.type],
                            items: prev[itemToPick.type].items.filter(i => i.id !== itemToPick.id)
                        }
                    }));
                    
                    await new Promise(resolve => setTimeout(resolve, 300));
                    await pickUpItem({ ...itemToPick, position: pickupPos });
                    await placeItemInBox(`OrderTray${orderTrayIndex}`);
                    
                    // Move to next order tray if current one has multiple items
                    const currentTrayItems = boxesData[`OrderTray${orderTrayIndex}`]?.items.length || 0;
                    if (currentTrayItems >= 3) {
                        orderTrayIndex = Math.min(orderTrayIndex + 1, 4);
                    }
                }
            }
        }

        setCurrentAction('Order fulfillment complete!');
        await new Promise(resolve => setTimeout(resolve, 2000));
        setCurrentAction('Idle');
        setCurrentOrder([]);
        setActionInProgress(false);
    }, [actionInProgress, itemsData, boxesData, pickUpItem, placeItemInBox]);

    // Reset function
    const resetSimulation = useCallback(() => {
        if (actionInProgress) return;
        
        // Reset to initial state
        window.location.reload();
    }, [actionInProgress]);

    const handleActionComplete = useCallback(() => {
        // Handled in individual functions
    }, []);

    const handleGripperStateChange = useCallback((state) => {
        setGripperState(state);
    }, []);

    return (
        <div className="w-full h-screen flex flex-col lg:flex-row bg-gray-100" style={{color:'black'}}>
            {/* Enhanced Control Panel */}
            <div className="lg:w-1/3 p-6 bg-white shadow-lg overflow-y-auto">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Warehouse Control System</h2>

                {/* Order Input */}
                <OrderInput 
                    onSubmitOrder={processOrder} 
                    isProcessing={actionInProgress}
                />

                {/* Control Buttons */}
                <div className="flex flex-col space-y-4 mb-6">
                    <button
                        onClick={startSorting}
                        disabled={actionInProgress}
                        className="py-3 px-6 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                    >
                        Start Auto-Sort
                    </button>
                    <button
                        onClick={resetSimulation}
                        disabled={actionInProgress}
                        className="py-3 px-6 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                    >
                        Reset Warehouse
                    </button>
                </div>

                {/* Status Panel */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">System Status</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="font-medium">Current Action:</span>
                            <span className={`${actionInProgress ? 'text-blue-600' : 'text-green-600'}`}>
                                {currentAction}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Gripper Status:</span>
                            <span className={`${gripperState === 'open' ? 'text-green-600' : 'text-orange-600'}`}>
                                {gripperState.toUpperCase()}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium">Holding Item:</span>
                            <span className={pickedItemId ? 'text-blue-600' : 'text-gray-500'}>
                                {pickedItemId ? itemsData.find(i => i.id === pickedItemId)?.type || 'Unknown' : 'None'}
                            </span>
                        </div>
                        {currentOrder.length > 0 && (
                            <div>
                                <span className="font-medium">Processing Order:</span>
                                <div className="ml-2 mt-1">
                                    {currentOrder.map((item, index) => (
                                        <div key={index} className="text-xs text-blue-600">
                                            • {item.quantity}x {item.type}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Inventory Overview */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg max-h-96 overflow-y-auto">
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">Warehouse Inventory</h3>
                    
                    {/* Product Storage */}
                    <div className="mb-4">
                        <h4 className="font-medium text-gray-600 mb-2">Product Storage:</h4>
                        {['ProductA', 'ProductB', 'ProductC', 'ProductD', 'ProductE'].map(type => {
                            const box = boxesData[type];
                            return box ? (
                                <div key={type} className="flex justify-between items-center py-1 px-2 bg-white rounded mb-1">
                                    <span className="text-sm">{type}:</span>
                                    <span className={`text-sm font-medium ${box.items.length > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                                        {box.items.length} items
                                    </span>
                                </div>
                            ) : null;
                        })}
                    </div>
                    
                    {/* Order Trays */}
                    <div className="mb-4">
                        <h4 className="font-medium text-gray-600 mb-2">Order Fulfillment Area:</h4>
                        {[1, 2, 3, 4].map(i => {
                            const tray = boxesData[`OrderTray${i}`];
                            return tray ? (
                                <div key={i} className="flex justify-between items-center py-1 px-2 bg-white rounded mb-1">
                                    <span className="text-sm">Order Tray {i}:</span>
                                    <span className={`text-sm font-medium ${tray.items.length > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
                                        {tray.items.length} items
                                    </span>
                                </div>
                            ) : null;
                        })}
                    </div>
                    
                    {/* Items on Floor */}
                    <div>
                        <h4 className="font-medium text-gray-600 mb-2">Items on Floor:</h4>
                        <div className="text-sm">
                            {itemsData.filter(item => item.inBox === null).length > 0 ? (
                                <div className="space-y-1">
                                    {['ProductA', 'ProductB', 'ProductC', 'ProductD', 'ProductE'].map(type => {
                                        const count = itemsData.filter(item => item.type === type && item.inBox === null).length;
                                        return count > 0 ? (
                                            <div key={type} className="flex justify-between py-1 px-2 bg-red-50 rounded">
                                                <span>{type}:</span>
                                                <span className="text-red-600 font-medium">{count}</span>
                                            </div>
                                        ) : null;
                                    })}
                                </div>
                            ) : (
                                <p className="text-green-600 italic">All items sorted!</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Performance Metrics */}
                <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Performance</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-white p-2 rounded">
                            <div className="font-medium text-gray-600">Total Items</div>
                            <div className="text-xl font-bold text-blue-600">{itemsData.length}</div>
                        </div>
                        <div className="bg-white p-2 rounded">
                            <div className="font-medium text-gray-600">Sorted Items</div>
                            <div className="text-xl font-bold text-green-600">
                                {itemsData.filter(item => item.inBox && item.inBox !== 'picked').length}
                            </div>
                        </div>
                        <div className="bg-white p-2 rounded">
                            <div className="font-medium text-gray-600">Orders Filled</div>
                            <div className="text-xl font-bold text-orange-600">
                                {Object.keys(boxesData).filter(key => key.includes('OrderTray')).reduce((sum, key) => 
                                    sum + (boxesData[key]?.items.length || 0), 0
                                )}
                            </div>
                        </div>
                        <div className="bg-white p-2 rounded">
                            <div className="font-medium text-gray-600">Efficiency</div>
                            <div className="text-xl font-bold text-purple-600">
                                {itemsData.length > 0 ? Math.round((itemsData.filter(item => item.inBox && item.inBox !== 'picked').length / itemsData.length) * 100) : 0}%
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced 3D Canvas */}
            <div className="flex-1 bg-gradient-to-b from-gray-800 to-gray-900">
                <Canvas 
                    camera={{ position: [8, 6, 8], fov: 50 }} 
                    shadows
                    gl={{ antialias: true, alpha: false }}
                >
                    {/* Enhanced Lighting */}
                    <ambientLight intensity={0.4} />
                    <directionalLight 
                        position={[10, 15, 5]} 
                        intensity={1.2} 
                        castShadow
                        shadow-mapSize-width={2048}
                        shadow-mapSize-height={2048}
                        shadow-camera-far={50}
                        shadow-camera-left={-10}
                        shadow-camera-right={10}
                        shadow-camera-top={10}
                        shadow-camera-bottom={-10}
                    />
                    <pointLight position={[-5, 10, -5]} intensity={0.5} />
                    <pointLight position={[5, 10, 5]} intensity={0.5} />

                    <OrbitControls 
                        enablePan={true} 
                        enableZoom={true} 
                        enableRotate={true}
                        maxPolarAngle={Math.PI * 0.45}
                        minDistance={5}
                        maxDistance={20}
                    />

                    {/* Enhanced Floor */}
                    <mesh position={[0, -0.05, 0]} receiveShadow>
                        <boxGeometry args={[20, 0.1, 20]} />
                        <meshStandardMaterial 
                            color="#2D3748" 
                            roughness={0.9}
                            metalness={0.1}
                        />
                    </mesh>

                    {/* Grid Lines */}
                    <gridHelper 
                        args={[20, 40, '#4A5568', '#2D3748']} 
                        position={[0, 0, 0]} 
                    />

                    {/* Warehouse Boundaries */}
                    <lineSegments position={[0, 2, 0]}>
                        <edgesGeometry args={[new THREE.BoxGeometry(20, 4, 20)]} />
                        <lineBasicMaterial color="#4A5568" />
                    </lineSegments>

                    {/* Robotic Arm */}
                    <RoboticArm
                        ref={armRef}
                        targetPosition={armTarget}
                        onActionComplete={handleActionComplete}
                        onGripperStateChange={handleGripperStateChange}
                        currentAction={currentAction}
                        pickedItemId={pickedItemId}
                        setPickedItemId={setPickedItemId}
                        itemsData={itemsData}
                        setItemsData={setItemsData}
                        gripperCommand={gripperCommand}
                    />

                    {/* Enhanced Items */}
                    {itemsData.map(item => (
                        <Item
                            key={item.id}
                            id={item.id}
                            type={item.type}
                            position={item.position}
                            isPicked={item.inBox === 'picked'}
                            meshRef={item.meshRef}
                            isMoving={actionInProgress && item.id === pickedItemId}
                        />
                    ))}

                    {/* Storage and Order Boxes */}
                    {Object.entries(boxesData).map(([key, boxData]) => (
                        <Box
                            key={key}
                            position={boxData.position}
                            type={key.includes('Product') ? key : key.includes('OrderTray') ? 'OrderTray' : 'Storage'}
                            itemsCount={boxData.items.length}
                            label={boxData.label}
                        />
                    ))}

                    {/* Zone Markers */}
                    <mesh position={[3, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                        <planeGeometry args={[6, 4]} />
                        <meshStandardMaterial 
                            color="#4299E1" 
                            transparent 
                            opacity={0.1}
                        />
                    </mesh>
                    
                    <mesh position={[-3, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                        <planeGeometry args={[4, 6]} />
                        <meshStandardMaterial 
                            color="#48BB78" 
                            transparent 
                            opacity={0.1}
                        />
                    </mesh>
                </Canvas>
            </div>
        </div>
    );
}

export default WarehouseSimulation;