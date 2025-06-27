import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  CircularProgress
} from "@mui/material";
import axios from "axios";

const OrderTable = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/orders/allOrders");
        setOrders(response.data.orders);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load orders. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress sx={{ color: '#667eea' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>
        {error}
      </Typography>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Added Heading */}
      <Typography 
        variant="h4" 
        sx={{ 
          color: "#ffffff", 
          mb: 3,
          fontWeight: "bold",
          textAlign: "center",
          textShadow: "0 2px 4px rgba(0,0,0,0.5)"
        }}
      >
        📋 Order History
      </Typography>

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
          borderRadius: 3,
          overflow: "hidden",
          border: "1px solid #333",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        }}
      >
        <Table>
          <TableHead
            sx={{
              background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            <TableRow>
              <TableCell sx={{ color: "#ffffff", fontWeight: "bold", fontSize: "1rem" }}>
                👤 Name 
              </TableCell>
              <TableCell sx={{ color: "#ffffff", fontWeight: "bold", fontSize: "1rem" }}>
                📧 Email
              </TableCell>
              <TableCell sx={{ color: "#ffffff", fontWeight: "bold", fontSize: "1rem" }}>
                🆔 Order ID
              </TableCell>
              <TableCell sx={{ color: "#ffffff", fontWeight: "bold", fontSize: "1rem" }}>
                📅 Order Date
              </TableCell>
              <TableCell sx={{ color: "#ffffff", fontWeight: "bold", fontSize: "1rem" }}>
                💊 Medicine (ID)
              </TableCell>
              <TableCell sx={{ color: "#ffffff", fontWeight: "bold", fontSize: "1rem" }}>
                🏷️ Brand
              </TableCell>
              <TableCell sx={{ color: "#ffffff", fontWeight: "bold", fontSize: "1rem" }}>
                📊 Quantity
              </TableCell>
              <TableCell sx={{ color: "#ffffff", fontWeight: "bold", fontSize: "1rem" }}>
                🚦 Status
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <React.Fragment key={order.id}>
                  {order.items.map((item, index) => (
                    <TableRow
                      key={`${order.id}-${item.id}`}
                      sx={{
                        backgroundColor: index % 2 === 0 ? "#2a2a2a" : "#1f1f1f",
                        "&:hover": {
                          backgroundColor: "#3a3a3a",
                          transition: "all 0.2s ease",
                        },
                        transition: "all 0.2s ease",
                      }}
                    >
                      {index === 0 && (
                        <>
                          <TableCell 
                            rowSpan={order.items.length} 
                            sx={{ color: "#b0b0b0" }}
                          >
                            {order.user.name}
                          </TableCell>
                          <TableCell 
                            rowSpan={order.items.length} 
                            sx={{ color: "#b0b0b0" }}
                          >
                            {order.email}
                          </TableCell>
                          <TableCell 
                            rowSpan={order.items.length} 
                            sx={{ color: "#90caf9", fontFamily: "monospace" }}
                          >
                            {order.id}
                          </TableCell>
                          <TableCell 
                            rowSpan={order.items.length} 
                            sx={{ color: "#e0e0e0" }}
                          >
                            {new Date(order.created_at).toLocaleString()}
                          </TableCell>
                        </>
                      )}
                      <TableCell sx={{ color: "#e0e0e0" }}>
                        {item.medicine.name} (ID: {item.medicineId})
                      </TableCell>
                      <TableCell sx={{ color: "#b0b0b0" }}>
                        {item.medicine.brand}
                      </TableCell>
                      <TableCell sx={{ color: "#81c784", fontWeight: "bold" }}>
                        {item.quantity}
                      </TableCell>
                      {index === 0 && (
                        <TableCell 
                          rowSpan={order.items.length} 
                          sx={{ 
                            color: order.status === 'completed' ? '#4caf50' : '#ff9800', 
                            fontWeight: "bold" 
                          }}
                        >
                          {order.status}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={8}
                  align="center"
                  sx={{
                    color: "#666",
                    py: 4,
                    fontSize: "1.1rem",
                    fontStyle: "italic",
                  }}
                >
                  📭 No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default OrderTable;