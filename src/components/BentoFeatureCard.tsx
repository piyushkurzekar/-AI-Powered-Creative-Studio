import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface BentoFeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: 'new' | 'beta' | 'soon' | 'free';
  size?: 'default' | 'large';
  onClick?: () => void;
  disabled?: boolean;
}

const BentoFeatureCard = ({ 
  icon: Icon, 
  title, 
  description, 
  badge,
  size = 'default',
  onClick,
  disabled = false
}: BentoFeatureCardProps) => {
  const badgeStyles = {
    new: 'badge-new',
    beta: 'badge-beta',
    soon: 'badge-soon',
    free: 'badge-beta',
  };

  const badgeLabels = {
    new: 'NEW',
    beta: 'BETA',
    soon: 'SOON',
    free: 'FREE',
  };

  return (
    <motion.div
      className={`
        glass-card-hover rounded-2xl p-6 relative overflow-hidden
        ${size === 'large' ? 'md:col-span-2 md:row-span-2' : ''}
        ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
      `}
      onClick={disabled ? undefined : onClick}
      whileHover={disabled ? {} : { scale: 1.02, y: -4 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      {/* Badge */}
      {badge && (
        <span className={`absolute top-4 right-4 ${badgeStyles[badge]}`}>
          {badgeLabels[badge]}
        </span>
      )}

      {/* Icon Container */}
      <div className="mb-4">
        <div className={`
          w-12 h-12 rounded-xl flex items-center justify-center
          bg-gradient-to-br from-neon-violet/20 to-neon-cyan/10
          border border-neon-violet/20
          ${!disabled && 'group-hover:shadow-neon'}
        `}>
          <Icon className={`w-6 h-6 ${disabled ? 'text-muted-foreground' : 'text-neon-violet icon-glow'}`} />
        </div>
      </div>

      {/* Content */}
      <h3 className={`text-lg font-semibold mb-2 ${disabled ? 'text-muted-foreground' : 'text-foreground'}`}>
        {title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>

      {/* Decorative gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-violet/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
};

export default BentoFeatureCard;
