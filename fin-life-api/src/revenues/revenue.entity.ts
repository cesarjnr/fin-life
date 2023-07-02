import { AfterLoad, BeforeInsert, Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { User } from '../users/user.entity';

@Entity('revenues')
export class Revenue {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'date' })
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
  @Index('revenues_user_id_idx')
  userId?: number;

  @ManyToOne(() => User, (user) => user.revenues)
  @JoinColumn({ name: 'user_id', foreignKeyConstraintName: 'revenues_user_id_fkey' })
  user?: User;

  @BeforeInsert()
  public convertValueToCents(): void {
    this.value = Number((Number(this.value.toFixed(2)) * 100).toFixed(2));
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
