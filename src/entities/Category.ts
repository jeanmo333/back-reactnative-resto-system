import { IsBoolean, IsOptional, IsString, MinLength } from "class-validator";
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
//import { Product } from './Product';
import { User } from "./User";
import { Plate } from "./Plate";

@Entity("categories")
export class Category {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @IsString()
  @MinLength(1)
  @Column("text", {
    unique: true,
  })
  name: string;

  @IsOptional()
  @IsString()
  @Column({
    type: "text",
    nullable: true,
  })
  description: string;

  // @IsOptional()
  // @IsString()
  // @Column("text", {
  //   default: "",
  // })
  // image: string;

  @IsOptional()
  @IsBoolean()
  @Column("bool", {
    default: true,
  })
  isActive: boolean;

  @OneToMany(() => Plate, (plate) => plate.category)
  plate?: Plate;

  @ManyToOne(() => User, (user) => user.category, { eager: true })
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
