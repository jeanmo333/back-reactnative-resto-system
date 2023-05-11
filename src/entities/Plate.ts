//import { User } from '../../products/entities/product.entity';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from "class-validator";
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Category } from "./Category";
// import { Detail } from './Detail';
// import { Supplier } from './Supplier';
import { User } from "./User";

@Entity("plates")
export class Plate {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @IsString({ message: "must be a string" })
  @MinLength(1, { message: "minimo un caracter" })
  @Column("text", {
    unique: true,
  })
  name: string;

  @IsString()
  @Column({
    type: "text",
  })
  description: string;

  @IsNumber()
  @IsOptional()
  @IsPositive()
  @Column("float", {
    default: 0,
  })
  prepared_price: number;

  @IsNumber()
  @IsOptional()
  @IsPositive()
  @Column("float", {
    default: 0,
  })
  sale_price: number;

  @IsInt()
  @IsPositive()
  @IsOptional()
  @Column("int", {
    default: 0,
  })
  stock: number;

  @IsOptional()
  @IsBoolean()
  @Column("bool", {
    default: true,
  })
  isActive: boolean;

  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  @Column("text", {
    array: true,
    default: [""],
  })
  images: string[];

  // @IsOptional()
  // @IsString()
  // @Column("text", {
  //   default: "",
  // })
  // image1: string;

  // @IsOptional()
  // @IsString()
  // @Column("text", {
  //   default: "",
  // })
  // image2: string;

  // @IsOptional()
  // @IsString()
  // @Column("text", {
  //   default: "",
  // })
  // image3: string;

  @ManyToOne(() => Category, (category) => category.plate, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  category: Category;

  // @ManyToOne(() => Supplier, (supplier) => supplier.product)
  // supplier: Supplier;

  // @OneToMany(() => Detail, ( detail) =>  detail.product)
  // detail?: Detail;

  @ManyToOne(() => User, (user) => user.plate, { eager: true })
  user: Partial<User>;

  @BeforeInsert()
  checkNameInsert() {
    this.name = this.name.toLowerCase();
  }

  @BeforeUpdate()
  checkNameUpdate() {
    this.name = this.name.toLowerCase();
  }
}
