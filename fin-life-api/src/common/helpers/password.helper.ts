import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcrypt';

@Injectable()
export class PasswordHelper {
  public async generateHash(password: string): Promise<string> {
    const rounds = 10;

    return await hash(password, rounds);
  }

  public async compareHash(password: string, passwordToCompare: string): Promise<boolean> {
    return compare(password, passwordToCompare);
  }
}
