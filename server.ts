import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API endpoint for "Oracle of the Aegis" - Gemini AI powered Dota Lore Assistant
  app.post("/api/oracle", async (req, res) => {
    try {
      const { prompt, tiContext } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        return res.status(200).json({
          response: "The Aegis Oracle requires a valid GEMINI_API_KEY configured in secrets. However, as an ancient Dota historian, I can tell you that The International's lore is built on legendary plays like the Dream Coil at TI3, The Play at TI2, the 6-Million Dollar Echo Slam at TI5, and OG's back-to-back miracle run at TI8 & TI9!",
          isFallback: true
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const systemInstruction = `You are the "Oracle of the Aegis", an elite, passionate, and deeply knowledgeable Dota 2 esports historian and archivist. You know everything about The International (TI1 through TI13), including draft strategies, caster iconic quotes, roster shuffles, player lore (Dendi, Puppey, KuroKy, s4, SumaIL, N0tail, Ceb, Yatoro, Collapse, etc.), metas (Fountain Hook, Split Push, Deathball, Buyback Meta, Carry Io, Magnus Skewer), and prize pools. Respond eloquently in the tone of a wise, ancient Dota grimoire archivist. Keep responses structured, concise, and engaging with bullet points and bold highlights.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      return res.json({
        response: response.text || "The Oracle peers into the Aegis of Champions but sees only swirling mist..."
      });
    } catch (error: any) {
      console.error("Error calling Gemini API in Oracle endpoint:", error);
      return res.status(500).json({
        error: "The Oracle was disrupted by an unexpected spell.",
        details: error.message
      });
    }
  });

  // Vite middleware setup for development vs static serve for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
