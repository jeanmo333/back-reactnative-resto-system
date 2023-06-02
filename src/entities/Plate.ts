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
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Category } from "./Category";
// import { Detail } from './Detail';
import { User } from "./User";
import { Detail } from "./Detail";

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

  @CreateDateColumn({
    name: "created_at",
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: "updated_at",
  })
  updateAt: Date;

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

  @IsOptional()
  @IsString()
  @Column("text", {
    default: "",
  })
  image: string;

  @ManyToOne(() => Category, (category) => category.plate, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  category: Partial<Category>;

  @OneToMany(() => Detail, (detail) => detail.plate)
  detail?: Detail;

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
