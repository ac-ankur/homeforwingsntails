import React from 'react';

const OrderTray = ({ position, items }) => {
  return (
    <group position={position}>
      {/* Tray base */}
      <mesh position={[0, 0.1, 0]} castShadow>
        <boxGeometry args={[2, 0.2, 2]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* Items in tray */}
      {items.map((item, index) => (
        <mesh 
          key={index} 
          position={[
            -0.7 + (index % 3) * 0.7, 
            0.3, 
            -0.7 + Math.floor(index / 3) * 0.7
          ]}
        >
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial 
            color={getMedicineColor(item.name)} 
            transparent 
            opacity={0.8} 
          />
        </mesh>
      ))}
      
      {/* Label */}
      <Text
        position={[0, 0.5, 0]}
        fontSize={0.3}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        Order Tray
      </Text>
    </group>
  );
};

export default OrderTray;