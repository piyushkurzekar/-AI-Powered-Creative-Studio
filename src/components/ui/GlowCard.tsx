import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  onClick?: () => void;
}

export const GlowCard = ({ children, className, glowColor = 'primary', onClick }: GlowCardProps) => {
  return (
    <motion.div
      className={cn(
        'relative group cursor-pointer overflow-hidden rounded-2xl',
        className
      )}
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {/* Animated border gradient */}
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(90deg, hsl(var(--dream-purple)), hsl(var(--dream-pink)), hsl(var(--dream-blue)), hsl(var(--dream-purple)))`,
          backgroundSize: '300% 100%',
        }}
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />
      
      {/* Inner content container */}
      <div className="relative m-[2px] rounded-[14px] bg-card/95 backdrop-blur-sm h-[calc(100%-4px)]">
        {children}
      </div>
      
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 blur-xl bg-gradient-to-r from-dream-purple via-dream-pink to-dream-blue pointer-events-none" />
    </motion.div>
  );
};
