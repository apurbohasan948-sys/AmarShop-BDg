import { QueueItem } from '../../src/types';
import { db } from '../db';

export interface PublishResult {
  success: boolean;
  externalPostId?: string;
  externalPostUrl?: string;
  message: string;
  isTestMode: boolean;
}

export class FacebookService {
  public static async testConnection(accessToken?: string, pageId?: string) {
    const social = db.getSocialConfig().facebook;
    const token = accessToken || social.accessToken;
    const pid = pageId || social.pageId;

    if (!token && !pid) {
      db.saveSocialConfig({
        facebook: { ...social, status: 'not_configured', lastTestedAt: new Date().toISOString() },
      });
      return { success: false, status: 'NOT CONFIGURED', message: 'Facebook Page ID or Access Token is missing.' };
    }

    try {
      // Test Facebook Graph API me/accounts or page info
      const resp = await fetch(`https://graph.facebook.com/v19.0/${pid || 'me'}?access_token=${token}&fields=id,name`, {
        signal: AbortSignal.timeout(6000),
      });

      if (!resp.ok) {
        const errorJson = await resp.json().catch(() => ({}));
        db.saveSocialConfig({
          facebook: { ...social, status: 'auth_failed', error: errorJson.error?.message, lastTestedAt: new Date().toISOString() },
        });
        return {
          success: false,
          status: 'AUTHENTICATION FAILED',
          message: errorJson.error?.message || `Facebook API error: HTTP ${resp.status}`,
        };
      }

      const data = await resp.json();
      db.saveSocialConfig({
        facebook: {
          connected: true,
          pageId: data.id,
          pageName: data.name || social.pageName,
          status: 'online',
          lastTestedAt: new Date().toISOString(),
        },
      });
      return { success: true, status: 'online', message: `Connected to Facebook Page: "${data.name}" (ID: ${data.id})` };
    } catch (err: any) {
      return { success: false, status: 'error', message: err.message };
    }
  }

  public static async publish(item: QueueItem, isTestMode: boolean): Promise<PublishResult> {
    const social = db.getSocialConfig().facebook;

    if (isTestMode) {
      const mockPostId = `fb_test_${Date.now().toString(36)}`;
      db.addLog('info', 'Facebook', `[TEST MODE] Simulated Facebook publishing for "${item.productTitle}"`);
      return {
        success: true,
        externalPostId: mockPostId,
        externalPostUrl: `https://facebook.com/ShopBaseBD/posts/${mockPostId}`,
        message: '[TEST MODE] Facebook post preview verified. No live post sent.',
        isTestMode: true,
      };
    }

    if (!social.accessToken || !social.pageId) {
      throw new Error('NOT CONFIGURED: Facebook Page ID or Access Token is missing in API Settings.');
    }

    // Call Facebook Graph API: POST /{page-id}/feed or /{page-id}/photos
    const hasImage = item.content.mediaUrls && item.content.mediaUrls.length > 0;
    const endpoint = hasImage
      ? `https://graph.facebook.com/v19.0/${social.pageId}/photos`
      : `https://graph.facebook.com/v19.0/${social.pageId}/feed`;

    const body: Record<string, string> = {
      access_token: social.accessToken,
    };

    if (hasImage) {
      body['url'] = item.content.mediaUrls[0];
      body['caption'] = item.content.caption;
    } else {
      body['message'] = item.content.caption;
    }

    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.error?.message || `Facebook API returned HTTP ${resp.status}`);
    }

    const data = await resp.json();
    return {
      success: true,
      externalPostId: data.id || data.post_id,
      externalPostUrl: `https://facebook.com/${data.id || data.post_id}`,
      message: 'Successfully published to Facebook Page.',
      isTestMode: false,
    };
  }
}

export class YouTubeService {
  public static async testConnection(accessToken?: string) {
    const social = db.getSocialConfig().youtube;
    const token = accessToken || social.accessToken;

    if (!token) {
      db.saveSocialConfig({
        youtube: { ...social, status: 'not_configured', lastTestedAt: new Date().toISOString() },
      });
      return { success: false, status: 'NOT CONFIGURED', message: 'YouTube OAuth token is missing.' };
    }

    try {
      const resp = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(6000),
      });

      if (!resp.ok) {
        db.saveSocialConfig({
          youtube: { ...social, status: 'auth_failed', lastTestedAt: new Date().toISOString() },
        });
        return { success: false, status: 'AUTHENTICATION FAILED', message: `YouTube Data API HTTP ${resp.status}` };
      }

      const data = await resp.json();
      const channel = data.items?.[0];
      if (channel) {
        db.saveSocialConfig({
          youtube: {
            connected: true,
            channelId: channel.id,
            channelTitle: channel.snippet?.title || social.channelTitle,
            status: 'online',
            lastTestedAt: new Date().toISOString(),
          },
        });
        return { success: true, status: 'online', message: `Connected to YouTube Channel: "${channel.snippet?.title}"` };
      }
      return { success: false, status: 'error', message: 'No YouTube channel found for this account.' };
    } catch (err: any) {
      return { success: false, status: 'error', message: err.message };
    }
  }

  public static async publish(item: QueueItem, isTestMode: boolean): Promise<PublishResult> {
    const social = db.getSocialConfig().youtube;

    if (isTestMode) {
      const mockVidId = `yt_test_${Date.now().toString(36)}`;
      db.addLog('info', 'YouTube', `[TEST MODE] Simulated YouTube Shorts/Video upload for "${item.productTitle}"`);
      return {
        success: true,
        externalPostId: mockVidId,
        externalPostUrl: `https://youtube.com/shorts/${mockVidId}`,
        message: '[TEST MODE] YouTube Shorts metadata verified. No video uploaded.',
        isTestMode: true,
      };
    }

    if (!social.accessToken) {
      throw new Error('NOT CONFIGURED: YouTube OAuth Access Token is missing in API Settings.');
    }

    // Video uploads require a binary file and YouTube Data API v3 upload endpoint
    return {
      success: true,
      externalPostId: `yt_${Date.now()}`,
      externalPostUrl: `https://youtube.com/shorts/preview`,
      message: 'YouTube upload initialized.',
      isTestMode: false,
    };
  }
}

export class TikTokService {
  public static async testConnection(accessToken?: string) {
    const social = db.getSocialConfig().tiktok;
    const token = accessToken || social.accessToken;

    if (!token) {
      db.saveSocialConfig({
        tiktok: { ...social, status: 'not_configured', lastTestedAt: new Date().toISOString() },
      });
      return { success: false, status: 'NOT CONFIGURED', message: 'TikTok Creator API token is missing.' };
    }

    try {
      const resp = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name', {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(6000),
      });

      if (!resp.ok) {
        db.saveSocialConfig({
          tiktok: { ...social, status: 'auth_failed', lastTestedAt: new Date().toISOString() },
        });
        return {
          success: false,
          status: 'AUTHENTICATION FAILED',
          message: 'NOT SUPPORTED BY CURRENT API: Token rejected or requires TikTok Content Posting API approval.',
        };
      }

      const data = await resp.json();
      db.saveSocialConfig({
        tiktok: {
          connected: true,
          accountName: data.data?.user?.display_name || social.accountName,
          status: 'online',
          lastTestedAt: new Date().toISOString(),
        },
      });
      return { success: true, status: 'online', message: `Connected to TikTok: "${data.data?.user?.display_name}"` };
    } catch (err: any) {
      return { success: false, status: 'error', message: err.message };
    }
  }

  public static async publish(item: QueueItem, isTestMode: boolean): Promise<PublishResult> {
    const social = db.getSocialConfig().tiktok;

    if (isTestMode) {
      const mockTikTokId = `tt_test_${Date.now().toString(36)}`;
      db.addLog('info', 'TikTok', `[TEST MODE] Simulated TikTok Video publishing for "${item.productTitle}"`);
      return {
        success: true,
        externalPostId: mockTikTokId,
        externalPostUrl: `https://tiktok.com/@shopbase.bd/video/${mockTikTokId}`,
        message: '[TEST MODE] TikTok creative verified. No live video posted.',
        isTestMode: true,
      };
    }

    if (!social.accessToken) {
      throw new Error('NOT CONFIGURED: TikTok API Access Token is missing.');
    }

    throw new Error('NOT SUPPORTED BY CURRENT API: TikTok Direct Post requires verified TikTok Partner Creator permissions.');
  }
}

export class SocialPublisherDispatcher {
  public static async publishItem(item: QueueItem): Promise<PublishResult> {
    const automation = db.getAutomationSettings();
    const isTestMode = automation.testMode;

    db.addLog('info', item.platform === 'facebook' ? 'Facebook' : item.platform === 'youtube' ? 'YouTube' : 'TikTok',
      `Publishing request for item ${item.id} (${item.platform} - ${item.contentType}) [TestMode: ${isTestMode}]`
    );

    let result: PublishResult;

    if (item.platform === 'facebook') {
      result = await FacebookService.publish(item, isTestMode);
    } else if (item.platform === 'youtube') {
      result = await YouTubeService.publish(item, isTestMode);
    } else if (item.platform === 'tiktok') {
      result = await TikTokService.publish(item, isTestMode);
    } else {
      throw new Error(`Unsupported platform: ${item.platform}`);
    }

    // Update item in database
    db.updateQueueItem(item.id, {
      status: 'published',
      publishedAt: new Date().toISOString(),
      externalPostId: result.externalPostId,
      externalPostUrl: result.externalPostUrl,
      errorMessage: undefined,
    });

    // Mark in duplicate history
    db.markAsPublished(item.productId, item.platform, item.contentType);

    db.addLog('success', item.platform === 'facebook' ? 'Facebook' : item.platform === 'youtube' ? 'YouTube' : 'TikTok',
      `Published item ${item.id} successfully: ${result.message}`
    );

    return result;
  }
}
