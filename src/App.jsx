import "./App.css";

import Navbar from "./components/Header";
import Home from "./components/Home";
import Footer from "./components/Footer";

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ImageGallery from "./components/ImageGallery";
import DiagonalCardStack from "./components/DiagonalCard";

function App() {
  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/imagegallery" element={<ImageGallery />} />
          <Route path="/stack" element={<DiagonalCardStack/>} />
        </Routes>
        <Footer />
      </Router>
    </>
  );
}

export default App;
