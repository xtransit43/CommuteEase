export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      latitude, 
      longitude, 
      vehicleType, 
      stationType, 
      stationName, 
      brand, 
      stationCount = 4 
    } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: 'Gemini API key not configured on server' }, { status: 500 });
    }

    // Determine fuel/vehicle type label
    const typeLabel = stationType || vehicleType || 'gas';
    const formattedType = typeLabel === 'ev' ? 'Electric Vehicle (EV) charging' : 'Gas';
    const displayBrand = brand ? ` (${brand})` : '';

    const prompt = `You are an expert commute assistant for the CommuteEase app. 
    The user has selected the following ${formattedType} station:
    - Target Node: ${stationName || 'Unknown Station'}${displayBrand}
    - Coordinates: (${latitude}, ${longitude})
    - Local Density: ${stationCount} compatible nodes found within a 5km radius. 
    
    Provide a concise, helpful, natural-language recommendation (max 3 sentences) on whether they should stop at this specific station or continue along their route.`;

    const aiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const aiData = await aiResponse.json();
    const recommendation =
      aiData?.candidates?.[0]?.content?.parts?.[0]?.text ||
      'Your route looks clear! Proceed with standard travel precautions.';

    return Response.json({ recommendation }, { status: 200 });
  } catch (error: any) {
    console.error('AI Insights error:', error);
    return Response.json({ error: 'Failed to generate commute insights' }, { status: 500 });
  }
}
