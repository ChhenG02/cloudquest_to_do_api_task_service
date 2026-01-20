// task.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, Index } from "typeorm";
import { TaskStatus } from "./task-status.enum";

@Entity()
@Index(["boardId", "status", "position"]) 
export class Task {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  boardId: string;

  @Column()
  name: string;

  @Column({
    type: "enum",
    enum: TaskStatus,
    default: TaskStatus.TODO,
  })
  status: TaskStatus;

  @Column({ type: "int", default: 0 })
  position: number;
}
