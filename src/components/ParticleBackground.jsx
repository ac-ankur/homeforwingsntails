import React, { useEffect, useRef,  } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);



// Animated background particles
const ParticleBackground = () => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const particles = [];
    
    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Create particles
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 5 + 1;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
        this.color = Math.random() > 0.5 ? 
          `rgba(255, ${Math.floor(Math.random() * 80) + 100}, 0, ${Math.random() * 0.2 + 0.1})` : 
          `rgba(0, 0, 0, ${Math.random() * 0.2 + 0.1})`;
      }
      
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        if (this.size > 0.2) this.size -= 0.05;
        
        // Reset particle if it's too small or out of bounds
        if (this.size <= 0.2 || 
            this.x < 0 || 
            this.x > canvas.width || 
            this.y < 0 || 
            this.y > canvas.height) {
          this.x = Math.random() * canvas.width;
          this.y = Math.random() * canvas.height;
          this.size = Math.random() * 5 + 1;
          this.speedX = Math.random() * 2 - 1;
          this.speedY = Math.random() * 2 - 1;
        }
      }
      
      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Initialize particles
    const init = () => {
      for (let i = 0; i < 100; i++) {
        particles.push(new Particle());
      }
    };
    
    init();
    
    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }
      
      // Connect particles with lines if they're close enough
      connectParticles();
      
      requestAnimationFrame(animate);
    };
    
    // Connect particles with lines
    const connectParticles = () => {
      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            const opacity = 1 - (distance / 100);
            ctx.strokeStyle = `rgba(255, 120, 0, ${opacity * 0.1})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef} 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0
      }}
    />
  );
};

// Progress indicator component
const ProgressIndicator = ({ currentIndex, total }) => {
  return (
    <div style={{
      position: 'fixed',
      left: '20px',
      top: '50%',
      transform: 'translateY(-50%)',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      zIndex: 100
    }}>
      {Array.from({ length: total }).map((_, index) => (
        <div 
          key={index}
          style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: index === currentIndex ? '#ff7700' : '#333',
            transition: 'all 0.3s ease',
            transform: index === currentIndex ? 'scale(1.5)' : 'scale(1)',
            boxShadow: index === currentIndex ? '0 0 10px rgba(255, 119, 0, 0.7)' : 'none'
          }}
        />
      ))}
    </div>
  );
};

const Particle = () => {

  const containerRef = useRef(null);



  
  return (
    <div 
      ref={containerRef}
      style={{
        background: '#121212',
        // minHeight: `${cardData.length * 100}vh`,
        position: 'relative'
      }}
    >
      <ParticleBackground />
  
      
    
    </div>
  );
};

export default Particle;