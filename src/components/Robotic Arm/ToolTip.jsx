import React from 'react';
import { Html } from '@react-three/drei';

// Tooltip component


export function Tooltip({ position, medicines, visible, boxId }) {
  if (!visible || !medicines || medicines.length === 0) return null;
  
  return (
    <Html position={position} center>
      <div className="bg-black bg-opacity-90 text-white p-3 rounded-lg shadow-lg max-w-xs text-sm z-50 pointer-events-none">
        <div className="font-bold text-yellow-300 mb-2">Container {boxId}</div>
        <div className="max-h-32 overflow-y-auto">
          {medicines.slice(0, 5).map((medicine, index) => (
            <div key={`${medicine.id}-${index}`} className="mb-1">
              <div className="font-medium text-blue-300">{medicine.name}</div>
              <div className="text-gray-300 text-xs">
                Brand: {medicine.brand} | Qty: {medicine.quantity}
              </div>
              {medicine.expiryDate && (
                <div className="text-gray-400 text-xs">
                  Exp: {new Date(medicine.expiryDate).toLocaleDateString()}
                </div>
              )}
            </div>
          ))}
          {medicines.length > 5 && (
            <div className="text-gray-400 text-xs mt-2">
              ... and {medicines.length - 5} more types
            </div>
          )}
        </div>
        <div className="mt-2 pt-2 border-t border-gray-600">
          <div className="text-xs text-gray-300">
            Total types: {medicines.length} | Total items:{" "}
            {medicines.reduce((sum, med) => sum + med.quantity, 0)}
          </div>
        </div>
      </div>
    </Html>
  );
}