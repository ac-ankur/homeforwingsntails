import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
  Divider,
  useTheme,
  styled
} from '@mui/material';
import { motion } from 'framer-motion';
gsap.registerPlugin(ScrollTrigger);

// Create styled components for the glass effect with orange/black/white theme
const GlassCard = styled(Card)(({ theme }) => ({
  background: 'rgba(0, 0, 0, 0.7)',
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(2),
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 8px 32px rgba(255, 87, 34, 0.2)', // Orange shadow
  overflow: 'hidden',
  position: 'relative',
  transition: 'transform 0.4s ease, box-shadow 0.4s ease',
  '&:hover': {
    transform: 'translateY(-10px)',
    boxShadow: '0 15px 40px rgba(255, 87, 34, 0.3)', // Deeper orange shadow on hover
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 87, 34, 0.2), transparent)', // Orange shine
    transition: '0.5s',
  },
  '&:hover::before': {
    left: '100%',
  }
}));

const GradientBackground = styled(Box)(({ theme }) => ({
  background: ' #FF9800', // Orange gradient background
  minHeight: '100vh',
  padding: theme.spacing(8, 2),
  display: 'flex',
  alignItems: 'center',
}));

const AnimatedContainer = styled(Container)(({ theme }) => ({
  position: 'relative',
}));

// MotionBox components with framer-motion
const MotionBox = styled(motion.div)({
  width: '100%',
});

const AboutUs = () => {

  const aboutRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      aboutRef.current,
      { opacity: 0, y: 100 },
      {
        opacity: 1,
        y: 0,
        scrollTrigger: {
          trigger: aboutRef.current,
          start: "top 80%",
          end: "bottom 60%",
          scrub: true,
        },
      }
    );
  }, []);
  return (
  
    <GradientBackground>
      <AnimatedContainer maxWidth="lg">
        {/* Section Title */}
        <MotionBox
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Typography variant="h2" component="h1" align="center" gutterBottom 
            sx={{ 
              color: 'white', 
              fontWeight: 700,
              mb: 2,
              fontSize: { xs: '2.5rem', md: '3.5rem' }
            }}
          >
            Foundation Home for Wings and Tails
          </Typography>
          
          <Divider sx={{ 
            width: '80px', 
            height: '4px', 
            backgroundColor: 'white', // White divider
            margin: '0 auto',
            mb: 6
          }} />
        </MotionBox>

        <Grid container spacing={4}>
          {/* About Us Card */}
          <Grid item xs={12} md={6}>
            <MotionBox
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <GlassCard elevation={0}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h4" component="h2" gutterBottom 
                    sx={{ 
                      color: '#FF5722', // Orange title
                      mb: 3,
                      fontWeight: 600
                    }}
                  >
                    Our Story
                  </Typography>
                  <Box sx={{ color: 'white', '& p': { mb: 2 } }}>
                    <Typography paragraph>
                      The Foundation Home for Wings and Tails was founded as a registered Section 8 Company under the Companies Act, 2013 to show we are not fly by the night or NGOs with doubtful integrity.
                    </Typography>
                    <Typography paragraph>
                      We are serving birds and animals for over two decades now. We are professionals who want to change the way society thinks about animals, birds, and nature at large.
                    </Typography>
                    <Typography paragraph>
                      Small steps to change opinions and set examples others can follow or at worst refrain from cruelty to birds and animals. People are becoming more exploitative but on the brighter side government and awareness campaigns by activists is causing reforms and protective laws.
                    </Typography>
                    <Typography paragraph>
                      Every one of us has a role to play, from feeding animals and birds to adopting stray and abandoned ones, we can make a substantial difference.
                    </Typography>
                    <Typography>
                      We started as a self-funded organization to help animals and birds near us under a five-step strategy- Adoption Facilitation, Sterilization and Neutering, Feeding Dogs Good Food and Clean Water, Creating Awareness on the ground and social media, and rescuing suffering animals and birds.
                    </Typography>
                  </Box>
                </CardContent>
              </GlassCard>
            </MotionBox>
          </Grid>
          
          {/* Mission & Vision Card */}
          <Grid item xs={12} md={6}>
            <MotionBox
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <GlassCard elevation={0}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h4" component="h2" gutterBottom 
                    sx={{ 
                      color: '#FF5722', // Orange title
                      mb: 4,
                      fontWeight: 600
                    }}
                  >
                    Mission & Vision
                  </Typography>
                  
                  <Box sx={{ mb: 5 }}>
                    <Typography variant="h5" component="h3" 
                      sx={{ 
                        color: '#FF9800', // Lighter orange subtitle
                        mb: 2,
                        fontWeight: 500
                      }}
                    >
                      Our Mission
                    </Typography>
                    <Typography sx={{ color: 'white' }}>
                      Enable creation of a society where Humans being the dominant species takes care of God's other creations namely birds and animals be it aerial, land based or water borne, and ensure eradication of cruelty and species based injustice.
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="h5" component="h3" 
                      sx={{ 
                        color: '#FF9800', // Lighter orange subtitle
                        mb: 2,
                        fontWeight: 500
                      }}
                    >
                      Our Vision
                    </Typography>
                    <Typography sx={{ color: 'white' }}>
                      Make the world a better place for all animals, birds, a place where all live an equal life and natural balance is maintained.
                    </Typography>
                  </Box>
                </CardContent>
              </GlassCard>
            </MotionBox>
          </Grid>
        </Grid>
      </AnimatedContainer>
    </GradientBackground>
   
  );
};

export default AboutUs;