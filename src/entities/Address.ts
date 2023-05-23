import { IsInt, IsOptional, IsPositive, IsString } from "class-validator";
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
import { User } from "./User";
import { Order } from "./Order";

@Entity("addresses")
export class Address {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @IsString()
  @Column("text")
  title: string;

  @IsString()
  @Column("text")
  street: string;

  @IsString()
  @Column("text")
  number: string;

  @IsString()
  @Column("text")
  city: string;

  @IsString()
  @Column("text")
  phone: string;

  @IsString()
  @Column("text")
  commune: string;

  @IsString()
  @Column("text")
  country: string;

  @IsString()
  @Column("text")
  firstname: string;

  @IsString()
  @Column("text")
  lastname: string;

  @ManyToOne(() => User, (user) => user.address, { eager: true })
  user: Partial<User>;

  @OneToMany(() => Order, (order) => order.address)
  order?: Order;

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
