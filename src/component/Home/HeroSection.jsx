import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown, Sparkles } from "lucide-react";

const HERO_IMG = "https://media.base44.com/images/public/6a3d3a422e67993e4dbef095/6f76412d4_generated_1c37794f.png";

export default function HeroSection() {
  const canvasRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let particles = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
      ctx.scale(2, 2);
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 2.5 + 1,
        color: ["#2563EB", "#D97706", "#7C3AED"][Math.floor(Math.random() * 3)],
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      const mx = mousePos.x * canvas.offsetWidth;
      const my = mousePos.y * canvas.offsetHeight;

      particles.forEach((p) => {
        const dx = mx - p.x;
        const dy = my - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
          p.vx += dx * 0.00008;
          p.vy += dy * 0.00008;
        }
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.995;
        p.vy *= 0.995;
        if (p.x < 0 || p.x > canvas.offsetWidth) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.offsetHeight) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + "60";
        ctx.fill();
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(37, 99, 235, ${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [mousePos]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  };

  return (
    <section
      className="relative min-h-[92vh] flex items-center overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold tracking-wider uppercase mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Interactive Physics Lab
            </div>

            <h1 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl text-slate-900 leading-tight mb-6">
              Work, Energy{" "}
              <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-amber-500 bg-clip-text text-transparent">
                & Power
              </span>
            </h1>

            <p className="text-slate-500 text-lg leading-relaxed max-w-lg mb-8">
              Stop reading about physics — start experiencing it. Explore three
              interactive experiments that bring the fundamental laws of mechanics
              to life through real-time simulations and calculations.
            </p>

            <a
              href="#experiments"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors text-sm"
            >
              Explore Experiments
              <ArrowDown className="w-4 h-4" />
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="rounded-2xl overflow-hidden shadow-2xl shadow-blue-900/10 border border-slate-200">
              <img
                src={HERO_IMG}
                alt="Polished steel sphere suspended by wire against blueprint grid"
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -left-4 glass-panel rounded-xl px-4 py-3 border border-blue-200">
              <p className="formula-mono text-sm text-blue-600 font-semibold">W = F × d</p>
              <p className="text-xs text-slate-400 mt-0.5">Work = Force × Distance</p>
            </div>
            <div className="absolute -top-4 -right-4 glass-panel rounded-xl px-4 py-3 border border-violet-200">
              <p className="formula-mono text-sm text-violet-600 font-semibold">P = W / t</p>
              <p className="text-xs text-slate-400 mt-0.5">Power = Work / Time</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}