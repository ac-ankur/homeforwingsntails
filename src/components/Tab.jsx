import * as React from 'react';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';

// Import your components
import MedicineTable from './Table'; // Adjust path as needed
import OrderTable from './orderTable';


export default function LabTabs() {
  const [value, setValue] = React.useState('1');

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ 
      width: '100%', 
      typography: 'body1',
      bgcolor: '#0a0a0a', // Match your dark theme
      minHeight: '100vh',
      
    }}>
      <TabContext value={value}>
        <Box sx={{ 
          width:"25rem",
          borderBottom: 1, 
          borderColor: '#333', // Dark theme border
          bgcolor: '#1a1a1a', // Dark background for tabs
          marginTop:"2rem",
          marginLeft:"4.5rem"
        }}>
          <TabList 
            onChange={handleChange} 
            aria-label="Medicine Management Tabs"
            sx={{
              '& .MuiTab-root': {
                color: '#b0b0b0',
                fontWeight: 'bold',
                '&.Mui-selected': {
                  color: '#667eea',
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#667eea',
              },
            }}
          >
            <Tab label="💊 Medicine Inventory" value="1" />
            <Tab label="📋 Order History" value="2" />
          </TabList>
        </Box>
        <TabPanel value="1" sx={{ p: 0 }}>
          <MedicineTable />
        </TabPanel>
        <TabPanel value="2" sx={{ p: 0 }}>
          <OrderTable />
        </TabPanel>
      </TabContext>
    </Box>
  );
}
