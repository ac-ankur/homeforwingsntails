import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Scrollbar, A11y, EffectCoverflow, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import 'swiper/css/effect-coverflow';
import 'swiper/css/autoplay';
import '../assets/css/ImageGallery.css';
import img1 from '../assets/images/gallery/1.jpg';
import img2 from '../assets/images/gallery/2.jpg';
import img3 from '../assets/images/gallery/3.jpg';
import img4 from '../assets/images/gallery/4.jpg';
import img5 from '../assets/images/gallery/5.jpg';
import img6 from '../assets/images/gallery/6.jpg';
import img7 from '../assets/images/gallery/7.jpg';
import img8 from '../assets/images/gallery/8.jpg';

const galleryImages = [
  { src: img1, alt: 'Gallery Image 1', title: 'Amazing View' },
  { src: img2, alt: 'Gallery Image 2', title: 'Scenic Beauty' },
  { src: img3, alt: 'Gallery Image 3', title: 'Natural Wonder' },
  { src: img4, alt: 'Gallery Image 4', title: 'Breathtaking Landscape' },
  { src: img5, alt: 'Gallery Image 5', title: 'Serene Sunset' },
  { src: img6, alt: 'Gallery Image 6', title: 'Majestic Mountains' },
  { src: img7, alt: 'Gallery Image 7', title: 'Coastal Paradise' },
  { src: img8, alt: 'Gallery Image 8', title: 'Tropical Dream' }
];

const ImageGallery = () => {
  const [swiperInstance, setSwiperInstance] = useState(null);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // To ensure proper perspective rendering
  useEffect(() => {
    // Set perspective to body for better 3D effect
    document.body.style.perspective = '1500px';
    
    // Fix for sticky header issue - add this class to your body
    document.body.classList.add('has-gallery');
    
    return () => {
      // Cleanup
      document.body.style.perspective = 'none';
      document.body.classList.remove('has-gallery');
    };
  }, []);

  // Handle fullscreen toggle
  // const toggleFullscreen = () => {
  //   setIsFullscreen(!isFullscreen);
  // };

  // Handle autoplay toggle
  // const toggleAutoplay = () => {
  //   if (swiperInstance) {
  //     if (isAutoplay) {
  //       swiperInstance.autoplay.stop();
  //     } else {
  //       swiperInstance.autoplay.start();
  //     }
  //     setIsAutoplay(!isAutoplay);
  //   }
  // };

  // Handle slide info display
  const handleSlideChange = (swiper) => {
    setActiveIndex(swiper.realIndex);
  };

  return (
    <div className={`panorama-slider-container ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* Gallery header with controls */}
      <div className="gallery-header">

        {/* <div className="gallery-controls">
          <button 
            className={`control-btn ${isAutoplay ? 'active' : ''}`}
            onClick={toggleAutoplay}
          >
            {isAutoplay ? 'Pause' : 'Play'}
          </button>
          <button 
            className="control-btn"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </button>
        </div> */}
      </div>

      {/* Current slide info */}
    
      <Swiper
        onSwiper={setSwiperInstance}
        modules={[Navigation, Pagination, Scrollbar, A11y, EffectCoverflow, Autoplay]}
        effect="coverflow"
        grabCursor={true}
        centeredSlides={true}
        slidesPerView="auto"
        spaceBetween={30}
        loop={true}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true
        }}
        coverflowEffect={{
          rotate: 35,
          stretch: 0,
          depth: 200,
          modifier: 1.5,
          slideShadows: true,
        }}
        navigation={{
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        }}
        pagination={{
          clickable: true,
          el: '.swiper-pagination',
          type: 'bullets',
          dynamicBullets: true,
        }}
        scrollbar={{ draggable: true }}
        breakpoints={{
          640: {
            slidesPerView: 1,
          },
          768: {
            slidesPerView: 2,
          },
          1024: {
            slidesPerView: 3,
          },
        }}
        onSlideChange={handleSlideChange}
        className="panorama-swiper"
      >
        {galleryImages.map((image, index) => (
          <SwiperSlide key={index} className="panorama-slide">
            <div className="image-container">
              <img
                src={image.src}
                alt={image.alt}
                className="panorama-image"
              />
              <div className="image-overlay">
                {/* <h4>{image.title}</h4> */}
              </div>
            </div>
          </SwiperSlide>
        ))}
        
        {/* Custom navigation buttons */}
        <div className="swiper-button-prev"></div>
        <div className="swiper-button-next"></div>
        <div className="swiper-pagination"></div>
    
      </Swiper>
    </div>
  );
};

export default ImageGallery;