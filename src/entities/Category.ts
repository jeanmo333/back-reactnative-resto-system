import { IsBoolean, IsOptional, IsString, MinLength } from "class-validator";
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
//import { Product } from './Product';
import { User } from "./User";
import { Plate } from "./Plate";

@Entity("categories")
export class Category {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @CreateDateColumn({
    name: "created_at",
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: "updated_at",
  })
  updateAt: Date;

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
