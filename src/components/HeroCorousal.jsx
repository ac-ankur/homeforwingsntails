import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCreative, Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-creative';
import 'swiper/css/pagination';
import '../assets/css/HeroSection.css';

// Import images
import dog1 from "../assets/images/herosection/dog1.jpg";
import dog2 from "../assets/images/herosection/dog2.jpg";
import dog3 from "../assets/images/herosection/dog3.jpg";
import cat1 from "../assets/images/herosection/cat1.jpg";
import cat2 from "../assets/images/herosection/cat2.jpg";

const HeroCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const slides = [
    {
      image: dog1,
      text: 'Home for Wings and Tails is a schedule 8 company formed to take care of the animals and birds around us, we feed them to rescue them and ensure their safety well being, provide them shelter, and above all lots of love caring, and compassion.'
    },
    {
      image: dog2,
      text: 'We foster orphaned animals specially dogs or birds, abandoned by greedy breeders or opportunistic owners, we try to provide them care comfort and affection in our home.'
    },
    {
      image: dog3,
      text: 'We also take care of the strays in our society feeding everyday around 30 stray dogs, we have names for all of them. All of them recognize us and wait for us.'
    },
    {
      image: cat1,
      text: 'People consider stray dogs as a menace, however the real problem be it humans or animals is uncontrolled population. Over population causes fights, hunger and aggression.'
    },
    {
      image: cat2,
      text: 'The solution is to sterilize and birth control, we fund such operations for strays.'
    }
  ];

  return (
    <div className="hero-carousel">
      <Swiper
        modules={[EffectCreative, Autoplay, Pagination]}
        effect={'creative'}
        creativeEffect={{
          prev: {
            // Shutter effect for previous slide
            shadow: true,
            translate: [0, 0, -400],
            opacity: 0,
            scale: 0.8,
          },
          next: {
            // Shutter effect for next slide
            shadow: true,
            translate: ['100%', 0, 0],
            scale: 1.2,
          },
        }}
        grabCursor={true}
        centeredSlides={true}
        slidesPerView={'auto'}
        pagination={{
          clickable: true,
          el: '.swiper-pagination',
          bulletClass: 'dot',
          bulletActiveClass: 'active',
        }}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        speed={1000}
        loop={true}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        className="mySwiper"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index} className="carousel-slide">
            <div 
              className="slide-background"
              style={{ backgroundImage: `url(${slide.image})` }}
            />
            <div className={`slide-overlay ${index === activeIndex ? 'active' : ''}`}>
              <div className="overlay-content">
                <p>{slide.text}</p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="swiper-pagination"></div>
    </div>
  );
};

export default HeroCarousel;