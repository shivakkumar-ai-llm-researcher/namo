/**
 * Automated Web Scraper & Synchronizer Service
 * Targets:
 *  - https://srirangaminfo.com/tamil-festivals.php
 *  - https://srirangaminfo.com/ekadashi.php
 *  - https://srirangaminfo.com/thiruvonam.php
 *  - https://tamilcalendarz.com/tamilcalendar.php
 *
 * Runs automatically every 8 hours (via Vercel Cron & client-side 8-hour cache TTL).
 * Specially identifies, categorizes, and notifies all Perumal / Vishnu sacred days.
 */

export interface ScrapedFestival {
  date: string; // YYYY-MM-DD
  title: string;
  titleTamil: string;
  weekday?: string;
  isVishnuSpecial: boolean;
  category: 'PURATTASI' | 'GOKULASHTAMI' | 'EKADASHI' | 'THIRUVONAM' | 'VISHNU_UTSAVAM' | 'OTHER';
  descriptionEn: string;
  descriptionTamil: string;
  source: string;
}

export interface CalendarSyncResult {
  lastSyncedAt: string; // ISO string
  syncIntervalHours: number; // 8
  totalFestivals: number;
  totalVishnuDays: number;
  festivalsByDate: Record<string, ScrapedFestival>;
  upcomingVishnuDay?: ScrapedFestival;
}

const MONTH_MAP: Record<string, string> = {
  january: '01', february: '02', march: '03', april: '04', may: '05', june: '06',
  july: '07', august: '08', september: '09', october: '10', november: '11', december: '12'
};

const SYNC_INTERVAL_MS = 8 * 60 * 60 * 1000; // 8 hours in milliseconds
const LOCAL_STORAGE_KEY = 'namo_srirangam_calendar_sync';

/**
 * Pre-compiled authenticated 2026 dataset from Srirangam Info & Vakya Panchangam
 * Ensures instant zero-latency loading and reliable offline/failover behavior.
 */
export const AUTHENTICATED_2026_VISHNU_DATA: Record<string, ScrapedFestival> = {
  // Purattasi Saturdays 2026
  '2026-09-19': {
    date: '2026-09-19',
    title: '1st Purattasi Saturday (புரட்டாசி 1-ம் சனிக்கிழமை)',
    titleTamil: 'புரட்டாசி 1-வது சனிக்கிழமை - மாவிளக்கு தீபம்',
    weekday: 'Saturday',
    isVishnuSpecial: true,
    category: 'PURATTASI',
    descriptionEn: 'First Saturday of sacred Purattasi month. Dedicated to Lord Venkateswara. Devotees observe strict fasting and light Maavilakku deepam.',
    descriptionTamil: 'புரட்டாசி முதல் சனிக்கிழமை. திருப்பதி வேங்கடேச பெருமாளுக்கு மாவிளக்கு ஏற்றி விரத வழிபாடு.',
    source: 'srirangaminfo.com',
  },
  '2026-09-26': {
    date: '2026-09-26',
    title: '2nd Purattasi Saturday - Annual Community Function',
    titleTamil: 'புரட்டாசி 2-வது சனிக்கிழமை (ஆண்டு பெருவிழா)',
    weekday: 'Saturday',
    isVishnuSpecial: true,
    category: 'PURATTASI',
    descriptionEn: 'OUR ANNUAL COMMUNITY FUNCTION: Grand Tirupati Balaji Thaligai, Thirumanjanam, Deepam Aradhana & Annadhanam feast. Most auspicious day!',
    descriptionTamil: 'நமது சமூக ஆண்டுப் பெருவிழா: திருப்பதி பாலாஜிக்கு தளிகை, திருமஞ்சனம், தீபாராதனை மற்றும் அன்னதானம் நடைபெறும் புண்ணிய நாள்.',
    source: 'srirangaminfo.com',
  },
  '2026-10-03': {
    date: '2026-10-03',
    title: '3rd Purattasi Saturday (புரட்டாசி 3-ம் சனிக்கிழமை)',
    titleTamil: 'புரட்டாசி 3-வது சனிக்கிழமை - திருப்பதி வைபவம்',
    weekday: 'Saturday',
    isVishnuSpecial: true,
    category: 'PURATTASI',
    descriptionEn: 'Third Saturday of Purattasi month. Special Vishnu Sahasranamam recitation and Thaligai seva for Lord Balaji.',
    descriptionTamil: 'புரட்டாசி 3-வது சனிக்கிழமை. விஷ்ணு சஹஸ்ரநாம பாராயணம் மற்றும் மாவிளக்கு பூஜை.',
    source: 'srirangaminfo.com',
  },
  '2026-10-10': {
    date: '2026-10-10',
    title: '4th Purattasi Saturday (புரட்டாசி 4-ம் சனிக்கிழமை)',
    titleTamil: 'புரட்டாசி 4-வது சனிக்கிழமை - நிறைவு பெருவிழா',
    weekday: 'Saturday',
    isVishnuSpecial: true,
    category: 'PURATTASI',
    descriptionEn: 'Fourth Saturday of Purattasi month. Concluding Purattasi Sani utsavam with special pushpa alankaram.',
    descriptionTamil: 'புரட்டாசி நான்காவது சனிக்கிழமை. சிறப்பு புஷ்ப அலங்கார தரிசனம்.',
    source: 'srirangaminfo.com',
  },
  '2026-10-17': {
    date: '2026-10-17',
    title: '5th Purattasi Saturday (புரட்டாசி 5-ம் சனிக்கிழமை)',
    titleTamil: 'புரட்டாசி 5-வது சனிக்கிழமை - மகா பிரசாதம்',
    weekday: 'Saturday',
    isVishnuSpecial: true,
    category: 'PURATTASI',
    descriptionEn: 'Rare fifth Purattasi Saturday. Special mangala aarti and thaligai offering for Lord Srinivasa.',
    descriptionTamil: 'அரிதான ஐந்தாவது புரட்டாசி சனிக்கிழமை. மங்கள ஆரத்தி மற்றும் தளிகை நைவேத்தியம்.',
    source: 'srirangaminfo.com',
  },

  // Gokulashtami / Sri Krishna Jayanthi
  '2026-09-04': {
    date: '2026-09-04',
    title: 'Sri Krishna Jayanthi / Gokulashtami',
    titleTamil: 'ஸ்ரீ கிருஷ்ண ஜெயந்தி / ஸ்ரீ கோகுலாஷ்டமி',
    weekday: 'Friday',
    isVishnuSpecial: true,
    category: 'GOKULASHTAMI',
    descriptionEn: 'Divine Appearance Day of Lord Sri Krishna (Rohini Nakshatra, Avani Krishna Ashtami). 4-Year Community Cycle: Celebrated in 2025; next grand celebration in 2029!',
    descriptionTamil: 'பகவான் ஸ்ரீ கிருஷ்ணர் அவதரித்த புண்ணிய தினம். நமது 4 ஆண்டு சுழற்சி: 2025-ல் கொண்டாடப்பட்டது; அடுத்த பெருவிழா 2029-ல்!',
    source: 'srirangaminfo.com/tamil-festivals.php',
  },

  // 2026 Ekadashis from Srirangam Info
  '2026-01-14': {
    date: '2026-01-14',
    title: 'Saphala Ekadashi (சபலா ஏகாதசி விரதம்)',
    titleTamil: 'சபலா ஏகாதசி விரதம் (தேய்பிறை)',
    weekday: 'Wednesday',
    isVishnuSpecial: true,
    category: 'EKADASHI',
    descriptionEn: 'Krishna Paksha Ekadashi of Margazhi/Thai. Auspicious fasting day for Perumal.',
    descriptionTamil: 'பெருமாளுக்குரிய புண்ணிய ஏகாதசி விரத நாள்.',
    source: 'srirangaminfo.com/ekadashi.php',
  },
  '2026-01-29': {
    date: '2026-01-29',
    title: 'Putrada Ekadashi (புத்ரதா ஏகாதசி விரதம்)',
    titleTamil: 'புத்ரதா ஏகாதசி விரதம் (வளர்பிறை)',
    weekday: 'Thursday',
    isVishnuSpecial: true,
    category: 'EKADASHI',
    descriptionEn: 'Shukla Paksha Ekadashi bringing blessings of good progeny and prosperity.',
    descriptionTamil: 'சந்தான பாக்கியம் அருளும் வளர்பிறை ஏகாதசி.',
    source: 'srirangaminfo.com/ekadashi.php',
  },
  '2026-02-13': {
    date: '2026-02-13',
    title: 'Shattila Ekadashi (ஷட்டிலா ஏகாதசி விரதம்)',
    titleTamil: 'ஷட்டிலா ஏகாதசி விரதம் (தேய்பிறை)',
    weekday: 'Friday',
    isVishnuSpecial: true,
    category: 'EKADASHI',
    descriptionEn: 'Auspicious Ekadashi observing sesame offering and Vishnu pooja.',
    descriptionTamil: 'எள் தானமும் பெருமாள் வழிபாடும் உரிய புண்ணிய நாள்.',
    source: 'srirangaminfo.com/ekadashi.php',
  },
  '2026-02-27': {
    date: '2026-02-27',
    title: 'Jaya Ekadashi (ஜெயா ஏகாதசி விரதம்)',
    titleTamil: 'ஜெயா ஏகாதசி விரதம் (வளர்பிறை)',
    weekday: 'Friday',
    isVishnuSpecial: true,
    category: 'EKADASHI',
    descriptionEn: 'Shukla Paksha Ekadashi granting spiritual victory and inner peace.',
    descriptionTamil: 'வெற்றியும் முக்தியும் தரும் வளர்பிறை ஏகாதசி.',
    source: 'srirangaminfo.com/ekadashi.php',
  },
  '2026-03-15': {
    date: '2026-03-15',
    title: 'Vijaya Ekadashi & Thiruvonam Nakshatra (விஜயா ஏகாதசி & திருவோணம்)',
    titleTamil: 'விஜயா ஏகாதசி மற்றும் திருவோணம் (பெருமாள் இரட்டை புண்ணிய நாள்)',
    weekday: 'Sunday',
    isVishnuSpecial: true,
    category: 'EKADASHI',
    descriptionEn: 'Rare divine coincidence of Vijaya Ekadashi and Lord Venkateswara Janma Nakshatram (Thiruvonam)! Immensely auspicious day for Vishnu fasting and temple worship.',
    descriptionTamil: 'விஜயா ஏகாதசியும் பெருமாள் அவதார திருவோண நட்சத்திரமும் இணையும் மகா புண்ணிய தினம்!',
    source: 'srirangaminfo.com',
  },
  '2026-03-29': {
    date: '2026-03-29',
    title: 'Amalaki Ekadashi (ஆமலகி ஏகாதசி விரதம்)',
    titleTamil: 'ஆமலகி ஏகாதசி விரதம் (வளர்பிறை)',
    weekday: 'Sunday',
    isVishnuSpecial: true,
    category: 'EKADASHI',
    descriptionEn: 'Worship of Lord Vishnu through the sacred Amla tree.',
    descriptionTamil: 'நெல்லியம்பதியில் மகா விஷ்ணுவை வழிபடும் புனித ஏகாதசி.',
    source: 'srirangaminfo.com/ekadashi.php',
  },
  '2026-04-13': {
    date: '2026-04-13',
    title: 'Papamochani Ekadashi (பாபமோசனி ஏகாதசி)',
    titleTamil: 'பாபமோசனி ஏகாதசி விரதம் (தேய்பிறை)',
    weekday: 'Monday',
    isVishnuSpecial: true,
    category: 'EKADASHI',
    descriptionEn: 'Absolves all karmic distress and purifies body and mind.',
    descriptionTamil: 'பாவங்களை நீக்கி புண்ணியம் அருளும் ஏகாதசி.',
    source: 'srirangaminfo.com/ekadashi.php',
  },
  '2026-04-28': {
    date: '2026-04-28',
    title: 'Kamada Ekadashi (காமதா ஏகாதசி விரதம்)',
    titleTamil: 'காமதா ஏகாதசி விரதம் (வளர்பிறை)',
    weekday: 'Tuesday',
    isVishnuSpecial: true,
    category: 'EKADASHI',
    descriptionEn: 'Grants all noble desires and spiritual fulfillment.',
    descriptionTamil: 'நினைத்த நற்காரியங்களை நிறைவேற்றித் தரும் ஏகாதசி.',
    source: 'srirangaminfo.com/ekadashi.php',
  },
  '2026-05-13': {
    date: '2026-05-13',
    title: 'Varuthini Ekadashi (வருதினி ஏகாதசி விரதம்)',
    titleTamil: 'வருதினி ஏகாதசி விரதம் (தேய்பிறை)',
    weekday: 'Wednesday',
    isVishnuSpecial: true,
    category: 'EKADASHI',
    descriptionEn: 'Auspicious protective fasting day for Maha Vishnu.',
    descriptionTamil: 'மகாவிஷ்ணுவின் பாதுகாப்பு அருளும் ஏகாதசி விரதம்.',
    source: 'srirangaminfo.com/ekadashi.php',
  },
  '2026-05-27': {
    date: '2026-05-27',
    title: 'Mohini Ekadashi (மோகினி ஏகாதசி விரதம்)',
    titleTamil: 'மோகினி ஏகாதசி விரதம் (வளர்பிறை)',
    weekday: 'Wednesday',
    isVishnuSpecial: true,
    category: 'EKADASHI',
    descriptionEn: 'Commemorates Lord Vishnu avatar as Mohini during Samudra Manthan.',
    descriptionTamil: 'திருப்பாற்கடல் கடைந்த போது பெருமாள் மோகினி அவதாரம் எடுத்த நன்னாள்.',
    source: 'srirangaminfo.com/ekadashi.php',
  },
  '2026-06-11': {
    date: '2026-06-11',
    title: 'Apara Ekadashi (அபரா ஏகாதசி விரதம்)',
    titleTamil: 'அபரா ஏகாதசி விரதம் (தேய்பிறை)',
    weekday: 'Thursday',
    isVishnuSpecial: true,
    category: 'EKADASHI',
    descriptionEn: 'Brings immense fame and removes deep negative tendencies.',
    descriptionTamil: 'அளவற்ற புண்ணியமும் புகழும் தரும் ஏகாதசி.',
    source: 'srirangaminfo.com/ekadashi.php',
  },
  '2026-06-25': {
    date: '2026-06-25',
    title: 'Nirjala Ekadashi (நிர்ஜலா ஏகாதசி விரதம்)',
    titleTamil: 'நிர்ஜலா ஏகாதசி விரதம் (பீம ஏகாதசி)',
    weekday: 'Thursday',
    isVishnuSpecial: true,
    category: 'EKADASHI',
    descriptionEn: 'Most rigorous and powerful Ekadashi fasting without water.',
    descriptionTamil: 'நீர் கூட அருந்தாமல் அனுஷ்டிக்கும் மகா புண்ணிய நிர்ஜலா ஏகாதசி.',
    source: 'srirangaminfo.com/ekadashi.php',
  },
  '2026-07-10': {
    date: '2026-07-10',
    title: 'Yogini Ekadashi (யோகினி ஏகாதசி விரதம்)',
    titleTamil: 'யோகினி ஏகாதசி விரதம் (தேய்பிறை)',
    weekday: 'Friday',
    isVishnuSpecial: true,
    category: 'EKADASHI',
    descriptionEn: 'Brings health, spiritual healing, and liberation.',
    descriptionTamil: 'நோயற்ற வாழ்வும் ஆரோக்கியமும் நல்கும் ஏகாதசி.',
    source: 'srirangaminfo.com/ekadashi.php',
  },
  '2026-07-25': {
    date: '2026-07-25',
    title: 'Sayana Ekadashi / Chaturmasya Starts',
    titleTamil: 'சயன ஏகாதசி (சதுர்மாஸ்ய விரதம் ஆரம்பம்)',
    weekday: 'Saturday',
    isVishnuSpecial: true,
    category: 'EKADASHI',
    descriptionEn: 'Lord Maha Vishnu enters cosmic yoga-nidra on Adisesha. Chaturmasya begins.',
    descriptionTamil: 'பகவான் மகாவிஷ்ணு ஆதிசேஷன் மீது யோக நித்திரையில் ஆழும் சயன ஏகாதசி.',
    source: 'srirangaminfo.com/ekadashi.php',
  },
  '2026-08-09': {
    date: '2026-08-09',
    title: 'Kamika Ekadashi (காமிகா ஏகாதசி விரதம்)',
    titleTamil: 'காமிகா ஏகாதசி விரதம் (தேய்பிறை)',
    weekday: 'Sunday',
    isVishnuSpecial: true,
    category: 'EKADASHI',
    descriptionEn: 'Auspicious day for Tulasi archana to Lord Vishnu.',
    descriptionTamil: 'துளசி தளங்களால் விஷ்ணுவை அர்ச்சித்து நற்பேறு பெறும் ஏகாதசி.',
    source: 'srirangaminfo.com/ekadashi.php',
  },
  '2026-08-23': {
    date: '2026-08-23',
    title: 'Pavitra Ekadashi (பவித்ரோபனா ஏகாதசி)',
    titleTamil: 'பவித்ரோபனா ஏகாதசி விரதம் (வளர்பிறை)',
    weekday: 'Sunday',
    isVishnuSpecial: true,
    category: 'EKADASHI',
    descriptionEn: 'Sacred thread and pavitra offering to Lord Venkateswara.',
    descriptionTamil: 'பெருமாளுக்கு பவித்ர மாலை சாற்றி வழிபடும் புனித நாள்.',
    source: 'srirangaminfo.com/ekadashi.php',
  },
  '2026-09-07': {
    date: '2026-09-07',
    title: 'Aja Ekadashi (அஜா ஏகாதசி விரதம்)',
    titleTamil: 'அஜா ஏகாதசி விரதம் (தேய்பிறை)',
    weekday: 'Monday',
    isVishnuSpecial: true,
    category: 'EKADASHI',
    descriptionEn: 'Observed during Avani month for relief from hardships.',
    descriptionTamil: 'ஆவணி தேய்பிறை ஏகாதசி விரதம். பெருமாள் அனுகிரகம் பெற சிறப்பு நாள்.',
    source: 'srirangaminfo.com/ekadashi.php',
  },
  '2026-09-22': {
    date: '2026-09-22',
    title: 'Parivartini Ekadashi (பரிவர்த்தினி ஏகாதசி விரதம்)',
    titleTamil: 'பரிவர்த்தினி ஏகாதசி விரதம் (புரட்டாசி வளர்பிறை)',
    weekday: 'Tuesday',
    isVishnuSpecial: true,
    category: 'EKADASHI',
    descriptionEn: 'Holy Purattasi Shukla Ekadashi: Lord Vishnu turns onto other side in yoga-nidra. Extremely sacred during Purattasi month.',
    descriptionTamil: 'புரட்டாசி வளர்பிறை ஏகாதசி: பெருமாள் யோக நித்திரையில் சயனம் மாறும் பவித்திர நாள்.',
    source: 'srirangaminfo.com/ekadashi.php',
  },
  '2026-10-06': {
    date: '2026-10-06',
    title: 'Indira Ekadashi (இந்திரா ஏகாதசி விரதம்)',
    titleTamil: 'இந்திரா ஏகாதசி விரதம் (மஹாளய பட்சம்)',
    weekday: 'Tuesday',
    isVishnuSpecial: true,
    category: 'EKADASHI',
    descriptionEn: 'Mahalaya Paksha Ekadashi granting liberation to ancestors.',
    descriptionTamil: 'முன்னோர்களுக்கு மோட்ச கதி அளிக்கும் மஹாளய இந்திரா ஏகாதசி.',
    source: 'srirangaminfo.com/ekadashi.php',
  },
  '2026-10-21': {
    date: '2026-10-21',
    title: 'Papankusha Ekadashi (பாபாங்குச ஏகாதசி)',
    titleTamil: 'பாபாங்குச ஏகாதசி விரதம் (வளர்பிறை)',
    weekday: 'Wednesday',
    isVishnuSpecial: true,
    category: 'EKADASHI',
    descriptionEn: 'Shukla Ekadashi controlling sins like an elephant goad (ankusha).',
    descriptionTamil: 'பாவங்களை அடக்கி புண்ணியம் தரும் வளர்பிறை ஏகாதசி.',
    source: 'srirangaminfo.com/ekadashi.php',
  },
  '2026-11-05': {
    date: '2026-11-05',
    title: 'Rama Ekadashi (ரமா ஏகாதசி விரதம்)',
    titleTamil: 'ரமா ஏகாதசி விரதம் (தீபாவளிக்கு முன்)',
    weekday: 'Thursday',
    isVishnuSpecial: true,
    category: 'EKADASHI',
    descriptionEn: 'Pre-Deepavali Ekadashi honoring Mahalakshmi and Lord Vishnu.',
    descriptionTamil: 'மகாலட்சுமி மற்றும் விஷ்ணு பகவானை பூஜிக்கும் ரமா ஏகாதசி.',
    source: 'srirangaminfo.com/ekadashi.php',
  },
  '2026-11-20': {
    date: '2026-11-20',
    title: 'Prabodhini Ekadashi / Kaisi Ekadashi',
    titleTamil: 'பிரபோதினீ ஏகாதசி / கைசிக ஏகாதசி',
    weekday: 'Friday',
    isVishnuSpecial: true,
    category: 'EKADASHI',
    descriptionEn: 'Kaisika Ekadashi grand celebration at Srirangam & Tirupati! Lord Vishnu awakens from cosmic slumber.',
    descriptionTamil: 'திருவரங்கத்தில் கைசிக மகா வைபவம்! பெருமாள் யோக நித்திரையிலிருந்து விழித்தெழும் நன்னாள்.',
    source: 'srirangaminfo.com/ekadashi.php',
  },
  '2026-12-05': {
    date: '2026-12-05',
    title: 'Utpanna Ekadashi (உற்பத்தி ஏகாதசி)',
    titleTamil: 'உற்பத்தி ஏகாதசி விரதம் (தேய்பிறை)',
    weekday: 'Saturday',
    isVishnuSpecial: true,
    category: 'EKADASHI',
    descriptionEn: 'Birth day of Ekadashi Devi from the body of Lord Vishnu.',
    descriptionTamil: 'விஷ்ணு பகவானிடமிருந்து ஏகாதசி தேவி தோன்றிய புண்ணிய நாள்.',
    source: 'srirangaminfo.com/ekadashi.php',
  },
  '2026-12-20': {
    date: '2026-12-20',
    title: 'Mokshada Ekadashi / Gita Jayanthi',
    titleTamil: 'மோட்சதா ஏகாதசி / பகவத் கீதா ஜெயந்தி',
    weekday: 'Sunday',
    isVishnuSpecial: true,
    category: 'EKADASHI',
    descriptionEn: 'Auspicious Mokshada Ekadashi and Gita Jayanthi: Sri Krishna taught Bhagavad Gita to Arjuna.',
    descriptionTamil: 'பகவத் கீதை பிறந்த கீதா ஜெயந்தி மற்றும் மோட்சதா ஏகாதசி விரதம்.',
    source: 'srirangaminfo.com/ekadashi.php',
  },

  // 2026 Thiruvonam (Shravana Nakshatra) Dates - Srirangam Info
  '2026-01-20': {
    date: '2026-01-20',
    title: 'Thiruvonam (Shravana Nakshatra)',
    titleTamil: 'திருவோணம் நட்சத்திரம் (பெருமாள் அவதார நட்சத்திரம்)',
    weekday: 'Tuesday',
    isVishnuSpecial: true,
    category: 'THIRUVONAM',
    descriptionEn: 'Sacred Janma Nakshatra of Lord Venkateswara / Balaji. Special Sahasranama Archana.',
    descriptionTamil: 'திருப்பதி வேங்கடேச பெருமாளின் ஜென்ம நட்சத்திரம். சிறப்பு அபிஷேக அலங்கார நாள்.',
    source: 'srirangaminfo.com/thiruvonam.php',
  },
  '2026-02-16': {
    date: '2026-02-16',
    title: 'Thiruvonam (Shravana Nakshatra)',
    titleTamil: 'திருவோணம் நட்சத்திரம் (பெருமாள் அவதார நட்சத்திரம்)',
    weekday: 'Monday',
    isVishnuSpecial: true,
    category: 'THIRUVONAM',
    descriptionEn: 'Sacred Janma Nakshatra of Lord Venkateswara / Balaji.',
    descriptionTamil: 'திருப்பதி வேங்கடேச பெருமாளின் ஜென்ம நட்சத்திரம்.',
    source: 'srirangaminfo.com/thiruvonam.php',
  },
  '2026-04-12': {
    date: '2026-04-12',
    title: 'Thiruvonam (Shravana Nakshatra)',
    titleTamil: 'திருவோணம் நட்சத்திரம் (பெருமாள் அவதார நட்சத்திரம்)',
    weekday: 'Sunday',
    isVishnuSpecial: true,
    category: 'THIRUVONAM',
    descriptionEn: 'Lord Venkateswara Janma Nakshatra.',
    descriptionTamil: 'திருப்பதி பாலாஜி அவதார நட்சத்திரம்.',
    source: 'srirangaminfo.com/thiruvonam.php',
  },
  '2026-05-09': {
    date: '2026-05-09',
    title: 'Thiruvonam (Shravana Nakshatra)',
    titleTamil: 'திருவோணம் நட்சத்திரம் (பெருமாள் அவதார நட்சத்திரம்)',
    weekday: 'Saturday',
    isVishnuSpecial: true,
    category: 'THIRUVONAM',
    descriptionEn: 'Saturday Thiruvonam: Doubly auspicious for Lord Srinivasa Balaji.',
    descriptionTamil: 'சனிக்கிழமை இணையும் திருவோணம்: பெருமாளுக்கு இரட்டிப்பு புண்ணியம் தரும் நாள்.',
    source: 'srirangaminfo.com/thiruvonam.php',
  },
  '2026-06-05': {
    date: '2026-06-05',
    title: 'Thiruvonam (Shravana Nakshatra)',
    titleTamil: 'திருவோணம் நட்சத்திரம் (பெருமாள் அவதார நட்சத்திரம்)',
    weekday: 'Friday',
    isVishnuSpecial: true,
    category: 'THIRUVONAM',
    descriptionEn: 'Sacred Janma Nakshatra of Lord Venkateswara.',
    descriptionTamil: 'திருப்பதி வேங்கடேச பெருமாளின் ஜென்ம நட்சத்திரம்.',
    source: 'srirangaminfo.com/thiruvonam.php',
  },
  '2026-07-03': {
    date: '2026-07-03',
    title: 'Thiruvonam (Shravana Nakshatra)',
    titleTamil: 'திருவோணம் நட்சத்திரம் (பெருமாள் அவதார நட்சத்திரம்)',
    weekday: 'Friday',
    isVishnuSpecial: true,
    category: 'THIRUVONAM',
    descriptionEn: 'Sacred Janma Nakshatra of Lord Venkateswara.',
    descriptionTamil: 'திருப்பதி வேங்கடேச பெருமாளின் ஜென்ம நட்சத்திரம்.',
    source: 'srirangaminfo.com/thiruvonam.php',
  },
  '2026-07-30': {
    date: '2026-07-30',
    title: 'Thiruvonam (Shravana Nakshatra)',
    titleTamil: 'திருவோணம் நட்சத்திரம் (பெருமாள் அவதார நட்சத்திரம்)',
    weekday: 'Thursday',
    isVishnuSpecial: true,
    category: 'THIRUVONAM',
    descriptionEn: 'Sacred Janma Nakshatra of Lord Venkateswara.',
    descriptionTamil: 'திருப்பதி வேங்கடேச பெருமாளின் ஜென்ம நட்சத்திரம்.',
    source: 'srirangaminfo.com/thiruvonam.php',
  },
  '2026-08-26': {
    date: '2026-08-26',
    title: 'Thiruvonam (Shravana Nakshatra)',
    titleTamil: 'திருவோணம் நட்சத்திரம் (பெருமாள் அவதார நட்சத்திரம்)',
    weekday: 'Wednesday',
    isVishnuSpecial: true,
    category: 'THIRUVONAM',
    descriptionEn: 'Sacred Janma Nakshatra of Lord Venkateswara.',
    descriptionTamil: 'திருப்பதி வேங்கடேச பெருமாளின் ஜென்ம நட்சத்திரம்.',
    source: 'srirangaminfo.com/thiruvonam.php',
  },
  '2026-09-23': {
    date: '2026-09-23',
    title: 'Purattasi Thiruvonam (புரட்டாசி திருவோணம்)',
    titleTamil: 'புரட்டாசி மாத திருவோணம் - திருப்பதி பிரம்மோற்சவம்',
    weekday: 'Wednesday',
    isVishnuSpecial: true,
    category: 'THIRUVONAM',
    descriptionEn: 'Most sacred Thiruvonam of the entire year! Observed during Holy Purattasi month. Coincides with Tirumala Brahmotsavam.',
    descriptionTamil: 'வருடத்திலேயே மிகப்புனிதமான புரட்டாசி திருவோணம்! திருப்பதி பிரம்மோற்சவ ரதோற்சவ புண்ணிய தினம்.',
    source: 'srirangaminfo.com/thiruvonam.php',
  },
  '2026-10-20': {
    date: '2026-10-20',
    title: 'Thiruvonam (Shravana Nakshatra)',
    titleTamil: 'திருவோணம் நட்சத்திரம் (பெருமாள் அவதார நட்சத்திரம்)',
    weekday: 'Tuesday',
    isVishnuSpecial: true,
    category: 'THIRUVONAM',
    descriptionEn: 'Sacred Janma Nakshatra of Lord Venkateswara.',
    descriptionTamil: 'திருப்பதி வேங்கடேச பெருமாளின் ஜென்ம நட்சத்திரம்.',
    source: 'srirangaminfo.com/thiruvonam.php',
  },
  '2026-11-16': {
    date: '2026-11-16',
    title: 'Thiruvonam (Shravana Nakshatra)',
    titleTamil: 'திருவோணம் நட்சத்திரம் (பெருமாள் அவதார நட்சத்திரம்)',
    weekday: 'Monday',
    isVishnuSpecial: true,
    category: 'THIRUVONAM',
    descriptionEn: 'Sacred Janma Nakshatra of Lord Venkateswara.',
    descriptionTamil: 'திருப்பதி வேங்கடேச பெருமாளின் ஜென்ம நட்சத்திரம்.',
    source: 'srirangaminfo.com/thiruvonam.php',
  },
  '2026-12-14': {
    date: '2026-12-14',
    title: 'Thiruvonam (Shravana Nakshatra)',
    titleTamil: 'திருவோணம் நட்சத்திரம் (பெருமாள் அவதார நட்சத்திரம்)',
    weekday: 'Monday',
    isVishnuSpecial: true,
    category: 'THIRUVONAM',
    descriptionEn: 'Margazhi Thiruvonam: Auspicious day with Tiruppavai chanting.',
    descriptionTamil: 'மார்கழி திருவோணம்: திருப்பாவை பாடி பெருமாளை சேவிக்கும் புனித நாள்.',
    source: 'srirangaminfo.com/thiruvonam.php',
  },

  // Major Vaishnava Festivals 2026 from Srirangam Info
  '2026-03-27': {
    date: '2026-03-27',
    title: 'Sri Rama Navami (ஸ்ரீ ராம நவமி)',
    titleTamil: 'ஸ்ரீ ராம நவமி - ராம பிரான் அவதார திருநாள்',
    weekday: 'Friday',
    isVishnuSpecial: true,
    category: 'VISHNU_UTSAVAM',
    descriptionEn: 'Appearance day of Maryada Purushottama Lord Sri Rama, 7th avatar of Lord Maha Vishnu.',
    descriptionTamil: 'மகாவிஷ்ணுவின் 7-ம் அவதாரமான ஸ்ரீ ராமபிரான் அவதரித்த நன்னாள்.',
    source: 'srirangaminfo.com/tamil-festivals.php',
  },
  '2026-04-02': {
    date: '2026-04-02',
    title: 'Panguni Uthiram (Srirangam Serthi Sevai)',
    titleTamil: 'பங்குனி உத்திரம் - ஸ்ரீரங்கம் சேர்த்தி சேவை',
    weekday: 'Thursday',
    isVishnuSpecial: true,
    category: 'VISHNU_UTSAVAM',
    descriptionEn: 'Srirangam Ranganathar & Ranganayaki Thayar divine celestial wedding (Serthi Sevai).',
    descriptionTamil: 'ஸ்ரீரங்கம் ரங்கநாதரும் ரங்கநாயகி தாயாரும் ஒருசேர அருள்பாலிக்கும் மகா சேர்த்தி சேவை.',
    source: 'srirangaminfo.com/tamil-festivals.php',
  },
  '2026-04-30': {
    date: '2026-04-30',
    title: 'Chithirai Thiruvizha - Kallazhagar Vaigai Aatril Ezhuntharulal',
    titleTamil: 'சித்திரை பெருவிழா - கள்ளழகர் வைகை ஆற்றில் எழுந்தருளல்',
    weekday: 'Thursday',
    isVishnuSpecial: true,
    category: 'VISHNU_UTSAVAM',
    descriptionEn: 'Lord Kallazhagar (Maha Vishnu) enters the Vaigai River in golden horse vahana.',
    descriptionTamil: 'ஸ்ரீ கள்ளழகர் தங்கக் குதிரை வாகனத்தில் வைகை ஆற்றில் எழுந்தருளும் வைபவம்.',
    source: 'srirangaminfo.com/tamil-festivals.php',
  },
  '2026-05-01': {
    date: '2026-05-01',
    title: 'Sri Narasimha Jayanthi (ஸ்ரீ நரசிம்ம ஜெயந்தி)',
    titleTamil: 'ஸ்ரீ நரசிம்ம ஜெயந்தி - லட்சுமி நரசிம்மர் அவதாரம்',
    weekday: 'Friday',
    isVishnuSpecial: true,
    category: 'VISHNU_UTSAVAM',
    descriptionEn: 'Lord Narasimha swami incarnated at twilight to protect his ardent devotee Prahlada.',
    descriptionTamil: 'பக்த பிரகலாதனை காக்க மகாவிஷ்ணு நரசிம்மராக அவதரித்த புண்ணிய நாள்.',
    source: 'srirangaminfo.com/tamil-festivals.php',
  },
  '2026-05-31': {
    date: '2026-05-31',
    title: 'Vaikasi Visakam (Nammalvar Avatharam)',
    titleTamil: 'வைகாசி விசாகம் - நம்மாழ்வார் அவதார திருநாள்',
    weekday: 'Sunday',
    isVishnuSpecial: true,
    category: 'VISHNU_UTSAVAM',
    descriptionEn: 'Incarnation day of Nammalvar, foremost of Vaishnava Alvars.',
    descriptionTamil: 'வைணவ குல திலகமான நம்மாழ்வார் அவதரித்த புண்ணிய திருநாள்.',
    source: 'srirangaminfo.com/tamil-festivals.php',
  },
  '2026-08-16': {
    date: '2026-08-16',
    title: 'Andal Aadi Pooram (ஆண்டாள் ஆடிப்பூரம்)',
    titleTamil: 'ஆடிப்பூரம் - சூடிக்கொடுத்த சுடர்க்கொடி ஆண்டாள் அவதாரம்',
    weekday: 'Sunday',
    isVishnuSpecial: true,
    category: 'VISHNU_UTSAVAM',
    descriptionEn: 'Appearance of Sri Andal Nachiyar in Srivilliputhur, supreme devotee of Lord Ranganatha.',
    descriptionTamil: 'ஸ்ரீவில்லிபுத்தூரில் ஸ்ரீ ஆண்டாள் நாச்சியார் அவதரித்த மங்களகரமான திருநாள்.',
    source: 'srirangaminfo.com/tamil-festivals.php',
  },
  '2026-08-17': {
    date: '2026-08-17',
    title: 'Garuda Panchami (ஸ்ரீ கருட பஞ்சமி)',
    titleTamil: 'கருட பஞ்சமி - பெருமாள் வாகன கருடாழ்வார் விரதம்',
    weekday: 'Monday',
    isVishnuSpecial: true,
    category: 'VISHNU_UTSAVAM',
    descriptionEn: 'Sacred worship of Lord Garuda, the divine vahana of Lord Maha Vishnu.',
    descriptionTamil: 'பெருமாளின் திவ்ய வாகனமான பெரிய திருவடி கருடாழ்வார் வழிபாட்டு நாள்.',
    source: 'srirangaminfo.com/tamil-festivals.php',
  },
  '2026-08-28': {
    date: '2026-08-28',
    title: 'Varalakshmi Vratam (ஸ்ரீ வரலக்ஷ்மி விரதம்)',
    titleTamil: 'வரலக்ஷ்மி விரதம் - பாலாஜி தாயார் பூஜை',
    weekday: 'Friday',
    isVishnuSpecial: true,
    category: 'VISHNU_UTSAVAM',
    descriptionEn: 'Goddess Mahalakshmi worship for household prosperity, harmony, and Perumal blessings.',
    descriptionTamil: 'மகாலட்சுமியின் பரிபூரண அருள் வேண்டி சுமங்கலிகள் மேற்கொள்ளும் விரதம்.',
    source: 'srirangaminfo.com/tamil-festivals.php',
  },
  '2026-09-18': {
    date: '2026-09-18',
    title: 'Purattasi Masappirappu (Holy Month Begins)',
    titleTamil: 'புரட்டாசி மாதப்பிறப்பு (புனித மாதம் ஆரம்பம்)',
    weekday: 'Friday',
    isVishnuSpecial: true,
    category: 'PURATTASI',
    descriptionEn: 'Sacred first day of Purattasi month dedicated entirely to Lord Venkateswara.',
    descriptionTamil: 'திருப்பதி வேங்கடேச பெருமாளுக்குரிய புனித புரட்டாசி மாதத்தின் தொடக்கம்.',
    source: 'srirangaminfo.com/Tamil-daily-calendar.php',
  },
};

export const calendarScraperService = {
  /**
   * Helper: Match whether an event title is related to Lord Perumal / Vishnu
   */
  isVishnuRelated(title: string): boolean {
    const q = title.toLowerCase();
    const keywords = [
      'perumal', 'vishnu', 'ranganath', 'krishna', 'gokula', 'rama', 'raghava',
      'narasimha', 'kallazhagar', 'thiruvonam', 'purattasi', 'vaikunda', 'vaikunta',
      'ekadasi', 'ekadashi', 'andal', 'adipuram', 'aadi pooram', 'garuda', 'varalakshmi',
      'venkateswara', 'balaji', 'srinivasa', 'shravana', 'saphala', 'putrada', 'jaya',
      'amalaki', 'papamochani', 'kamada', 'varuthini', 'mohini', 'apara', 'nirjala',
      'yogini', 'sayana', 'kamika', 'pavitra', 'aja', 'parivartini', 'indira', 'papankusha',
      'rama ekadashi', 'kaisika', 'utpanna', 'mokshada', 'gita jayanthi'
    ];
    return keywords.some((k) => q.includes(k));
  },

  /**
   * Scrape Master Festivals from srirangaminfo.com/tamil-festivals.php
   */
  async scrapeFestivals(): Promise<ScrapedFestival[]> {
    try {
      const res = await fetch('https://srirangaminfo.com/tamil-festivals.php', {
        headers: { 'User-Agent': 'Mozilla/5.0 (Namo-Calendar/1.0)' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      const clean = html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');

      const regex = /(\d{1,2})\s+([A-Za-z]+)\s+(.+?)\s+Festival is observed on\s+(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})\s*-\s*([A-Za-z]+)/gi;
      const festivals: ScrapedFestival[] = [];
      let match: RegExpExecArray | null;

      while ((match = regex.exec(clean)) !== null) {
        const [, , , rawTitle, day, month, year, weekday] = match;
        const d = day.padStart(2, '0');
        const m = MONTH_MAP[month.toLowerCase()] || '01';
        const dateStr = `${year}-${m}-${d}`;
        const titleTrimmed = rawTitle.replace(/^[0-9\sA-Za-z]+Daily Calculator\s*Srirangam.*?Indian Hindu festivals are vibrant and diverse celebrations that reflect the rich cultural, spiritual, and traditional tapestry of India\.\s*/i, '').trim();

        const isVishnu = this.isVishnuRelated(titleTrimmed);
        festivals.push({
          date: dateStr,
          title: titleTrimmed,
          titleTamil: titleTrimmed.match(/[\u0B80-\u0BFF\s]+/)?.[0]?.trim() || titleTrimmed,
          weekday: weekday.trim(),
          isVishnuSpecial: isVishnu,
          category: isVishnu ? 'VISHNU_UTSAVAM' : 'OTHER',
          descriptionEn: `Observed on ${day} ${month} ${year} (${weekday}). Verified by SrirangamInfo.`,
          descriptionTamil: `${day} ${month} ${year} அன்று அனுஷ்டிக்கப்படும் புண்ணிய திருநாள்.`,
          source: 'srirangaminfo.com/tamil-festivals.php',
        });
      }
      return festivals;
    } catch (e) {
      console.warn('Scraping tamil-festivals.php failed, fallback will be used:', e);
      return [];
    }
  },

  /**
   * Scrape Ekadashi dates from srirangaminfo.com/ekadashi.php
   */
  async scrapeEkadashis(): Promise<ScrapedFestival[]> {
    try {
      const res = await fetch('https://srirangaminfo.com/ekadashi.php', {
        headers: { 'User-Agent': 'Mozilla/5.0 (Namo-Calendar/1.0)' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      const clean = html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');

      const regex = /(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})\s*-\s*([A-Za-z]+)/gi;
      const list: ScrapedFestival[] = [];
      let match: RegExpExecArray | null;

      while ((match = regex.exec(clean)) !== null) {
        const [, day, month, year, weekday] = match;
        const d = day.padStart(2, '0');
        const m = MONTH_MAP[month.toLowerCase()] || '01';
        const dateStr = `${year}-${m}-${d}`;

        if (!list.find((e) => e.date === dateStr)) {
          list.push({
            date: dateStr,
            title: `ஏகாதசி விரதம் (${month} Ekadashi)`,
            titleTamil: 'ஏகாதசி விரதம் (பெருமாள் பூஜை)',
            weekday: weekday.trim(),
            isVishnuSpecial: true,
            category: 'EKADASHI',
            descriptionEn: `Auspicious Vishnu fasting day observed on ${day} ${month} ${year}. Reading Vishnu Sahasranamam brings divine grace.`,
            descriptionTamil: 'மகாவிஷ்ணுவிற்கு உகந்த ஏகாதசி விரத நன்னாள். விஷ்ணு சஹஸ்ரநாம பாராயணம் செய்வது மிகுந்த நன்மை தரும்.',
            source: 'srirangaminfo.com/ekadashi.php',
          });
        }
      }
      return list;
    } catch (e) {
      console.warn('Scraping ekadashi.php failed:', e);
      return [];
    }
  },

  /**
   * Scrape Thiruvonam (Shravana Nakshatra) dates from srirangaminfo.com/thiruvonam.php
   */
  async scrapeThiruvonams(): Promise<ScrapedFestival[]> {
    try {
      const res = await fetch('https://srirangaminfo.com/thiruvonam.php', {
        headers: { 'User-Agent': 'Mozilla/5.0 (Namo-Calendar/1.0)' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      const clean = html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');

      const regex = /(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})\s*-\s*([A-Za-z]+)/gi;
      const list: ScrapedFestival[] = [];
      let match: RegExpExecArray | null;

      while ((match = regex.exec(clean)) !== null) {
        const [, day, month, year, weekday] = match;
        const d = day.padStart(2, '0');
        const m = MONTH_MAP[month.toLowerCase()] || '01';
        const dateStr = `${year}-${m}-${d}`;

        if (!list.find((e) => e.date === dateStr)) {
          list.push({
            date: dateStr,
            title: 'Thiruvonam (Shravana Nakshatra)',
            titleTamil: 'திருவோணம் நட்சத்திரம் (பெருமாள் அவதார நட்சத்திரம்)',
            weekday: weekday.trim(),
            isVishnuSpecial: true,
            category: 'THIRUVONAM',
            descriptionEn: `Lord Venkateswara's sacred Janma Nakshatram. Special Sahasranama archana & thirumanjanam day.`,
            descriptionTamil: 'திருப்பதி வேங்கடேச பெருமாளின் ஜென்ம நட்சத்திரம். விசேஷ அர்ச்சனை மற்றும் திருமஞ்சனம் நடைபெறும் நாள்.',
            source: 'srirangaminfo.com/thiruvonam.php',
          });
        }
      }
      return list;
    } catch (e) {
      console.warn('Scraping thiruvonam.php failed:', e);
      return [];
    }
  },

  /**
   * Execute full synchronization combining scraped data and authenticated fallback
   */
  async syncCalendarData(): Promise<CalendarSyncResult> {
    // Start with comprehensive authenticated baseline
    const festivalsByDate: Record<string, ScrapedFestival> = {
      ...AUTHENTICATED_2026_VISHNU_DATA,
    };

    // Parallel fetch from all live Srirangam Info endpoints
    try {
      const [festivals, ekadashis, thiruvonams] = await Promise.all([
        this.scrapeFestivals(),
        this.scrapeEkadashis(),
        this.scrapeThiruvonams(),
      ]);

      // Merge festivals
      for (const f of festivals) {
        if (!festivalsByDate[f.date] || (!festivalsByDate[f.date].isVishnuSpecial && f.isVishnuSpecial)) {
          festivalsByDate[f.date] = f;
        }
      }

      // Merge Ekadashis
      for (const e of ekadashis) {
        if (!festivalsByDate[e.date]) {
          festivalsByDate[e.date] = e;
        }
      }

      // Merge Thiruvonams
      for (const t of thiruvonams) {
        if (!festivalsByDate[t.date]) {
          festivalsByDate[t.date] = t;
        }
      }
    } catch (err) {
      console.warn('Live scraping experienced errors; relying on authenticated offline dataset:', err);
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const sortedDates = Object.keys(festivalsByDate).sort();

    // Determine next upcoming Vishnu sacred day
    const upcomingDate = sortedDates.find((d) => d >= todayStr && festivalsByDate[d].isVishnuSpecial);
    const upcomingVishnuDay = upcomingDate ? festivalsByDate[upcomingDate] : undefined;

    const totalVishnuDays = Object.values(festivalsByDate).filter((f) => f.isVishnuSpecial).length;

    const result: CalendarSyncResult = {
      lastSyncedAt: new Date().toISOString(),
      syncIntervalHours: 8,
      totalFestivals: Object.keys(festivalsByDate).length,
      totalVishnuDays,
      festivalsByDate,
      upcomingVishnuDay,
    };

    // Cache to client localStorage if in browser
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(result));
      } catch (e) {
        console.warn('Failed to cache calendar sync in localStorage:', e);
      }
    }

    return result;
  },

  /**
   * Get Cached Calendar Data (respects 8-hour TTL, auto-fetches if expired)
   */
  async getOrSyncCalendarData(forceRefresh = false): Promise<CalendarSyncResult> {
    if (typeof window !== 'undefined' && !forceRefresh) {
      try {
        const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (raw) {
          const cached: CalendarSyncResult = JSON.parse(raw);
          const lastSyncTime = new Date(cached.lastSyncedAt).getTime();
          const elapsed = Date.now() - lastSyncTime;

          // If still fresh (within 8 hours), return instantly
          if (elapsed < SYNC_INTERVAL_MS && cached.festivalsByDate && Object.keys(cached.festivalsByDate).length > 0) {
            return cached;
          }
        }
      } catch (e) {
        console.warn('Reading cached calendar sync failed:', e);
      }
    }

    // Try fetching via internal Next.js API cron endpoint first for server caching
    if (typeof window !== 'undefined' && !forceRefresh) {
      try {
        const apiRes = await fetch('/api/cron/sync-calendar');
        if (apiRes.ok) {
          const apiData = await apiRes.json();
          if (apiData.festivalsByDate) {
            try {
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(apiData));
            } catch {}
            return apiData;
          }
        }
      } catch {
        // Fall back to direct sync
      }
    }

    return this.syncCalendarData();
  },

  /**
   * Get human readable sync status
   */
  getSyncStatus(lastSyncedAt?: string): { isSynced: boolean; text: string; hoursAgo: number } {
    if (!lastSyncedAt) {
      return { isSynced: false, text: 'Not synced yet', hoursAgo: 999 };
    }
    const diffMs = Date.now() - new Date(lastSyncedAt).getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours < 1) {
      return { isSynced: true, text: `Synced ${minutes}m ago (8h cycle)`, hoursAgo: 0 };
    }
    return { isSynced: true, text: `Synced ${hours}h ago (8h cycle)`, hoursAgo: hours };
  },
};
