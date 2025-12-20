import { useCallback, useRef } from 'react';

interface ConfettiOptions {
  colors?: string[];
  count?: number;
  duration?: number;
}

interface Confetti {
  x: number;
  y: number;
  rotation: number;
  color: string;
  scale: number;
  velocityX: number;
  velocityY: number;
  rotationSpeed: number;
  opacity: number;
}

const DEFAULT_COLORS = [
  '#fbbf24', // gold
  '#f59e0b', // amber
  '#22c55e', // green
  '#3b82f6', // blue
  '#a855f7', // purple
  '#ec4899', // pink
  '#ef4444', // red
  '#14b8a6', // teal
];

export function useConfetti() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const confettisRef = useRef<Confetti[]>([]);

  const createConfetti = useCallback((count: number, colors: string[]): Confetti[] => {
    const confettis: Confetti[] = [];
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const velocity = 8 + Math.random() * 12;
      
      confettis.push({
        x: centerX,
        y: centerY,
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
        scale: 0.5 + Math.random() * 0.5,
        velocityX: Math.cos(angle) * velocity,
        velocityY: Math.sin(angle) * velocity - 5, // Initial upward bias
        rotationSpeed: (Math.random() - 0.5) * 15,
        opacity: 1,
      });
    }
    
    return confettis;
  }, []);

  const animate = useCallback((ctx: CanvasRenderingContext2D, startTime: number, duration: number) => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    confettisRef.current = confettisRef.current.filter(confetti => {
      // Apply gravity
      confetti.velocityY += 0.3;
      
      // Apply air resistance
      confetti.velocityX *= 0.99;
      confetti.velocityY *= 0.99;
      
      // Update position
      confetti.x += confetti.velocityX;
      confetti.y += confetti.velocityY;
      confetti.rotation += confetti.rotationSpeed;
      
      // Fade out
      confetti.opacity = Math.max(0, 1 - progress * 1.2);

      // Draw confetti
      if (confetti.opacity > 0) {
        ctx.save();
        ctx.translate(confetti.x, confetti.y);
        ctx.rotate((confetti.rotation * Math.PI) / 180);
        ctx.scale(confetti.scale, confetti.scale);
        ctx.globalAlpha = confetti.opacity;
        
        // Draw rectangle confetti
        ctx.fillStyle = confetti.color;
        ctx.fillRect(-5, -3, 10, 6);
        
        ctx.restore();
      }

      return confetti.opacity > 0 && confetti.y < ctx.canvas.height + 100;
    });

    if (progress < 1 && confettisRef.current.length > 0) {
      animationRef.current = requestAnimationFrame(() => animate(ctx, startTime, duration));
    } else {
      // Cleanup
      if (canvasRef.current) {
        canvasRef.current.remove();
        canvasRef.current = null;
      }
    }
  }, []);

  const triggerConfetti = useCallback((options?: ConfettiOptions) => {
    const {
      colors = DEFAULT_COLORS,
      count = 100,
      duration = 3000,
    } = options || {};

    // Cancel any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (canvasRef.current) {
      canvasRef.current.remove();
    }

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    canvasRef.current = canvas;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create confetti particles
    confettisRef.current = createConfetti(count, colors);

    // Start animation
    const startTime = Date.now();
    animate(ctx, startTime, duration);
  }, [createConfetti, animate]);

  const cleanup = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (canvasRef.current) {
      canvasRef.current.remove();
      canvasRef.current = null;
    }
    confettisRef.current = [];
  }, []);

  return { triggerConfetti, cleanup };
}
