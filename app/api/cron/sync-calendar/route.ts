import { NextResponse } from 'next/server';
import { calendarScraperService } from '@/services/calendarScraperService';

// Vercel Cron handler: Runs every 8 hours ("0 */8 * * *")
// Revalidates festival, Ekadashi, Thiruvonam, and Purattasi calendars from SrirangamInfo.
export const dynamic = 'force-dynamic';
export const maxDuration = 30; // allow up to 30s for scraping

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const isCronJob = Boolean(
      process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`
    );

    const data = await calendarScraperService.syncCalendarData();

    return NextResponse.json(
      {
        success: true,
        isCronJob,
        ...data,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=28800, stale-while-revalidate=3600',
        },
      }
    );
  } catch (error: any) {
    console.error('[CRON] Calendar sync error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to sync calendar',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  return GET(request);
}
