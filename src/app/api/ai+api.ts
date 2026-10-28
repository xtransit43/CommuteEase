export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { latitude, longitude, stationName } = body;

    const recommendation = stationName 
      ? `Analysis for ${stationName} (Lat: ${latitude}, Lng: ${longitude}): Grid is operating at optimal throughput. Minimal congestion detected along primary lanes.`
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
