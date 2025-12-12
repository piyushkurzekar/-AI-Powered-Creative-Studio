import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Download, Upload, Image, ArrowLeft, Maximize2, Sparkles, Zap, CheckCircle } from 'lucide-react';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ConfettiEffect } from '@/components/ui/ConfettiEffect';
import { ImageComparisonSlider } from '@/components/ui/ImageComparisonSlider';

interface ImageUpscalerProps {
  onBack?: () => void;
}

const scaleFactors = [
  { value: 2, label: '2x', description: 'Balanced', icon: '⚡' },
  { value: 4, label: '4x', description: 'High Detail', icon: '🔥' },
  { value: 8, label: '8x', description: 'Maximum', icon: '🚀' },
];

const ImageUpscaler: React.FC<ImageUpscalerProps> = ({ onBack }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [upscaledImage, setUpscaledImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scaleFactor, setScaleFactor] = useState<number>(2);
  const [showConfetti, setShowConfetti] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
        setUpscaledImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpscale = async () => {
    if (!selectedImage) {
      toast({
        title: "No image selected",
        description: "Please select an image to upscale.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('upscale-image', {
        body: {
          image: selectedImage,
          scale: scaleFactor,
        },
      });

      if (error) {
        const message = (error as any)?.message || 'Upscaling failed.';
        throw new Error(message);
      }

      if (!data?.upscaledImage) {
        throw new Error('No image returned from server.');
      }

      setUpscaledImage(data.upscaledImage);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 100);

      toast({
        title: "Upscaling complete!",
        description: `Your image has been upscaled ${scaleFactor}x.`,
      });

    } catch (err) {
      console.error('Upscaling error:', err);
      const msg = err instanceof Error ? err.message : 'Please try again.';
      toast({
        title: "Upscaling failed",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = (imageUrl: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `upscaled-image-${scaleFactor}x-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Maximize2 className="w-8 h-8 text-primary" />
              </motion.div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gradient-magic">
                AI Image Upscaler
              </h1>
            </motion.div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Enhance your images with AI-powered super-resolution technology
            </p>
          </div>
        </motion.div>

        <motion.div 
          className="grid gap-6 lg:grid-cols-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Upload and Controls */}
          <Card className="glass border-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="w-5 h-5" />
                <span>Upload & Configure</span>
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

              {/* Scale Factor Selection */}
              <div className="space-y-3">
                <Label>Upscale Factor</Label>
                <div className="grid grid-cols-3 gap-3">
                  {scaleFactors.map((factor) => (
                    <motion.div
                      key={factor.value}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Card
                        className={`cursor-pointer transition-all duration-200 ${
                          scaleFactor === factor.value
                            ? 'ring-2 ring-primary bg-primary/10'
                            : 'hover:bg-accent/50'
                        }`}
                        onClick={() => setScaleFactor(factor.value)}
                      >
                        <CardContent className="p-4 text-center">
                          <span className="text-2xl mb-1 block">{factor.icon}</span>
                          <h3 className="font-bold text-2xl mb-1">{factor.label}</h3>
                          <p className="text-xs text-muted-foreground">{factor.description}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Higher factors produce larger, more detailed images but take longer
                </p>
              </div>

              <Separator />

              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Button
                  onClick={handleUpscale}
                  disabled={!selectedImage || isProcessing}
                  className="w-full h-12 bg-gradient-to-r from-magic-glow to-dream-pink hover:shadow-glow-lg transition-all ripple"
                  size="lg"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-3">
                      <LoadingSpinner size="sm" />
                      <span>Enhancing...</span>
                    </div>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Upscale Image
                    </>
                  )}
                </Button>
              </motion.div>
            </CardContent>
          </Card>

          {/* Result Preview */}
          <Card className="glass border-2">
            <CardHeader>
              <CardTitle>Result</CardTitle>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {upscaledImage && selectedImage ? (
                  <motion.div 
                    className="space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {/* Before/After Comparison */}
                    <ImageComparisonSlider
                      beforeImage={selectedImage}
                      afterImage={upscaledImage}
                      beforeLabel="Original"
                      afterLabel={`${scaleFactor}x Enhanced`}
                    />
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        {scaleFactor}x Enhanced
                      </Badge>
                    </div>
                    <Button
                      onClick={() => downloadImage(upscaledImage)}
                      className="w-full"
                      variant="default"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Upscaled Image
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div 
                    className="text-center py-12 text-muted-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <Maximize2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    </motion.div>
                    <p>No upscaled image yet</p>
                    <p className="text-sm">Upload an image and click upscale</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass border-2">
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { icon: Maximize2, title: 'AI Enhancement', desc: 'Advanced AI algorithms enhance details' },
                  { icon: Image, title: 'Quality Preserved', desc: 'Maintains quality while increasing resolution' },
                  { icon: Zap, title: 'Fast Processing', desc: 'Get high-res images in seconds' },
                ].map((item, index) => (
                  <motion.div 
                    key={item.title}
                    className="text-center space-y-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <motion.div 
                      className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <item.icon className="w-6 h-6 text-primary" />
                    </motion.div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ImageUpscaler;
