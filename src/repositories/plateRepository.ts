import { AppDataSource } from "../data-source";
import { Plate } from "../entities/Plate";

export const plateRepository = AppDataSource.getRepository(Plate);
