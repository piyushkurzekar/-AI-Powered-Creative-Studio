import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Video, Download, Trash2, Sparkles, Film, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ProgressSteps } from "@/components/ui/ProgressSteps";
import { ConfettiEffect } from "@/components/ui/ConfettiEffect";

interface GeneratedVideo {
  url: string;
  prompt: string;
  timestamp: number;
}

interface VideoGeneratorProps {
  onBack?: () => void;
}

const videoPresets = [
  { label: 'Cinematic', icon: '🎬', prompt: 'cinematic, film grain, dramatic lighting' },
  { label: 'Animation', icon: '✨', prompt: 'animated, cartoon style, vibrant colors' },
  { label: 'Nature', icon: '🌿', prompt: 'nature documentary, peaceful, serene' },
  { label: 'Sci-Fi', icon: '🚀', prompt: 'futuristic, sci-fi, neon lights' },
];

const generationSteps = [
  { label: 'Analyzing' },
  { label: 'Generating' },
  { label: 'Rendering' },
];

const VideoGenerator = ({ onBack }: VideoGeneratorProps) => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a prompt",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setCurrentStep(0);
    
    // Simulate progress steps
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => Math.min(prev + 1, 2));
    }, 15000);

    try {
      const { data, error } = await supabase.functions.invoke("generate-video", {
        body: { prompt },
      });

      clearInterval(stepInterval);

      if (error) throw error;

      const newVideo: GeneratedVideo = {
        url: data.video,
        prompt,
        timestamp: Date.now(),
      };

      setGeneratedVideos((prev) => [newVideo, ...prev]);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 100);
      
      toast({
        title: "Success!",
        description: "Video generated successfully",
      });
    } catch (error: any) {
      clearInterval(stepInterval);
      console.error("Error generating video:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate video",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setCurrentStep(0);
    }
  };

  const downloadVideo = (videoUrl: string, index: number) => {
    const link = document.createElement("a");
    link.href = videoUrl;
    link.download = `generated-video-${index + 1}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deleteVideo = (index: number) => {
    setGeneratedVideos((prev) => prev.filter((_, i) => i !== index));
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const applyPreset = (presetPrompt: string) => {
    setPrompt(prev => prev ? `${prev}, ${presetPrompt}` : presetPrompt);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />
      <ConfettiEffect trigger={showConfetti} />
      
      {/* Header */}
      <motion.div 
        className="border-b border-border/50 glass sticky top-0 z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            {onBack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="hover:bg-secondary"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <div className="flex items-center gap-3">
              <motion.div 
                className="p-2 bg-gradient-to-br from-dream-purple to-dream-pink rounded-lg shadow-glow"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Video className="h-6 w-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold text-gradient-magic">AI Video Generator</h1>
                <p className="text-sm text-muted-foreground">
                  Create videos from text prompts (Free Tier)
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Generation Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-2 border-border/50 shadow-elevated glass">
              <CardContent className="p-6 space-y-6">
                {/* Style Presets */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Style Presets</label>
                  <div className="flex flex-wrap gap-2">
                    {videoPresets.map((preset) => (
                      <motion.button
                        key={preset.label}
                        className="px-4 py-2 rounded-full glass border border-border/50 text-sm font-medium hover:border-primary/50 transition-all flex items-center gap-2"
                        onClick={() => applyPreset(preset.prompt)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span>{preset.icon}</span>
                        <span>{preset.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Video Prompt</label>
                  <Textarea
                    placeholder="Describe the video you want to generate... (e.g., 'A sunset over ocean waves', 'A cat playing with yarn')"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[120px] resize-none focus:ring-2 focus:ring-primary/50"
                    disabled={isGenerating}
                  />
                </div>

                <motion.div 
                  className="bg-muted/50 p-4 rounded-lg space-y-2 border border-border/50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Film className="w-4 h-4" />
                    Free Tier Limitations:
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Videos are 2-4 seconds long</li>
                    <li>Lower resolution (256x256 or 512x512)</li>
                    <li>Generation may take 30-60 seconds</li>
                    <li>Rate limits apply on free tier</li>
                  </ul>
                </motion.div>

                {/* Progress Steps during generation */}
                <AnimatePresence>
                  {isGenerating && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="py-4"
                    >
                      <ProgressSteps steps={generationSteps} currentStep={currentStep} />
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim()}
                    className="w-full h-14 bg-gradient-to-r from-dream-purple to-dream-pink hover:shadow-glow-lg transition-all duration-300 ripple"
                    size="lg"
                  >
                    {isGenerating ? (
                      <div className="flex items-center gap-3">
                        <LoadingSpinner size="sm" />
                        <span>Creating your video...</span>
                      </div>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        Generate Video
                      </>
                    )}
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Generated Videos */}
          <AnimatePresence>
            {generatedVideos.length > 0 && (
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold">Generated Videos</h2>
                  <Badge variant="secondary">{generatedVideos.length}</Badge>
                </div>
                <div className="grid gap-4">
                  {generatedVideos.map((video, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="overflow-hidden glass border-2 hover:border-primary/20 transition-all">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <p className="text-sm font-medium mb-1">
                                  {video.prompt}
                                </p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatTimeAgo(video.timestamp)}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => downloadVideo(video.url, index)}
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => deleteVideo(index)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </motion.div>
                              </div>
                            </div>
                            <motion.video
                              src={video.url}
                              controls
                              className="w-full rounded-lg bg-black shadow-lg"
                              style={{ maxHeight: "400px" }}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.2 }}
                            >
                              Your browser does not support video playback.
                            </motion.video>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {generatedVideos.length === 0 && !isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-dashed border-2 glass">
                <CardContent className="p-12 text-center">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  </motion.div>
                  <p className="text-muted-foreground">
                    No videos generated yet. Enter a prompt above to get started!
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoGenerator;
