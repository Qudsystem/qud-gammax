import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkle } from '@phosphor-icons/react';

const messages = [
  "Generating outline...",
  "Designing slides...",
  "Generating images...",
  "Crafting logical flow...",
  "Researching content...",
  "Designing layouts for a world-class deck."
];

export function GeneratingState() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen bg-[#020617] flex flex-col items-center justify-center p-12 text-center relative overflow-hidden">
      {/* Magic Starfield/Particle Background */}
      <div className="absolute inset-0 z-0">
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              opacity: Math.random() * 0.5 + 0.2,
              scale: Math.random() * 0.5 + 0.5,
              x: Math.random() * 2000 - 1000,
              y: Math.random() * 1000 + 1000
            }}
            animate={{
              y: -1200,
              x: (Math.random() - 0.5) * 200,
              opacity: [0, 0.8, 0]
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 10
            }}
            className="absolute w-1 h-1 bg-blue-400 rounded-full blur-[1px]"
            style={{
              left: `${Math.random() * 100}%`,
              bottom: "-20px"
            }}
          />
        ))}
        {/* Glow effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] mix-blend-screen animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="relative w-20 h-20 mb-12"
        >
          <div className="absolute inset-0 bg-blue-500/20 rounded-3xl blur-2xl animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkle className="w-16 h-16 text-indigo-400" weight="fill" />
          </div>
          {/* Orbits */}
          <div className="absolute inset-[-10px] border border-blue-500/10 rounded-full animate-spin-slow" />
          <div className="absolute inset-[-20px] border border-purple-500/5 rounded-full animate-spin-reverse-slow" />
        </motion.div>

        <h2 className="text-2xl font-black text-white mb-4 tracking-tight drop-shadow-lg">
          {messages[messageIndex]}
        </h2>

        <div className="flex gap-2 mb-8">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
              className="w-1.5 h-1.5 rounded-full bg-blue-400"
            />
          ))}
        </div>

        <div className="max-w-md w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "85%" }}
            transition={{ duration: 15, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 shadow-[0_0_20px_rgba(37,99,235,0.4)]"
          />
        </div>
        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">AI Presentation Architect at work</p>
      </div>
    </div>
  );
}