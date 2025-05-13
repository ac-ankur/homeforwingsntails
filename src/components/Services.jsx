import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import services1 from "../assets/images/services/services1.jpg";
import services2 from "../assets/images/services/services2.jpg";
import services3 from "../assets/images/services/services3.jpg";
import services4 from "../assets/images/services/services4.jpg";
import services5 from "../assets/images/services/services5.jpg";
import services6 from "../assets/images/services/services6.jpg";
import OurTeam from "./OurTeam";
gsap.registerPlugin(ScrollTrigger);

const img1 = services1;
const img2 = services2;
const img3 = services3;
const img4 = services4;
const img5 = services5;
const img6 = services6;

const cardData = [
  {
    title: "The Home",
    description:
      "A world-class dream home for stray dogs, self-sustained, natural, neat clean, warm during winters, cold during summers. We are coming up with a model Home for animals Abandoned due to human apathy, where they feel at home, Unlike the typical shelter which is plagued by funds shortages and donation volatility, this will be self-funded and sustainable to the maximum extent. the vegetables will be grown for self-consumption, lighting and power will be Solar, the green foliage will make the place cooler and natural, water bowls will be neat and managed, food will be scientifically administered to meet nutrition requirements.",
    image: img1,
    icon: "🏠",
  },
  {
    title: "Do-Roti (दो-रोटी) Challenge",
    description:
      "When you eat, feed two Rotis to the nearest stray, make it a part of our daily life, morning or evening, see how we do Every felt hunger, the pain and desperation when you don't have food to eat. Our strays unfortunately feel it every day as they go about without food for days and weeks. Can you try becoming a better human being by feeding Two Rotis a day to the nearest hungry stray dog/birds/cows/donkeys around you? If even 1% of people think this way they will never remain hungry.",
    image: img2,
    icon: "🍞",
  },
  {
    title: "Foster Service",
    description:
      "Many times, pet dogs need a foster home, because their guardians are no longer available or capable of taking care of their pets or the pets have run away and their guardians cannot be traced. We have provided Foster Services to many such cases, it is very necessary to be sensitive to their disturbed state of mind, losing their owners, their territory and maybe companions, fighting strays, human casualness, etc is a lot stressful to them which makes them hostile and bitter, see how we treated them with love and compassion and they regain confidence and trust on humans.",
    image: img3,
    icon: "🏡",
  },
  {
    title: "Animal Birth Control (ABC)",
    description:
      "The legally correct, most humane, and correct way of controlling stray dog population is through birth control operations, generally, this requires a pre-op test for health state, actual surgery which lasts around 1 hour or less, followed by post-op care which can take as less as five days where antibiotic medication has to be given for healing to final release at its original territory. If you have the capability it might cost less than what you spend on a dinner outing for your family, please sponsor or initiate and execute an ABC program for your strays nearby.",
    image: img4,
    icon: "🐾",
  },
  {
    title: "Stray Feeding",
    description:
      "We are the privileged species, but what about our responsibility towards the others -dogs, cats, birds, cows all need us. More than 90% of stray dogs, cats, and birds, die an untimely death, accidents, territorial fights, man-animal conflict casualties, disease, starvation, poisoning, thirst, and predators How we can bring about a change, adopt one or two or more strays as per your capability, and take care of their water, shelter and food requirements. If needed consult a Vet and provide basic medicines, stray dogs are very resilient, basic help and they will have a much better life. An occasional tick collar or tick treatment will help them get rid of ticks/mites, imagine hundreds of ticks sucking their blood, this pain can be easily avoided at low costs.",
    image: img5,
    icon: "🍽️",
  },
  {
    title: "Rescues",
    description:
      "Animals and Birds need to be rescued on many unfortunate occasions, sometimes they get stuck in narrow lanes, deep pits, drain pipes, or stranded in water, tangled in kite strings lost as pups/chicks, displaced or dislocated from their dwellings.",
    image: img6,
    icon: "🚑",
  },
];

const AnimatedBackground = () => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pawPrints = [];
    // Enhanced color palette with more variety
    const colors = ['#ff7700', '#ff9900', '#ffaa33', '#ff5500', '#444444', '#333333'];
    
    // Set canvas size and handle resize
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Create enhanced paw print
    const createPawPrint = () => {
      // Use different sizes for varied appearance
      const baseSize = Math.random() * 20 + 10;
      
      // Create different walking paths - some straight, some curved
      const walkingPath = Math.random() > 0.5;
      const pathCurvature = (Math.random() * 0.1) - 0.05;
      
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: baseSize,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: 0,
        direction: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.4 + 0.1,
        rotationOffset: Math.random() * 0.4 - 0.2,
        walkingPath: walkingPath,
        pathCurvature: pathCurvature,
        pulse: Math.random() * 0.05 + 0.01,
        pulseDirection: 1,
        pulseValue: 0
      };
    };
    
    // Add initial paw prints - increased number for better coverage
    for (let i = 0; i < 25; i++) {
      pawPrints.push(createPawPrint());
    }
    
    // Enhanced draw paw print function with better shaping
    const drawPawPrint = (paw) => {
      ctx.save();
      ctx.globalAlpha = paw.opacity;
      
      // Add subtle gradient to paw print
      const gradient = ctx.createRadialGradient(
        paw.x, paw.y, 0,
        paw.x, paw.y, paw.size * 1.2
      );
      gradient.addColorStop(0, paw.color);
      gradient.addColorStop(1, paw.color + '88'); // Add transparency to outer edge
      ctx.fillStyle = gradient;
      
      // Rotate the whole paw print according to direction
      ctx.translate(paw.x, paw.y);
      ctx.rotate(paw.direction + Math.PI/2 + paw.rotationOffset);
      ctx.translate(-paw.x, -paw.y);
      
      // Enhanced main pad with better shape
      const padMultiplier = 1 + (paw.pulseValue * 0.05);
      ctx.beginPath();
      ctx.ellipse(
        paw.x, 
        paw.y, 
        paw.size * 0.6 * padMultiplier, 
        paw.size * 0.7 * padMultiplier, 
        0, 0, Math.PI * 2
      );
      ctx.fill();
      
      // Add subtle shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 5;
      
      // Enhanced toe pads - slightly more realistic positioning
      const toeSize = paw.size * 0.35 * padMultiplier;
      
      // Front toes - 3 of them in a slight arc
      for (let i = 0; i < 3; i++) {
        const angleOffset = (i - 1) * 0.4; // -0.4, 0, 0.4
        const toeDistance = paw.size * 0.9;
        const toeX = paw.x + Math.cos(Math.PI/2 + angleOffset) * toeDistance;
        const toeY = paw.y + Math.sin(Math.PI/2 + angleOffset) * toeDistance;
        
        ctx.beginPath();
        ctx.ellipse(
          toeX, 
          toeY, 
          toeSize * 0.9, 
          toeSize * 1.1, 
          angleOffset, 
          0, Math.PI * 2
        );
        ctx.fill();
      }
      
      // Rear/side toe pads (1 on each side)
      const rearToeSize = toeSize * 0.9;
      const angles = [-Math.PI/4, Math.PI/4];
      
      angles.forEach(angle => {
        const toeDistance = paw.size * 0.6;
        const toeX = paw.x + Math.cos(angle) * toeDistance;
        const toeY = paw.y + Math.sin(angle) * toeDistance;
        
        ctx.beginPath();
        ctx.ellipse(
          toeX, 
          toeY, 
          rearToeSize * 0.85, 
          rearToeSize, 
          angle, 
          0, Math.PI * 2
        );
        ctx.fill();
      });
      
      ctx.restore();
    };
    
    // Animation loop
    const animate = () => {
      // Use semi-transparent clear for trail effect
      ctx.fillStyle = 'rgba(17, 17, 17, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw paw prints
      pawPrints.forEach((paw, index) => {
        // Enhanced fade in/out logic with smoother transitions
        if (paw.opacity < 0.7) {
          paw.opacity += 0.005;
        } else {
          paw.opacity -= 0.003;
          if (paw.opacity <= 0) {
            pawPrints[index] = createPawPrint();
            return;
          }
        }
        
        // Pulsing effect
        paw.pulseValue += paw.pulse * paw.pulseDirection;
        if (paw.pulseValue > 1 || paw.pulseValue < 0) {
          paw.pulseDirection *= -1;
        }
        
        // Enhanced movement: some paws follow paths, others random
        if (paw.walkingPath) {
          // Follow a slightly curved path
          paw.direction += paw.pathCurvature;
        } else {
          // Occasionally change direction slightly
          if (Math.random() < 0.03) {
            paw.direction += (Math.random() * 0.2) - 0.1;
          }
        }
        
        // Move paw print
        paw.x += Math.cos(paw.direction) * paw.speed;
        paw.y += Math.sin(paw.direction) * paw.speed;
        
        // Enhanced boundary checking - replace when off screen
        const buffer = paw.size * 3;
        if (paw.x < -buffer || paw.x > canvas.width + buffer || 
            paw.y < -buffer || paw.y > canvas.height + buffer) {
          pawPrints[index] = createPawPrint();
          
          // Create entry from edges for more natural appearance
          const side = Math.floor(Math.random() * 4);
          switch(side) {
            case 0: // top
              pawPrints[index].x = Math.random() * canvas.width;
              pawPrints[index].y = -buffer;
              pawPrints[index].direction = Math.random() * Math.PI + Math.PI/2;
              break;
            case 1: // right
              pawPrints[index].x = canvas.width + buffer;
              pawPrints[index].y = Math.random() * canvas.height;
              pawPrints[index].direction = Math.random() * Math.PI + Math.PI;
              break;
            case 2: // bottom
              pawPrints[index].x = Math.random() * canvas.width;
              pawPrints[index].y = canvas.height + buffer;
              pawPrints[index].direction = Math.random() * Math.PI + Math.PI*1.5;
              break;
            case 3: // left
              pawPrints[index].x = -buffer;
              pawPrints[index].y = Math.random() * canvas.height;
              pawPrints[index].direction = Math.random() * Math.PI;
              break;
          }
        }
        
        drawPawPrint(paw);
      });
      
      requestAnimationFrame(animate);
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
        position: 'absolute',
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

const Services = () => {
  const cardsRef = useRef([]);
  const containerRef = useRef(null);
  const stackRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate title
      gsap.from(titleRef.current, {
        y: -50,
        opacity: 0,
        duration: 1,
        ease: "elastic.out(1, 0.5)"
      });

      cardsRef.current.forEach((card, index) => {
        gsap.set(card, {
          zIndex: cardData.length - index,
          opacity: 0,
          scale: 0.85,
          rotationY: -10,
        });
      });

      // Create card animations
      cardsRef.current.forEach((card, index) => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: () => `top+=${index * window.innerHeight * 0.7} top`,
            end: () => `+=${window.innerHeight}`,
            scrub: true,
          },
        });

        tl.to(card, {
          opacity: 1,
          yPercent: 0,
          scale: 1,
          rotationY: 0,
          duration: 1,
          ease: "power2.out",
        });

        if (index > 0) {
          tl.to(
            cardsRef.current[index - 1],
            {
              opacity: 0,
              yPercent: -40,
              scale: 0.85,
              rotationY: 10,
              duration: 1,
              ease: "power2.inOut",
            },
            0
          );
        }
      });

      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: () => `+=${cardData.length * window.innerHeight * 0.7}`,
        pin: stackRef.current,
        pinSpacing: true,
        scrub: true,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div 
      ref={containerRef}
      style={{
      background: ' #FF9800',
        minHeight: `${cardData.length * 100}vh`,
        position: 'relative',
        overflow: 'hidden',
        paddingTop: '0px', 
      }}
    >
      {/* <AnimatedBackground /> */}
      
      <div
        ref={stackRef}
        style={{
          position: "relative",
          height: "90vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          perspective: "1200px",
          zIndex: 10,
          marginTop:'4rem'
          
        }}
      >
        <h1 
          ref={titleRef}
          style={{
            color: '#ff7700',
            textAlign: 'center',
            fontSize: '3.5rem',
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            position: 'absolute',
            top: '60px',
            left: '0',
            right: '0',
            margin: '0 auto',
            zIndex: 20,
          }}
        >
          Our Services
        </h1>
        
        {cardData.map((card, index) => (
          <div
            key={index}
            ref={(el) => (cardsRef.current[index] = el)}
            style={{
              position: "absolute",
              width: "100%",
              height: "80vh",
              background: 'linear-gradient(135deg, #fff 0%, #f5f5f5 100%)',
              borderRadius: "8px",
              color: "#333",
              padding: "0",
              transformStyle: "preserve-3d",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
              maxWidth: "1400px",
            }}
          >
            <div style={{ 
              padding: '30px', 
              position: 'relative', 
              overflow: 'hidden',
              flex: '1',
              display: 'flex',
              flexDirection: 'row',
              maxHeight: 'calc(80vh - 60px)',
              gap: '40px',
              alignItems: 'center',
            }}>
              {card.image && (
                <div style={{
                  flex: '0 0 400px', // Fixed width for consistent image size
                  position: 'relative',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  height: '400px', // Fixed height for a perfect square
                  boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                  border: '4px solid white',
                }}>
                  <img
                    src={card.image}
                    alt={card.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block", 
                      transition: "transform 0.5s ease", 
                    }}
                    onMouseOver={(e) => {e.currentTarget.style.transform = "scale(1.05)"}}
                    onMouseOut={(e) => {e.currentTarget.style.transform = "scale(1)"}}
                  />
                </div>
              )}
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                flex: '1', 
                justifyContent: 'space-between',
                height: '400px', // Match image height for alignment
                padding: '10px 0',
              }}>
                <div style={{
                  background: 'linear-gradient(90deg, #ff7700 0%, #ff9900 100%)',
                  padding: '15px 20px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '20px',
                  boxShadow: '0 4px 10px rgba(255,119,0,0.2)'
                }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: '#000',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    marginRight: '20px',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                  }}>
                    {card.icon}
                  </div>
                  <h2 style={{ 
                    fontSize: "26px", 
                    margin: 0, 
                    color: '#000',
                    fontWeight: 'bold',
                    textShadow: '1px 1px 0 rgba(255,255,255,0.3)'
                  }}>
                    {card.title}
                  </h2>
                </div>
                
                <div style={{
                  flex: '1',
                  overflow: 'auto',
                  padding: '5px 10px 20px 5px',
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#ff7700 #f5f5f5',
                  marginBottom: '20px',
                  fontSize: "17px", 
                  lineHeight: "1.7", 
                  color: '#333',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: '8px',
                  border: '1px solid #eee',
                }}>
                  {card.description}
                </div>
              
                <button style={{
                  background: 'linear-gradient(90deg, #ff7700 0%, #ff9900 100%)',
                  color: '#000',
                  border: 'none',
                  padding: '16px 36px',
                  borderRadius: '8px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                  transition: 'all 0.3s ease',
                  alignSelf: 'flex-start',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.3)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.25)";
                }}>
                  Get Involved
                </button>
              </div>
            </div>
            
            <div style={{
              position: 'absolute',
              bottom: '20px',
              right: '20px',
              width: '150px',
              height: '150px',
              opacity: 0.08,
              pointerEvents: 'none'
            }}>
              <div style={{
                fontSize: '130px',
                color: '#ff7700'
              }}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        zIndex: 100
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #ff7700 0%, #ff9900 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
          cursor: 'pointer',
          color: '#000',
          fontSize: '28px',
          fontWeight: 'bold',
          transition: 'all 0.3s ease'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = "scale(1.1)";
          e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.5)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.4)";
        }}>
          ↑
        </div>
      </div>
      <OurTeam/>
    </div>
  );
};

export default Services;