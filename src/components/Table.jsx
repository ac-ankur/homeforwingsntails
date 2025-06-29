import { useEffect, useState } from "react";
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
  Button,
  Modal,
  TextField,
  MenuItem,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  Pagination,
  Stack,
} from "@mui/material";
import { Add, Remove, Sort } from "@mui/icons-material";
import axios from "axios";

const MedicineTable = () => {
  const [medicines, setMedicines] = useState([]);
  const [sortedMedicines, setSortedMedicines] = useState([]);
  const [sortOption, setSortOption] = useState("");
  const [createdOrderId, setCreatedOrderId] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  // Modal states
  const [open, setOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [message, setMessage] = useState("");

  // Static email list
  const availableEmails = [
    "shania.white96@yahoo.com",
    "ruthie59@hotmail.com",
    "maximillia54@hotmail.com",
    "orie_reynolds@gmail.com",
    "maureen47@gmail.com",
  ];

  const sortOptions = [
    { value: "name_asc", label: "📝 Alphabetical (A-Z)" },
    { value: "containerLabel_asc", label: "📦 Container (A-Z)" },
    { value: "totalUnits_desc", label: "📊 Total Units (High to Low)" },
    { value: "availableQuantity_desc", label: "✅ Available (High to Low)" },
    { value: "usedQuantity_desc", label: "📉 Used (High to Low)" },
  ];

  useEffect(() => {
    axios
      .get("http://localhost:3000/api/medicines")
      .then((response) => {
        console.log("API response:", response.data);
        const actualArray = response.data.medicines;
        console.log("Extracted medicine list:", actualArray);
        setMedicines(actualArray);
        setSortedMedicines(actualArray);
      })
      .catch((error) => {
        console.error("Error fetching medicine data:", error);
      });
  }, []);

  // Alphanumeric sorting function for containers (A1, A2, B1, B2, etc.)
  const containerSort = (a, b) => {
    // Convert to string and handle null/undefined values
    const aStr = String(a || "");
    const bStr = String(b || "");

    // Extract letter and number parts using regex
    const aMatch = aStr.match(/^([A-Za-z]+)(\d+)/) || [null, aStr, "0"];
    const bMatch = bStr.match(/^([A-Za-z]+)(\d+)/) || [null, bStr, "0"];

    const aLetter = aMatch[1].toLowerCase();
    const bLetter = bMatch[1].toLowerCase();
    const aNumber = parseInt(aMatch[2], 10) || 0;
    const bNumber = parseInt(bMatch[2], 10) || 0;

    // First compare letters (A, B, C, etc.)
    if (aLetter !== bLetter) {
      return aLetter.localeCompare(bLetter);
    }

    // If letters are the same, compare numbers (1, 2, 3, etc.)
    return aNumber - bNumber;
  };

  // Calculate pagination
  const totalPages = Math.ceil(sortedMedicines.length / rowsPerPage);
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedMedicines = sortedMedicines.slice(startIndex, endIndex);

  // Pagination handlers
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1); // Reset to first page when changing rows per page
  };
  // Sorting function - FIXED: Proper field name handling
  const handleSortChange = (event) => {
    const selectedSort = event.target.value;
    setSortOption(selectedSort);
    setPage(1);
    if (!selectedSort) {
      setSortedMedicines(medicines);
      return;
    }

    const [field, order] = selectedSort.split("_");
    const sorted = [...medicines].sort((a, b) => {
      let aValue = a[field];
      let bValue = b[field];

      // Special handling for container sorting (letter first, then number)
      if (field === "containerLabel") {
        const result = containerSort(aValue, bValue);
        return order === "asc" ? result : -result;
      }

      // Handle string sorting
      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
        const result = aValue.localeCompare(bValue);
        return order === "asc" ? result : -result;
      }

      // Handle numeric sorting
      if (order === "asc") {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

    setSortedMedicines(sorted);
  };

  // Modal handlers
  const handleEmailSelect = (e) => {
    setSelectedEmail(e.target.value);
  };

  const handleMedicineSelect = (e) => {
    const selected = e.target.value;
    setSelectedItems(selected);

    const initialQuantities = {};
    selected.forEach((id) => {
      if (!quantities[id]) {
        initialQuantities[id] = 1;
      }
    });
    setQuantities({ ...quantities, ...initialQuantities });
  };

  const handleProceed = () => {
    if (!selectedEmail) {
      setMessage("❌ Please select an email first!");
      setTimeout(() => setMessage(""), 2000);
      return;
    }

    if (selectedItems.length === 0) {
      setMessage("❌ Please select at least one medicine!");
      setTimeout(() => setMessage(""), 2000);
      return;
    }

    const order = {
      email: selectedEmail,
      items: selectedItems.map((id) => ({
        medicineId: id,
        quantity: quantities[id] || 1,
      })),
    };

    console.log("🧾 Order Sent to Backend:", order);

    axios
      .post("http://localhost:3000/api/orders/createOrders", order)
      .then((response) => {
        const orderId = response.data.orderId;
        setCreatedOrderId(orderId);
        console;
        setMessage(
          `✅ Order placed successfully with order id: ${response.data.orderId}`
        );
        setTimeout(() => {
          setMessage("");
          setSelectedEmail("");
          setSelectedItems([]);
          setQuantities({});
          setOpen(false);
        }, 5000);
      })
      .catch((err) => {
        console.error("Error placing order:", err);
        setMessage("❌ Error placing order. Please try again.");
        setTimeout(() => setMessage(""), 2000);
      });
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedEmail("");
    setSelectedItems([]);
    setQuantities({});
    setMessage("");
  };

  return (
    <Box
      sx={{
        maxWidth: 1200,
        mx: "auto",
        mt: 0,
        bgcolor: "#0a0a0a",
        minHeight: "100vh",
        p: 3,
      }}
    >
      {/* Header with title and button */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
          p: 2,
          mx: "auto",
          width: 1200,
          bgcolor: "linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)",
          borderRadius: 2,
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}
      >
        <Typography
          variant="h4"
          fontWeight="bold"
          sx={{
            color: "#ffffff",
            textShadow: "0 2px 4px rgba(0,0,0,0.5)",
            letterSpacing: "0.5px",
          }}
        >
          💊 Medicine Inventory
        </Typography>
        <Box
          style={{
            display: "flex",
            justifyContent: "center",
            maxHeight: "60px",
          }}
        >
          <Button
            variant="contained"
            onClick={() => setOpen(true)}
            sx={{
              background: "linear-gradient(45deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              px: 4,
              py: 1.5,
              borderRadius: 3,
              fontWeight: "bold",
              fontSize: "1rem",
              textTransform: "none",
              // boxShadow: "0 4px 15px rgba(102, 126, 234, 0.2)",
              "&:hover": {
                background: "linear-gradient(45deg, #5a67d8 0%, #6b46c1 100%)",
                transform: "translateY(-2px)",
                // boxShadow: "0 6px 20px rgba(102, 126, 234, 0.3)",
              },

              transition: "all 0.3s ease",
            }}
          >
            🛒 Create Order
          </Button>
          {/* Sorting Controls */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              mb: 3,
              px: 2,
            }}
          >
            <FormControl
              variant="outlined"
              sx={{
                minWidth: 200,
                // minHeight:1,
                backgroundColor: "#2a2a2a",

                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#2a2a2a",
                  color: "#ffffff",
                  "& fieldset": {
                    borderColor: "#555",
                  },
                  "&:hover fieldset": {
                    borderColor: "#667eea",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#667eea",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "#b0b0b0",
                  "&.Mui-focused": {
                    color: "#667eea",
                  },
                },
                "& .MuiSelect-icon": {
                  color: "#b0b0b0",
                },
              }}
            >
              <InputLabel id="sort-select-label">
                <Sort sx={{ mr: 1, fontSize: "1rem" }} />
                Sort By
              </InputLabel>
              <Select
                labelId="sort-select-label"
                value={sortOption}
                onChange={handleSortChange}
                label="Sort By"
                MenuProps={{
                  PaperProps: {
                    sx: {
                      "& .MuiMenu-list": {
                        paddingTop: "1rem",
                        paddingBottom: "1rem",
                        backgroundColor: "#2a2a2a",
                      },
                    },
                  },
                }}
                sx={{
                  backgroundColor: "black !important",
                  "& .MuiSelect-select": {
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: "#2a2a2a",
                  },
                }}
              >
                <MenuItem
                  value=""
                  sx={{
                    backgroundColor: "#2a2a2a",
                    color: "#ffffff",
                    "&:hover": {
                      backgroundColor: "#3a3a3a",
                    },
                    "&.Mui-selected": {
                      backgroundColor: "#667eea",
                      "&:hover": {
                        backgroundColor: "#5a67d8",
                      },
                    },
                  }}
                >
                  🔄 Default Order
                </MenuItem>
                {sortOptions.map((option) => (
                  <MenuItem
                    key={option.value}
                    value={option.value}
                    sx={{
                      backgroundColor: "#2a2a2a",
                      color: "#ffffff",
                      "&:hover": {
                        backgroundColor: "#3a3a3a",
                      },
                      "&.Mui-selected": {
                        backgroundColor: "#667eea",
                        "&:hover": {
                          backgroundColor: "#5a67d8",
                        },
                      },
                    }}
                  >
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Box>

      {/* Table */}
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
              <TableCell
                sx={{ color: "#ffffff", fontWeight: "bold", fontSize: "1rem" }}
              >
                #️⃣ ID
              </TableCell>
              <TableCell
                sx={{ color: "#ffffff", fontWeight: "bold", fontSize: "1rem" }}
              >
                💊 Name
              </TableCell>
              <TableCell
                sx={{ color: "#ffffff", fontWeight: "bold", fontSize: "1rem" }}
              >
                🏷️ Brand
              </TableCell>
              <TableCell
                sx={{ color: "#ffffff", fontWeight: "bold", fontSize: "1rem" }}
              >
                📦 Container
              </TableCell>
              <TableCell
                sx={{ color: "#ffffff", fontWeight: "bold", fontSize: "1rem" }}
              >
                🔍 Scanner Code
              </TableCell>
              <TableCell
                sx={{ color: "#ffffff", fontWeight: "bold", fontSize: "1rem" }}
              >
                📊 Total Units
              </TableCell>
              <TableCell
                sx={{ color: "#ffffff", fontWeight: "bold", fontSize: "1rem" }}
              >
                ✅ Available
              </TableCell>
              <TableCell
                sx={{ color: "#ffffff", fontWeight: "bold", fontSize: "1rem" }}
              >
                📉 Used
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(sortedMedicines) && sortedMedicines.length > 0 ? (
              paginatedMedicines.map((med, index) => (
                <TableRow
                  key={startIndex + index}
                  sx={{
                    backgroundColor:
                      (startIndex + index) % 2 === 0 ? "#2a2a2a" : "#1f1f1f",
                    "&:hover": {
                      backgroundColor: "#3a3a3a",
                      // transform: "scale(1.005)",
                      transition: "all 0.2s ease",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  <TableCell sx={{ color: "#b0b0b0", fontFamily: "monospace" }}>
                    {med.id}
                  </TableCell>
                  <TableCell sx={{ color: "#e0e0e0", fontWeight: "500" }}>
                    {med.name}
                  </TableCell>
                  <TableCell sx={{ color: "#b0b0b0" }}>{med.brand}</TableCell>
                  <TableCell sx={{ color: "#b0b0b0" }}>
                    {med.containerLabel}
                  </TableCell>
                  <TableCell sx={{ color: "#90caf9", fontFamily: "monospace" }}>
                    {med.scannerCode}
                  </TableCell>
                  <TableCell sx={{ color: "#81c784", fontWeight: "bold" }}>
                    {med.totalUnits}
                  </TableCell>
                  <TableCell sx={{ color: "#4caf50", fontWeight: "bold" }}>
                    {med.availableQuantity}
                  </TableCell>
                  <TableCell sx={{ color: "#f48fb1", fontWeight: "bold" }}>
                    {med.usedQuantity}
                  </TableCell>
                </TableRow>
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
                  📭 No medicine data available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

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
          Showing {startIndex + 1}-{Math.min(endIndex, sortedMedicines.length)}{" "}
          of {sortedMedicines.length} entries
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

      {/* Order Modal */}
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: 600, md: 800 },
            maxWidth: 800,
            maxHeight: "90vh",
            overflow: "auto",
            background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
            border: "2px solid #667eea",
            boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
            borderRadius: 4,
            p: 4,
          }}
        >
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              color: "#ffffff",
              fontWeight: "bold",
              textAlign: "center",
              mb: 3,
              textShadow: "0 2px 4px rgba(0,0,0,0.5)",
            }}
          >
            🛒 Create New Order
          </Typography>

          <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
            <TextField
              label="📧 Select Email"
              variant="outlined"
              select
              value={selectedEmail}
              onChange={handleEmailSelect}
              SelectProps={{
                MenuProps: {
                  PaperProps: {
                    sx: {
                      "& .MuiMenu-list": {
                        paddingTop: 0,
                        paddingBottom: 0,
                      },
                    },
                  },
                },
              }}
              sx={{
                flex: 1,
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#2a2a2a",
                  color: "#ffffff",
                  "& fieldset": {
                    borderColor: "#555",
                  },
                  "&:hover fieldset": {
                    borderColor: "#667eea",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#667eea",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "#b0b0b0",
                  "&.Mui-focused": {
                    color: "#667eea",
                  },
                },
                "& .MuiSelect-icon": {
                  color: "#b0b0b0",
                },
              }}
            >
              {availableEmails.map((email) => (
                <MenuItem
                  key={email}
                  value={email}
                  sx={{
                    backgroundColor: "#2a2a2a",
                    color: "#ffffff",
                    "&:hover": {
                      backgroundColor: "#3a3a3a",
                    },
                    "&.Mui-selected": {
                      backgroundColor: "#667eea",
                      "&:hover": {
                        backgroundColor: "#5a67d8",
                      },
                    },
                  }}
                >
                  {email}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="💊 Select Medicine(s)"
              variant="outlined"
              select
              value={selectedItems}
              onChange={handleMedicineSelect}
              SelectProps={{
                multiple: true,
                MenuProps: {
                  PaperProps: {
                    sx: {
                      "& .MuiMenu-list": {
                        paddingTop: 0,
                        paddingBottom: 0,
                      },
                    },
                  },
                },
              }}
              sx={{
                flex: 1,
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#2a2a2a",
                  color: "#ffffff",
                  "& fieldset": {
                    borderColor: "#555",
                  },
                  "&:hover fieldset": {
                    borderColor: "#667eea",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#667eea",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "#b0b0b0",
                  "&.Mui-focused": {
                    color: "#667eea",
                  },
                },
                "& .MuiSelect-icon": {
                  color: "#b0b0b0",
                },
              }}
            >
              {medicines.map((med) => (
                <MenuItem
                  key={med.id}
                  value={med.id}
                  sx={{
                    backgroundColor: "#2a2a2a",
                    color: "#ffffff",
                    "&:hover": {
                      backgroundColor: "#3a3a3a",
                    },
                    "&.Mui-selected": {
                      backgroundColor: "#667eea",
                      "&:hover": {
                        backgroundColor: "#5a67d8",
                      },
                    },
                  }}
                >
                  {med.name} ({med.brand}) (ID: {med.id})
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Quantity for each selected medicine */}
          {selectedItems.length > 0 && (
            <Box
              sx={{
                maxHeight: "300px",
                overflow: "auto",
                border: "2px solid #667eea",
                borderRadius: 2,
                p: 3,
                mb: 3,
                background: "linear-gradient(135deg, #2a2a2a 0%, #3d3d3d 100%)",
                boxShadow: "inset 0 2px 10px rgba(0,0,0,0.3)",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  fontWeight: "bold",
                  color: "#ffffff",
                  textAlign: "center",
                  textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                }}
              >
                📋 Selected Medicines
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 2,
                }}
              >
                {selectedItems.map((id) => {
                  const med = medicines.find((m) => m.id === id);
                  return (
                    <Box
                      key={id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        p: 2,
                        background:
                          "linear-gradient(45deg, #1e1e1e 0%, #2d2d2d 100%)",
                        borderRadius: 2,
                        border: "1px solid #555",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                        "&:hover": {
                          border: "1px solid #667eea",
                          transform: "translateY(-2px)",
                          boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      <Typography
                        sx={{
                          color: "#e0e0e0",
                          flex: 1,
                          mr: 1,
                          fontWeight: "500",
                        }}
                      >
                        💊 {med?.name} (ID: {med?.id})
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          backgroundColor: "#1a1a1a",
                          borderRadius: 2,
                          p: 0.5,
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() =>
                            setQuantities((q) => ({
                              ...q,
                              [id]: Math.max((q[id] || 1) - 1, 1),
                            }))
                          }
                          sx={{
                            color: "#f48fb1",
                            "&:hover": {
                              backgroundColor: "#f48fb1",
                              color: "#000",
                            },
                          }}
                        >
                          <Remove fontSize="small" />
                        </IconButton>
                        <Typography
                          component="span"
                          sx={{
                            mx: 2,
                            minWidth: "30px",
                            textAlign: "center",
                            color: "#ffffff",
                            fontWeight: "bold",
                            fontSize: "1.1rem",
                          }}
                        >
                          {quantities[id] || 1}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() =>
                            setQuantities((q) => ({
                              ...q,
                              [id]: (q[id] || 1) + 1,
                            }))
                          }
                          sx={{
                            color: "#4caf50",
                            "&:hover": {
                              backgroundColor: "#4caf50",
                              color: "#000",
                            },
                          }}
                        >
                          <Add fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}

          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <Button
              variant="contained"
              onClick={handleProceed}
              disabled={!selectedEmail || selectedItems.length === 0}
              sx={{
                flex: 1,
                background: "linear-gradient(45deg, #4caf50 0%, #45a049 100%)",
                color: "white",
                py: 1.5,
                fontSize: "1rem",
                fontWeight: "bold",
                textTransform: "none",
                borderRadius: 2,
                // boxShadow: "0 4px 15px rgba(76, 175, 80, 0.2)",
                "&:hover": {
                  background:
                    "linear-gradient(45deg, #45a049 0%, #388e3c 100%)",
                  transform: "translateY(-2px)",
                  // boxShadow: "0 6px 20px rgba(76, 175, 80, 0.2)",
                },
                "&:disabled": {
                  background: "#333",
                  color: "#666",
                  cursor: "not-allowed",
                },
                transition: "all 0.3s ease",
              }}
            >
              ✅ Proceed Order
            </Button>

            <Button
              variant="outlined"
              onClick={handleClose}
              sx={{
                flex: 1,
                borderColor: "#f44336",
                color: "#f44336",
                py: 1.5,
                fontSize: "1rem",
                fontWeight: "bold",
                textTransform: "none",
                borderRadius: 2,
                "&:hover": {
                  borderColor: "#d32f2f",
                  backgroundColor: "#f44336",
                  color: "white",
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 15px rgba(244, 67, 54, 0.4)",
                },
                transition: "all 0.3s ease",
              }}
            >
              ❌ Cancel
            </Button>
          </Box>

          {message && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                borderRadius: 2,
                textAlign: "center",
                background: message.includes("✅")
                  ? "linear-gradient(45deg, #4caf50 0%, #45a049 100%)"
                  : "linear-gradient(45deg, #f44336 0%, #d32f2f 100%)",
                boxShadow: message.includes("✅")
                  ? "0 4px 15px rgba(76, 175, 80, 0.4)"
                  : "0 4px 15px rgba(244, 67, 54, 0.4)",
              }}
            >
              <Typography
                sx={{
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                  textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                }}
              >
                {message}
              </Typography>
            </Box>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default MedicineTable;
