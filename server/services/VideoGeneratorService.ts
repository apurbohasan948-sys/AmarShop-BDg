import { db } from '../db.js';

export interface VideoGenerateRequest {
  productTitle: string;
  productPrice?: number;
  productImage: string;
  platform: 'reels' | 'tiktok' | 'youtube' | 'facebook';
  durationSeconds?: number;
}

export interface VideoStoryboardScene {
  timestamp: string;
  visualDescription: string;
  voiceoverScript: string;
  onScreenText: string;
  cameraMovement: string;
}

export interface VideoProject {
  id: string;
  title: string;
  platform: string;
  aspectRatio: string;
  estimatedDuration: number;
  hookAudioText: string;
  scenes: VideoStoryboardScene[];
  audioTrack: string;
  ctaText: string;
  renderedPreviewUrl?: string;
  createdAt: string;
}

export class VideoGeneratorService {
  public static async generateStoryboard(req: VideoGenerateRequest): Promise<VideoProject> {
    const id = `vid-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const title = req.productTitle;
    const price = req.productPrice ? `$${req.productPrice.toFixed(2)}` : 'On Sale';

    db.addLog('info', 'ai', `Synthesizing video storyboard for [${title}] target [${req.platform}].`);

    const scenes: VideoStoryboardScene[] = [
      {
        timestamp: '0:00 - 0:03',
        visualDescription: 'Fast zoom-in on frustrating everyday situation (tired worker / clutter / discomfort).',
        voiceoverScript: `Stop scrolling if you are tired of dealing with this every single day!`,
        onScreenText: '🛑 STOP SCROLLING 🛑',
        cameraMovement: 'Dynamic snap zoom with high energy sound effect'
      },
      {
        timestamp: '0:03 - 0:08',
        visualDescription: `Hero reveal of ${title} in sleek studio lighting with smooth unboxing motion.`,
        voiceoverScript: `Check out the ${title}. It completely changed my routine!`,
        onScreenText: `✨ Meet the ${title.slice(0, 24)}...`,
        cameraMovement: 'Smooth cinematic orbital pan'
      },
      {
        timestamp: '0:08 - 0:13',
        visualDescription: 'Close-up on key feature in active use, showing instant satisfaction and durability.',
        voiceoverScript: `Engineered with premium materials so you get unmatched comfort and convenience instantly.`,
        onScreenText: '⚡ Instant Results & Premium Build',
        cameraMovement: 'Macro tilt tracking the ergonomic movement'
      },
      {
        timestamp: '0:13 - 0:18',
        visualDescription: 'Split screen comparing bad old way vs effortless new way with ShopBase product.',
        voiceoverScript: `Why pay hundreds for big brand markups when you can get top tier quality for only ${price}?`,
        onScreenText: `💰 Only ${price} Today (50% Off)`,
        cameraMovement: 'Side-by-side swipe transition'
      },
      {
        timestamp: '0:18 - 0:22',
        visualDescription: 'Call-to-action screen with pulsing "Shop Now" badge and official guarantee logo.',
        voiceoverScript: `Tap the link in bio right now to grab yours before the flash sale ends!`,
        onScreenText: '👉 TAP LINK IN BIO - FREE SHIPPING 👈',
        cameraMovement: 'Subtle push forward into link badge'
      }
    ];

    return {
      id,
      title: `Viral Showcase - ${title}`,
      platform: req.platform,
      aspectRatio: req.platform === 'youtube' ? '16:9' : '9:16',
      estimatedDuration: 22,
      hookAudioText: `Stop scrolling if you are tired of this!`,
      scenes,
      audioTrack: 'Upbeat Tech Trend Synth (Royalty Free)',
      ctaText: `Shop now for ${price} - Limited Stock`,
      renderedPreviewUrl: req.productImage,
      createdAt: new Date().toISOString()
    };
  }
}
