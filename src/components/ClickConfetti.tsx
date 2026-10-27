import React, { useState, useEffect, useCallback, useRef } from 'react';
import { playClickSound } from '../utils/sfx';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  shape: 'square' | 'circle' | 'cross' | 'diamond';
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

const SHAPES: Array<Particle['shape']> = ['square', 'diamond', 'cross', 'circle'];
const COLORS = ['#ff4a8a', '#ffd15c', '#0e4dff', '#ff7028', '#39ff14', '#1f1a0e'];

export const triggerGeometricBlast = (originX: number, originY: number, count = 14) => {
  if (typeof window === 'undefined') return;
  const x = originX > 0 ? originX : window.innerWidth / 2;
  const y = originY > 0 ? originY : window.innerHeight / 3;

  const event = new CustomEvent('sneha:blast', {
    detail: { x, y, count }
  });
  window.dispatchEvent(event);
};

export const ClickConfetti: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const lastSpawnRef = useRef<{ x: number; y: number; time: number }>({ x: -999, y: -999, time: 0 });

  const spawnParticles = useCallback((x: number, y: number, count: number) => {
    // Avoid double-spawning on exact same pixel within 40ms
    const now = Date.now();
    const last = lastSpawnRef.current;
    if (Math.abs(x - last.x) < 5 && Math.abs(y - last.y) < 5 && now - last.time < 40) {
      return;
    }
    lastSpawnRef.current = { x, y, time: now };

    const newParticles: Particle[] = [];
    const baseId = now + Math.random();

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.6;
      const speed = 2.8 + Math.random() * 4.2;
      newParticles.push({
        id: baseId + i,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.6, // slight upward bounce
        size: 7 + Math.floor(Math.random() * 8),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 18,
        opacity: 1,
      });
    }

    setParticles((prev) => [...prev.slice(-72), ...newParticles]);
  }, []);

  // 1. Listen for programmatic blast events
  useEffect(() => {
    const handleBlast = (e: any) => {
      const { x, y, count } = e.detail;
      spawnParticles(x, y, count);
    };

    window.addEventListener('sneha:blast', handleBlast);
    return () => window.removeEventListener('sneha:blast', handleBlast);
  }, [spawnParticles]);

  // 2. Listen for clicks & taps everywhere on the screen at every click
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      // Don't spawn if clicking outside the visible window
      if (e.clientX <= 0 && e.clientY <= 0) return;

      spawnParticles(e.clientX, e.clientY, 12);
      playClickSound();
    };

    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [spawnParticles]);

  // 3. Animation loop for physics & decay
  useEffect(() => {
    if (particles.length === 0) return;

    const interval = requestAnimationFrame(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.17, // smooth gravity
            rotation: p.rotation + p.rotationSpeed,
            opacity: p.opacity - 0.025,
          }))
          .filter((p) => p.opacity > 0)
      );
    });

    return () => cancelAnimationFrame(interval);
  }, [particles]);

  if (particles.length === 0) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[99999] overflow-hidden select-none"
      aria-hidden="true"
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute will-change-transform pointer-events-none select-none"
          style={{
            left: `${p.x}px`,
            top: `${p.y}px`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.shape === 'cross' ? 'transparent' : p.color,
            borderRadius: p.shape === 'circle' ? '50%' : '0px',
            transform: `translate(-50%, -50%) rotate(${p.rotation}deg)`,
            opacity: p.opacity,
            boxShadow: p.shape !== 'cross' ? '1px 1px 0 #1f1a0e' : 'none',
            border: p.shape === 'cross' ? 'none' : '1.5px solid #1f1a0e',
          }}
        >
          {p.shape === 'cross' && (
            <div className="relative w-full h-full flex items-center justify-center font-black text-xs text-[#1f1a0e] select-none">
              +
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
