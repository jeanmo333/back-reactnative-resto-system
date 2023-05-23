import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Plate } from "./Plate";
import { Order } from "./Order";

@Entity()
export class Detail {
  @PrimaryGeneratedColumn("uuid")
  id?: string;

  @Column("int", {
    default: 0,
  })
  quantity?: number;

  @Column("float", {
    default: 0,
  })
  subtotal: number;

  @ManyToOne(() => Plate, (plate) => plate.detail, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  plate: Partial<Plate>;

  @ManyToOne(() => Order, (order) => order.details, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  order: Order;
}
