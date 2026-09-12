import { Product } from '../../src/types';
import { db } from '../db';

export interface VideoRenderSpec {
  id: string;
  productId: string;
  title: string;
  durationSeconds: number; // 15, 30, 45, 60
  aspectRatio: '9:16';
  width: number;
  height: number;
  template: 'modern_reels' | 'bold_tiktok' | 'clean_shorts';
  audioTrack: {
    id: string;
    title: string;
    artist: string;
    genre: string;
    url: string;
  };
  scenes: Array<{
    sceneIndex: number;
    durationSeconds: number;
    imageUrl: string;
    overlayText: string;
    overlaySubtext?: string;
    badgeText?: string;
    transition: 'fade' | 'slide_left' | 'zoom_in';
  }>;
  brandOverlay: {
    name: string;
    phone: string;
    price: string;
    cta: string;
  };
}

export const ROYALTY_FREE_AUDIO_TRACKS = [
  {
    id: 'track-energetic-beat',
    title: 'Upbeat Gadget Groove',
    artist: 'ShopBase Beats (Royalty Free)',
    genre: 'Lo-Fi Electronic',
    url: 'https://cdn.freesound.org/previews/565/565123_11861866-lq.mp3',
  },
  {
    id: 'track-viral-trap',
    title: 'TikTok Viral Pulse',
    artist: 'Audio Library License Free',
    genre: 'Trap Tech',
    url: 'https://cdn.freesound.org/previews/612/612081_11861866-lq.mp3',
  },
  {
    id: 'track-chill-ambient',
    title: 'Modern Product Showcase',
    artist: 'Commercial Safe Sounds',
    genre: 'Ambient Commercial',
    url: 'https://cdn.freesound.org/previews/518/518305_11861866-lq.mp3',
  }
];

export class VideoGeneratorService {
  /**
   * Builds a complete 9:16 video generation timeline and metadata specification
   */
  public static createVideoSpec(
    product: Product,
    scriptText?: string,
    durationSeconds: 15 | 30 | 45 | 60 = 15,
    template: 'modern_reels' | 'bold_tiktok' | 'clean_shorts' = 'modern_reels',
    audioTrackId = 'track-energetic-beat'
  ): VideoRenderSpec {
    const brand = db.getBrandSettings();
    const images = product.images.filter(img => img.isSelected !== false);
    const validImages = images.length > 0 ? images : product.images;

    const audio =
      ROYALTY_FREE_AUDIO_TRACKS.find(t => t.id === audioTrackId) || ROYALTY_FREE_AUDIO_TRACKS[0];

    // Build 4 scenes based on duration
    const sceneDuration = durationSeconds / 4;
    const img0 = validImages[0]?.highResolutionImageUrl || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=1920&auto=format&fit=crop';
    const img1 = validImages[1]?.highResolutionImageUrl || img0;
    const img2 = validImages[2]?.highResolutionImageUrl || img0;

    const scenes: VideoRenderSpec['scenes'] = [
      {
        sceneIndex: 1,
        durationSeconds: sceneDuration,
        imageUrl: img0,
        overlayText: product.aiAnalysis?.shortHook || `অসাধারণ অফারে ${product.title}!`,
        overlaySubtext: '১০০% অরিজিনাল কোয়ালিটি গ্যারান্টি',
        badgeText: 'HOT DEAL 🔥',
        transition: 'zoom_in',
      },
      {
        sceneIndex: 2,
        durationSeconds: sceneDuration,
        imageUrl: img1,
        overlayText: product.features[0] || 'প্রিমিয়াম বিল্ড ও দারুণ ফিনিশিং',
        overlaySubtext: product.features[1] || 'ব্যবহার করা অত্যন্ত সহজ',
        badgeText: 'FEATURE 1',
        transition: 'slide_left',
      },
      {
        sceneIndex: 3,
        durationSeconds: sceneDuration,
        imageUrl: img2,
        overlayText: product.features[2] || 'দীর্ঘস্থায়ী ব্যাটারি ও ফাস্ট কানেকশন',
        overlaySubtext: 'সারা বাংলাদেশে ক্যাশ অন ডেলিভারি',
        badgeText: 'FEATURE 2',
        transition: 'fade',
      },
      {
        sceneIndex: 4,
        durationSeconds: sceneDuration,
        imageUrl: img0,
        overlayText: `মাত্র ${product.sellingPrice} টাকা!`,
        overlaySubtext: brand.defaultCta,
        badgeText: 'LIMITED STOCK ⚡',
        transition: 'zoom_in',
      }
    ];

    const spec: VideoRenderSpec = {
      id: `vid-${product.id}-${Date.now()}`,
      productId: product.id,
      title: `${product.title} - 9:16 Creative Video`,
      durationSeconds,
      aspectRatio: '9:16',
      width: 1080,
      height: 1920,
      template,
      audioTrack: audio,
      scenes,
      brandOverlay: {
        name: brand.brandName,
        phone: brand.contactNumber,
        price: `${product.sellingPrice} BDT`,
        cta: brand.defaultCta,
      },
    };

    db.addLog('info', 'Video', `Generated 9:16 video spec for "${product.title}" (${durationSeconds}s, template: ${template})`);
    return spec;
  }
}
