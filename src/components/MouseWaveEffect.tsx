import React, { useEffect, useRef, useState } from 'react';

interface MouseTracker {
  x: number;
  y: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  hue: number;
  size?: number;
  type?: 'normal' | 'click';
}

const MouseWaveEffect: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const mouseRef = useRef<MouseTracker>({ x: 0, y: 0 });
  const particlesRef = useRef<Particle[]>([]);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      setIsActive(true);
      
      // Create particles every time for visibility testing
      for (let i = 0; i < 2; i++) {
        particlesRef.current.push({
          x: e.clientX + (Math.random() - 0.5) * 15,
          y: e.clientY + (Math.random() - 0.5) * 15,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          life: 50,
          maxLife: 50,
          hue: 220 + Math.random() * 40, // Blue range
          type: 'normal'
        });
      }
    };

    // Mouse click handler for special effects
    const handleMouseClick = (e: MouseEvent) => {
      // Create subtle click effect - just a few particles
      for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 * i) / 5;
        const speed = 1 + Math.random() * 1;
        particlesRef.current.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 40,
          maxLife: 40,
          hue: 240 + Math.random() * 20, // Gentle blue
          size: 8 + Math.random() * 4,
          type: 'click'
        });
      }
    };

    const handleMouseLeave = () => {
      setIsActive(false);
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life--;
        
        if (particle.life <= 0) return false;
        
        // Draw particle with wave effect
        const alpha = particle.life / particle.maxLife;
        const baseSize = particle.type === 'click' ? (particle.size || 12) : 20;
        const size = (1 - alpha) * baseSize + 3;
        
        // More visible gradient for testing
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, size
        );
        
        if (particle.type === 'click') {
          // More visible click particles
          gradient.addColorStop(0, `hsla(${particle.hue}, 70%, 70%, ${alpha * 0.6})`);
          gradient.addColorStop(0.5, `hsla(${particle.hue + 10}, 60%, 60%, ${alpha * 0.4})`);
          gradient.addColorStop(1, `hsla(${particle.hue + 20}, 50%, 50%, 0)`);
        } else {
          // More visible normal particles
          gradient.addColorStop(0, `hsla(${particle.hue}, 60%, 60%, ${alpha * 0.4})`);
          gradient.addColorStop(0.7, `hsla(${particle.hue + 10}, 50%, 70%, ${alpha * 0.2})`);
          gradient.addColorStop(1, `hsla(${particle.hue + 20}, 40%, 80%, 0)`);
        }
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
        ctx.fill();
        
        return true;
      });
      
      // Draw connecting waves between particles - much more subtle
      if (particlesRef.current.length > 1) {
        ctx.strokeStyle = 'rgba(100, 150, 255, 0.05)';
        ctx.lineWidth = 0.5;
        
        for (let i = 0; i < particlesRef.current.length - 1; i++) {
          const p1 = particlesRef.current[i];
          const p2 = particlesRef.current[i + 1];
          const distance = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
          
          if (distance < 60) { // Shorter connection distance
            const alpha = (60 - distance) / 60 * 0.1; // Much more subtle
            ctx.strokeStyle = `rgba(100, 150, 255, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y); // Simple line instead of curve
            ctx.stroke();
          }
        }
      }
      
      // Draw very subtle cursor effect
      if (isActive) {
        const time = Date.now() * 0.003;
        const pulseSize = 15 + Math.sin(time * 2) * 5; // Bigger for visibility
        
        // More visible outer glow
        const outerGradient = ctx.createRadialGradient(
          mouseRef.current.x, mouseRef.current.y, 0,
          mouseRef.current.x, mouseRef.current.y, pulseSize * 1.5
        );
        outerGradient.addColorStop(0, 'rgba(100, 150, 255, 0.2)');
        outerGradient.addColorStop(0.7, 'rgba(150, 180, 255, 0.1)');
        outerGradient.addColorStop(1, 'rgba(200, 220, 255, 0)');
        
        ctx.fillStyle = outerGradient;
        ctx.beginPath();
        ctx.arc(mouseRef.current.x, mouseRef.current.y, pulseSize * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    // Event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('click', handleMouseClick);
    
    // Start animation
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('click', handleMouseClick);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-40 mouse-wave-canvas"
    />
  );
};

export default MouseWaveEffect;
