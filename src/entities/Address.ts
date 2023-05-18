import { IsInt, IsOptional, IsPositive, IsString } from "class-validator";
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./User";

@Entity("addresses")
export class Address {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @IsOptional()
  @IsString()
  @Column("text")
  title: string;

  @IsOptional()
  @IsString()
  @Column("text")
  street: string;

  @IsString()
  @IsOptional()
  @Column("text")
  number: string;

  @IsOptional()
  @IsString()
  @Column("text")
  city: string;

  @IsOptional()
  @IsString()
  @Column("text")
  phone: string;

  @IsOptional()
  @IsString()
  @Column("text")
  state: string;

  @IsOptional()
  @IsString()
  @Column("text")
  country: string;

  @ManyToOne(() => User, (user) => user.address, { eager: true })
  user: Partial<User>;

  @CreateDateColumn({
    name: "created_at",
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: "updated_at",
  })
  updateAt: Date;

  @BeforeInsert()
  checkNameInsert() {
    this.title = this.title.toLowerCase();
  }

  @BeforeUpdate()
  checkNameUpdate() {
    this.title = this.title.toLowerCase();
  }
}
