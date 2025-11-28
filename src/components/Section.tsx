'use client';

import React, { useEffect, useRef, useState } from 'react';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  id?: string;
}

const Section: React.FC<SectionProps> = ({ children, className = "", delay = 0, id }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentRef = domRef.current;
    
    // Safety fallback: Ensure content becomes visible after 1 second even if observer fails
    const safetyTimer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          clearTimeout(safetyTimer); // Clear fallback if observer works
        }
      });
    }, { 
      threshold: 0, // Trigger as soon as 1 pixel is visible
      rootMargin: '0px 0px -50px 0px' // Offset to trigger slightly before full view
    });

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      clearTimeout(safetyTimer);
      if (currentRef) observer.unobserve(currentRef);
    };
  }, []);

  return (
    <div
      id={id}
      ref={domRef}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transform transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default Section;