
const http = require("node:http");

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.OPENAI_API_KEY;

const WEBSITE = "https://inventorbl4ze.github.io";

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin;

  if (origin === WEBSITE) {
    res.setHeader("Access-Control-Allow-Origin", WEBSITE);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.end();
  }

  if (req.method === "GET" && req.url === "/health") {
    return res.end(JSON.stringify({
      status: "CYBERAI backend is running"
    }));
  }

  if (req.method !== "POST" || req.url !== "/token") {
    res.writeHead(404);
    return res.end(JSON.stringify({ error: "Not found" }));
  }

  if (origin !== WEBSITE) {
    res.writeHead(403);
    return res.end(JSON.stringify({ error: "Access denied" }));
  }

  if (!API_KEY) {
    res.writeHead(500);
    return res.end(JSON.stringify({
      error: "Server API key is not configured"
    }));
  }

  try {
    const response = await fetch(
      "https://api.openai.com/v1/realtime/client_secrets",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          expires_after: {
            seconds: 600
          },
          session: {
            type: "realtime",
            model: "gpt-realtime-2.1-mini",
            audio: {
              output: {
                voice: "marin"
              }
            },
            instructions:
              "You are CYBERAI, a helpful, friendly and professional AI assistant."
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      res.writeHead(response.status);
      return res.end(JSON.stringify({
        error: "Could not create voice session"
      }));
    }

    res.end(JSON.stringify({
      client_secret: data.client_secret.value
    }));

  } catch (error) {
    res.writeHead(500);
    res.end(JSON.stringify({
      error: "Backend connection failed"
    }));
  }
});

server.listen(PORT, () => {
  console.log(`CYBERAI backend running on port ${PORT}`);
});
                                 
