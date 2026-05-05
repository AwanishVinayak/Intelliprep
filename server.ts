import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Mock for SDE Score calculation (could be more complex later)
  app.post("/api/calculate-sde-score", (req, res) => {
    const { githubCommits, leetcodeSolved, difficultyWeight } = req.body;
    // Simple logic: weighted sum
    const score = (githubCommits * 0.1) + (leetcodeSolved * 0.5) * difficultyWeight;
    res.json({ score: Math.min(100, Math.round(score)) });
  });

  // Handle Vite in dev or static files in production
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
