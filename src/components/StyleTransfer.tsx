import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Download, Upload, Palette, Trash2, X, Image, ArrowLeft, Clock, Sparkles } from 'lucide-react';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ConfettiEffect } from '@/components/ui/ConfettiEffect';
import { ImageComparisonSlider } from '@/components/ui/ImageComparisonSlider';

interface StyledImage {
  url: string;
  originalUrl: string;
  style: string;
  timestamp: number;
}

const styleOptions = [
  { name: 'Pixel Art', value: 'pixel_art', description: 'Retro gaming aesthetic', emoji: '👾' },
  { name: 'Disney', value: 'disney', description: 'Classic 2D animation', emoji: '🏰' },
  { name: 'Ghibli', value: 'ghibli', description: 'Studio Ghibli style', emoji: '🌿' },
  { name: 'Simpsons', value: 'simpsons', description: 'Yellow cartoon style', emoji: '🍩' },
  { name: '3D Render', value: '3d_render', description: 'Hyper-realistic 3D', emoji: '🎮' },
  { name: 'Van Gogh', value: 'van_gogh', description: 'Starry Night style', emoji: '🌙' },
  { name: 'Picasso', value: 'picasso', description: 'Cubist geometric shapes', emoji: '🎨' },
  { name: 'Monet', value: 'monet', description: 'Impressionist soft light', emoji: '🌸' },
  { name: 'Anime', value: 'anime', description: 'Japanese animation', emoji: '✨' },
  { name: 'Oil Painting', value: 'oil_painting', description: 'Classic oil texture', emoji: '🖼️' },
  { name: 'Watercolor', value: 'watercolor', description: 'Soft bleeding effects', emoji: '💧' },
];

interface StyleTransferProps {
  onBack?: () => void;
}

const StyleTransfer: React.FC<StyleTransferProps> = ({ onBack }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [styledImages, setStyledImages] = useState<StyledImage[]>([]);
  const [previewImage, setPreviewImage] = useState<StyledImage | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const savedImages = localStorage.getItem('styled-images');
    if (savedImages) {
      try {
        setStyledImages(JSON.parse(savedImages));
      } catch (error) {
        console.error('Failed to load saved styled images:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Limit to 10 most recent images to prevent localStorage quota exceeded
    const imagesToSave = styledImages.slice(0, 10);
    try {
      localStorage.setItem('styled-images', JSON.stringify(imagesToSave));
    } catch (error) {
      console.error('Failed to save styled images to localStorage:', error);
      // If still failing, try with fewer images
      try {
        localStorage.setItem('styled-images', JSON.stringify(imagesToSave.slice(0, 3)));
      } catch {
        // Clear storage if we still can't save
        localStorage.removeItem('styled-images');
      }
    }
  }, [styledImages]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }

      if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
        toast({
          title: "Unsupported format",
          description: "Please upload a PNG or JPG image.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStyleTransfer = async () => {
    if (!selectedImage || !selectedStyle) {
      toast({
        title: "Missing requirements",
        description: "Please select both an image and a style.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('style-transfer', {
        body: {
          image: selectedImage,
          style: selectedStyle,
        },
      });

      if (error) {
        const message = (error as any)?.message || 'Style transfer failed.';
        throw new Error(message);
      }

      if (!data?.styledImage) {
        throw new Error('No image returned from server.');
      }

      const newStyledImage: StyledImage = {
        url: data.styledImage,
        originalUrl: selectedImage,
        style: selectedStyle,
        timestamp: Date.now(),
      };

      setStyledImages(prev => [newStyledImage, ...prev]);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 100);

      toast({
        title: "Style transfer complete!",
        description: "Your image has been transformed.",
      });

    } catch (err) {
      console.error('Style transfer error:', err);
      const msg = err instanceof Error ? err.message : 'Please try again.';
      toast({
        title: "Style transfer failed",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = (imageUrl: string, style: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `styled-image-${style}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteImage = (timestamp: number) => {
    setStyledImages(prev => prev.filter(img => img.timestamp !== timestamp));
    toast({ title: "Image deleted", description: "Removed from gallery." });
  };

  const clearAllImages = () => {
    setStyledImages([]);
    toast({ title: "Cleared", description: "All styled images removed." });
  };

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
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
      
      <div className="w-full max-w-7xl mx-auto p-6 space-y-8 relative z-10">
        {/* Header */}
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
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
              className="flex items-center justify-center space-x-2"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Palette className="w-8 h-8 text-primary" />
              </motion.div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gradient-magic">
                AI Style Transfer
              </h1>
            </motion.div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Transform your photos with the artistic styles of famous painters
            </p>
          </div>
        </motion.div>

        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-2 glass">
            <TabsTrigger value="create">Create Style Transfer</TabsTrigger>
            <TabsTrigger value="gallery">Gallery ({styledImages.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <motion.div 
              className="grid gap-6 lg:grid-cols-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {/* Upload and Style Selection */}
              <Card className="glass border-2">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Upload className="w-5 h-5" />
                    <span>Upload & Style</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Image Upload */}
                  <div className="space-y-3">
                    <Label>Upload Image</Label>
                    <motion.div 
                      className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-all"
                      onClick={() => fileInputRef.current?.click()}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {selectedImage ? (
                        <div className="space-y-3">
                          <motion.img
                            src={selectedImage}
                            alt="Selected"
                            className="max-w-full max-h-48 mx-auto rounded-lg object-contain"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          />
                          <p className="text-sm text-muted-foreground">Click to change</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <motion.div
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Image className="w-12 h-12 mx-auto text-muted-foreground" />
                          </motion.div>
                          <div>
                            <p className="text-lg font-medium">Click to upload</p>
                            <p className="text-sm text-muted-foreground">PNG, JPG up to 10MB</p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>

                  {/* Style Selection */}
                  <div className="space-y-3">
                    <Label>Choose Art Style</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {styleOptions.map((style) => (
                        <motion.div
                          key={style.value}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <Card
                            className={`cursor-pointer transition-all duration-200 ${
                              selectedStyle === style.value
                                ? 'ring-2 ring-primary bg-primary/10'
                                : 'hover:bg-accent/50'
                            }`}
                            onClick={() => setSelectedStyle(style.value)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xl">{style.emoji}</span>
                                <h3 className="font-semibold text-sm">{style.name}</h3>
                              </div>
                              <p className="text-xs text-muted-foreground">{style.description}</p>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                    <Button
                      onClick={handleStyleTransfer}
                      disabled={!selectedImage || !selectedStyle || isProcessing}
                      className="w-full h-12 bg-gradient-to-r from-magic-glow to-dream-pink hover:shadow-glow-lg transition-all ripple"
                      size="lg"
                    >
                      {isProcessing ? (
                        <div className="flex items-center gap-3">
                          <LoadingSpinner size="sm" />
                          <span>Applying Style...</span>
                        </div>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Apply Style
                        </>
                      )}
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>

              {/* Latest Result Preview */}
              <Card className="glass border-2">
                <CardHeader>
                  <CardTitle>Latest Result</CardTitle>
                </CardHeader>
                <CardContent>
                  {styledImages.length > 0 ? (
                    <motion.div 
                      className="space-y-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {/* Before/After Comparison */}
                      <ImageComparisonSlider
                        beforeImage={styledImages[0].originalUrl}
                        afterImage={styledImages[0].url}
                        beforeLabel="Original"
                        afterLabel={styleOptions.find(s => s.value === styledImages[0].style)?.name || 'Styled'}
                      />
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <Badge variant="secondary">
                          {styleOptions.find(s => s.value === styledImages[0].style)?.name}
                        </Badge>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(styledImages[0].timestamp)}
                        </span>
                      </div>
                      <Button
                        onClick={() => downloadImage(styledImages[0].url, styledImages[0].style)}
                        className="w-full"
                        variant="outline"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </motion.div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        <Palette className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      </motion.div>
                      <p>No styled images yet</p>
                      <p className="text-sm">Upload an image and choose a style</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="gallery" className="space-y-6">
            <AnimatePresence>
              {styledImages.length > 0 ? (
                <motion.div 
                  className="space-y-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="w-6 h-6 text-primary" />
                      <h2 className="text-2xl font-bold">Gallery</h2>
                      <Badge variant="secondary">{styledImages.length}</Badge>
                    </div>
                    <Button
                      variant="outline"
                      onClick={clearAllImages}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear All
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {styledImages.map((styledImage, index) => (
                      <motion.div
                        key={styledImage.timestamp}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="group overflow-hidden hover:shadow-elevated transition-all duration-300 border-2 hover:border-primary/20">
                          <CardContent className="p-0">
                            <div className="relative overflow-hidden">
                              <motion.img
                                src={styledImage.url}
                                alt={`Styled with ${styledImage.style}`}
                                className="w-full h-64 object-cover cursor-pointer"
                                onClick={() => setPreviewImage(styledImage)}
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.3 }}
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteImage(styledImage.timestamp);
                                  }}
                                  className="h-8 w-8 p-0"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="p-4 space-y-3">
                              <div className="flex items-center justify-between">
                                <Badge variant="secondary" className="text-xs">
                                  {styleOptions.find(s => s.value === styledImage.style)?.name}
                                </Badge>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatTimeAgo(styledImage.timestamp)}
                                </span>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => downloadImage(styledImage.url, styledImage.style)}
                                className="w-full"
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <Card className="border-dashed border-2 glass">
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <Image className="w-12 h-12 text-muted-foreground mb-4" />
                    </motion.div>
                    <h3 className="text-xl font-semibold mb-2">No styled images yet</h3>
                    <p className="text-muted-foreground max-w-md">
                      Upload an image and apply a style to see results here.
                    </p>
                  </CardContent>
                </Card>
              )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>

        {/* Preview Dialog */}
        <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
          <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden bg-black/95">
            {previewImage && (
              <div className="relative w-full h-full flex flex-col">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-4 right-4 z-50 h-10 w-10 p-0 bg-black/70 hover:bg-black/90 text-white rounded-full"
                  onClick={() => setPreviewImage(null)}
                >
                  <X className="h-5 w-5" />
                </Button>
                
                <div className="flex-1 flex items-center justify-center p-4">
                  <ImageComparisonSlider
                    beforeImage={previewImage.originalUrl}
                    afterImage={previewImage.url}
                    beforeLabel="Original"
                    afterLabel={styleOptions.find(s => s.value === previewImage.style)?.name || 'Styled'}
                    className="max-w-2xl"
                  />
                </div>
                
                <div className="bg-background/95 backdrop-blur-sm p-6 border-t">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="secondary">
                      {styleOptions.find(s => s.value === previewImage.style)?.name}
                    </Badge>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatTimeAgo(previewImage.timestamp)}
                    </span>
                  </div>
                  <Button
                    onClick={() => downloadImage(previewImage.url, previewImage.style)}
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Styled Image
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default StyleTransfer;
