import { ExpenseCategory } from '../types/expense';
import { PaymentMethod, Member, CommunityFunction } from '../types';
import { formatDateInput } from '../utils/formatters';

export interface ExpenseParsedData {
  amount?: string;
  category?: ExpenseCategory;
  description?: string;
  paymentMethod?: PaymentMethod;
  expenseDate?: string;
  notes?: string;
}

export interface IncomeParsedData {
  amount?: string;
  memberId?: string;
  memberName?: string;
  paymentMethod?: PaymentMethod;
  paymentDate?: string;
  notes?: string;
}

export interface MemberParsedData {
  fullName?: string;
  phone?: string;
  email?: string;
  role?: 'admin' | 'visitor';
  status?: 'active' | 'inactive';
}

export interface AssistantContext {
  activeFunction?: CommunityFunction | null;
  functions?: CommunityFunction[];
  members?: Member[];
  summary?: {
    totalContributions: number;
    totalExpenses: number;
    balance: number;
  };
}

export interface AssistantResponse {
  text: string;
  actionType?: 'create_expense' | 'create_income' | 'create_member' | 'query';
  actionData?: any;
  actionLabel?: string;
  route?: string;
  routeParams?: Record<string, string>;
}

// Category keywords for local NLP
const CATEGORY_KEYWORDS: Record<ExpenseCategory, string[]> = {
  food: [
    'food', 'lunch', 'dinner', 'breakfast', 'prasadam', 'prasadham', 'meals',
    'catering', 'sweets', 'tea', 'coffee', 'tiffin', 'annadhanam', 'saapadu',
    'milk', 'fruits', 'உணவு', 'பிரசாதம்', 'பழங்கள்'
  ],
  hall: [
    'hall', 'mandapam', 'marriage hall', 'community hall', 'kalyana mandapam',
    'stage rent', 'venue', 'அரங்கம்', 'மண்டபம்'
  ],
  decoration: [
    'decoration', 'flowers', 'poova', 'poo', 'garland', 'malai', 'panthal',
    'shamiana', 'flower', 'stage decoration', 'பூ', 'அலங்காரம்', 'பந்தல்'
  ],
  transportation: [
    'transport', 'transportation', 'bus', 'van', 'car', 'auto', 'travel',
    'petrol', 'diesel', 'driver', 'carriage', 'வண்டி', 'போக்குவரத்து'
  ],
  cultural_religious: [
    'pooja', 'puja', 'archana', 'homam', 'havan', 'priest', 'vadhyar', 'iyer',
    'bhattachar', 'camphor', 'agarbathi', 'dhoop', 'coconut', 'thengai',
    'thamboolam', 'saffron', 'kumkum', 'பூஜை', 'அர்ச்சனை', 'குருக்கள்'
  ],
  printing: [
    'print', 'printing', 'banner', 'poster', 'invitation', 'patrika', 'flex',
    'notice', 'பத்திரிக்கை', 'பேனர்', 'அச்சு'
  ],
  sound_system: [
    'sound', 'mic', 'microphone', 'speaker', 'audio', 'amplifier', 'mike set',
    'dj', 'ஒலிபெருக்கி'
  ],
  gifts: [
    'gift', 'gifts', 'memento', 'prize', 'shawl', 'ponnadai', 'presentation',
    'பரிசு', 'பொன்னாடை'
  ],
  utilities: [
    'utility', 'utilities', 'current bill', 'electricity', 'generator', 'water',
    'tank', 'cleaning', 'eb bill', 'மின்சாரம்', 'தண்ணீர்'
  ],
  miscellaneous: ['misc', 'miscellaneous', 'other', 'general', 'இதர'],
};

// Payment method keywords
const PAYMENT_KEYWORDS: Record<PaymentMethod, string[]> = {
  upi: ['upi', 'gpay', 'google pay', 'phonepe', 'phone pe', 'paytm', 'qr', 'online'],
  cash: ['cash', 'rokkam', 'panam', 'hand', 'ரொக்கம்', 'பணம்'],
  bank_transfer: ['bank', 'transfer', 'neft', 'imps', 'rtgs', 'account transfer', 'வங்கி'],
  other: ['cheque', 'check', 'காசோலை', 'other', 'dd', 'demand draft'],
};

class AiService {
  private geminiApiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
  // Groq is called server-side via Supabase Edge Function — no client key needed
  private readonly EDGE_FUNCTION_NAME = 'ai-assistant';

  /**
   * Parse speech input to extract expense form fields
   */
  public parseExpenseVoice(transcript: string): ExpenseParsedData {
    const text = transcript.toLowerCase();
    const result: ExpenseParsedData = {};

    // 1. Extract Amount
    const amountMatch = this.extractAmount(text);
    if (amountMatch) {
      result.amount = String(amountMatch);
    }

    // 2. Extract Category
    for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.some((k) => text.includes(k))) {
        result.category = cat as ExpenseCategory;
        break;
      }
    }
    if (!result.category) {
      result.category = 'miscellaneous';
    }

    // 3. Extract Payment Method
    for (const [method, keywords] of Object.entries(PAYMENT_KEYWORDS)) {
      if (keywords.some((k) => text.includes(k))) {
        result.paymentMethod = method as PaymentMethod;
        break;
      }
    }
    if (!result.paymentMethod) {
      result.paymentMethod = 'upi';
    }

    // 4. Description & Notes
    result.description = this.cleanTranscriptForDescription(transcript);
    result.notes = `Voice recorded: "${transcript}"`;
    result.expenseDate = formatDateInput(new Date());

    return result;
  }

  /**
   * Parse speech input to extract income / contribution form fields
   */
  public parseIncomeVoice(transcript: string, members: Member[] = []): IncomeParsedData {
    const text = transcript.toLowerCase();
    const result: IncomeParsedData = {};

    // 1. Extract Amount
    const amountMatch = this.extractAmount(text);
    if (amountMatch) {
      result.amount = String(amountMatch);
    }

    // 2. Extract Payment Method
    for (const [method, keywords] of Object.entries(PAYMENT_KEYWORDS)) {
      if (keywords.some((k) => text.includes(k))) {
        result.paymentMethod = method as PaymentMethod;
        break;
      }
    }
    if (!result.paymentMethod) {
      result.paymentMethod = 'upi';
    }

    // 3. Match Member
    const matchedMember = this.findMatchingMember(text, members);
    if (matchedMember) {
      result.memberId = matchedMember.id;
      result.memberName = matchedMember.full_name;
    }

    result.notes = `Voice recorded: "${transcript}"`;
    result.paymentDate = formatDateInput(new Date());

    return result;
  }

  /**
   * Parse speech input to extract member addition fields
   */
  public parseMemberVoice(transcript: string): MemberParsedData {
    const result: MemberParsedData = {
      role: 'visitor',
      status: 'active',
    };

    // 1. Phone number (10 digit indian phone or with +91)
    const phoneMatch = transcript.match(/(?:\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}/);
    if (phoneMatch) {
      result.phone = phoneMatch[0].replace(/[\s-+]/g, '').slice(-10);
    }

    // 2. Email
    const emailMatch = transcript.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
      result.email = emailMatch[0].toLowerCase();
    }

    // 3. Role
    const text = transcript.toLowerCase();
    if (text.includes('admin') || text.includes('manager')) {
      result.role = 'admin';
    } else {
      result.role = 'visitor';
    }

    // 4. Name extraction
    // Remove "add member", "member", phone, email from text to deduce full name
    let cleanName = transcript
      .replace(/add\s+(new\s+)?member/i, '')
      .replace(/member\s+name(\s+is)?/i, '')
      .replace(/phone(\s+number)?(\s+is)?/i, '')
      .replace(/mobile(\s+number)?(\s+is)?/i, '')
      .replace(/email(\s+is)?/i, '')
      .replace(/role(\s+is)?/i, '')
      .replace(/(?:\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}/g, '')
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '')
      .replace(/\b(admin|visitor|active|inactive)\b/gi, '')
      .trim();

    // Clean extraneous punctuation
    cleanName = cleanName.replace(/^[,\s:-]+|[,\s:-]+$/g, '').trim();

    if (cleanName.length > 1) {
      // Capitalize first letters
      result.fullName = cleanName
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    }

    return result;
  }

  /**
   * Assistant Conversational Intent Classifier & Dispatcher
   */
  public async processAssistantCommand(
    command: string,
    context: AssistantContext
  ): Promise<AssistantResponse> {
    const trimmed = command.trim();
    const lower = trimmed.toLowerCase();

    // 1. Build system prompt for AI (used by Edge Function)
    const systemPrompt = `
You are the AI Assistant for the 'Namo' Community Trust & Temple Finance Management mobile app.
Context:
- Active Function: ${context.activeFunction?.name || 'Annual Function'}
- Total Income: ₹${context.summary?.totalContributions || 0}
- Total Expenses: ₹${context.summary?.totalExpenses || 0}
- Net Balance: ₹${context.summary?.balance || 0}
- Registered Members: ${context.members?.slice(0, 15).map((m) => m.full_name).join(', ') || 'N/A'}

Your task:
Analyze the user's message (which may be in English, Tamil-English transliteration, or financial queries).
Output strictly valid JSON with this exact schema:
{
  "text": "friendly conversational response acknowledging the action or answering financial queries",
  "actionType": "create_expense" | "create_income" | "create_member" | "query",
  "actionLabel": "Open Expense Form" | "Open Income Form" | "Open Member Form" | null,
  "route": "/(admin)/expenses/add" | "/(admin)/contributions/add" | "/(admin)/members/add" | null,
  "routeParams": {
    "amount": "numeric string or empty",
    "category": "food | hall | decoration | transportation | cultural_religious | printing | sound_system | gifts | utilities | miscellaneous",
    "description": "brief description",
    "paymentMethod": "upi | cash | bank_transfer | other",
    "fullName": "member full name",
    "phone": "10-digit phone number if provided"
  }
}

Guidelines:
- If user wants to record an expense (spent, paid, bought, cost, etc.): set actionType to "create_expense", route to "/(admin)/expenses/add", actionLabel to "Open Expense Form", and populate amount, category, description, and paymentMethod.
- If user wants to record income or contribution (donation, received, paid contribution, etc.): set actionType to "create_income", route to "/(admin)/contributions/add", actionLabel to "Open Income Form", and populate amount and paymentMethod.
- If user wants to add a member: set actionType to "create_member", route to "/(admin)/members/add", actionLabel to "Open Member Form", and populate fullName, phone.
- If user is asking a question about balances, totals, functions, or members: set actionType to "query", and provide a clear, polite summary in the text field.
`;

    // Always attempt Edge Function first; falls back to local NLP if unavailable
    try {
      const groqReply = await this.queryGroq(trimmed, context, systemPrompt);
      if (groqReply) return groqReply;
    } catch (e) {
      console.warn('Groq query fallback to Gemini/Local NLP:', e);
    }

    // 2. If Gemini API key is configured, fallback to Gemini
    if (this.geminiApiKey) {
      try {
        const geminiReply = await this.queryGemini(trimmed, context);
        if (geminiReply) return geminiReply;
      } catch (e) {
        console.warn('Gemini query fallback to local NLP:', e);
      }
    }

    // --- High-Performance Local Intelligent NLP Engine ---

    // 1. Check for Financial Queries
    if (
      lower.includes('balance') ||
      lower.includes('how much') ||
      lower.includes('total') ||
      lower.includes('summary') ||
      lower.includes('status')
    ) {
      const tc = context.summary?.totalContributions ?? 0;
      const te = context.summary?.totalExpenses ?? 0;
      const bal = context.summary?.balance ?? (tc - te);
      const fnName = context.activeFunction?.name || 'Community';

      if (lower.includes('expense') || lower.includes('spent')) {
        return {
          text: `Total recorded expenses for ${fnName} are ₹${te.toLocaleString('en-IN')}.`,
          actionType: 'query',
        };
      }
      if (lower.includes('income') || lower.includes('contribution') || lower.includes('collected')) {
        return {
          text: `Total community income received is ₹${tc.toLocaleString('en-IN')}.`,
          actionType: 'query',
        };
      }
      return {
        text: `Financial Status for ${fnName}:\n• Total Income: ₹${tc.toLocaleString('en-IN')}\n• Total Expenses: ₹${te.toLocaleString('en-IN')}\n• Net Balance: ₹${bal.toLocaleString('en-IN')}`,
        actionType: 'query',
      };
    }

    // 2. Check for Expense Intent
    if (
      lower.includes('expense') ||
      lower.includes('spent') ||
      lower.includes('spend') ||
      lower.includes('paid for') ||
      lower.includes('bought') ||
      lower.includes('cost') ||
      lower.includes('செலவு')
    ) {
      const parsed = this.parseExpenseVoice(trimmed);
      const amountStr = parsed.amount ? `₹${Number(parsed.amount).toLocaleString('en-IN')}` : 'an amount';
      const catStr = parsed.category || 'general';

      return {
        text: `I've prepared the expense record of ${amountStr} under '${catStr}'. Click below to review and save.`,
        actionType: 'create_expense',
        actionLabel: 'Open Expense Form',
        actionData: parsed,
        route: '/(admin)/expenses/add',
        routeParams: {
          amount: parsed.amount || '',
          category: parsed.category || 'food',
          description: parsed.description || '',
          paymentMethod: parsed.paymentMethod || 'upi',
        },
      };
    }

    // 3. Check for Income / Contribution Intent
    if (
      lower.includes('income') ||
      lower.includes('contribution') ||
      lower.includes('donation') ||
      lower.includes('received') ||
      lower.includes('hundi') ||
      lower.includes('வரவு') ||
      lower.includes('நன்கொடை')
    ) {
      const parsed = this.parseIncomeVoice(trimmed, context.members);
      const amountStr = parsed.amount ? `₹${Number(parsed.amount).toLocaleString('en-IN')}` : 'an amount';
      const memberInfo = parsed.memberName ? ` from ${parsed.memberName}` : '';

      return {
        text: `I've prepared the income entry of ${amountStr}${memberInfo}. Click below to confirm and save.`,
        actionType: 'create_income',
        actionLabel: 'Open Income Form',
        actionData: parsed,
        route: '/(admin)/contributions/add',
        routeParams: {
          amount: parsed.amount || '',
          memberId: parsed.memberId || '',
          paymentMethod: parsed.paymentMethod || 'upi',
          notes: parsed.notes || '',
        },
      };
    }

    // 4. Check for Member Addition Intent
    if (
      lower.includes('member') ||
      lower.includes('user') ||
      lower.includes('person') ||
      lower.includes('உறுப்பினர்')
    ) {
      const parsed = this.parseMemberVoice(trimmed);
      const nameInfo = parsed.fullName ? ` '${parsed.fullName}'` : '';

      return {
        text: `I've prepared member details for${nameInfo}. Click below to review and add to the registry.`,
        actionType: 'create_member',
        actionLabel: 'Open Member Form',
        actionData: parsed,
        route: '/(admin)/members/add',
        routeParams: {
          fullName: parsed.fullName || '',
          phone: parsed.phone || '',
          email: parsed.email || '',
          role: parsed.role || 'visitor',
        },
      };
    }

    // 5. Default Helpful Greeting / Guidance
    return {
      text: `Namaste! I am your Namo AI Assistant. You can speak or type commands like:\n\n• "Spent 1500 for flowers cash"\n• "Received 2000 contribution from Suresh via UPI"\n• "Add member Karthik phone 9845123456"\n• "What is our current balance?"`,
      actionType: 'query',
    };
  }

  /**
   * Extract numeric amount from text
   */
  private extractAmount(text: string): number | null {
    // 1. Look for 'k' notation (e.g. 5k = 5000, 1.5k = 1500)
    const kMatch = text.match(/(\d+(?:\.\d+)?)\s*k\b/i);
    if (kMatch) {
      return Math.round(parseFloat(kMatch[1]) * 1000);
    }

    // 2. Look for thousand(s) (e.g. 10 thousand = 10000)
    const thousandMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:thousand|ஆயிரம்)/i);
    if (thousandMatch) {
      return Math.round(parseFloat(thousandMatch[1]) * 1000);
    }

    // 3. Look for explicit currency / rs / rupees / ₹ / ரூபாய்
    const currencyMatch = text.match(/(?:rs|inr|₹|rupees|ரூபாய்)\.?\s*([\d,]+(?:\.\d+)?)/i);
    if (currencyMatch) {
      const cleaned = currencyMatch[1].replace(/,/g, '');
      const val = parseFloat(cleaned);
      if (!isNaN(val)) return val;
    }

    // 4. Look for numbers preceding rupees/rs
    const postCurrencyMatch = text.match(/([\d,]+(?:\.\d+)?)\s*(?:rs|rupees|bucks|ரூபாய்)/i);
    if (postCurrencyMatch) {
      const cleaned = postCurrencyMatch[1].replace(/,/g, '');
      const val = parseFloat(cleaned);
      if (!isNaN(val)) return val;
    }

    // 5. General standalone number in sentence
    const numMatch = text.match(/\b\d{2,7}\b/);
    if (numMatch) {
      const val = parseInt(numMatch[0], 10);
      if (!isNaN(val)) return val;
    }

    return null;
  }

  /**
   * Find matching member by name from local members list
   */
  private findMatchingMember(text: string, members: Member[]): Member | null {
    if (!members || members.length === 0) return null;

    // Direct substring search
    for (const m of members) {
      const name = m.full_name.toLowerCase();
      if (text.includes(name)) {
        return m;
      }
    }

    // Partial first name search
    for (const m of members) {
      const parts = m.full_name.toLowerCase().split(' ');
      for (const part of parts) {
        if (part.length > 3 && text.includes(part)) {
          return m;
        }
      }
    }

    return null;
  }

  private cleanTranscriptForDescription(transcript: string): string {
    let clean = transcript
      .replace(/(?:spent|spend|paid|cost|expense|for|rupees|rs|inr|cash|upi|via)\b/gi, '')
      .replace(/\d+/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!clean) return transcript;
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  }

  /**
   * Optional Gemini API integration
   */
  private async queryGemini(
    command: string,
    context: AssistantContext
  ): Promise<AssistantResponse | null> {
    try {
      const prompt = `
You are the AI Assistant for the 'Namo' Community Trust & Temple Finance Management mobile app.
Context:
- Active Function: ${context.activeFunction?.name || 'Annual Function'}
- Total Income: ₹${context.summary?.totalContributions || 0}
- Total Expenses: ₹${context.summary?.totalExpenses || 0}
- Net Balance: ₹${context.summary?.balance || 0}
- Members: ${context.members?.slice(0, 10).map((m) => m.full_name).join(', ') || 'N/A'}

User Input: "${command}"

Respond strictly with valid JSON with the following structure:
{
  "text": "friendly conversational response or answers to queries",
  "actionType": "create_expense" | "create_income" | "create_member" | "query",
  "route": "/(admin)/expenses/add" | "/(admin)/contributions/add" | "/(admin)/members/add" | null,
  "routeParams": {
    "amount": "number string or empty",
    "category": "food | hall | decoration | transportation | cultural_religious | printing | sound_system | gifts | utilities | miscellaneous",
    "description": "text",
    "paymentMethod": "upi | cash | bank_transfer | cheque",
    "fullName": "member name",
    "phone": "phone"
  }
}
`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
        }
      );

      if (!response.ok) return null;
      const data = await response.json();
      const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!content) return null;

      const parsed = JSON.parse(content);
      return {
        text: parsed.text,
        actionType: parsed.actionType,
        route: parsed.route || undefined,
        routeParams: parsed.routeParams || undefined,
        actionLabel:
          parsed.actionType === 'create_expense'
            ? 'Open Expense Form'
            : parsed.actionType === 'create_income'
            ? 'Open Income Form'
            : parsed.actionType === 'create_member'
            ? 'Open Member Form'
            : undefined,
      };
    } catch {
      return null;
    }
  }

  /**
   * Calls the Groq AI via a secure Supabase Edge Function.
   * The Groq API key is stored only as a server-side Edge Function secret.
   */
  private async queryGroq(
    message: string,
    context: AssistantContext,
    systemPrompt: string
  ): Promise<AssistantResponse | null> {
    try {
      const { supabase } = await import('./supabase');
      const { data, error } = await supabase.functions.invoke(this.EDGE_FUNCTION_NAME, {
        body: {
          message,
          context: {
            activeFunction: context.activeFunction,
            summary: context.summary,
            functionCount: context.functions?.length ?? 0,
            memberCount: context.members?.length ?? 0,
          },
          systemPrompt,
        },
      });

      if (error) {
        console.warn('Edge Function error (falling back to local NLP):', error.message);
        return null;
      }

      if (!data?.text) {
        return null;
      }

      return {
        text: data.text,
        actionType: data.actionType,
        actionData: data.actionData,
        actionLabel: data.actionLabel,
        route: data.route,
        routeParams: data.routeParams,
      } as AssistantResponse;
    } catch (e) {
      console.warn('queryGroq Edge Function exception (falling back to local NLP):', e);
      return null;
    }
  }
}

export const aiService = new AiService();
