import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, Mountain, User, Building, Palette, Rocket, Heart, Gamepad2, ChefHat } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PromptTemplate {
  id: string;
  title: string;
  prompt: string;
  category: string;
  icon: string;
}

const promptTemplates: PromptTemplate[] = [
  // Fantasy
  { id: '1', title: 'Enchanted Forest', prompt: 'A mystical enchanted forest with glowing mushrooms, fireflies, ancient twisted trees covered in luminescent moss, ethereal mist, magical atmosphere, fantasy art style, 8k', category: 'Fantasy', icon: 'sparkles' },
  { id: '2', title: 'Dragon\'s Lair', prompt: 'A majestic dragon sleeping on a pile of gold in a vast underground cavern, gemstones embedded in walls, dramatic lighting, epic fantasy, highly detailed', category: 'Fantasy', icon: 'sparkles' },
  { id: '3', title: 'Wizard\'s Tower', prompt: 'A tall wizard tower on a cliff overlooking stormy seas, lightning in background, magical glowing windows, floating books and potions, mystical atmosphere', category: 'Fantasy', icon: 'sparkles' },
  
  // Landscapes
  { id: '4', title: 'Mountain Sunrise', prompt: 'Breathtaking mountain landscape at golden hour sunrise, snow-capped peaks reflecting orange and pink light, mirror-like lake in foreground, professional photography, 8k ultra HD', category: 'Landscapes', icon: 'mountain' },
  { id: '5', title: 'Tropical Paradise', prompt: 'Pristine tropical beach with crystal clear turquoise water, white sand, palm trees swaying, sunset colors, paradise island vibes, travel photography', category: 'Landscapes', icon: 'mountain' },
  { id: '6', title: 'Northern Lights', prompt: 'Aurora borealis dancing over a frozen Icelandic landscape, stars visible, snow-covered mountains, reflection in ice, long exposure photography style', category: 'Landscapes', icon: 'mountain' },
  
  // Portraits
  { id: '7', title: 'Cyberpunk Portrait', prompt: 'Cyberpunk portrait of a person with neon face paint, holographic implants, rain-slicked streets reflection in eyes, dramatic lighting, blade runner style', category: 'Portraits', icon: 'user' },
  { id: '8', title: 'Renaissance Noble', prompt: 'Renaissance-style oil painting portrait, noble attire with velvet and gold embroidery, dramatic Rembrandt lighting, classical art style, museum quality', category: 'Portraits', icon: 'user' },
  { id: '9', title: 'Ethereal Beauty', prompt: 'Ethereal portrait surrounded by floating flowers and soft particles, dreamy soft lighting, pastel colors, fashion photography, magical atmosphere', category: 'Portraits', icon: 'user' },
  
  // Sci-Fi
  { id: '10', title: 'Space Station', prompt: 'Massive space station orbiting a ringed planet, Earth-like moon visible, stars and nebula background, hard sci-fi style, cinematic lighting, concept art', category: 'Sci-Fi', icon: 'rocket' },
  { id: '11', title: 'Alien City', prompt: 'Futuristic alien city with organic architecture, bioluminescent structures, multiple moons in the sky, exotic vegetation, otherworldly atmosphere', category: 'Sci-Fi', icon: 'rocket' },
  { id: '12', title: 'Mech Warrior', prompt: 'Giant combat mech standing in a destroyed cityscape, battle damage, smoke and fire, dramatic sunset backlighting, anime mecha style, detailed mechanical design', category: 'Sci-Fi', icon: 'rocket' },
  
  // Architecture
  { id: '13', title: 'Minimalist Home', prompt: 'Modern minimalist interior design, floor-to-ceiling windows, natural light, neutral colors with wood accents, indoor plants, architectural digest quality', category: 'Architecture', icon: 'building' },
  { id: '14', title: 'Ancient Temple', prompt: 'Ancient temple ruins overgrown with jungle vegetation, shafts of light through canopy, moss-covered stones, mysterious atmosphere, Indiana Jones style', category: 'Architecture', icon: 'building' },
  { id: '15', title: 'Floating City', prompt: 'Steampunk floating city with airships, brass and copper structures, clouds below, Victorian era meets future technology, detailed concept art', category: 'Architecture', icon: 'building' },
  
  // Art Styles
  { id: '16', title: 'Van Gogh Style', prompt: 'Starry night over a coastal village, swirling sky with vibrant blues and yellows, thick impasto brushstrokes, Van Gogh impressionist style, oil painting', category: 'Art Styles', icon: 'palette' },
  { id: '17', title: 'Anime Scene', prompt: 'Beautiful anime landscape, cherry blossoms falling, traditional Japanese architecture, soft pastel colors, Studio Ghibli aesthetic, peaceful atmosphere', category: 'Art Styles', icon: 'palette' },
  { id: '18', title: 'Pop Art Portrait', prompt: 'Bold pop art style portrait, bright primary colors, halftone dots, comic book aesthetic, Andy Warhol inspired, high contrast', category: 'Art Styles', icon: 'palette' },
  
  // Food
  { id: '19', title: 'Gourmet Dish', prompt: 'Michelin star gourmet dish, artistic plating, colorful ingredients, professional food photography, shallow depth of field, restaurant quality', category: 'Food', icon: 'chef' },
  { id: '20', title: 'Cozy Bakery', prompt: 'Warm cozy bakery interior, fresh bread and pastries on display, morning sunlight through windows, rustic wooden shelves, inviting atmosphere', category: 'Food', icon: 'chef' },
  
  // Gaming
  { id: '21', title: 'RPG Character', prompt: 'Fantasy RPG character design, detailed armor with intricate engravings, magical weapon glowing, heroic pose, game concept art, AAA quality', category: 'Gaming', icon: 'gamepad' },
  { id: '22', title: 'Battle Scene', prompt: 'Epic battle scene with warriors and magic, spell effects lighting up the battlefield, dramatic action poses, fantasy game art style', category: 'Gaming', icon: 'gamepad' },
  
  // Romantic
  { id: '23', title: 'Sunset Silhouette', prompt: 'Romantic couple silhouette against a vivid orange and pink sunset, beach setting, waves gently lapping, love story atmosphere, cinematic', category: 'Romantic', icon: 'heart' },
  { id: '24', title: 'Fairy Tale', prompt: 'Fairy tale castle in the clouds, rainbow bridge, magical creatures, whimsical and romantic atmosphere, children book illustration style', category: 'Romantic', icon: 'heart' },
];

const categories = ['All', 'Fantasy', 'Landscapes', 'Portraits', 'Sci-Fi', 'Architecture', 'Art Styles', 'Food', 'Gaming', 'Romantic'];

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'Fantasy': Sparkles,
  'Landscapes': Mountain,
  'Portraits': User,
  'Sci-Fi': Rocket,
  'Architecture': Building,
  'Art Styles': Palette,
  'Food': ChefHat,
  'Gaming': Gamepad2,
  'Romantic': Heart,
};

interface PromptTemplatesProps {
  onSelectPrompt: (prompt: string) => void;
}

export const PromptTemplates: React.FC<PromptTemplatesProps> = ({ onSelectPrompt }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredTemplates = promptTemplates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(search.toLowerCase()) ||
                          template.prompt.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search templates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Category Pills */}
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2 pb-2">
          {categories.map((category) => {
            const Icon = categoryIcons[category];
            return (
              <motion.button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {category}
              </motion.button>
            );
          })}
        </div>
      </ScrollArea>

      {/* Templates Grid */}
      <ScrollArea className="h-[300px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-4">
          <AnimatePresence mode="popLayout">
            {filteredTemplates.map((template) => {
              const Icon = categoryIcons[template.category] || Sparkles;
              return (
                <motion.button
                  key={template.id}
                  onClick={() => onSelectPrompt(template.prompt)}
                  className="p-3 rounded-lg border border-border bg-card hover:bg-accent/50 text-left transition-all group"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  layout
                >
                  <div className="flex items-start gap-2">
                    <div className="p-1.5 rounded-md bg-primary/10 text-primary shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-sm group-hover:text-primary transition-colors truncate">
                        {template.title}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {template.prompt.slice(0, 80)}...
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="mt-2 text-xs">
                    {template.category}
                  </Badge>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>No templates found</p>
        </div>
      )}
    </div>
  );
};
