import { AfterLoad, BeforeInsert, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { User } from '../users/user.entity';

@Entity('revenues')
export class Revenue {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  date: Date;

  @Column()
  description: string;

  @Column({ name: 'destiny_institution', comment: 'Institution where the amount has been received' })
  destinyInstitution: string;

  @Column()
  source: string;

  @Column()
  value: number;

  @Column({ name: 'user_id' })
  userId?: number;

  @ManyToOne(() => User, (user) => user.revenues)
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @BeforeInsert()
  public convertValueToCents(): void {
    this.value = this.value * 100;
  }

  @AfterLoad()
  public convertValueToReais(): void {
    this.value = this.value / 100;
  }

  constructor(
    date: Date,
    description: string,
    destinyInstitution: string,
    source: string,
    value: number,
    userId: number
  ) {
    this.date = date;
    this.description = description;
    this.destinyInstitution = destinyInstitution;
    this.source = source;
    this.value = value;
    this.userId = userId;
  }
}
