import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Download, Wand2, Clock, Sparkles, Image, Trash2, X, ArrowLeft, Lightbulb, Grid3X3, BookOpen, Share2 } from 'lucide-react';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ConfettiEffect } from '@/components/ui/ConfettiEffect';
import { PromptTemplates } from '@/components/ui/PromptTemplates';
import { ImageGalleryCard } from '@/components/ui/ImageGalleryCard';
import { SocialShare } from '@/components/ui/SocialShare';

interface GeneratedImage {
  url: string;
  prompt: string;
  model: string;
  timestamp: number;
}

interface ImageGeneratorProps {
  onBack?: () => void;
}

const promptSuggestions = [
  'A magical forest with glowing mushrooms and fireflies at twilight',
  'Cyberpunk city street with neon signs and rain reflections',
  'Majestic dragon soaring through clouds at sunset',
  'Cozy coffee shop interior with warm lighting and plants',
  'Astronaut floating in space with Earth in background',
  'Enchanted garden with crystal flowers and butterflies',
];

type PromptInputMode = 'write' | 'templates';

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ onBack }) => {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [model, setModel] = useState('flux');
  const [size, setSize] = useState('1024x1024');
  const [quality, setQuality] = useState('hd');
  const [style, setStyle] = useState('vivid');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [previewImage, setPreviewImage] = useState<GeneratedImage | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
  const [promptInputMode, setPromptInputMode] = useState<PromptInputMode>('write');
  const [variationCount, setVariationCount] = useState(1);
  const [generatingCount, setGeneratingCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const savedImages = localStorage.getItem('generated-images');
      if (savedImages) {
        const parsed = JSON.parse(savedImages);
        // Only keep the 10 most recent images to prevent quota issues
        setGeneratedImages(parsed.slice(0, 10));
      }
    } catch (error) {
      console.error('Failed to load saved images, clearing storage:', error);
      localStorage.removeItem('generated-images');
    }
  }, []);

  useEffect(() => {
    // Skip saving on initial mount if images are empty
    if (generatedImages.length === 0) return;
    
    // Limit to 10 most recent images
    const imagesToStore = generatedImages.slice(0, 10);
    try {
      localStorage.setItem('generated-images', JSON.stringify(imagesToStore));
    } catch (error) {
      console.warn('Storage quota exceeded, clearing old data');
      localStorage.removeItem('generated-images');
      // Try saving just the newest 3 images
      try {
        localStorage.setItem('generated-images', JSON.stringify(imagesToStore.slice(0, 3)));
      } catch {
        // Give up on storage
      }
    }
  }, [generatedImages]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSuggestionIndex((prev) => (prev + 1) % promptSuggestions.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const generateSingleImage = async (promptText: string): Promise<GeneratedImage | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: {
          prompt: promptText.trim(),
          model,
          size,
          quality,
          style,
          negative_prompt: negativePrompt.trim() || undefined
        }
      });
      if (error) throw error;
      return {
        url: data.image_url,
        prompt: data.prompt,
        model: data.model,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Generation error:', error);
      return null;
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    setGeneratingCount(variationCount);
    
    const newImages: GeneratedImage[] = [];
    let successCount = 0;
    
    // Generate images sequentially (to avoid overwhelming the API)
    for (let i = 0; i < variationCount; i++) {
      // Add slight variation to prompt for multiple generations
      const variedPrompt = variationCount > 1 
        ? `${prompt.trim()}, variation ${i + 1}, unique interpretation`
        : prompt.trim();
      
      const result = await generateSingleImage(variedPrompt);
      if (result) {
        newImages.push({ ...result, prompt: prompt.trim() }); // Store original prompt
        successCount++;
      }
      setGeneratingCount(variationCount - i - 1);
    }
    
    if (newImages.length > 0) {
      setGeneratedImages(prev => [...newImages.reverse(), ...prev]);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 100);
      toast({
        title: "Success!",
        description: successCount === variationCount 
          ? `${successCount} image${successCount > 1 ? 's' : ''} generated!`
          : `${successCount}/${variationCount} images generated`
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to generate images",
        variant: "destructive"
      });
    }
    
    setIsGenerating(false);
    setGeneratingCount(0);
  };

  const downloadImage = async (url: string, prompt: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `artify-${prompt.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      toast({ title: "Downloaded", description: "Image saved to your device" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to download image", variant: "destructive" });
    }
  };

  const deleteImage = (index: number) => {
    setGeneratedImages(prev => prev.filter((_, i) => i !== index));
    toast({ title: "Deleted", description: "Image removed from gallery" });
  };

  const clearAllImages = () => {
    setGeneratedImages([]);
    toast({ title: "Cleared", description: "All images removed from gallery" });
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />
      <ConfettiEffect trigger={showConfetti} />
      
      <div className="max-w-7xl mx-auto p-6 space-y-8 relative z-10">
        {/* Header with Back Button */}
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {onBack && (
            <Button 
              variant="ghost" 
              onClick={onBack} 
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground glass"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          )}
          <div className="text-center space-y-4">
            <motion.div 
              className="flex items-center justify-center gap-3"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <motion.div 
                className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 shadow-glow"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Sparkles className="w-8 h-8 text-primary" />
              </motion.div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gradient-magic">
                AI Image Generator
              </h1>
            </motion.div>
            <p className="text-lg max-w-2xl mx-auto text-muted-foreground">
              Create stunning images with the power of AI using completely free service. No API costs!
            </p>
          </div>
        </motion.div>

        {/* Generation Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="shadow-elevated border-2 glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="w-5 h-5" />
                Create New Image
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {/* Prompt Input with Tabs */}
                  <Tabs value={promptInputMode} onValueChange={(v) => setPromptInputMode(v as PromptInputMode)} className="w-full">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-base font-medium">Prompt</Label>
                      <TabsList className="h-8">
                        <TabsTrigger value="write" className="text-xs px-3 gap-1.5">
                          <Wand2 className="w-3.5 h-3.5" />
                          Write
                        </TabsTrigger>
                        <TabsTrigger value="templates" className="text-xs px-3 gap-1.5">
                          <BookOpen className="w-3.5 h-3.5" />
                          Templates
                        </TabsTrigger>
                      </TabsList>
                    </div>
                    
                    <TabsContent value="write" className="mt-0 space-y-3">
                      <Textarea 
                        id="prompt" 
                        placeholder="Describe the image you want to generate..." 
                        value={prompt} 
                        onChange={e => setPrompt(e.target.value)} 
                        rows={4} 
                        className="resize-none focus:ring-2 focus:ring-primary/50 transition-all"
                      />
                      
                      {/* Prompt Suggestions */}
                      <motion.div 
                        className="p-3 rounded-lg bg-muted/50 border border-border/50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Lightbulb className="w-4 h-4" />
                          <span>Try this prompt:</span>
                        </div>
                        <AnimatePresence mode="wait">
                          <motion.button
                            key={currentSuggestionIndex}
                            className="text-sm text-primary hover:underline cursor-pointer text-left"
                            onClick={() => setPrompt(promptSuggestions[currentSuggestionIndex])}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                          >
                            "{promptSuggestions[currentSuggestionIndex]}"
                          </motion.button>
                        </AnimatePresence>
                      </motion.div>
                    </TabsContent>
                    
                    <TabsContent value="templates" className="mt-0">
                      <PromptTemplates onSelectPrompt={(p) => {
                        setPrompt(p);
                        setPromptInputMode('write');
                      }} />
                    </TabsContent>
                  </Tabs>

                  <div>
                    <Label htmlFor="negative-prompt" className="text-base font-medium">Negative Prompt (Optional)</Label>
                    <Input 
                      id="negative-prompt" 
                      placeholder="What to avoid in the image..." 
                      value={negativePrompt} 
                      onChange={e => setNegativePrompt(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">AI Model</Label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <motion.button
                        type="button"
                        onClick={() => setModel('flux')}
                        className={`p-3 border rounded-lg text-left transition-all ${
                          model === 'flux' 
                            ? 'bg-green-50 dark:bg-green-950/20 border-green-500 ring-2 ring-green-500/30' 
                            : 'bg-muted/30 border-border hover:border-green-300'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-2">
                          <motion.span 
                            className={`w-2 h-2 rounded-full ${model === 'flux' ? 'bg-green-500' : 'bg-muted-foreground'}`}
                            animate={model === 'flux' ? { scale: [1, 1.2, 1] } : {}}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                          <span className="font-medium text-sm">FLUX</span>
                          <Badge variant="secondary" className="ml-auto text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            Free
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Fast & high-quality</p>
                      </motion.button>
                      
                      <motion.button
                        type="button"
                        onClick={() => setModel('gemini')}
                        className={`p-3 border rounded-lg text-left transition-all ${
                          model === 'gemini' 
                            ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-500 ring-2 ring-blue-500/30' 
                            : 'bg-muted/30 border-border hover:border-blue-300'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-2">
                          <motion.span 
                            className={`w-2 h-2 rounded-full ${model === 'gemini' ? 'bg-blue-500' : 'bg-muted-foreground'}`}
                            animate={model === 'gemini' ? { scale: [1, 1.2, 1] } : {}}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                          <span className="font-medium text-sm">Gemini Flash</span>
                          <Badge variant="secondary" className="ml-auto text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                            Google
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Creative & versatile</p>
                      </motion.button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="size" className="text-base font-medium">Size</Label>
                    <Select value={size} onValueChange={setSize}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1024x1024">Square (1024×1024)</SelectItem>
                        <SelectItem value="1792x1024">Landscape (1792×1024)</SelectItem>
                        <SelectItem value="1024x1792">Portrait (1024×1792)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Variations Selector */}
                  <div>
                    <Label className="text-base font-medium flex items-center gap-2">
                      <Grid3X3 className="w-4 h-4" />
                      Generate Variations
                    </Label>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {[1, 2, 3, 4].map((count) => (
                        <motion.button
                          key={count}
                          type="button"
                          onClick={() => setVariationCount(count)}
                          className={`p-2 border rounded-lg text-center transition-all ${
                            variationCount === count
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-muted/30 border-border hover:border-primary/50'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <span className="font-medium">{count}</span>
                          <span className="text-xs block opacity-70">{count === 1 ? 'image' : 'images'}</span>
                        </motion.button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Generate multiple variations at once for more options
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Button 
                  onClick={handleGenerate} 
                  disabled={isGenerating || !prompt.trim()} 
                  className="w-full h-14 text-lg font-medium bg-gradient-to-r from-magic-glow to-dream-pink hover:shadow-glow-lg transition-all duration-300 ripple" 
                  size="lg"
                >
                  {isGenerating ? (
                    <div className="flex items-center gap-3">
                      <LoadingSpinner size="sm" />
                      <span>
                        {generatingCount > 0 
                          ? `Creating ${generatingCount} more...` 
                          : 'Creating your masterpiece...'}
                      </span>
                    </div>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate {variationCount > 1 ? `${variationCount} Images` : 'Image'}
                    </>
                  )}
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recently Generated Section */}
        <AnimatePresence>
          {generatedImages.length > 0 && (
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-bold">Recently Generated</h2>
                  <Badge variant="secondary" className="ml-2">
                    {generatedImages.length} image{generatedImages.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                <Button variant="outline" onClick={clearAllImages} className="text-destructive hover:text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {generatedImages.map((image, index) => (
                  <ImageGalleryCard
                    key={`${image.timestamp}-${index}`}
                    image={image}
                    index={index}
                    onPreview={() => setPreviewImage(image)}
                    onDownload={() => downloadImage(image.url, image.prompt)}
                    onDelete={() => deleteImage(index)}
                    onUsePrompt={(p) => {
                      setPrompt(p);
                      setPromptInputMode('write');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    formatTimeAgo={formatTimeAgo}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {generatedImages.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-dashed border-2 border-muted-foreground/25 glass">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <motion.div 
                  className="p-4 rounded-full bg-muted/50 mb-4"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Image className="w-12 h-12 text-muted-foreground" />
                </motion.div>
                <h3 className="text-xl font-semibold mb-2">No images generated yet</h3>
                <p className="text-muted-foreground mb-4 max-w-md">
                  Start by entering a creative prompt above and generating your first AI image.
                </p>
                <Badge variant="outline" className="text-xs">
                  Your generated images will appear here
                </Badge>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Image Preview Dialog */}
        <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
          <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden bg-black/95">
            {previewImage && (
              <div className="relative w-full h-full flex flex-col">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute top-4 right-4 z-50 h-10 w-10 p-0 bg-black/70 hover:bg-black/90 text-white rounded-full border border-white/20" 
                  onClick={() => setPreviewImage(null)}
                >
                  <X className="h-5 w-5" />
                </Button>
                
                <div className="flex-1 flex items-center justify-center p-4">
                  <motion.img 
                    src={previewImage.url} 
                    alt={previewImage.prompt} 
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                
                <div className="bg-background/95 backdrop-blur-sm p-6 space-y-4 border-t">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Prompt</h3>
                    <p className="text-muted-foreground">{previewImage.prompt}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className={`${
                      previewImage.model === 'gemini' || previewImage.model?.includes('Gemini')
                        ? 'bg-blue-500/20 text-blue-700 dark:text-blue-300'
                        : 'bg-green-500/20 text-green-700 dark:text-green-300'
                    }`}>
                      {previewImage.model || 'FLUX'}
                    </Badge>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatTimeAgo(previewImage.timestamp)}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={() => downloadImage(previewImage.url, previewImage.prompt)} className="flex-1">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <SocialShare 
                      imageUrl={previewImage.url} 
                      prompt={previewImage.prompt}
                      onDownload={() => downloadImage(previewImage.url, previewImage.prompt)}
                    />
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ImageGenerator;
