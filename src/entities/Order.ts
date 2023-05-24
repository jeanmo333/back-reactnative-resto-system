import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./User";
import { Detail } from "./Detail";
import { Address } from "./Address";

@Entity("orders")
export class Order {
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

  @Column("float", {
    default: 0,
  })
  total: number;

  @Column("float", {
    default: 0,
  })
  profit: number;

  @Column("text", {
    default: "RECIBIDO",
  })
  status: string;

  @Column("text", {
    default: "",
  })
  idPayment: string;

  @OneToMany(() => Detail, (detail) => detail.order, {
    cascade: true,
  })
  @JoinTable()
  details: Detail[];

  @ManyToOne(() => User, (user) => user.order, { eager: true })
  user: Partial<User>;

  @ManyToOne(() => Address, (address) => address.order, { eager: true })
  address: Partial<Address>;
}
