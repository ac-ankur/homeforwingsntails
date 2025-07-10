import React from 'react';

const OrderItemsPanel = ({ 
  orderItems = [], 
  currentOrderItem = null, 
  deliveredItems = [], 
  dumpedItems = [] 
}) => {
 const getItemStatus = (item) => {
  // Check if item is delivered - fix the property name comparison
  const isDelivered = deliveredItems.some(delivered => 
    delivered.name === item.medicine.name && 
    delivered.brand === item.medicine.brand
  );
  
  // Check if item is dumped - fix the property name comparison
  const isDumped = dumpedItems.some(dumped => 
    dumped.name === item.medicine.name && 
    dumped.brand === item.medicine.brand
  );
  
  // Check if item is currently being processed
  const isProcessing = currentOrderItem && 
    currentOrderItem.medicineName === item.medicine.name && 
    currentOrderItem.brand === item.medicine.brand;
  
  if (isDelivered) return 'delivered';
  if (isDumped) return 'dumped';
  if (isProcessing) return 'processing';
  return 'pending';
};


  React.useEffect(() => {
    console.log('OrderItemsPanel Debug:');
    console.log('orderItems:', orderItems);
    console.log('deliveredItems:', deliveredItems);
    console.log('dumpedItems:', dumpedItems);
    console.log('currentOrderItem:', currentOrderItem);
  }, [orderItems, deliveredItems, dumpedItems, currentOrderItem]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return '✅';
      case 'dumped':
        return '❌';
      case 'processing':
        return '⚙️';
      case 'pending':
        return '⏳';
      default:
        return '⏳';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'text-green-400';
      case 'dumped':
        return 'text-red-400';
      case 'processing':
        return 'text-yellow-400';
      case 'pending':
        return 'text-gray-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-900 border-green-600';
      case 'dumped':
        return 'bg-red-900 border-red-600';
      case 'processing':
        return 'bg-yellow-900 border-yellow-600';
      case 'pending':
        return 'bg-gray-800 border-gray-600';
      default:
        return 'bg-gray-800 border-gray-600';
    }
  };

  if (!orderItems || orderItems.length === 0) {
    return (
      <div className="bg-black bg-opacity-90 p-4 rounded-lg shadow-lg w-80">
        <div className="text-white font-bold text-lg mb-2">Order Items</div>
        <div className="text-gray-400 text-sm">No order items to display</div>
      </div>
    );
  }

  return (
    <div className="bg-black bg-opacity-90 p-4 rounded-lg shadow-lg w-80 max-h-96 overflow-y-auto">
      <div className="text-white font-bold text-lg mb-4">Order Items</div>
      
      <div className="space-y-2">
        {orderItems.map((item, index) => {
          const status = getItemStatus(item);
          const statusIcon = getStatusIcon(status);
          const statusColor = getStatusColor(status);
          const statusBg = getStatusBg(status);
          
          return (
            <div
              key={`${item.medicineName}-${item.brand}-${index}`}
              className={`p-3 rounded-lg border ${statusBg} transition-all duration-300`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{statusIcon}</span>
                  <span className={`text-sm font-medium capitalize ${statusColor}`}>
                    {status}
                  </span>
                </div>
                <div className="text-xs text-gray-400">
                  Qty: {item.quantity}
                </div>
              </div>
              
              <div className="text-white">
                <div className="font-medium text-sm mb-1">
                  {item.medicine.name}
                </div>
                <div className="text-xs text-gray-300 mb-1">
                  Brand: {item.medicine.brand}
                </div>
                <div className="text-xs text-gray-300">
                  Container: {item.medicine.container.label}
                </div>
              </div>
              
              {status === 'processing' && (
                <div className="mt-2 w-full bg-gray-700 rounded-full h-1.5">
                  <div className="bg-yellow-400 h-1.5 rounded-full animate-pulse w-3/4"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Summary */}
      <div className="mt-4 pt-3 border-t border-gray-600">
        <div className="text-xs text-gray-300 grid grid-cols-2 gap-2">
          <div>
            <span className="text-green-400">✅ Delivered:</span> {
              orderItems.filter(item => getItemStatus(item) === 'delivered').length
            }
          </div>
          <div>
            <span className="text-red-400">❌ Dumped:</span> {
              orderItems.filter(item => getItemStatus(item) === 'dumped').length
            }
          </div>
          <div>
            <span className="text-yellow-400">⚙️ Processing:</span> {
              orderItems.filter(item => getItemStatus(item) === 'processing').length
            }
          </div>
          <div>
            <span className="text-gray-400">⏳ Pending:</span> {
              orderItems.filter(item => getItemStatus(item) === 'pending').length
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderItemsPanel;