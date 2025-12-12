import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, description }) => {
  return (
    <div className="glass-card-hover rounded-2xl p-6 h-full flex flex-col">
      <div className="w-12 h-12 bg-gradient-to-br from-neon-violet/20 to-neon-cyan/10 border border-neon-violet/20 rounded-xl flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-neon-violet icon-glow" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed flex-1">{description}</p>
    </div>
  );
};

export default FeatureCard;
