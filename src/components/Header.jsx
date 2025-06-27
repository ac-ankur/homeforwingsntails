import React, { useState, useEffect } from 'react';
import { FaPaw, FaHome, FaInfoCircle, FaTools, FaBuilding, FaImages, FaEnvelope, FaUserFriends, FaHandHoldingHeart, FaChevronDown } from 'react-icons/fa';
import '../assets/css/Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
    // Close dropdowns when closing menu
    if (isOpen) setActiveDropdown(null);
    
    // Prevent body scroll when menu is open
    if (!isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  };
  
  const toggleDropdown = (name) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };
  
  // Close the menu when a link is clicked
  const handleLinkClick = () => {
    setIsOpen(false);
    document.body.style.overflow = 'auto';
  };
  
  return (
    <nav className={`navbar ${scrolled ? 'navbar-shrink' : ''}`}>
      <div className="navbar-container">
        {/* Logo/Brand */}
        <div className={`navbar-brand ${scrolled ? 'brand-small' : 'brand-large'}`}>
          {/* <FaPaw className="paw-icon" /> */}
          <span className="brand-name">HomeForWings&Tails</span>
          <span className="brand-name" style={{color:'black' }}>Family</span>
        </div>
        
        {/* Mobile menu button */}
        <div className="mobile-menu-btn" onClick={toggleMenu}>
          {isOpen ? (
            <svg className="menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg className="menu-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </div>
        
       
        <ul className={`nav-links ${isOpen ? 'active' : ''}`}>
          <li className="nav-item">
            <a href="/" className="nav-link" onClick={handleLinkClick}>
              {/* <FaHome className="nav-icon" />  */}
              <span className="nav-text">Home</span>
            </a>
          </li>
          <li className="nav-item">
            <a href="/about" className="nav-link" onClick={handleLinkClick}>
              {/* <FaInfoCircle className="nav-icon" /> */}
               <span className="nav-text">About</span>
            </a>
          </li>
          
          {/* Services Dropdown */}
          <li className={`nav-item dropdown ${activeDropdown === 'services' ? 'open' : ''}`}>
            <button 
              className="nav-link dropdown-toggle" 
              onClick={() => toggleDropdown('services')}
            >
              {/* <FaTools className="nav-icon" />  */}
              <span className="nav-text">Services</span>
              <FaChevronDown className="dropdown-icon" />
            </button>
            <ul className="dropdown-menu">
              <li><a href="/services/adoption" onClick={handleLinkClick}>Adoption</a></li>
              <li><a href="/services/fostering" onClick={handleLinkClick}>Fostering</a></li>
              <li><a href="/services/veterinary" onClick={handleLinkClick}>Veterinary Care</a></li>
              <li><a href="/services/rescue" onClick={handleLinkClick}>Rescue Operations</a></li>
            </ul>
          </li>
          
          <li className="nav-item">
            <a href="/facility" className="nav-link" onClick={handleLinkClick}>
              {/* <FaBuilding className="nav-icon" /> */}
               <span className="nav-text">Facility</span>
            </a>
          </li>
          
          {/* Gallery Dropdown */}
          <li className={`nav-item dropdown ${activeDropdown === 'gallery' ? 'open' : ''}`}>
            <button 
              className="nav-link dropdown-toggle" 
              onClick={() => toggleDropdown('gallery')}
            >
              {/* <FaImages className="nav-icon" />  */}
              <span className="nav-text">Gallery</span>
              <FaChevronDown className="dropdown-icon" />
            </button>
            <ul className="dropdown-menu">
              <li><a href="/gallery/photos" onClick={handleLinkClick}>Photos</a></li>
              <li><a href="/gallery/videos" onClick={handleLinkClick}>Videos</a></li>
              <li><a href="/gallery/success-stories" onClick={handleLinkClick}>Success Stories</a></li>
            </ul>
          </li>
          
          <li className="nav-item">
            <a href="/contact" className="nav-link" onClick={handleLinkClick}>
              {/* <FaEnvelope className="nav-icon" /> */}
               <span className="nav-text">Contact</span>
            </a>
          </li>
         
          <li className="nav-item">
            <a href="/donate" className="nav-link donate-btn" onClick={handleLinkClick}>
              <FaHandHoldingHeart className="nav-icon" /> <span className="nav-text">Donate</span>
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;