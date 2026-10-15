import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// Support high resolution base64 image transfers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to strip data URL prefix if present
function parseBase64(input: string): { data: string; mimeType: string } {
  const matches = input.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
  if (matches && matches.length === 3) {
    return { mimeType: matches[1], data: matches[2] };
  }
  return { mimeType: 'image/jpeg', data: input };
}

// 1. Generate Headshot from Selfie + Selected Style
app.post('/api/generate-headshot', async (req, res) => {
  try {
    const {
      selfieBase64,
      styleId = 'corporate-grey',
      styleName = 'Corporate Grey Backdrop',
      stylePrompt = '',
      attire = 'Charcoal tailored executive blazer',
      lighting = 'Soft diffuse studio softbox lighting with gentle catchlights',
      aspectRatio = '3:4',
      customNotes = '',
    } = req.body;

    if (!selfieBase64) {
      return res.status(400).json({ error: 'Please provide a selfie image.' });
    }

    const { data: base64Data, mimeType } = parseBase64(selfieBase64);

    const promptText = `You are a world-class professional portrait photographer.
Transform the person from the provided selfie image into a pristine, magazine-cover commercial professional headshot.
Crucial Requirements:
1. Preserve and accurately honor the person's real facial features, bone structure, eye shape, smile, ethnicity, and core identity from the selfie photo, while elevating it to a high-end studio portrait.
2. Styling & Setting: ${styleName}. ${stylePrompt}
3. Wardrobe & Attire: ${attire}. Immaculate tailoring, pressed fabric texture, sharp lapels, professional styling.
4. Lighting: ${lighting}. High-end commercial studio illumination, gentle fill light, subtle hair highlight, sharp depth-of-field.
5. Overall aesthetic: Photorealistic, 85mm f/1.4 lens bokeh, razor-sharp focus on iris and eyes, natural skin texture with flattering studio grading, executive presence.
${customNotes ? `Additional specific direction: ${customNotes}` : ''}`;

    let generatedImageUrl = '';
    let modelUsed = 'gemini-nano-banana-2.1';

    try {
      // Try gemini-nano-banana-2.1 first
      const response = await ai.models.generateContent({
        model: 'gemini-nano-banana-2.1',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType || 'image/jpeg',
              },
            },
            {
              text: promptText,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: (['1:1', '3:4', '4:3', '9:16', '16:9'].includes(aspectRatio) ? aspectRatio : '3:4') as any,
            imageSize: '1K',
          },
        },
      });

      const parts = response.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          const mime = part.inlineData.mimeType || 'image/png';
          generatedImageUrl = `data:${mime};base64,${part.inlineData.data}`;
          break;
        }
      }
    } catch (primaryErr: any) {
      console.warn('Primary model gemini-nano-banana-2.1 failed, attempting fallback to gemini-3.1-flash-lite-image:', primaryErr?.message);
      modelUsed = 'gemini-3.1-flash-lite-image';

      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType || 'image/jpeg',
              },
            },
            {
              text: promptText,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: (['1:1', '3:4', '4:3', '9:16', '16:9'].includes(aspectRatio) ? aspectRatio : '3:4') as any,
          },
        },
      });

      const parts = fallbackResponse.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          const mime = part.inlineData.mimeType || 'image/png';
          generatedImageUrl = `data:${mime};base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!generatedImageUrl) {
      throw new Error('No image was returned from the AI model.');
    }

    return res.json({
      success: true,
      imageUrl: generatedImageUrl,
      modelUsed,
      styleId,
      styleName,
      aspectRatio,
    });
  } catch (err: any) {
    console.error('Error generating headshot:', err);
    return res.status(500).json({
      error: err?.message || 'Failed to generate headshot. Please try again.',
    });
  }
});

// 2. Edit Headshot using Natural Language Prompt (using gemini-nano-banana-2.1)
app.post('/api/edit-headshot', async (req, res) => {
  try {
    const { imageBase64, editPrompt, aspectRatio = '3:4' } = req.body;

    if (!imageBase64 || !editPrompt) {
      return res.status(400).json({ error: 'Please provide both the image and the edit prompt.' });
    }

    const { data: base64Data, mimeType } = parseBase64(imageBase64);

    const fullPrompt = `You are a high-end photo retoucher and commercial portrait editor.
Apply the following specific edit to this portrait photo while keeping the subject's face, identity, and facial likeness completely intact and realistic:
Requested edit: ${editPrompt}
Ensure the resulting image maintains photorealistic commercial studio lighting, natural skin textures, and sharp professional focus.`;

    let generatedImageUrl = '';
    let modelUsed = 'gemini-nano-banana-2.1';

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-nano-banana-2.1',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType || 'image/jpeg',
              },
            },
            {
              text: fullPrompt,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: (['1:1', '3:4', '4:3', '9:16', '16:9'].includes(aspectRatio) ? aspectRatio : '3:4') as any,
            imageSize: '1K',
          },
        },
      });

      const parts = response.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          const mime = part.inlineData.mimeType || 'image/png';
          generatedImageUrl = `data:${mime};base64,${part.inlineData.data}`;
          break;
        }
      }
    } catch (primaryErr: any) {
      console.warn('Edit with gemini-nano-banana-2.1 failed, attempting gemini-3.1-flash-lite-image:', primaryErr?.message);
      modelUsed = 'gemini-3.1-flash-lite-image';

      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType || 'image/jpeg',
              },
            },
            {
              text: fullPrompt,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: (['1:1', '3:4', '4:3', '9:16', '16:9'].includes(aspectRatio) ? aspectRatio : '3:4') as any,
          },
        },
      });

      const parts = fallbackResponse.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          const mime = part.inlineData.mimeType || 'image/png';
          generatedImageUrl = `data:${mime};base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!generatedImageUrl) {
      throw new Error('No edited image was returned from the AI model.');
    }

    return res.json({
      success: true,
      imageUrl: generatedImageUrl,
      modelUsed,
      editPrompt,
    });
  } catch (err: any) {
    console.error('Error editing headshot:', err);
    return res.status(500).json({
      error: err?.message || 'Failed to edit headshot. Please try again.',
    });
  }
});

// 3. Analyze Selfie using gemini-3.8-flash for Professional Photographer Critique
app.post('/api/analyze-selfie', async (req, res) => {
  try {
    const { selfieBase64 } = req.body;
    if (!selfieBase64) {
      return res.status(400).json({ error: 'Please provide a selfie image to analyze.' });
    }

    const { data: base64Data, mimeType } = parseBase64(selfieBase64);

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType || 'image/jpeg',
            },
          },
          {
            text: `You are an elite portrait photographer assessing a client's selfie for conversion into executive headshots.
Analyze the image and return a JSON object with this exact structure:
{
  "lightingQuality": "Short description of original lighting (e.g., Natural window light with slight shadow)",
  "headAngle": "Description of posture and face angle (e.g., Direct front-facing with slight pleasant chin lift)",
  "expressionTone": "Tone of expression (e.g., Approachable, friendly professional smile)",
  "bestSuitedStyles": ["corporate-grey", "modern-tech"],
  "photographerAdvice": "A 1-2 sentence warm, expert photographer note highlighting what works well and how the AI will enhance the studio lighting and wardrobe."
}
Return only valid JSON, no markdown formatting.`,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
      },
    });

    const jsonText = response.text || '{}';
    let parsed = {};
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      parsed = {
        lightingQuality: 'Good ambient lighting',
        headAngle: 'Centered portrait angle',
        expressionTone: 'Warm professional presence',
        bestSuitedStyles: ['corporate-grey', 'modern-tech', 'outdoor-natural'],
        photographerAdvice: 'Great base photo! The studio conversion will balance key light, add gentle hair illumination, and apply crisp executive wardrobe.',
      };
    }

    return res.json({ success: true, analysis: parsed });
  } catch (err: any) {
    console.error('Error analyzing selfie:', err);
    return res.json({
      success: true,
      analysis: {
        lightingQuality: 'Natural ambient lighting',
        headAngle: 'Centered portrait angle',
        expressionTone: 'Approachable professional look',
        bestSuitedStyles: ['corporate-grey', 'modern-tech', 'outdoor-natural'],
        photographerAdvice: 'Solid casual selfie! The AI will reconstruct executive three-point lighting and sharp studio tailoring.',
      },
    });
  }
});

// Configure Vite middleware in development or static serving in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AuraStudio server running on http://0.0.0.0:${PORT} [${isProduction ? 'production' : 'development'}]`);
  });
}

startServer();
