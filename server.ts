import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import { createHash, randomBytes, randomInt, timingSafeEqual } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use('/photos', express.static(path.resolve(__dirname, 'photos')));

const otpChallenges = new Map<string, { codeHash: string; email: string; expiresAt: number; nextSendAt: number; attempts: number }>();
const authSessions = new Map<string, { phone: string; email: string; expiresAt: number }>();
const hashSecret = (value: string) => createHash('sha256').update(value).digest('hex');
const normalizeKenyanPhone = (value: unknown) => {
  const digits = String(value || '').replace(/\D/g, '');
  if (/^254[17]\d{8}$/.test(digits)) return `+${digits}`;
  if (/^0[17]\d{8}$/.test(digits)) return `+254${digits.slice(1)}`;
  if (/^[17]\d{8}$/.test(digits)) return `+254${digits}`;
  return null;
};
const readCookie = (header: string | undefined, name: string) => {
  const value = header?.split(';').map(part => part.trim()).find(part => part.startsWith(`${name}=`));
  return value ? decodeURIComponent(value.slice(name.length + 1)) : null;
};

app.post('/api/auth/send-code', async (req, res) => {
  const phone = normalizeKenyanPhone(req.body?.phone);
  const email = String(req.body?.email || '').trim().toLowerCase();
  if (!phone) return res.status(400).json({ error: 'Enter a valid Kenyan mobile number.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Enter a valid email address.' });
  const username = process.env.AT_USERNAME;
  const smsKey = process.env.AT_API_KEY;
  if (!username || !smsKey) return res.status(503).json({ error: 'SMS login is not configured. Set AT_USERNAME and AT_API_KEY on the server.' });

  const previous = otpChallenges.get(phone);
  if (previous && previous.nextSendAt > Date.now()) {
    return res.status(429).json({ error: `Wait ${Math.ceil((previous.nextSendAt - Date.now()) / 1000)} seconds before requesting another code.` });
  }

  const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
  const fields = new URLSearchParams({
    username,
    to: phone,
    message: `Your UniThread login code is ${code}. It expires in 5 minutes. Do not share this code.`
  });
  if (process.env.AT_SENDER_ID) fields.set('from', process.env.AT_SENDER_ID);

  try {
    const baseUrl = username.toLowerCase() === 'sandbox'
      ? 'https://api.sandbox.africastalking.com'
      : 'https://api.africastalking.com';
    const response = await fetch(`${baseUrl}/version1/messaging`, {
      method: 'POST',
      headers: { apiKey: smsKey, Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
      body: fields
    });
    const body = await response.json().catch(() => ({})) as { SMSMessageData?: { Recipients?: Array<{ statusCode?: number }> }; errorMessage?: string };
    const accepted = body.SMSMessageData?.Recipients?.some(recipient => [100, 101, 102].includes(recipient.statusCode || 0));
    if (!response.ok || !accepted) {
      console.error('Africa’s Talking rejected an OTP message:', response.status, body.errorMessage || 'No recipient accepted');
      return res.status(502).json({ error: 'The SMS provider could not send your code. Check the phone number and SMS account configuration.' });
    }
    otpChallenges.set(phone, { codeHash: hashSecret(`${phone}:${code}`), email, expiresAt: Date.now() + 5 * 60_000, nextSendAt: Date.now() + 60_000, attempts: 0 });
    return res.json({ sent: true, phone, expiresInSeconds: 300, resendInSeconds: 60 });
  } catch (error) {
    console.error('Africa’s Talking request failed:', error);
    return res.status(502).json({ error: 'Could not reach the SMS provider. Try again shortly.' });
  }
});

app.post('/api/auth/verify-code', (req, res) => {
  const phone = normalizeKenyanPhone(req.body?.phone);
  const email = String(req.body?.email || '').trim().toLowerCase();
  const code = String(req.body?.code || '').trim();
  if (!phone || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\d{6}$/.test(code)) return res.status(400).json({ error: 'Enter your email and the six-digit code sent to your phone.' });
  const challenge = otpChallenges.get(phone);
  if (!challenge || challenge.expiresAt < Date.now()) {
    otpChallenges.delete(phone);
    return res.status(400).json({ error: 'That code has expired. Request a new one.' });
  }
  if (challenge.attempts >= 5) {
    otpChallenges.delete(phone);
    return res.status(429).json({ error: 'Too many incorrect attempts. Request a new code.' });
  }
  if (challenge.email !== email) return res.status(400).json({ error: 'Use the same email address you entered before requesting the SMS code.' });
  challenge.attempts += 1;
  const expected = Buffer.from(challenge.codeHash, 'hex');
  const supplied = Buffer.from(hashSecret(`${phone}:${code}`), 'hex');
  if (!timingSafeEqual(expected, supplied)) return res.status(400).json({ error: 'That code does not match. Check the SMS and try again.' });

  otpChallenges.delete(phone);
  const token = randomBytes(32).toString('hex');
  authSessions.set(token, { phone, email, expiresAt: Date.now() + 8 * 60 * 60_000 });
  const secure = req.secure || req.headers['x-forwarded-proto'] === 'https' ? '; Secure' : '';
  res.setHeader('Set-Cookie', `unithread_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=28800${secure}`);
  return res.json({ authenticated: true, phone });
});

app.get('/api/auth/session', (req, res) => {
  const token = readCookie(req.headers.cookie, 'unithread_session');
  const session = token ? authSessions.get(token) : undefined;
  if (!token || !session || session.expiresAt < Date.now()) {
    if (token) authSessions.delete(token);
    return res.status(401).json({ authenticated: false });
  }
  return res.json({ authenticated: true, phone: session.phone, email: session.email });
});

app.post('/api/auth/logout', (req, res) => {
  const token = readCookie(req.headers.cookie, 'unithread_session');
  if (token) authSessions.delete(token);
  res.setHeader('Set-Cookie', 'unithread_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0');
  return res.json({ authenticated: false });
});

// Initialize Google GenAI client if key is available
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. Trade Evaluation & Fairness AI Endpoint
app.post('/api/ai/evaluate-trade', async (req, res) => {
  try {
    const { offeredItem, requestedItem, pointsBonus = 0 } = req.body;

    if (!offeredItem || !requestedItem) {
      return res.status(400).json({ error: 'Missing offeredItem or requestedItem' });
    }

    if (!aiClient) {
      // Intelligent fallback when API key is not yet set
      const estOffered = offeredItem.estMarketValue || 2500;
      const estRequested = requestedItem.estMarketValue || 3000;
      const diff = estRequested - (estOffered + (pointsBonus * 20));
      
      let verdict = 'Balanced Exchange';
      let fairnessScore = 94;
      let pointsAdjustment = 0;

      if (diff > 800) {
        verdict = 'Sweeten the deal with +20-30 Virtual Exchange Points';
        fairnessScore = 78;
        pointsAdjustment = Math.round(diff / 30);
      } else if (diff < -800) {
        verdict = 'High-value offer! Generous exchange for the requester';
        fairnessScore = 96;
        pointsAdjustment = 0;
      }

      return res.json({
        fairnessScore,
        verdict,
        fabricComparison: `${offeredItem.fabric || 'Cotton blend'} vs ${requestedItem.fabric || 'Synthetic/Cotton'}: Both provide strong durability for Kenyan campus daily routines and laundry endurance.`,
        recommendedPointsAdjustment: pointsAdjustment,
        stylingTip: `Pair the ${requestedItem.title} with campus casual layers and clean kicks for UoN / Strathmore lecture halls.`,
        sustainabilityPerk: 'Trading in this campus cycle saves textile waste and avoids fast fashion imported runoff.'
      });
    }

    const prompt = `You are a Kenyan campus student wardrobe swap & textile evaluation specialist.
Evaluate this peer-to-peer wardrobe exchange between two college students in Kenya:

Item Offered:
- Title: ${offeredItem.title}
- Brand: ${offeredItem.brand}
- Category: ${offeredItem.category}
- Condition: ${offeredItem.condition}
- Fabric/Material: ${offeredItem.fabric} (${offeredItem.fabricWeight || 'Medium'} weight)
- Est. Value: KSh ${offeredItem.estMarketValue || 'Unknown'}

Item Requested in Return:
- Title: ${requestedItem.title}
- Brand: ${requestedItem.brand}
- Category: ${requestedItem.category}
- Condition: ${requestedItem.condition}
- Fabric/Material: ${requestedItem.fabric} (${requestedItem.fabricWeight || 'Medium'} weight)
- Est. Value: KSh ${requestedItem.estMarketValue || 'Unknown'}

Points Bonus offered: ${pointsBonus} virtual exchange points (10 pts ≈ KSh 200 trade utility).

Respond ONLY with valid JSON in this exact structure:
{
  "fairnessScore": 92,
  "verdict": "string summarizing if trade is fair, slightly uneven, or great",
  "fabricComparison": "string 1-2 sentences comparing fabric quality, wash durability, and comfort for campus life in Kenya",
  "recommendedPointsAdjustment": 0,
  "stylingTip": "string 1 sentence with outfit pairing advice for campus",
  "sustainabilityPerk": "string highlighting circular thrift fashion benefit in Kenya"
}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.error('Trade evaluation error:', err);
    return res.status(500).json({
      error: 'Failed to evaluate trade',
      fairnessScore: 88,
      verdict: 'Fair campus exchange with mutual wardrobe utility',
      fabricComparison: 'Both garments are durable for active campus lifestyle.',
      recommendedPointsAdjustment: 0,
      stylingTip: 'Great casual combination for lecture halls and quad hangouts.',
    });
  }
});

// 2. Fabric Quality & Longevity Advisor Endpoint
app.post('/api/ai/fabric-advisor', async (req, res) => {
  try {
    const { title, fabric, condition, washCare } = req.body;

    if (!aiClient) {
      return res.json({
        fabricScore: 92,
        durabilityRating: 'High Endurance',
        handFeel: 'Substantial, breathable texture with structured drape',
        maintenanceTips: 'Cold gentle wash inside out, flat or hang dry to preserve weave integrity and prevent shrinkage.',
        campusVibe: 'Ideal for transitioning from cold library desks to brisk quad walks.'
      });
    }

    const prompt = `You are a textile quality and eco-fashion engineer for college students.
Inspect this garment:
- Title: ${title}
- Fabric: ${fabric}
- Condition: ${condition}
- Care: ${washCare || 'Standard wash'}

Provide an assessment in JSON format:
{
  "fabricScore": 88,
  "durabilityRating": "High Endurance / Moderate Wear / Delicate Heritage",
  "handFeel": "Brief sensory description of fabric feel and weight",
  "maintenanceTips": "Best dorm laundry practices for this fabric",
  "campusVibe": "How this piece functions in campus student daily life"
}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.error('Fabric advisor error:', err);
    return res.json({
      fabricScore: 85,
      durabilityRating: 'Substantial Campus Grade',
      handFeel: 'Authentic collegiate weight with durable weave',
      maintenanceTips: 'Wash cold with similar colors; air drying extends shoe/garment lifespan by 2x.',
      campusVibe: 'Versatile campus daily driver.',
    });
  }
});

// 3. AI Smart Match Recommendations for Closet Swaps
app.post('/api/ai/recommend-matches', async (req, res) => {
  try {
    const { myItems, targetItems } = req.body;

    if (!aiClient) {
      return res.json({
        recommendation: 'Top mutual swap matches identified based on size alignment and style vibes.',
        suggestedPairs: [
          {
            myitemId: myItems?.[0]?.id,
            targetItemId: targetItems?.[0]?.id,
            reason: 'High style complementarity: vintage streetwear for classic sneakers.',
            compatibilityScore: 95
          }
        ]
      });
    }

    const prompt = `Given these student wardrobe items:
My Items: ${JSON.stringify((myItems || []).slice(0, 5).map((i: any) => ({ id: i.id, title: i.title, category: i.category, size: i.size, brand: i.brand })))}
Campus Community Items: ${JSON.stringify((targetItems || []).slice(0, 8).map((i: any) => ({ id: i.id, title: i.title, category: i.category, size: i.size, brand: i.brand, lookingFor: i.lookingFor })))}

Analyze mutual trade potential. Return JSON:
{
  "recommendation": "Summary sentence of the best campus style synergy",
  "suggestedPairs": [
    {
      "myitemId": "id string",
      "targetItemId": "id string",
      "reason": "1 sentence why this swap makes great sense for both students",
      "compatibilityScore": 94
    }
  ]
}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.error('Match recommendation error:', err);
    return res.json({
      recommendation: 'Recommended mutual swaps based on verified campus wardrobe styles.',
      suggestedPairs: []
    });
  }
});

// 4. Campus Wardrobe & Swap AI Chatbot
app.post('/api/ai/chatbot', async (req, res) => {
  try {
    const { message, campus = 'University of Nairobi', vibes = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!aiClient) {
      const msg = message.toLowerCase();
      let reply = "Sasa! I'm UniBot, your campus wardrobe swap assistant. I can help with styling, fabric quality checks, M-Pesa Binance-style verification, and safe campus meetups!";

      if (msg.includes('mpesa') || msg.includes('m-pesa') || msg.includes('payment') || msg.includes('verify') || msg.includes('binance') || msg.includes('screenshot')) {
        reply = "Here is how our Binance-style M-Pesa verification works:\n1. The buyer sends M-Pesa directly to the seller's phone or till.\n2. The buyer uploads a screenshot of the official Safaricom M-Pesa message along with the transaction code (e.g. SJD82LK190).\n3. The seller checks their M-Pesa account balance and clicks 'Payment Verified & Confirmed'.\n4. Both students set a confirmed campus exchange date and safe handover spot!";
      } else if (msg.includes('jewel') || msg.includes('chain') || msg.includes('ring') || msg.includes('cuff') || msg.includes('bracelet')) {
        reply = "For Kenyan campus drip, layer a chunky stainless steel Cuban chain or handcrafted brass Maasai cuff with a boxy heavyweight tee. Add signet rings on your index and ring finger for that effortlessly curated thrift look!";
      } else if (msg.includes('bag') || msg.includes('tote') || msg.includes('backpack')) {
        reply = "A heavy-canvas zipped tote or a Carhartt crossbody bag is a student essential: durable enough for lecture notes and laptops, while perfectly matching vintage denim or tracksuits!";
      } else if (msg.includes('clean') || msg.includes('laundry') || msg.includes('wash') || msg.includes('hygiene') || msg.includes('rating') || msg.includes('quality')) {
        reply = "UniThreads holds a strict Cleanliness Pledge! Items must be freshly laundered and odor-free before exchange. When you swap, rate your peer on Cleanliness, Fabric Quality, and Punctuality to boost their badge and unlock bonus virtual points!";
      } else if (msg.includes('meetup') || msg.includes('safe') || msg.includes('location') || msg.includes('spot') || msg.includes('date')) {
        reply = `For ${campus}, always schedule your exchange at well-lit, populated campus hubs like the main library steps, student center cafeteria, or central quad during daylight hours!`;
      } else if (msg.includes('thrift') || msg.includes('mitumba') || msg.includes('drip') || msg.includes('fit')) {
        reply = "Vintage mitumba pieces have unmatched character! Look out for 350+ GSM heavyweight fleece, double-needle stitching, and pure cotton canvas for longevity that survives college life.";
      }

      return res.json({ reply });
    }

    const systemPrompt = `You are UniBot, a friendly and savvy Kenyan campus wardrobe advisor and peer-to-peer swap guide for UniThreads.
You help university students at University of Nairobi, Strathmore, KU, JKUAT, USIU, and Daystar exchange streetwear, sneakers, vintage mitumba grails, jewelry, and bags.
You speak warm, natural English with occasional Kenyan campus flavor (subtle Sheng words like 'Sasa', 'grail', 'luku', 'fit check').
Key topics you master:
- Explaining the Binance P2P-style M-Pesa payment and screenshot verification flow.
- Recommending outfits, matching jewelry (chains, rings, bracelets) and bags (totes, backpacks).
- Fabric care, hostel laundry tips, and hygiene ratings (cleanliness, fabric quality, punctuality).
- Safe campus meetup locations during daylight.
User's Campus: ${campus}
User's Style Vibes: ${(Array.isArray(vibes) ? vibes.join(', ') : '') || 'Streetwear & Mitumba'}

User message: ${message}`;

    const response = await aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: systemPrompt,
    });

    const reply = response.text || "I'm here to help you style your fit or verify your campus swap!";
    return res.json({ reply });
  } catch (err: any) {
    console.error('Chatbot error:', err);
    return res.json({
      reply: "Sasa! Feel free to ask about campus styling, jewelry pairing, M-Pesa Binance verification, or safe meetup spots!"
    });
  }
});

// Vite middleware or production static
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`UniThread server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
