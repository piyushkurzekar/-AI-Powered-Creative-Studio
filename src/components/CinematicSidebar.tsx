import { motion } from 'framer-motion';
import { 
  Home, Video, Image, Wand2, Maximize2, Users, Zap, Settings, Sparkles
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface CinematicSidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
}

const navItems = [
  { id: 'home', icon: Home, label: 'Home', active: true },
  { id: 'imageGen', icon: Image, label: 'AI Image Gen', active: true },
  { id: 'videoGen', icon: Video, label: 'AI Video Gen', active: true },
  { id: 'styleTransfer', icon: Wand2, label: 'Style Transfer', active: true },
  { id: 'imageUpscaler', icon: Maximize2, label: 'Ultra Upscaler', active: true },
  { id: 'faceSwap', icon: Users, label: 'Face Swap Pro', active: false },
  { id: 'effects', icon: Zap, label: 'Visual Effects', active: false },
];

const CinematicSidebar = ({ activeView, onNavigate }: CinematicSidebarProps) => {
  return (
    <motion.aside 
      className="fixed left-0 top-0 h-screen w-16 glass-sidebar z-50 flex flex-col items-center py-6"
      initial={{ x: -64 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Logo */}
      <motion.div 
        className="mb-8"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-neon flex items-center justify-center shadow-neon cursor-pointer"
             onClick={() => onNavigate('home')}>
          <Sparkles className="w-5 h-5 text-white" />
        </div>
      </motion.div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-2">
        {navItems.map((item, index) => (
          <Tooltip key={item.id} delayDuration={0}>
            <TooltipTrigger asChild>
              <motion.button
                className={`sidebar-icon ${activeView === item.id ? 'active' : ''} ${!item.active ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                onClick={() => item.active && onNavigate(item.id)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                whileHover={item.active ? { scale: 1.05 } : {}}
                whileTap={item.active ? { scale: 0.95 } : {}}
              >
                <item.icon className={`w-5 h-5 ${activeView === item.id ? 'text-neon-violet icon-glow' : 'text-muted-foreground'}`} />
              </motion.button>
            </TooltipTrigger>
            <TooltipContent side="right" className="glass-card border-neon-violet/20">
              <p className="text-sm">{item.label}</p>
              {!item.active && <span className="text-xs text-muted-foreground">Coming Soon</span>}
            </TooltipContent>
          </Tooltip>
        ))}
      </nav>

      {/* Settings */}
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <motion.button
            className="sidebar-icon mt-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Settings className="w-5 h-5 text-muted-foreground" />
          </motion.button>
        </TooltipTrigger>
        <TooltipContent side="right" className="glass-card border-neon-violet/20">
          <p className="text-sm">Settings</p>
        </TooltipContent>
      </Tooltip>
    </motion.aside>
  );
};

export default CinematicSidebar;
