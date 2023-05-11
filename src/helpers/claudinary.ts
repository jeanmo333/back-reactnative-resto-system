import * as dotenv from "dotenv";
dotenv.config();
import { v2 as cloudinary } from "cloudinary";
cloudinary.config(process.env.CLOUDINARY_URL || "");

export async function uploadFileClaudinary(
  rutaImagen: string,
  carpeta: string
) {
  const options = {
    folder: carpeta, // Especifica la subcarpeta donde se subirá la imagen
  };

  // Sube la imagen a Cloudinary
  const result = await cloudinary.uploader.upload(rutaImagen, options);

  return result.secure_url; // Muestra la información de la imagen subida
}

export async function destroyImageClaudinary(public_id: string) {
  await cloudinary.uploader.destroy(public_id);
}

export const folderNameApp = "Resto_native_system";

export const folderNameUsers = "Users";

export const folderNamePlates = "Plates";
