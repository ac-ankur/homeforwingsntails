import "./App.css";

import Navbar from "./components/Header";
import Home from "./components/Home";
import Footer from "./components/Footer";

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ImageGallery from "./components/ImageGallery";
import DiagonalCardStack from "./components/DiagonalCard";
// import Room from "./components/Room";
import MultiRobotRoom from "./components/Room";
import ArmSimulation from "./components/ArmSimulation.jsx";
import WarehouseSimulation from "./components/WareHouseSimulation.jsx";
import MedicineTable from "./components/Table.jsx";
import Practice from "./components/Practice.jsx";
import LabTabs from "./components/Tab.jsx";

function App() {
  return (
    <>
      <Router>
        {/* <Navbar /> */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/imagegallery" element={<ImageGallery />} />
          <Route path="/stack" element={<DiagonalCardStack/>} />
          <Route path="/room" element={<MultiRobotRoom/>} />
          <Route path="/armsimulation" element={<ArmSimulation/>} />
          <Route path="/warehousesimulation" element={<WarehouseSimulation/>} />
          {/* <Route path="/table" element={<MedicineTable/>} /> */}
          <Route path="/practice" element={<Practice/>} />
          <Route path="/table" element={<LabTabs/>} />

          {/* <Route path="/ordertable" element={<OrderTable/>} /> */}

        </Routes>
        {/* <Footer /> */}
      </Router>
    </>
  );
}

export default App;

