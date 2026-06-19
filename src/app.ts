import express from "express";
import cors from "cors";
import routes from "./routes";
import homeRoutes from "./routes/home.routes";
import { errorHandler } from "./middleware/errorHandler";
import { env } from "./config/env";

const app = express();

app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true,
  })
);
app.use(express.json());
app.use(homeRoutes);
app.use("/api", routes);
app.use(errorHandler);

export default app;
