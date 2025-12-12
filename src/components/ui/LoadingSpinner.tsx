import { motion } from 'framer-motion';
import { Sparkles, Wand2, Stars } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

const loadingMessages = [
  'Mixing colors...',
  'Adding magic...',
  'Sprinkling stardust...',
  'Painting dreams...',
  'Creating wonder...',
  'Almost there...',
];

export const LoadingSpinner = ({ size = 'md', text, className }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  const iconSizes = {
    sm: 16,
    md: 24,
    lg: 32,
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-4', className)}>
      <div className={cn('relative', sizeClasses[size])}>
        {/* Outer ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-primary/30"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
        
        {/* Inner ring */}
        <motion.div
          className="absolute inset-2 rounded-full border-2 border-dream-pink/50"
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
        
        {/* Center icon */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Sparkles className="text-primary" size={iconSizes[size]} />
        </motion.div>
        
        {/* Orbiting particles */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-dream-purple"
            style={{ left: '50%', top: '50%' }}
            animate={{
              x: [0, 30, 0, -30, 0],
              y: [-30, 0, 30, 0, -30],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
              delay: i * 0.4,
            }}
          />
        ))}
      </div>
      
      {text && (
        <motion.p
          className="text-muted-foreground text-sm font-medium"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

export const LoadingMessages = () => {
  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {loadingMessages.map((message, index) => (
        <motion.p
          key={message}
          className="text-muted-foreground text-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: [0, 1, 0], y: 0 }}
          transition={{
            duration: 2,
            delay: index * 2,
            repeat: Infinity,
            repeatDelay: loadingMessages.length * 2 - 2,
          }}
          style={{ position: index === 0 ? 'relative' : 'absolute' }}
        >
          {message}
        </motion.p>
      ))}
    </motion.div>
  );
};
