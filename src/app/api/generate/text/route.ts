import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { imageBase64, promptName, apiKey } = await request.json();

    if (!apiKey) {
      return NextResponse.json({ error: 'API key is required' }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `You are an expert e-commerce copywriter and SEO specialist for luxury jewelry brands.
Based on the provided jewelry image and the target photography style ("${promptName}"), generate a highly conversion-optimized product title and description.
The description should include: Materials, Features, Craftsmanship, Style, Occasion, and Target audience.
Keep it concise and marketing-friendly.

Return your response as a JSON object exactly in this format:
{
  "title": "SEO-friendly Product Title (Max 60 chars)",
  "description": "Professional product description..."
}`;

    const match = imageBase64.match(/^data:(image\/\w+);base64,/);
    const mimeType = match ? match[1] : 'image/jpeg';
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: systemInstruction },
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
      }
    });

    const resultText = response.text || "{}";
    const resultJson = JSON.parse(resultText);

    return NextResponse.json({
      title: resultJson.title,
      description: resultJson.description
    });
  } catch (error: any) {
    console.error('Error generating text:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate text' }, { status: 500 });
  }
}
