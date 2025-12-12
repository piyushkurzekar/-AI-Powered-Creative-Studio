import React from 'react';
import { motion } from 'framer-motion';
import { Share2, Twitter, Facebook, Link2, Download, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface SocialShareProps {
  imageUrl: string;
  prompt: string;
  onDownload?: () => void;
}

export const SocialShare: React.FC<SocialShareProps> = ({ imageUrl, prompt, onDownload }) => {
  const { toast } = useToast();
  const [copied, setCopied] = React.useState(false);

  const shareText = `✨ Created with Artify AI!\n\nPrompt: "${prompt.slice(0, 100)}${prompt.length > 100 ? '...' : ''}"\n\n#AIArt #Artify #GenerativeAI`;
  
  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  };

  const shareToFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(shareText)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast({ title: 'Copied!', description: 'Share text copied to clipboard' });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to copy to clipboard', variant: 'destructive' });
    }
  };

  const copyImageLink = async () => {
    try {
      await navigator.clipboard.writeText(imageUrl);
      toast({ title: 'Copied!', description: 'Image link copied to clipboard' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to copy link', variant: 'destructive' });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        </motion.div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={shareToTwitter} className="gap-2 cursor-pointer">
          <Twitter className="w-4 h-4" />
          Share on X/Twitter
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToFacebook} className="gap-2 cursor-pointer">
          <Facebook className="w-4 h-4" />
          Share on Facebook
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={copyToClipboard} className="gap-2 cursor-pointer">
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Link2 className="w-4 h-4" />}
          Copy Share Text
        </DropdownMenuItem>
        <DropdownMenuItem onClick={copyImageLink} className="gap-2 cursor-pointer">
          <Link2 className="w-4 h-4" />
          Copy Image Link
        </DropdownMenuItem>
        {onDownload && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDownload} className="gap-2 cursor-pointer">
              <Download className="w-4 h-4" />
              Download Image
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
