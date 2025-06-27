import React from 'react';

const ConveyorBelt = ({ items }) => {
  return (
    <group>
      {/* Conveyor belt model */}
      <mesh position={[-4, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[8, 0.2, 2]} />
        <meshStandardMaterial color="#555" />
      </mesh>
      
      {/* Items on conveyor */}
      {items.map(item => (
        <mesh key={item.id} position={item.position}>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color={item.color} />
        </mesh>
      ))}
    </group>
  );
};

export default ConveyorBelt;