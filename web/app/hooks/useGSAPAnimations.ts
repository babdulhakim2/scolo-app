'use client';

import { useEffect, useRef, MutableRefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, TextPlugin);
}

// Magnetic button effect
export function useMagneticButton(strength = 0.3) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      const distance = Math.sqrt(x * x + y * y);
      const maxDistance = Math.max(rect.width, rect.height);

      if (distance < maxDistance) {
        gsap.to(element, {
          x: x * strength,
          y: y * strength,
          duration: 0.3,
          ease: 'power2.out',
        });
      }
    };

    const handleMouseLeave = () => {
      gsap.to(element, {
        x: 0,
        y: 0,
        duration: 0.3,
        ease: 'elastic.out(1, 0.3)',
      });
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [strength]);

  return ref;
}

// Text reveal animation
export function useTextReveal(delay = 0) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Check if element has child spans (for split lines)
    const childSpans = element.querySelectorAll('span');

    if (childSpans.length > 0) {
      // Animate each span separately
      gsap.set(childSpans, {
        opacity: 0,
        y: 50,
        clipPath: 'inset(0 0 100% 0)'
      });

      gsap.to(childSpans, {
        opacity: 1,
        y: 0,
        clipPath: 'inset(0 0 0% 0)',
        duration: 1.2,
        stagger: 0.3,
        delay,
        ease: 'power3.out',
      });
    } else {
      // Original word-by-word animation
      const text = element.textContent || '';
      element.innerHTML = '';

      const words = text.split(' ');
      words.forEach((word, i) => {
        const span = document.createElement('span');
        span.textContent = word + ' ';
        span.style.display = 'inline-block';
        span.style.overflow = 'hidden';

        const inner = document.createElement('span');
        inner.textContent = word + ' ';
        inner.style.display = 'inline-block';
        span.innerHTML = '';
        span.appendChild(inner);

        element.appendChild(span);

        gsap.from(inner, {
          y: '100%',
          duration: 0.8,
          delay: delay + i * 0.05,
          ease: 'power3.out',
        });
      });
    }
  }, [delay]);

  return ref;
}

// Parallax scroll effect
export function useParallax(speed = 0.5) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    gsap.to(element, {
      y: () => window.innerHeight * speed,
      ease: 'none',
      scrollTrigger: {
        trigger: element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  }, [speed]);

  return ref;
}

// Glitch effect on hover
export function useGlitchHover<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseEnter = () => {
      const tl = gsap.timeline();

      tl.to(element, {
        duration: 0.05,
        x: () => gsap.utils.random(-5, 5),
        y: () => gsap.utils.random(-5, 5),
        repeat: 5,
        ease: 'none',
      })
      .to(element, {
        duration: 0.1,
        x: 0,
        y: 0,
        ease: 'power2.out',
      });

      // Color glitch
      tl.to(element, {
        duration: 0.02,
        filter: 'hue-rotate(90deg)',
        repeat: 2,
        yoyo: true,
      }, 0);
    };

    element.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, []);

  return ref;
}

// Staggered fade in animation
export function useStaggerFadeIn(stagger = 0.1) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const children = element.children;

    gsap.set(children, {
      opacity: 0,
      y: 30,
      scale: 0.95,
    });

    ScrollTrigger.create({
      trigger: element,
      start: 'top 80%',
      onEnter: () => {
        gsap.to(children, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: stagger,
          ease: 'power3.out',
        });
      },
      once: true,
    });
  }, [stagger]);

  return ref;
}

// Morph animation between shapes
export function useMorphAnimation(
  paths: string[],
  duration = 2
): MutableRefObject<SVGPathElement | null> {
  const ref = useRef<SVGPathElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || paths.length < 2) return;

    const tl = gsap.timeline({ repeat: -1 });

    paths.forEach((path, i) => {
      if (i === 0) {
        element.setAttribute('d', path);
      } else {
        tl.to(element, {
          duration: duration,
          attr: { d: path },
          ease: 'power2.inOut',
        });
      }
    });
  }, [paths, duration]);

  return ref;
}

// Interactive cursor follower
export function useCursorFollower() {
  const followerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const follower = followerRef.current;
    if (!follower) return;

    const handleMouseMove = (e: MouseEvent) => {
      gsap.to(follower, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.5,
        ease: 'power2.out',
      });
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return followerRef;
}

// Typewriter effect
export function useTypewriter(text: string, speed = 0.05) {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.textContent = '';

    gsap.to(element, {
      duration: text.length * speed,
      text: text,
      ease: 'none',
    });
  }, [text, speed]);

  return ref;
}