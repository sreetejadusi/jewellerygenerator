import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { imageBase64, promptText, apiKey } = await request.json();

    if (!apiKey) {
      return NextResponse.json({ error: 'API key is required' }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const match = imageBase64.match(/^data:(image\/\w+);base64,/);
    const mimeType = match ? match[1] : 'image/jpeg';
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    // Step 1: Describe the jewelry perfectly using Gemini 2.5 Flash
    const describeInstruction = `Analyze this jewelry piece in extreme, meticulous detail. Describe its exact shape, gemstone placement, metal finish, engravings, textures, proportions, and colors. Do not include any background details. Be as specific as possible to recreate it perfectly.`;
    
    const descriptionResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: describeInstruction },
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              }
            }
          ]
        }
      ]
    });
    
    const jewelryDescription = descriptionResponse.text;

    // Step 2: Generate the image using Imagen 3
    const finalPrompt = `[JEWELRY DESCRIPTION TO REPLICATE EXACTLY: ${jewelryDescription}]\n\n[PHOTOGRAPHY INSTRUCTIONS: ${promptText}]`;

    const imageResponse = await ai.models.generateImages({
      model: 'imagen-3.0-generate-002',
      prompt: finalPrompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '1:1',
      }
    });

    const generatedBase64 = imageResponse.generatedImages?.[0]?.image?.imageBytes;

    if (!generatedBase64) {
      throw new Error("No image returned from Imagen API");
    }

    return NextResponse.json({
      imageUrl: `data:image/jpeg;base64,${generatedBase64}`
    });
  } catch (error: any) {
    console.error('Error generating image:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate image' }, { status: 500 });
  }
}
