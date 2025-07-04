import { Portfolio } from './portfolio.dto';

export interface User {
  id: number;
  email: string;
  name: string;
  portfolios: Portfolio[];
}
