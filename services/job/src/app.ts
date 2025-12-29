import express from "express";
import dotenv from "dotenv";
import jobRoutes from "./routes/job";
import cors from "cors";
dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/job", jobRoutes);

export default app;
