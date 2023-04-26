import { ICategory } from "./category";
import { ISupplier } from "./supplier";

export interface IProduct {
    _id?            : string;
    name            : string;
    description?    : string;
    purchase_price  : number;
    sale_price      : number;
    inStock         : number;
    isActive?       : boolean;
    category?       : string;
    supplier?        : string;
    user?           : string;
    createdAt?      : string;
    updatedAt?      : string;


  }