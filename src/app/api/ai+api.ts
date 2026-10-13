export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { latitude, longitude, vehicleType, stationCount } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: 'Gemini API key not configured on server' }, { status: 500 });
    }

    const prompt = `You are an expert commute assistant for the CommuteEase app. 
    The user is driving a ${vehicleType === 'ev' ? 'Electric Vehicle (EV)' : 'Gas-powered'} vehicle, located at coordinates (${latitude}, ${longitude}). 
    There are ${stationCount} compatible stations found within a 5km radius. 
    Provide a concise, helpful, natural-language recommendation (max 3 sentences) on whether they should proceed or stop for service based on this data.`;

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