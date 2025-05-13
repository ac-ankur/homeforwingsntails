import { useState, useEffect, useRef } from 'react';
import Lenis from '@studio-freight/lenis';

// Create 9 cards with customizable content
const cards = Array.from({ length: 9 }, (_, i) => {
  const num = i + 1;
  const id = num.toString().padStart(2, '0'); // Format as 01, 02, etc.
  
  // You can customize card content here
  const cardTexts = [
    'RUN THE',
    'LIGHT (UNDER',
    'MAD',
    'BRING ANIM LIBR',
    'CON SCRO DURA',
    'USE AS S',
    'ENJOY HOR VER SUP',
    'FEEL "POS STIC',
    'TOUCH SUPPORT'
  ];
  
  return {
    id,
    title: id,
    content: cardTexts[i] || `Feature ${id}`
  };
});

const DiagonalCardStack = () => {
  const containerRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  
  useEffect(() => {
    const lenis = new Lenis({
      smooth: true,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential ease out
    });
    
    // Set up scroll listener to track scroll position
    lenis.on('scroll', ({ scroll, limit }) => {
      const progress = Math.min(Math.max(scroll / limit, 0), 1);
      setScrollProgress(progress);
    });
    
    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    
    requestAnimationFrame(raf);
    
    return () => {
      lenis.destroy();
    };
  }, []);
  
  return (
    <div 
      ref={containerRef} 
      className="relative min-h-screen bg-black overflow-hidden flex items-center justify-center"
    >
      {/* Right side heading */}
      <div className="absolute right-12 top-20 text-right">
        <h1 className="text-6xl font-bold tracking-tight text-black">
          <span className="block">LENIS BRINGS</span>
          <span className="block text-gray-300">THE HEAT</span>
        </h1>
      </div>
      
      {/* Card stack container */}
      <div className="relative h-screen w-full max-w-6xl py-24">
        {cards.map((card, index) => {
          // Calculate card position based on scroll progress
          const baseOffsetX = 40;
          const baseOffsetY = 20;
          const scrollMultiplier = 400;
          
          // Stagger card movement based on index
          const staggerFactor = 0.1;
          const cardOffsetX = index * baseOffsetX - scrollProgress * scrollMultiplier * (1 + index * staggerFactor);
          const cardOffsetY = index * baseOffsetY;
          
          return (
            <div
              key={card.id}
              className="absolute w-64 h-80 rounded-sm transition-all duration-300 bg-white"
              style={{
                transform: `translate(${cardOffsetX}px, ${cardOffsetY}px)`,
                opacity: scrollProgress > 0.95 ? 0 : 1,
                zIndex: cards.length - index,
                boxShadow: '2px 2px 10px rgba(0,0,0,0.1)'
              }}
            >
              {/* Card number styling */}
              <div className="p-6">
                <span className="text-8xl font-bold text-pink-300">{card.title}</span>
                
                {/* Card text content */}
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-2xl font-bold tracking-tight leading-tight text-black">
                    {card.content}
                  </h3>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Scroll indicator */}
      <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 text-center text-gray-400">
        <p>Scroll to reveal</p>
        <div className="mt-2 animate-bounce">↓</div>
      </div>
      
      {/* Pink dust particles effect - purely decorative */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        {Array.from({ length: 40 }).map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-pink-300"
            style={{
              width: Math.random() * 6 + 2 + 'px',
              height: Math.random() * 6 + 2 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              opacity: Math.random() * 0.5 + 0.2,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default DiagonalCardStack;