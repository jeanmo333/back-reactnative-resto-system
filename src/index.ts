import "express-async-errors";
import express from "express";
import logger from "morgan";
import cors from "cors";
import { AppDataSource } from "./data-source";
import { errorMiddleware } from "./middlewares/error";
import userRoutes from "./routes/userRoutes";

AppDataSource.initialize().then(() => {
  const PORT = process.env.PORT || 3000;
  const app = express();

  app.use(logger("dev"));
  app.use(express.json());
  app.use(cors());
  app.set("port", PORT);
  app.use("/api/users", userRoutes);

  app.use(errorMiddleware);

  // app.listen(PORT, () => {
  //   console.log(`Server listening on port: ${PORT}`);
  // });

  app.listen(4000, "192.168.1.4" || "localhost", function () {
    console.log("Aplicacion de NodeJS " + PORT + " Iniciada...");
  });
});
