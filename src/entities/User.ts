import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from "class-validator";
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import generarId from "../helpers/generarId";
import { Category } from "./Category";
import { Plate } from "./Plate";
import { Address } from "./Address";
import { Order } from "./Order";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @IsString()
  @IsEmail()
  @Column("text", {
    unique: true,
  })
  email: string;

  @CreateDateColumn({
    name: "created_at",
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: "updated_at",
  })
  updateAt: Date;

  @IsString()
  @MinLength(6, { message: "password minimo 6 caracteres" })
  // @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
  //   message: "password Uppercase, lowercase, number",
  // })
  @Column("text")
  password: string;

  @IsString()
  @MinLength(1)
  @Column("text")
  name: string;

  @IsOptional()
  @IsBoolean()
  @Column("bool", {
    default: false,
  })
  isActive: boolean;

  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  @Column("text", {
    array: true,
    default: ["client"],
  })
  roles: string[];

  @IsString()
  @Column("text", {
    default: generarId(),
  })
  token: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @Column("text", {
    default: "",
  })
  phone: string;

  @IsOptional()
  @IsString()
  @Column("text", {
    default: "",
  })
  image: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @Column("text", {
    default: "",
  })
  lastname: string;

  @OneToMany(() => Plate, (plate) => plate.user)
  plate: Plate;

  @OneToMany(() => Category, (category) => category.user)
  category: Category;

  @OneToMany(() => Address, (address) => address.user)
  address: Address;

  @OneToMany(() => Order, (order) => order.user)
  order: Order;

  @BeforeInsert()
  checkFieldsBeforeInsert() {
    this.email = this.email.toLowerCase().trim();
  }

  @BeforeUpdate()
  checkFieldsBeforeUpdate() {
    this.checkFieldsBeforeInsert();
  }
}
