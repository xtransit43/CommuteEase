export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { latitude, longitude, stationName, vehicleType } = body;

    // Optional: If you want to use live Gemini API insights, set GEMINI_API_KEY in Vercel environment variables
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const prompt = stationName
          ? `Provide a short, terminal-style traffic and charging/fuel recommendation for a ${vehicleType || 'vehicle'} heading to ${stationName} at coordinates Lat: ${latitude}, Lng: ${longitude}. Keep it concise and under 2 sentences.`
          : `Provide a short, terminal-style traffic insight for coordinates Lat: ${latitude}, Lng: ${longitude}. Keep it concise and under 2 sentences.`;

        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });

        const geminiData = await geminiResponse.json();
        const aiText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (aiText) {
          return Response.json({
            success: true,
            recommendation: aiText.trim(),
          });
        }
      } catch (geminiErr) {
        console.warn('Gemini API fetch failed, falling back to built-in telemetry:', geminiErr);
      }
    }

    // Fallback Mock AI Response (if no API key is provided yet)
    const recommendation = stationName 
      ? `Analysis for ${stationName} (Lat: ${latitude}, Lng: ${longitude}): Grid is operating at optimal throughput. Minimal congestion detected along primary transit lanes.`
      : `General Telemetry (Lat: ${latitude}, Lng: ${longitude}): Normal traffic conditions observed. Recommended to maintain standard cruising velocity.`;

    return Response.json({
      success: true,
      recommendation,
    });
  } catch (error: any) {
    return Response.json(
      { error: 'Failed to generate AI insights.' },
      { status: 500 }
    );
  }
}
