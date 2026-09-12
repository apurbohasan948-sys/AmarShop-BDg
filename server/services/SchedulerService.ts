import { db } from '../db.ts';

export class SchedulerService {
  private static timer: NodeJS.Timeout | null = null;

  public static start(): void {
    if (this.timer) return;
    console.log('[SchedulerService] Starting publishing scheduler loop (1-min intervals)...');
    this.timer = setInterval(() => {
      this.tick();
    }, 60000);
  }

  public static stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  public static tick(): { published: number; approved: number } {
    const queue = db.getQueue();
    const settings = db.getSettings();
    if (!settings.autoPublishEnabled) {
      return { published: 0, approved: 0 };
    }

    const now = new Date().getTime();
    let publishedCount = 0;
    let approvedCount = 0;

    queue.forEach((item) => {
      const scheduledTime = new Date(item.scheduledTime).getTime();

      // If approved and time has arrived -> mark published
      if (item.status === 'approved' && scheduledTime <= now) {
        db.updateQueueItem(item.id, {
          status: 'published',
          publishedAt: new Date().toISOString(),
        });
        publishedCount++;
        db.addLog(
          'queue',
          'success',
          `Published "${item.productTitle}" to ${item.platform.toUpperCase()}`,
          `Call to Action: ${item.content.callToAction}`
        );
      }
    });

    return { published: publishedCount, approved: approvedCount };
  }
}
