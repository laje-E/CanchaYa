import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { router } from "./routes.js";

const app = express();
const allowed = (process.env.FRONTEND_URL || "http://localhost:5173").split(",").map(s => s.trim());
app.use(helmet());
app.use(cors({ origin: (origin, callback) => {
  if (!origin || allowed.includes(origin)) callback(null, true);
  else callback(new Error("Origen no permitido por CORS."));
}}));
app.use(express.json({ limit:"20kb" }));
app.use("/api/auth", rateLimit({ windowMs:15*60*1000, limit:30, standardHeaders:true, legacyHeaders:false }));
app.use("/api", router);
const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`CanchaYa API escuchando en puerto ${port}`));
