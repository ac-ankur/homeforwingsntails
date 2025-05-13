import React from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  Typography, 
  TextField, 
  Button, 
  IconButton, 
  Divider,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import PetsIcon from '@mui/icons-material/Pets';

// Custom styled components
const FooterWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: '#1a1a1a',
  color: '#ffffff',
  paddingTop: theme.spacing(6),
  paddingBottom: theme.spacing(3),
}));

const OrangeButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#ff6b00',
  color: 'white',
  '&:hover': {
    backgroundColor: '#e25e00',
  },
}));

const OrangeIconButton = styled(IconButton)(({ theme }) => ({
  color: '#ff6b00',
  '&:hover': {
    color: '#ffffff',
    backgroundColor: 'rgba(255, 107, 0, 0.2)',
  },
}));

const FooterLink = styled(Typography)(({ theme }) => ({
  color: '#dddddd',
  marginBottom: theme.spacing(1),
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  transition: 'color 0.3s ease',
  '&:hover': {
    color: '#ff6b00',
  },
}));

const InfoItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: theme.spacing(2),
}));

const FooterLogo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
}));

const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#555555',
    },
    '&:hover fieldset': {
      borderColor: '#ff6b00',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#ff6b00',
    },
  },
  '& .MuiInputBase-input': {
    color: '#ffffff',
  },
  '& .MuiInputLabel-root': {
    color: '#aaaaaa',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#ff6b00',
  },
});

const FooterDivider = styled(Divider)(({ theme }) => ({
  backgroundColor: '#444444',
  margin: theme.spacing(3, 0),
}));

const Footer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <FooterWrapper>
      <Container maxWidth="xl">
        <Grid container spacing={4}>
         
          <Grid item xs={12} sm={6} md={3}>
            <FooterLogo>
              <PetsIcon sx={{ fontSize: 36, color: '#ff6b00', mr: 1 }} />
              <Typography variant="h5" component="div" fontWeight="bold" sx={{ letterSpacing: 1 }}>
                HomeForWings&TailsFamily
              </Typography>
            </FooterLogo>
            <Typography variant="body2" color="#cccccc" >
              A schedule 8 company formed to take care of animals and birds,  providing shelter,
            </Typography>
            <Typography variant="body2" color="#cccccc" >
            safety, and compassion to our furry and feathered friends.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <OrangeIconButton aria-label="facebook">
                <FacebookIcon />
              </OrangeIconButton>
              <OrangeIconButton aria-label="twitter">
                <TwitterIcon />
              </OrangeIconButton>
              <OrangeIconButton aria-label="instagram">
                <InstagramIcon />
              </OrangeIconButton>
              <OrangeIconButton aria-label="youtube">
                <YouTubeIcon />
              </OrangeIconButton>
            </Box>
          </Grid>

         
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" fontWeight="bold" mb={2} sx={{ position: 'relative', paddingBottom: 1, 
              '&:after': {
                content: '""',
                position: 'absolute',
                left: 0,
                bottom: 0,
                width: '40px',
                height: '3px',
                backgroundColor: '#ff6b00',
              }
            }}>
              Popular Links
            </Typography>
            <FooterLink variant="body2">Home</FooterLink>
            <FooterLink variant="body2">About Us</FooterLink>
            <FooterLink variant="body2">Our Services</FooterLink>
            <FooterLink variant="body2">Gallery</FooterLink>
            <FooterLink variant="body2">Contact Us</FooterLink>
          </Grid>

      
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" fontWeight="bold" mb={2} sx={{ position: 'relative', paddingBottom: 1, 
              '&:after': {
                content: '""',
                position: 'absolute',
                left: 0,
                bottom: 0,
                width: '40px',
                height: '3px',
                backgroundColor: '#ff6b00',
              }
            }}>
              Get In Touch
            </Typography>
            <InfoItem>
              <LocationOnIcon sx={{ color: '#ff6b00', mr: 1, mt: 0.3 }} />
              <Typography variant="body2" color="#cccccc">
                Plot-20, Techzone7, Greater Noida West
              </Typography>
            </InfoItem>
            <InfoItem>
              <PhoneIcon sx={{ color: '#ff6b00', mr: 1, mt: 0.3 }} />
              <Typography variant="body2" color="#cccccc">
                +91-9891001443
              </Typography>
            </InfoItem>
            <InfoItem>
              <EmailIcon sx={{ color: '#ff6b00', mr: 1, mt: 0.3 }} />
              <Typography variant="body2" color="#cccccc">
                info@wingsandtails.co.in
              </Typography>
            </InfoItem>
          </Grid>

          
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" fontWeight="bold" mb={2} sx={{ position: 'relative', paddingBottom: 1, 
              '&:after': {
                content: '""',
                position: 'absolute',
                left: 0,
                bottom: 0,
                width: '40px',
                height: '3px',
                backgroundColor: '#ff6b00',
              }
            }}>
              Newsletter
            </Typography>
            <Typography variant="body2" color="#cccccc" >
            Subscribe to our newsletter for updates on our
            </Typography>
            <Typography variant="body2" color="#cccccc" >
            furry friends and upcoming events.
            </Typography>
            <StyledTextField
              variant="outlined"
              size="small"
              fullWidth
              label="Email Address"
              margin="dense"
            />
            <OrangeButton 
              variant="contained" 
              fullWidth
              disableElevation
              sx={{ mt: 1 }}
            >
              Submit Now
            </OrangeButton>
          </Grid>
        </Grid>

        <FooterDivider />
        
        {/* Bottom Footer */}
        <Grid container justifyContent="space-between" alignItems="center" flexDirection={isMobile ? 'column' : 'row'}>
          <Grid item>
            <Typography variant="body2" color="#999999" textAlign={isMobile ? 'center' : 'left'}>
              Copyright ©2024 Design & Developed by HomeForWingsandTailsFamily
            </Typography>
          </Grid>
          <Grid item sx={{ mt: isMobile ? 2 : 0 }}>
            <Box display="flex" gap={2} justifyContent="center">
              <Typography variant="body2" color="#999999" sx={{ cursor: 'pointer', '&:hover': { color: '#ff6b00' } }}>
                Privacy
              </Typography>
              <Typography variant="body2" color="#999999" sx={{ cursor: 'pointer', '&:hover': { color: '#ff6b00' } }}>
                Terms
              </Typography>
              <Typography variant="body2" color="#999999" sx={{ cursor: 'pointer', '&:hover': { color: '#ff6b00' } }}>
                FAQs
              </Typography>
              <Typography variant="body2" color="#999999" sx={{ cursor: 'pointer', '&:hover': { color: '#ff6b00' } }}>
                Help
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </FooterWrapper>
  );
};

export default Footer;