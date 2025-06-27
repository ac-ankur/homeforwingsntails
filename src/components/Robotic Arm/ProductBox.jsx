import React from 'react';

const ProductBox = ({ position, items, color, type }) => {
  return (
    <group position={position}>
      {/* Box model */}
      <mesh>
        <boxGeometry args={[1.5, 1, 1.5]} />
        <meshStandardMaterial color="#ddd" transparent opacity={0.7} />
      </mesh>
      
      {/* Items in box */}
      {items.map((item, index) => (
        <mesh 
          key={item.id} 
          position={[
            -0.5 + (index % 3) * 0.5,
            0.25 + Math.floor(index / 3) * 0.5,
            -0.5 + (Math.floor(index / 6) % 2) * 1
          ]}
        >
          <boxGeometry args={[0.4, 0.4, 0.4]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
      
      {/* Label */}
      <Text
        position={[0, 0.6, 0]}
        fontSize={0.3}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        {`Box ${type}`}
      </Text>
    </group>
  );
};

export default ProductBox;