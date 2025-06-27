import React from 'react';

const OrderTray = ({ position, items }) => {
  return (
    <group position={position}>
      {/* Tray model */}
      <mesh>
        <boxGeometry args={[2, 0.2, 2]} />
        <meshStandardMaterial color="#aaa" />
      </mesh>
      
      {/* Items in tray */}
      {items.map((item, index) => (
        <mesh 
          key={item.id} 
          position={[
            -0.8 + (index % 4) * 0.5,
            0.3,
            -0.8 + Math.floor(index / 4) * 0.5
          ]}
        >
          <boxGeometry args={[0.4, 0.4, 0.4]} />
          <meshStandardMaterial color="#FFD700" /> {/* Gold color for ordered items */}
        </mesh>
      ))}
      
      {/* Label */}
      <Text
        position={[0, 0.3, 0]}
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