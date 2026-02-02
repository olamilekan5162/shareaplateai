import "dotenv/config";
import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";
import { trackGemini } from "opik-gemini";
import { matchFood, logMatchOutcome } from "./routes/matching.js";
import {
  getUserGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  getGoalProgress,
} from "./routes/goals.js";
import {
  recordClaim,
  recordExpiration,
  getMetrics,
} from "./routes/outcomes.js";

const app = express();
app.use(cors());
app.use(express.json());

const genAI = trackGemini(
  new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  }),
);

// Legacy generate endpoint
app.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    await genAI.flush();

    res.json({ text: result.text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gemini error" });
  }
});

// Food Matching Agent endpoints
app.post("/api/match/recommend", matchFood);
app.post("/api/match/outcome", logMatchOutcome);

// Goals endpoints
app.get("/api/goals/:userId", getUserGoals);
app.post("/api/goals", createGoal);
app.put("/api/goals/:goalId", updateGoal);
app.delete("/api/goals/:goalId", deleteGoal);
app.get("/api/goals/:userId/progress", getGoalProgress);

// Outcomes endpoints
app.post("/api/outcomes/claim", recordClaim);
app.post("/api/outcomes/expire", recordExpiration);
app.get("/api/outcomes/metrics", getMetrics);

app.listen(3001, () => {
  console.log("🤖 AI server running on http://localhost:3001");
});
