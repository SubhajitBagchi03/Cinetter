/**
 * releaseNotifier.job.js
 * Runs daily at 00:00 IST — finds all interests whose movie releases today
 * and sends an email notification via Resend.
 *
 * API key: set RESEND_API_KEY in .env when ready.
 * Scheduled via node-cron in server/src/index.js
 */
import cron from 'node-cron';
import Interest from '../modules/movies/interest.model.js';
import logger from '../utils/logger.js';

const sendReleaseEmails = async () => {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    logger.warn('[ReleaseNotifier] RESEND_API_KEY not set — skipping email sends');
    return;
  }

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(RESEND_API_KEY);

    // Find all un-notified interests whose releaseDate is today
    const todayStart = new Date(); todayStart.setHours(0,0,0,0);
    const todayEnd   = new Date(); todayEnd.setHours(23,59,59,999);

    const interests = await Interest.find({
      notified: false,
      releaseDate: { $gte: todayStart, $lte: todayEnd },
    }).populate('userId', 'email username');

    if (!interests.length) {
      logger.info('[ReleaseNotifier] No releases today.');
      return;
    }

    const results = await Promise.allSettled(
      interests.map(async (interest) => {
        const user = interest.userId;
        if (!user?.email) return;

        await resend.emails.send({
          from: 'Cinetter <notifications@cinetter.app>',
          to:   user.email,
          subject: `🎬 "${interest.movieTitle}" drops TODAY!`,
          html: `
            <div style="background:#000;color:#fff;font-family:'Google Sans',sans-serif;padding:40px;max-width:560px;margin:0 auto;border:1px solid #1E1E1E;border-radius:8px;">
              <div style="margin-bottom:24px;">
                <span style="color:#FF4D00;font-size:0.7rem;letter-spacing:0.12em;text-transform:uppercase;">CINETTER — Release Alert</span>
              </div>
              <h1 style="font-size:2rem;line-height:1;margin:0 0 12px;font-weight:800;">${interest.movieTitle}</h1>
              <p style="color:#A3A3A3;font-size:0.95rem;line-height:1.7;margin:0 0 32px;">
                Hey ${user.username}, your most anticipated ${interest.mediaType === 'tv' ? 'show' : 'movie'} is out today.
                Don't miss it — head over to Cinetter and log your reaction.
              </p>
              <a href="https://cinetter.app/movie/${interest.movieId}?type=${interest.mediaType}"
                 style="background:#FF4D00;color:#000;padding:14px 28px;border-radius:4px;text-decoration:none;font-weight:700;font-size:0.85rem;display:inline-block;">
                Watch Now on Cinetter →
              </a>
              <p style="margin-top:40px;color:#333;font-size:0.7rem;">You're receiving this because you marked this title as Interested.</p>
            </div>
          `,
        });

        // Mark as notified
        await Interest.findByIdAndUpdate(interest._id, { notified: true });
        logger.info(`[ReleaseNotifier] Sent email to ${user.email} for "${interest.movieTitle}"`);
      })
    );

    const failed = results.filter(r => r.status === 'rejected');
    if (failed.length) logger.warn(`[ReleaseNotifier] ${failed.length} emails failed.`);
  } catch (err) {
    logger.error('[ReleaseNotifier] Error:', err);
  }
};

// Schedule: every day at 00:00 IST (UTC+5:30 = 18:30 UTC previous day)
export const scheduleReleaseNotifier = () => {
  // '30 18 * * *' = 18:30 UTC = 00:00 IST
  cron.schedule('30 18 * * *', sendReleaseEmails, { timezone: 'UTC' });
  logger.info('[ReleaseNotifier] Scheduled daily release email job (00:00 IST).');
};

export { sendReleaseEmails };
