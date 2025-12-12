import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  size: number;
  rotation: number;
}

interface ConfettiEffectProps {
  trigger: boolean;
  duration?: number;
}

const colors = [
  'hsl(var(--dream-purple))',
  'hsl(var(--dream-pink))',
  'hsl(var(--dream-blue))',
  'hsl(var(--dream-mint))',
  'hsl(var(--magic-glow))',
  '#FFD700',
  '#FF6B6B',
];

export const ConfettiEffect = ({ trigger, duration = 3000 }: ConfettiEffectProps) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (trigger && !isActive) {
      setIsActive(true);
      const newPieces: ConfettiPiece[] = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 10 + 5,
        rotation: Math.random() * 360,
      }));
      setPieces(newPieces);

      setTimeout(() => {
        setIsActive(false);
        setPieces([]);
      }, duration);
    }
  }, [trigger, duration, isActive]);

  return (
    <AnimatePresence>
      {isActive && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {pieces.map((piece) => (
            <motion.div
              key={piece.id}
              className="absolute"
              style={{
                left: `${piece.x}%`,
                top: -20,
                width: piece.size,
                height: piece.size * 0.6,
                backgroundColor: piece.color,
                borderRadius: 2,
              }}
              initial={{ y: -20, rotate: 0, opacity: 1 }}
              animate={{
                y: window.innerHeight + 50,
                rotate: piece.rotation + 720,
                opacity: [1, 1, 0],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 2 + Math.random() * 2,
                ease: [0.25, 0.46, 0.45, 0.94],
                delay: Math.random() * 0.5,
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
};
