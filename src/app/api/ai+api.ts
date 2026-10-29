import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
  try {
    const { latitude, longitude, stationName, brand, vehicleType, stationCount } = await request.json();

    if (!latitude || !longitude || !stationName) {
      return Response.json({ error: 'Missing station metadata' }, { status: 400 });
    }

    // Craft a cyberpunk terminal-themed prompt for Gemini 1.5 Flash
    const prompt = `
      You are CommuteEase's core AI telemetry system operating in a cyberpunk terminal environment.
      Provide a concise, highly tactical 2-3 sentence route assessment and recommendation for a driver 
      operating a [${vehicleType?.toUpperCase() || 'GAS'}] vehicle heading towards the following target node:
      
      - Station Name: ${stationName}
      - Brand/Operator: ${brand || 'Independent Node'}
      - Coordinates: Lat ${latitude}, Lng ${longitude}
      - Total Detected Nodes in Sector: ${stationCount || 'Unknown'}

      Keep the tone sharp, professional, futuristic, and actionable. Avoid generic filler.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
    });

    const recommendation = response.text || 'Telemetry link unstable. Proceed with caution.';

    return Response.json({ success: true, recommendation }, { status: 200 });
  } catch (error: any) {
    console.error('Gemini AI API Error:', error);
    return Response.json({ error: 'Failed to generate AI telemetry assessment.' }, { status: 500 });
  }
}
