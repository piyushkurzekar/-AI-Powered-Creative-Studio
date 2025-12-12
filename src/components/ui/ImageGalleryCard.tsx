import React from 'react';
import { motion } from 'framer-motion';
import { Download, Trash2, Clock, Sparkles, Maximize2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { SocialShare } from '@/components/ui/SocialShare';
import { useToast } from '@/hooks/use-toast';

interface GeneratedImage {
  url: string;
  prompt: string;
  model: string;
  timestamp: number;
}

interface ImageGalleryCardProps {
  image: GeneratedImage;
  index: number;
  onPreview: () => void;
  onDownload: () => void;
  onDelete: () => void;
  onUsePrompt?: (prompt: string) => void;
  formatTimeAgo: (timestamp: number) => string;
}

export const ImageGalleryCard: React.FC<ImageGalleryCardProps> = ({
  image,
  index,
  onPreview,
  onDownload,
  onDelete,
  onUsePrompt,
  formatTimeAgo,
}) => {
  const { toast } = useToast();

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(image.prompt);
      toast({ title: 'Copied!', description: 'Prompt copied to clipboard' });
    } catch {
      toast({ title: 'Error', description: 'Failed to copy prompt', variant: 'destructive' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="group overflow-hidden hover:shadow-glow transition-all duration-300 border-2 hover:border-primary/30">
        <div 
          className="aspect-square relative cursor-pointer overflow-hidden"
          onClick={onPreview}
        >
          <img
            src={image.url}
            alt={image.prompt}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
              <Badge 
                variant="secondary" 
                className="bg-white/20 text-white backdrop-blur-sm border-none"
              >
                {image.model === 'gemini' ? 'Gemini' : 'FLUX'}
              </Badge>
              <Button 
                size="icon" 
                variant="secondary" 
                className="w-8 h-8 bg-white/20 backdrop-blur-sm border-none hover:bg-white/40"
              >
                <Maximize2 className="w-4 h-4 text-white" />
              </Button>
            </div>
          </div>
        </div>
        <CardContent className="p-4 space-y-3">
          <p className="text-sm line-clamp-2 text-muted-foreground group-hover:text-foreground transition-colors">
            {image.prompt}
          </p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTimeAgo(image.timestamp)}
            </div>
            <div className="flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              AI Generated
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <SocialShare 
              imageUrl={image.url} 
              prompt={image.prompt} 
              onDownload={onDownload}
            />
            
            {onUsePrompt && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1.5"
                  onClick={() => onUsePrompt(image.prompt)}
                >
                  <Copy className="w-3.5 h-3.5" />
                  Remix
                </Button>
              </motion.div>
            )}
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="ml-auto">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onDownload}
                className="text-muted-foreground hover:text-foreground"
              >
                <Download className="w-4 h-4" />
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onDelete}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
