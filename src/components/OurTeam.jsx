import React from "react";
import "../assets/css/OurTeam.css";
import { motion } from "framer-motion";
import RaviSIr from "../assets/images/team/ravi sir.jpeg"
import Shreevidya from "../assets/images/team/vidyamam.jpeg"
import Rahul from "../assets/images/team/rahulsir.jpeg"
import VinodSir from "../assets/images/team/binodsir.jpeg"
import RiteshSir from "../assets/images/team/riteshsir.jpeg"
import RohitSir from "../assets/images/team/rohitsir.jpeg"

const teamMembers = [
  {
    name: "Dr. Ravi Ramakrishnan",
    position: "Animal Lover and Founder",
    image: RaviSIr,
    linkedin: "#",
    twitter: "#",
    instagram: "#",
    facebook: "#"
  },
  {
    name: "Shreevidya Ravi",
    position: "Animal Lover and Co-Founder",
    image: Shreevidya,
    linkedin: "#",
    twitter: "#",
    instagram: "#",
    facebook: "#"
  },
  {
    name: "Ritesh Kumar",
    position: "Facilities Head",
    image: RiteshSir,
    linkedin: "#",
    twitter: "#",
    instagram: "#",
    facebook: "#"
  },
  {
    name: "Rohit Chaudhary",
    position: "Head of Animal Welfare",
    image: RohitSir,
    linkedin: "#",
    twitter: "#",
    instagram: "#",
    facebook: "#"
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2,
      duration: 0.6,
      type: "spring",
    },
  }),
};

const OurTeam = () => {
  return (
    <div className="outer-container responsive-container-block">
      <div className="inner-container responsive-container-block">
        <h1 className="heading-text">Meet Our Team Member</h1>
       
        <div className="cards-container">
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              className="card-container"
              custom={index}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
            >
              <div className="image-container">
                <img 
                  className="team-member-image" 
                  src={member.image} 
                  alt={member.name} 
                />
              </div>
              <h2 className="name">{member.name}</h2>
              <p className="position">{member.position}</p>
              <div className="social-icons">
                <a href={member.linkedin}>
                  <img 
                    className="social-media-icon" 
                    src="https://img.icons8.com/ios-filled/50/ffffff/linkedin.png" 
                    alt="LinkedIn" 
                  />
                </a>
                <a href={member.twitter}>
                  <img 
                    className="social-media-icon" 
                    src="https://img.icons8.com/ios-filled/50/ffffff/twitter.png" 
                    alt="Twitter" 
                  />
                </a>
                <a href={member.instagram}>
                  <img 
                    className="social-media-icon" 
                    src="https://img.icons8.com/ios-filled/50/ffffff/instagram-new--v1.png" 
                    alt="Instagram" 
                  />
                </a>
                <a href={member.facebook}>
                  <img 
                    className="social-media-icon" 
                    src="https://img.icons8.com/ios-filled/50/ffffff/facebook-new.png" 
                    alt="Facebook" 
                  />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OurTeam;