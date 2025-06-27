
import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text, Html } from "@react-three/drei";
import * as THREE from "three";
export function OrderItemsPanel({
  currentOrder,
  orderQueue,
  deliveredItems,
  dumpedItems,
  currentOrderItem,
}) {
  if (!currentOrder) return null;

  const allOrderItems = currentOrder.items.flatMap((item) =>
    Array(item.quantity)
      .fill()
      .map((_, index) => ({
        ...item,
        uniqueId: `${item.orderItemId}-${index}`,
        itemIndex: index,
      }))
  );

  const getItemStatus = (item) => {
    // Check if this specific item is currently being processed
    const isCurrentItem =
      currentOrderItem &&
      currentOrderItem.medicineName === item.medicineName &&
      currentOrderItem.brand === item.brand &&
      currentOrderItem.orderItemId === item.orderItemId;

    // Count delivered items for this specific medicine type
    const deliveredCount = deliveredItems.filter(
      (med) => med.name === item.medicineName && med.brand === item.brand
    ).length;

    // Count dumped items for this specific medicine type
    const dumpedCount = dumpedItems.filter(
      (med) => med.name === item.medicineName && med.brand === item.brand
    ).length;

    // Count items still in queue for this specific medicine type
    const queueCount = orderQueue.filter(
      (qItem) =>
        qItem.medicineName === item.medicineName &&
        qItem.brand === item.brand &&
        qItem.orderItemId === item.orderItemId
    ).length;

    // Calculate total processed for this medicine type
    const totalProcessed = deliveredCount + dumpedCount;

    // Determine status based on item index
    if (item.itemIndex < deliveredCount) {
      return "delivered";
    } else if (item.itemIndex < totalProcessed) {
      return "dumped";
    } else if (isCurrentItem && item.itemIndex === totalProcessed) {
      return "processing";
    } else {
      return "pending";
    }
  };

  return (
    <div className="absolute bottom-0 left-0 z-10 bg-black bg-opacity-90 p-4 rounded-lg shadow-lg w-80 m-4 max-h-96 overflow-y-auto">
      <div className="mb-2 font-bold text-lg text-white">
        Order #{currentOrder.id} Items
      </div>

      <div className="space-y-2">
        {currentOrder.items.map((item, itemIndex) => (
          <div key={item.orderItemId} className="bg-gray-800 p-2 rounded">
            <div className="text-sm font-medium text-white mb-1">
              {item.medicineName} ({item.brand})
            </div>
            <div className="text-xs text-gray-300 mb-2">
              Container: {item.containerLabel} • Qty: {item.quantity}
            </div>

            <div className="flex flex-wrap gap-1">
              {Array(item.quantity)
                .fill()
                .map((_, index) => {
                  const itemStatus = getItemStatus({
                    ...item,
                    itemIndex: index,
                  });
                  let statusColor = "bg-gray-600"; // pending
                  let statusText = "P";

                  if (itemStatus === "delivered") {
                    statusColor = "bg-green-600";
                    statusText = "✓";
                  } else if (itemStatus === "dumped") {
                    statusColor = "bg-red-600";
                    statusText = "✗";
                  } else if (itemStatus === "processing") {
                    statusColor = "bg-yellow-600 animate-pulse";
                    statusText = "⟳";
                  }

                  return (
                    <div
                      key={index}
                      className={`${statusColor} text-white text-xs w-6 h-6 flex items-center justify-center rounded`}
                      title={`Item ${index + 1}: ${itemStatus}`}
                    >
                      {statusText}
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-2 border-t border-gray-600">
        <div className="text-xs text-gray-300">
          <div className="flex justify-between">
            <span>Pending: {orderQueue.length}</span>
            <span>Delivered: {deliveredItems.length}</span>
            <span>Dumped: {dumpedItems.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}