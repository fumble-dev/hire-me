import express from "express";
import "dotenv/config";
import userRoutes from "./routes/user.js";

const app = express();

app.use(express.json())

app.use('/api/user',userRoutes)

app.listen(process.env.PORT, () => {
  console.log(
    `user service is running on http://localhost:${process.env.PORT}`
  );
});
