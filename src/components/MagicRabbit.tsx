
import React from 'react';

const MagicRabbit = () => {
  return (
    <div className="relative rabbit-hop">
      {/* Rabbit SVG */}
      <svg
        width="120"
        height="140"
        viewBox="0 0 120 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        {/* Ears */}
        <ellipse cx="35" cy="25" rx="8" ry="20" fill="white" stroke="#E2E8F0" strokeWidth="2"/>
        <ellipse cx="85" cy="25" rx="8" ry="20" fill="white" stroke="#E2E8F0" strokeWidth="2"/>
        <ellipse cx="35" cy="25" rx="4" ry="12" fill="#FFB6C1"/>
        <ellipse cx="85" cy="25" rx="4" ry="12" fill="#FFB6C1"/>
        
        {/* Head */}
        <circle cx="60" cy="55" r="25" fill="white" stroke="#E2E8F0" strokeWidth="2"/>
        
        {/* Eyes */}
        <circle cx="50" cy="50" r="6" fill="#1F2937"/>
        <circle cx="70" cy="50" r="6" fill="#1F2937"/>
        <circle cx="52" cy="48" r="2" fill="white"/>
        <circle cx="72" cy="48" r="2" fill="white"/>
        
        {/* Nose */}
        <ellipse cx="60" cy="60" rx="2" ry="1.5" fill="#FFB6C1"/>
        
        {/* Body */}
        <ellipse cx="60" cy="95" rx="20" ry="25" fill="white" stroke="#E2E8F0" strokeWidth="2"/>
        
        {/* Arms */}
        <ellipse cx="40" cy="85" rx="6" ry="12" fill="white" stroke="#E2E8F0" strokeWidth="1"/>
        <ellipse cx="80" cy="85" rx="6" ry="12" fill="white" stroke="#E2E8F0" strokeWidth="1"/>
        
        {/* Legs */}
        <ellipse cx="50" cy="125" rx="8" ry="10" fill="white" stroke="#E2E8F0" strokeWidth="2"/>
        <ellipse cx="70" cy="125" rx="8" ry="10" fill="white" stroke="#E2E8F0" strokeWidth="2"/>
        
        {/* Tail */}
        <circle cx="35" cy="105" r="8" fill="white" stroke="#E2E8F0" strokeWidth="2"/>
      </svg>
      
      {/* Magic sparkles around rabbit */}
      <div className="absolute -top-2 -left-2 w-3 h-3 bg-magic-glow rounded-full sparkle-animation" style={{animationDelay: '0s'}}></div>
      <div className="absolute top-5 right-0 w-2 h-2 bg-dream-pink rounded-full sparkle-animation" style={{animationDelay: '0.5s'}}></div>
      <div className="absolute bottom-10 -right-3 w-4 h-4 bg-dream-blue rounded-full sparkle-animation" style={{animationDelay: '1s'}}></div>
      <div className="absolute bottom-0 left-5 w-2 h-2 bg-dream-mint rounded-full sparkle-animation" style={{animationDelay: '1.5s'}}></div>
    </div>
  );
};

export default MagicRabbit;
