import { motion } from 'framer-motion';
import { Play, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  onStartCreating: () => void;
}

const HeroSection = ({ onStartCreating }: HeroSectionProps) => {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden rounded-3xl mb-8">
      {/* Video/Image Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-violet/20 via-background to-neon-cyan/10" />
        
        {/* Animated gradient orbs */}
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-neon-violet/20 blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-neon-cyan/15 blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(270 100% 65% / 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(270 100% 65% / 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Eyebrow */}
          <motion.div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
            <span className="text-sm font-medium text-muted-foreground">AI-Powered Creative Studio</span>
          </motion.div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6">
            <span className="text-foreground">CREATE CINEMATIC</span>
            <br />
            <span className="text-gradient-neon">VISUALS.</span>
            <span className="text-foreground"> INSTANTLY.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Transform your ideas into stunning AI-generated images, videos, and visual effects. 
            No experience required — just pure imagination.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                size="lg"
                className="btn-gradient text-white px-8 py-6 text-lg font-semibold rounded-full border-0"
                onClick={onStartCreating}
              >
                <Play className="w-5 h-5 mr-2 fill-current" />
                START CREATING
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                variant="outline"
                size="lg"
                className="glass-card hover:bg-white/5 px-8 py-6 text-lg font-semibold rounded-full border-neon-violet/30 text-foreground"
              >
                Watch Demo
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div 
            className="flex items-center justify-center gap-8 mt-12 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center gap-2">
              <span className="font-mono text-neon-cyan font-semibold">50K+</span>
              <span className="text-muted-foreground">Creators</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-2">
              <span className="font-mono text-neon-cyan font-semibold">1M+</span>
              <span className="text-muted-foreground">Images Generated</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-2">
              <span className="font-mono text-neon-cyan font-semibold">4.9</span>
              <span className="text-muted-foreground">Rating</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
