import "express-async-errors";
import express from "express";
import logger from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import fileUpload from "express-fileupload";
import { AppDataSource } from "./data-source";
import { errorMiddleware } from "./middlewares/error";
import userRoutes from "./routes/userRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import plateRoutes from "./routes/plateRoutes";
import addressRoutes from "./routes/addressRoutes";
import orderRoutes from "./routes/orderRoutes";

AppDataSource.initialize().then(() => {
  const PORT = process.env.PORT || 3000;
  const app = express();

  app.use(logger("dev"));
  app.use(express.json());
  dotenv.config();
  app.use(cors());

  //carga de archivo
  app.use(
    fileUpload({
      useTempFiles: true,
      tempFileDir: "/tmp/",
      createParentPath: true,
    })
  );
  app.set("port", PORT);
  app.use("/api/users", userRoutes);
  app.use("/api/categories", categoryRoutes);
  app.use("/api/plates", plateRoutes);
  app.use("/api/addresses", addressRoutes);
  app.use("/api/orders", orderRoutes);

  app.use(errorMiddleware);

  app.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}`);
  });
});
