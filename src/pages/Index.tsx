import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Video, Image, Palette, Maximize2, Users, Repeat, UserCircle, 
  Zap, Wand2, Film, Box, ImagePlay, Move3d, Clapperboard,
  Shirt, ShoppingBag, Eraser, Globe, TrendingUp, Camera
} from 'lucide-react';
import CinematicSidebar from '@/components/CinematicSidebar';
import HeroSection from '@/components/HeroSection';
import BentoFeatureCard from '@/components/BentoFeatureCard';
import ImageGenerator from '@/components/ImageGenerator';
import StyleTransfer from '@/components/StyleTransfer';
import ImageUpscaler from '@/components/ImageUpscaler';
import VideoGenerator from '@/components/VideoGenerator';
import UserProfile from '@/components/UserProfile';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const Index = () => {
  const [currentView, setCurrentView] = useState<string>('home');
  
  // Handle feature views
  if (currentView === 'imageGen') {
    return <ImageGenerator onBack={() => setCurrentView('home')} />;
  }
  if (currentView === 'styleTransfer') {
    return <StyleTransfer onBack={() => setCurrentView('home')} />;
  }
  if (currentView === 'imageUpscaler') {
    return <ImageUpscaler onBack={() => setCurrentView('home')} />;
  }
  if (currentView === 'videoGen') {
    return <VideoGenerator onBack={() => setCurrentView('home')} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Light leak effects */}
      <div className="light-leaks" />
      
      {/* Sidebar */}
      <CinematicSidebar activeView={currentView} onNavigate={setCurrentView} />

      {/* Main Content */}
      <main className="pl-16 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Header with User Profile */}
          <motion.header 
            className="flex items-center justify-end mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <UserProfile />
          </motion.header>

          {/* Hero Section */}
          <HeroSection onStartCreating={() => setCurrentView('imageGen')} />

          {/* Features Bento Grid */}
          <section className="mb-16">
            <motion.div 
              className="flex items-center justify-between mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">AI Tools</h2>
                <p className="text-muted-foreground">Powerful features at your fingertips</p>
              </div>
            </motion.div>

            {/* Active Features - Primary Grid */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <BentoFeatureCard
                icon={Image}
                title="AI Image Gen"
                description="Create stunning images from text prompts using state-of-the-art AI models"
                badge="new"
                onClick={() => setCurrentView('imageGen')}
              />
              <BentoFeatureCard
                icon={Video}
                title="AI Video Gen"
                description="Transform text into cinematic video clips with AI"
                badge="free"
                onClick={() => setCurrentView('videoGen')}
              />
              <BentoFeatureCard
                icon={Palette}
                title="Style Transfer"
                description="Apply artistic styles to transform your images"
                badge="new"
                onClick={() => setCurrentView('styleTransfer')}
              />
              <BentoFeatureCard
                icon={Maximize2}
                title="Ultra Upscaler"
                description="Enhance resolution with AI super-resolution technology"
                badge="beta"
                onClick={() => setCurrentView('imageUpscaler')}
              />
            </motion.div>

            {/* Coming Soon Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-6"
            >
              <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-neon-cyan" />
                Face & Character
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <BentoFeatureCard
                  icon={Repeat}
                  title="Face Swap Pro"
                  description="Swap faces between photos or with AI characters seamlessly"
                  badge="soon"
                  disabled
                />
                <BentoFeatureCard
                  icon={UserCircle}
                  title="Character Consistency"
                  description="Keep the same face across multiple AI generations"
                  badge="soon"
                  disabled
                />
                <BentoFeatureCard
                  icon={Camera}
                  title="AI Avatar Creator"
                  description="Create personalized AI avatars from your selfies"
                  badge="soon"
                  disabled
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-6"
            >
              <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-neon-violet" />
                Visual Effects
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <BentoFeatureCard
                  icon={Wand2}
                  title="Viral Effects"
                  description="One-click effects: Earth Zoom, Metal Transform, Disintegration"
                  badge="soon"
                  disabled
                />
                <BentoFeatureCard
                  icon={Film}
                  title="Magic Transitions"
                  description="Cinematic transitions and morph effects for videos"
                  badge="soon"
                  disabled
                />
                <BentoFeatureCard
                  icon={Box}
                  title="3D Transform"
                  description="Turn 2D images into stunning 3D rotating views"
                  badge="soon"
                  disabled
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-6"
            >
              <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Clapperboard className="w-5 h-5 text-neon-cyan" />
                Animation & Video
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <BentoFeatureCard
                  icon={ImagePlay}
                  title="Image-to-Video"
                  description="Animate still images with subtle motion like breathing"
                  badge="soon"
                  disabled
                />
                <BentoFeatureCard
                  icon={Move3d}
                  title="Ken Burns Effect"
                  description="Automated cinematic pan/zoom animations on images"
                  badge="soon"
                  disabled
                />
                <BentoFeatureCard
                  icon={Video}
                  title="Video Face Swap"
                  description="Swap faces in videos with seamless AI technology"
                  badge="soon"
                  disabled
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-6"
            >
              <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-neon-violet" />
                Fashion & Product
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <BentoFeatureCard
                  icon={Shirt}
                  title="Virtual Try-On"
                  description="Try clothes on your photos virtually with AI"
                  badge="soon"
                  disabled
                />
                <BentoFeatureCard
                  icon={ShoppingBag}
                  title="Product Studio"
                  description="Place products in professional advertising scenes"
                  badge="soon"
                  disabled
                />
                <BentoFeatureCard
                  icon={Eraser}
                  title="Background Remover"
                  description="Remove or replace backgrounds instantly with AI"
                  badge="soon"
                  disabled
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-neon-cyan" />
                Community
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <BentoFeatureCard
                  icon={Globe}
                  title="Public Gallery"
                  description="Browse and discover amazing creations from the community"
                  badge="soon"
                  disabled
                />
                <BentoFeatureCard
                  icon={TrendingUp}
                  title="Trending Effects"
                  description="See what's popular and remix others' work"
                  badge="soon"
                  disabled
                />
              </div>
            </motion.div>
          </section>

          {/* Footer */}
          <footer className="text-center py-8 border-t border-border/50">
            <p className="text-sm text-muted-foreground">
              © 2024 Artify. Powered by AI. Built for creators.
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default Index;
