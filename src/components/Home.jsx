import React, { useEffect, useRef } from "react";
import HeroCarousel from "./HeroCorousal";
import AboutUs from "./AboutUs";
import Services from "./Services";


import Lenis from "@studio-freight/lenis";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function Home() {
  const scrollRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      smooth: true,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Sync Lenis scroll with GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div ref={scrollRef} id="smooth-wrapper">
      <HeroCarousel />
      <AboutUs />
      <Services />
      
    </div>
  );
}

export default Home;
