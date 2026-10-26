import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

export async function geospatial(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Geospatial API processed request for url "${request.url}"`);

    // Extract lat and lng from query parameters (e.g., /api/geospatial?lat=37.7749&lng=-122.4194)
    const lat = request.query.get('lat');
    const lng = request.query.get('lng');

    if (!lat || !lng) {
        return {
            status: 400,
            jsonBody: { error: "Latitude and longitude query parameters are required" }
        };
    }

    // You can integrate real geospatial/routing logic or third-party APIs here later
    const geospatialData = {
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        zoneStatus: "Optimal",
        trafficDelayMinutes: 4,
        alternativeRouteAvailable: true,
        timestamp: new Date().toISOString()
    };

    return {
        status: 200,
        jsonBody: { geospatialData }
    };
}

app.http('geospatial', {
    methods: ['GET'],
    authLevel: 'anonymous', // Publicly accessible for your Netlify frontend
    handler: geospatial
});