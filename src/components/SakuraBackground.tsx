import React, { useMemo } from 'react';
import { motion } from 'motion/react';

const Petal = ({ delay, duration, left, size, rotate }: { delay: number, duration: number, left: string, size: number, rotate: number }) => {
  return (
    <motion.div
      initial={{ y: -20, x: 0, opacity: 0, rotate: rotate }}
      animate={{ 
        y: '110vh', 
        x: [0, 80, -80, 40],
        opacity: [0, 0.8, 0.8, 0],
        rotate: rotate + 720
      }}
      transition={{ 
        duration: duration, 
        repeat: Infinity, 
        delay: delay,
        ease: "linear"
      }}
      style={{
        position: 'fixed',
        left: left,
        width: size,
        height: size,
        zIndex: -1,
        pointerEvents: 'none',
      }}
    >
      <svg viewBox="0 0 100 100" fill="#ffb7c5">
        <path d="M50,0 C60,20 80,40 80,60 C80,80 65,95 50,95 C35,95 20,80 20,60 C20,40 40,20 50,0" />
      </svg>
    </motion.div>
  );
};

const FloatingFlower = ({ top, left, size, delay }: { top: string, left: string, size: number, delay: number }) => {
  return (
    <motion.div
      animate={{ 
        y: [0, -30, 0],
        x: [0, 15, 0],
        rotate: [0, 25, 0],
        opacity: [0.2, 0.4, 0.2]
      }}
      transition={{ 
        duration: 10 + Math.random() * 10, 
        repeat: Infinity, 
        delay: delay,
        ease: "easeInOut"
      }}
      style={{
        position: 'fixed',
        top: top,
        left: left,
        width: size,
        height: size,
        zIndex: -2,
        pointerEvents: 'none',
      }}
    >
      <SakuraSVG />
    </motion.div>
  );
};

const SakuraSVG = ({ opacity = 1 }: { opacity?: number }) => (
  <svg viewBox="0 0 100 100" fill="#ffb7c5" style={{ opacity }}>
    <path d="M50,50 Q65,10 80,50 T50,90 T20,50 T50,10 Z" />
    <path d="M50,50 Q85,35 85,65 T50,95 T15,65 T15,35 T50,50 Z" />
    <circle cx="50" cy="50" r="10" fill="#fff" opacity="0.6" />
    <circle cx="50" cy="50" r="4" fill="#ff8fa3" />
  </svg>
);

const CornerDecoration = ({ position }: { position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) => {
  const styles: any = {
    'top-left': { top: '-50px', left: '-50px', rotate: '45deg' },
    'top-right': { top: '-50px', right: '-50px', rotate: '135deg' },
    'bottom-left': { bottom: '-50px', left: '-50px', rotate: '-45deg' },
    'bottom-right': { bottom: '-50px', right: '-50px', rotate: '-135deg' },
  };

  return (
    <div 
      style={{ 
        position: 'fixed', 
        width: '300px', 
        height: '300px', 
        zIndex: -1, 
        opacity: 0.3,
        pointerEvents: 'none',
        ...styles[position]
      }}
    >
      <div className="relative w-full h-full">
        <div className="absolute top-0 left-0 w-32 h-32"><SakuraSVG /></div>
        <div className="absolute top-10 left-24 w-20 h-20"><SakuraSVG /></div>
        <div className="absolute top-24 left-10 w-24 h-24"><SakuraSVG /></div>
        <div className="absolute top-40 left-40 w-16 h-16"><SakuraSVG /></div>
      </div>
    </div>
  );
};

export default function SakuraBackground() {
  const petals = useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      delay: Math.random() * 20,
      duration: 12 + Math.random() * 18,
      left: `${Math.random() * 100}%`,
      size: 10 + Math.random() * 15,
      rotate: Math.random() * 360,
    }));
  }, []);

  const flowers = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: 80 + Math.random() * 100,
      delay: Math.random() * 10,
    }));
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
      <CornerDecoration position="top-left" />
      <CornerDecoration position="top-right" />
      <CornerDecoration position="bottom-left" />
      <CornerDecoration position="bottom-right" />
      
      {flowers.map(f => (
        <FloatingFlower key={f.id} {...f} />
      ))}
      {petals.map(p => (
        <Petal key={p.id} {...p} />
      ))}
    </div>
  );
}
