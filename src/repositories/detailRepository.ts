import { AppDataSource } from "../data-source";
import { Detail } from "../entities/Detail";

export const detailRepository = AppDataSource.getRepository(Detail);
