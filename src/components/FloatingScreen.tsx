
import React from 'react';
import { Play, Video, Sparkles } from 'lucide-react';

const FloatingScreen = () => {
  return (
    <div className="relative float-animation">
      {/* Main screen */}
      <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-3xl p-6 w-80 h-48 magic-glow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-magic-glow" />
            <span className="text-sm font-medium text-foreground/80">AI Video Studio</span>
          </div>
          <Sparkles className="w-5 h-5 text-dream-pink" />
        </div>
        
        {/* Mock video preview */}
        <div className="bg-gradient-to-br from-dream-blue to-dream-purple rounded-2xl h-24 flex items-center justify-center mb-4">
          <Play className="w-8 h-8 text-white" />
        </div>
        
        {/* Progress indicator */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-foreground/60">
            <span>Generating...</span>
            <span>78%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div className="bg-gradient-to-r from-magic-glow to-dream-pink h-2 rounded-full" style={{width: '78%'}}></div>
          </div>
        </div>
      </div>
      
      {/* Floating elements around screen */}
      <div className="absolute -top-4 -right-4 w-8 h-8 bg-dream-purple/30 rounded-full sparkle-animation" style={{animationDelay: '0.3s'}}></div>
      <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-dream-mint/40 rounded-full sparkle-animation" style={{animationDelay: '0.8s'}}></div>
      <div className="absolute top-1/2 -right-6 w-4 h-4 bg-dream-pink/50 rounded-full sparkle-animation" style={{animationDelay: '1.2s'}}></div>
    </div>
  );
};

export default FloatingScreen;
