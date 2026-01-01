import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class TaskAssignee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  taskId: string;

  @Column()
  userId: string;
}
