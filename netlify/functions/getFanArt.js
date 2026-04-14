// netlify/functions/getFanArt.js

exports.handler = async (event, context) => {
  // 1. Get the IMDb ID from the URL parameters
  const { id } = event.queryStringParameters;
  
  // Your FanArt.tv API Key
  const API_KEY = "cf862773b90fd45c922fc9ca16ad49b2"; 
  const BASE_URL = `https://webservice.fanart.tv/v3.2/movies/${id}?api_key=${API_KEY}`;

  // 2. Safety check: Ensure an ID was actually sent
  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing IMDb ID parameter" }),
    };
  }

  try {

    console.log(`Received request for IMDb ID: ${id}`);
    // 3. Perform the fetch from Node.js (Node 18+ includes global fetch)
    const response = await fetch(BASE_URL);

    console.log(`Fetching FanArt for IMDb ID: ${id} - Status: ${response.status}`);

    if (!response.ok) {
      return { 
        statusCode: response.status, 
        body: JSON.stringify({ error: `FanArt API responded with ${response.status}` }) 
      };
    }

    const data = await response.json();

    // 4. Return the data to your React app with clean CORS headers
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // This fixes the CORS error
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, OPTION"
      },
      body: JSON.stringify(data),
    };

  } catch (error) {
    console.error("Function Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error", message: error.message }),
    };
  }
};