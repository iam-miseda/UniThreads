import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

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
    console.log(`UniThread server running on http://localhost:${PORT} (or http://127.0.0.1:${PORT})`);
  });
}

startServer();
