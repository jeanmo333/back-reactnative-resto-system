/** @format */

export default async function asyncForeach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

// import { Response } from "express";

// export default async function asyncForeach(
//   array: string | any[],
//   callback: {
//     (archive: any): Promise<Response<any, Record<string, any>> | undefined>;
//     (arg0: any, arg1: number, arg2: any): any;
//   }
// ) {
//   for (let index = 0; index < array.length; index++) {
//     await callback(array[index], index, array);
//   }
// }
