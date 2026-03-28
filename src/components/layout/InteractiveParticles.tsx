"use client";

import { useRef, useEffect } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  opacity: number;
}

export default function InteractiveParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number | null>(null);

  const COLORS = ["#14b8a6", "#f97316"];
  const PARTICLE_COUNT = 80;
  const PARTICLE_SIZE = 2;
  const CONNECTION_DISTANCE = 150;
  const MOUSE_RADIUS = 120;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Initialize particles function
    const initParticles = () => {
      particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: PARTICLE_SIZE,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        opacity: Math.random() * 0.4 + 0.6,
      }));
    };

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Mouse movement tracking
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Animation loop
    const animate = () => {
      if (!particlesRef.current || particlesRef.current.length === 0) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      // Clear canvas with slight trail effect for smooth motion
      ctx.fillStyle = "rgba(10, 10, 15, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;

      // Update and draw particles
      particles.forEach((particle) => {
        // Move particle
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off walls
        if (
          particle.x - particle.radius < 0 ||
          particle.x + particle.radius > canvas.width
        ) {
          particle.vx *= -1;
          particle.x = Math.max(
            particle.radius,
            Math.min(canvas.width - particle.radius, particle.x),
          );
        }
        if (
          particle.y - particle.radius < 0 ||
          particle.y + particle.radius > canvas.height
        ) {
          particle.vy *= -1;
          particle.y = Math.max(
            particle.radius,
            Math.min(canvas.height - particle.radius, particle.y),
          );
        }

        // Mouse interaction (repel)
        const dx = particle.x - mouseRef.current.x;
        const dy = particle.y - mouseRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < MOUSE_RADIUS) {
          const angle = Math.atan2(dy, dx);
          const force = (MOUSE_RADIUS - distance) / MOUSE_RADIUS;
          particle.vx += Math.cos(angle) * force * 1.5;
          particle.vy += Math.sin(angle) * force * 1.5;
          particle.opacity = Math.min(1, particle.opacity + 0.15);
        } else {
          particle.opacity = Math.max(0.5, particle.opacity - 0.01);
        }

        // Limit velocity
        const maxVelocity = 2;
        const velocity = Math.sqrt(
          particle.vx * particle.vx + particle.vy * particle.vy,
        );
        if (velocity > maxVelocity) {
          particle.vx = (particle.vx / velocity) * maxVelocity;
          particle.vy = (particle.vy / velocity) * maxVelocity;
        }

        // Draw particle with increased size
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.opacity;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius + 0.5, 0, Math.PI * 2);
        ctx.fill();

        // Add glow effect to particles
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 8;
        ctx.globalAlpha = particle.opacity * 0.5;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius + 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw connections
      ctx.strokeStyle = "#14b8a6";
      ctx.globalAlpha = 0.2;
      ctx.lineWidth = 1;

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < CONNECTION_DISTANCE) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{
        background: "transparent",
        zIndex: -9999,
        willChange: "transform",
        display: "block",
        width: "100%",
        height: "100%",
      }}
    />
  );
}
