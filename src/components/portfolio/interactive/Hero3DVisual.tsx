"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";

type Point3D = [number, number, number];

export function Hero3DVisual() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let isVisible = true;
    let isScrolling = false;
    let scrollTimeout: NodeJS.Timeout;

    // Responsive configuration based on viewport width
    const getIsMobile = () => (container.clientWidth || window.innerWidth) < 768;
    let isMobile = getIsMobile();

    // Golden ratio for icosahedron vertices
    const phi = (1 + Math.sqrt(5)) / 2;

    const getScale = () => (isMobile ? 46 : 72);

    const getBaseVertices = (): Point3D[] => {
      const s = getScale();
      return [
        [-1, phi, 0],
        [1, phi, 0],
        [-1, -phi, 0],
        [1, -phi, 0],
        [0, -1, phi],
        [0, 1, phi],
        [0, -1, -phi],
        [0, 1, -phi],
        [phi, 0, -1],
        [phi, 0, 1],
        [-phi, 0, -1],
        [-phi, 0, 1]
      ].map(([x, y, z]) => [x * s, y * s, z * s]);
    };

    let baseVertices = getBaseVertices();

    // 30 edges of the icosahedron
    const edges: [number, number][] = [
      [0, 11], [0, 5], [0, 1], [0, 7], [0, 10],
      [1, 5], [5, 11], [11, 10], [10, 7], [7, 1],
      [3, 9], [3, 4], [3, 2], [3, 6], [3, 8],
      [4, 9], [9, 8], [8, 6], [6, 2], [2, 4],
      [5, 9], [5, 4], [11, 4], [11, 2], [10, 2],
      [10, 6], [7, 6], [7, 8], [1, 8], [1, 9]
    ];

    // Fewer ambient particles on mobile for battery and GPU efficiency
    const particleCount = isMobile ? 14 : 26;
    const particles = Array.from({ length: particleCount }, () => ({
      x: (Math.random() - 0.5) * (isMobile ? 260 : 380),
      y: (Math.random() - 0.5) * (isMobile ? 260 : 380),
      z: (Math.random() - 0.5) * 180,
      size: Math.random() * (isMobile ? 1.5 : 2) + 1,
      speed: Math.random() * 0.005 + 0.002
    }));

    let rotX = 0.2;
    let rotY = 0.3;
    let targetRotX = 0.2;
    let targetRotY = 0.3;

    // Handle high DPI (capped at 1.5 on mobile to conserve GPU and battery)
    const resize = () => {
      isMobile = getIsMobile();
      baseVertices = getBaseVertices();
      const maxDpr = isMobile ? 1.5 : 2;
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      const width = container.clientWidth;
      const height = container.clientHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    // Track mouse (only on devices with pointer/hover support)
    const hasHover = window.matchMedia("(hover: hover)").matches;
    const handleMouseMove = (e: MouseEvent) => {
      if (!hasHover) return;
      const rect = container.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;

      targetRotY = nx * 1.4;
      targetRotX = -ny * 1.4;
    };

    if (hasHover) {
      window.addEventListener("mousemove", handleMouseMove);
    }

    // Scroll listener: pause animation during fast scrolling on mobile to keep 60fps
    const handleScroll = () => {
      isScrolling = true;
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
      }, 100);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Pause when scrolled out of view
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    observer.observe(container);

    const render = () => {
      if (!isVisible || isScrolling) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const width = container.clientWidth;
      const height = container.clientHeight;
      ctx.clearRect(0, 0, width, height);

      // Smooth rotation interpolation
      rotX += (targetRotX - rotX) * 0.05 + 0.003;
      rotY += (targetRotY - rotY) * 0.05 + 0.004;

      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);

      // On mobile, position in upper-center (behind avatar); on desktop, position on right
      const centerX = isMobile ? width * 0.5 : width * 0.78;
      const centerY = isMobile ? height * 0.22 : height * 0.5;
      const fov = isMobile ? 280 : 350;

      // Project 3D point to 2D screen
      const project = (p: Point3D): { x: number; y: number; z: number } => {
        const x1 = p[0] * cosY + p[2] * sinY;
        const y1 = p[1];
        const z1 = -p[0] * sinY + p[2] * cosY;

        const x2 = x1;
        const y2 = y1 * cosX - z1 * sinX;
        const z2 = y1 * sinX + z1 * cosX;

        const distance = fov + z2;
        const factor = distance > 0 ? fov / distance : 0;

        return {
          x: centerX + x2 * factor,
          y: centerY + y2 * factor,
          z: z2
        };
      };

      // Draw ambient particles
      particles.forEach((p) => {
        p.z += p.speed * 18;
        if (p.z > 90) p.z = -90;

        const proj = project([p.x, p.y, p.z]);
        const alpha = Math.max(0.08, Math.min(0.4, (p.z + 90) / 180));

        ctx.beginPath();
        ctx.arc(proj.x, proj.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(194, 101, 42, ${alpha * 0.35})`;
        ctx.fill();
      });

      // Project icosahedron vertices
      const projected = baseVertices.map(project);

      // Draw edges with depth-based gradient
      edges.forEach(([i, j]) => {
        const p1 = projected[i];
        const p2 = projected[j];

        const avgZ = (p1.z + p2.z) / 2;
        const alpha = Math.max(0.06, Math.min(isMobile ? 0.35 : 0.45, (avgZ + 100) / 200));

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = `rgba(194, 101, 42, ${alpha * 0.6})`;
        ctx.lineWidth = isMobile ? 1 : 1.2;
        ctx.stroke();
      });

      // Draw glowing vertices
      projected.forEach((p) => {
        const alpha = Math.max(0.12, Math.min(isMobile ? 0.55 : 0.7, (p.z + 100) / 200));

        ctx.beginPath();
        ctx.arc(p.x, p.y, isMobile ? 2 : 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(194, 101, 42, ${alpha})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, isMobile ? 4.5 : 6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232, 149, 92, ${alpha * 0.22})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      if (hasHover) {
        window.removeEventListener("mousemove", handleMouseMove);
      }
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, [reduceMotion]);

  if (reduceMotion) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
      ref={containerRef}
    >
      <canvas
        className="h-full w-full opacity-50 sm:opacity-60 transition-opacity duration-700"
        ref={canvasRef}
      />
    </div>
  );
}
