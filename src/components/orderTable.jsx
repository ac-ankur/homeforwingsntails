// import React, { useEffect, useState } from "react";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   Typography,
//   Box,
//   CircularProgress,
//   TablePagination,
// } from "@mui/material";
// import axios from "axios";

// const OrderTable = () => {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(5);

//   useEffect(() => {
//     const fetchOrders = async () => {
//       try {
//         const response = await axios.get("http://localhost:3000/api/orders/allOrders");
//         setOrders(response.data.orders);
//       } catch (err) {
//         console.error("Error fetching orders:", err);
//         setError("Failed to load orders. Please try again later.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOrders();
//   }, []);

//   const handleChangePage = (event, newPage) => {
//     setPage(newPage);
//   };

//   const handleChangeRowsPerPage = (event) => {
//     setRowsPerPage(parseInt(event.target.value, 10));
//     setPage(0);
//   };

//   const paginatedOrders = orders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

//   if (loading) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
//         <CircularProgress sx={{ color: '#667eea' }} />
//       </Box>
//     );
//   }

//   if (error) {
//     return (
//       <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>
//         {error}
//       </Typography>
//     );
//   }

//   let serialNo = page * rowsPerPage + 1;

//   return (
//     <Box sx={{ p: 3 }}>
//       <Typography
//         variant="h4"
//         sx={{
//           color: "#ffffff",
//           mb: 3,
//           fontWeight: "bold",
//           textAlign: "center",
//           textShadow: "0 2px 4px rgba(0,0,0,0.5)"
//         }}
//       >
//         📋 Order History
//       </Typography>

//       <TableContainer
//         component={Paper}
//         elevation={0}
//         sx={{
//           background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
//           borderRadius: 3,
//           overflow: "hidden",
//           border: "1px solid #333",
//           boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
//           mx:"auto",
//           width:"93%"

//         }}
//       >
//         <Table>
//           <TableHead
//             sx={{
//               background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
//             }}
//           >
//             <TableRow>
//               <TableCell sx={{ color: "#ffffff", fontWeight: "bold", fontSize: "1rem" }}>
//                 #️⃣ S.No.
//               </TableCell>
//               <TableCell sx={{ color: "#ffffff", fontWeight: "bold", fontSize: "1rem" }}>
//                 👤 Name
//               </TableCell>
//               <TableCell sx={{ color: "#ffffff", fontWeight: "bold", fontSize: "1rem" }}>
//                 📧 Email
//               </TableCell>
//               <TableCell sx={{ color: "#ffffff", fontWeight: "bold", fontSize: "1rem" }}>
//                 🆔 Order ID
//               </TableCell>
//               <TableCell sx={{ color: "#ffffff", fontWeight: "bold", fontSize: "1rem" }}>
//                 📅 Order Date
//               </TableCell>
//               <TableCell sx={{ color: "#ffffff", fontWeight: "bold", fontSize: "1rem" }}>
//                 💊 Medicine (ID)
//               </TableCell>
//               <TableCell sx={{ color: "#ffffff", fontWeight: "bold", fontSize: "1rem" }}>
//                 🏷️ Brand
//               </TableCell>
//               <TableCell sx={{ color: "#ffffff", fontWeight: "bold", fontSize: "1rem" }}>
//                 📊 Quantity
//               </TableCell>
//               <TableCell sx={{ color: "#ffffff", fontWeight: "bold", fontSize: "1rem" }}>
//                 🚦 Status
//               </TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {paginatedOrders.length > 0 ? (
//               paginatedOrders.map((order) => (
//                 <React.Fragment key={order.id}>
//                   {order.items.map((item, index) => (
//                     <TableRow
//                       key={`${order.id}-${item.id}`}
//                       sx={{
//                         backgroundColor: index % 2 === 0 ? "#2a2a2a" : "#1f1f1f",
//                         "&:hover": {
//                           backgroundColor: "#3a3a3a",
//                           transition: "all 0.2s ease",
//                         },
//                         transition: "all 0.2s ease",
//                       }}
//                     >
//                       {index === 0 && (
//                         <TableCell rowSpan={order.items.length} sx={{ color: "#ffffff", fontWeight: "bold" }}>
//                           {serialNo++}
//                         </TableCell>
//                       )}
//                       {index === 0 && (
//                         <>
//                           <TableCell rowSpan={order.items.length} sx={{ color: "#b0b0b0" }}>
//                             {order.user.name}
//                           </TableCell>
//                           <TableCell rowSpan={order.items.length} sx={{ color: "#b0b0b0" }}>
//                             {order.email}
//                           </TableCell>
//                           <TableCell rowSpan={order.items.length} sx={{ color: "#90caf9", fontFamily: "monospace" }}>
//                             {order.id}
//                           </TableCell>
//                           <TableCell rowSpan={order.items.length} sx={{ color: "#e0e0e0" }}>
//                             {new Date(order.created_at).toLocaleString()}
//                           </TableCell>
//                         </>
//                       )}
//                       <TableCell sx={{ color: "#e0e0e0" }}>
//                         {item.medicine.name} (ID: {item.medicineId})
//                       </TableCell>
//                       <TableCell sx={{ color: "#b0b0b0" }}>
//                         {item.medicine.brand}
//                       </TableCell>
//                       <TableCell sx={{ color: "#81c784", fontWeight: "bold" }}>
//                         {item.quantity}
//                       </TableCell>
//                       {index === 0 && (
//                         <TableCell
//                           rowSpan={order.items.length}
//                           sx={{
//                             color: order.status === 'completed' ? '#4caf50' : '#ff9800',
//                             fontWeight: "bold"
//                           }}
//                         >
//                           {order.status}
//                         </TableCell>
//                       )}
//                     </TableRow>
//                   ))}
//                 </React.Fragment>
//               ))
//             ) : (
//               <TableRow>
//                 <TableCell
//                   colSpan={9}
//                   align="center"
//                   sx={{
//                     color: "#666",
//                     py: 4,
//                     fontSize: "1.1rem",
//                     fontStyle: "italic",
//                   }}
//                 >
//                   📭 No orders found.
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>

//         {/* Pagination */}
//         <TablePagination
//           component="div"
//           count={orders.length}
//           page={page}
//           onPageChange={handleChangePage}
//           rowsPerPage={rowsPerPage}
//           onRowsPerPageChange={handleChangeRowsPerPage}
//           rowsPerPageOptions={[5, 10, 25]}
//           sx={{
//             backgroundColor: "#2d2d2d",
//             color: "#ffffff",
//             borderTop: "1px solid #444",
//             "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
//               color: "#aaa",
//             },
//             "& .MuiSelect-icon": {
//               color: "#aaa",
//             },
//           }}
//         />
//       </TableContainer>
//     </Box>
//   );
// };

// export default OrderTable;







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
  CircularProgress,
  FormControl,
  Select,
  MenuItem,
  Pagination,
  Stack,
} from "@mui/material";
import axios from "axios";

const OrderTable = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1); // Changed to 1-based indexing for Pagination component
  const [rowsPerPage, setRowsPerPage] = useState(5);

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

  // Calculate pagination values
  const totalPages = Math.ceil(orders.length / rowsPerPage);
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedOrders = orders.slice(startIndex, endIndex);

  // Pagination handlers
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1); // Reset to first page when changing rows per page
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress sx={{ color: '#667eea' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" sx={{ mt: 1, textAlign: 'center' }}>
        {error}
      </Typography>
    );
  }

  let serialNo = startIndex + 1;

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h4"
        sx={{
          color: "#ffffff",
          mb: 1,
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
          mx: "auto",
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
                #️⃣ S.No.
              </TableCell>
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
            {paginatedOrders.length > 0 ? (
              paginatedOrders.map((order) => (
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
                        <TableCell rowSpan={order.items.length} sx={{ color: "#ffffff", fontWeight: "bold" }}>
                          {serialNo++}
                        </TableCell>
                      )}
                      {index === 0 && (
                        <>
                          <TableCell rowSpan={order.items.length} sx={{ color: "#b0b0b0" }}>
                            {order.user.name}
                          </TableCell>
                          <TableCell rowSpan={order.items.length} sx={{ color: "#b0b0b0" }}>
                            {order.email}
                          </TableCell>
                          <TableCell rowSpan={order.items.length} sx={{ color: "#90caf9", fontFamily: "monospace" }}>
                            {order.id}
                          </TableCell>
                          <TableCell rowSpan={order.items.length} sx={{ color: "#e0e0e0" }}>
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
                  colSpan={9}
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

      {/* Custom Pagination Section - Same layout as MedicineTable */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 3,
          p: 2,
          bgcolor: "#1a1a1a",
          borderRadius: 2,
          border: "1px solid #333",
          mx: "auto",
          width: "98%"
        }}
      >
        {/* Rows per page selector */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography sx={{ color: "#b0b0b0", fontSize: "0.9rem" }}>
            Rows per page:
          </Typography>
          <FormControl size="small">
            <Select
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
              sx={{
                color: "#ffffff",
                backgroundColor: "#2a2a2a",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#555",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#667eea",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#667eea",
                },
                "& .MuiSelect-icon": {
                  color: "#b0b0b0",
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    backgroundColor: "#2a2a2a",
                    "& .MuiMenuItem-root": {
                      color: "#ffffff",
                      "&:hover": {
                        backgroundColor: "#3a3a3a",
                      },
                      "&.Mui-selected": {
                        backgroundColor: "#667eea",
                      },
                    },
                  },
                },
              }}
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
              <MenuItem value={50}>50</MenuItem>
              <MenuItem value={100}>100</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Page info */}
        <Typography sx={{ color: "#b0b0b0", fontSize: "0.9rem" }}>
          Showing {startIndex + 1}-{Math.min(endIndex, orders.length)} of{" "}
          {orders.length} entries
        </Typography>

        {/* Pagination component */}
        <Stack spacing={2}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="medium"
            sx={{
              "& .MuiPaginationItem-root": {
                color: "#b0b0b0",
                borderColor: "#555",
                "&:hover": {
                  backgroundColor: "#3a3a3a",
                  borderColor: "#667eea",
                },
                "&.Mui-selected": {
                  backgroundColor: "#667eea",
                  color: "#ffffff",
                  "&:hover": {
                    backgroundColor: "#5a67d8",
                  },
                },
              },
              "& .MuiPaginationItem-ellipsis": {
                color: "#666",
              },
            }}
          />
        </Stack>
      </Box>
    </Box>
  );
};

export default OrderTable;