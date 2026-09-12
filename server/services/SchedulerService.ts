import { db } from '../db.js';

export class SchedulerService {
  private static timer: NodeJS.Timeout | null = null;

  public static start() {
    if (this.timer) return;
    this.timer = setInterval(() => {
      this.checkAndProcessQueue();
    }, 30000); // Check every 30 seconds
    console.log('[Scheduler] Background queue scheduler started.');
  }

  public static stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  public static checkAndProcessQueue() {
    const data = db.get();
    if (!data.settings.autoPublish) return;

    const now = new Date();
    const scheduled = data.queue.filter((q) => q.status === 'scheduled' && new Date(q.scheduledFor) <= now);

    if (scheduled.length > 0) {
      db.update((d) => {
        scheduled.forEach((item) => {
          const match = d.queue.find((q) => q.id === item.id);
          if (match) {
            match.status = 'published';
            match.publishedAt = new Date().toISOString();
            db.addLog('SUCCESS', 'PUBLISH', `[Auto-Publisher] Automatically published scheduled post to ${match.platform}: "${match.hook}"`);
          }
        });
      });
    }
  }

  public static getStatus() {
    const settings = db.get().settings;
    const queue = db.get().queue;
    const scheduledCount = queue.filter((q) => q.status === 'scheduled').length;
    const publishedCount = queue.filter((q) => q.status === 'published').length;

    return {
      autoPublish: settings.autoPublish,
      publishIntervalMinutes: settings.publishIntervalMinutes,
      scheduledCount,
      publishedCount,
      isRunning: Boolean(this.timer)
    };
  }

  public static toggleAutoPublish(enabled: boolean) {
    db.update((d) => {
      d.settings.autoPublish = enabled;
    });
    db.addLog('INFO', 'SYSTEM', `Auto-publish schedule ${enabled ? 'ENABLED' : 'DISABLED'}`);
    return this.getStatus();
  }
}
