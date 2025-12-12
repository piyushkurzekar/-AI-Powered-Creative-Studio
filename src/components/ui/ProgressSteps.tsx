import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  label: string;
  icon?: React.ReactNode;
}

interface ProgressStepsProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export const ProgressSteps = ({ steps, currentStep, className }: ProgressStepsProps) => {
  return (
    <div className={cn('flex items-center justify-between w-full', className)}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        
        return (
          <div key={index} className="flex items-center flex-1 last:flex-none">
            {/* Step circle */}
            <motion.div
              className={cn(
                'relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors',
                isCompleted && 'bg-primary border-primary',
                isCurrent && 'border-primary bg-primary/10',
                !isCompleted && !isCurrent && 'border-muted-foreground/30 bg-muted/50'
              )}
              initial={false}
              animate={{
                scale: isCurrent ? [1, 1.1, 1] : 1,
              }}
              transition={{
                duration: 1.5,
                repeat: isCurrent ? Infinity : 0,
                ease: 'easeInOut',
              }}
            >
              {isCompleted ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                  <Check className="w-5 h-5 text-primary-foreground" />
                </motion.div>
              ) : (
                <span className={cn(
                  'text-sm font-semibold',
                  isCurrent ? 'text-primary' : 'text-muted-foreground'
                )}>
                  {step.icon || index + 1}
                </span>
              )}
              
              {/* Pulse effect for current step */}
              {isCurrent && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-primary"
                  animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </motion.div>
            
            {/* Step label */}
            <span className={cn(
              'ml-3 text-sm font-medium hidden sm:block',
              isCompleted && 'text-primary',
              isCurrent && 'text-foreground',
              !isCompleted && !isCurrent && 'text-muted-foreground'
            )}>
              {step.label}
            </span>
            
            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className="flex-1 mx-4 h-[2px] bg-muted-foreground/20 relative overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-primary"
                  initial={{ width: '0%' }}
                  animate={{ width: isCompleted ? '100%' : '0%' }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
