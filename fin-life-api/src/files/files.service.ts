import { Injectable } from '@nestjs/common';
import { parse } from 'csv-parse';

@Injectable()
export class FilesService {
  public async readCsvFile<T>(file: Express.Multer.File): Promise<T[]> {
    const results: T[] = [];

    return new Promise((resolve, reject) => {
      parse(file.buffer, { columns: true, trim: true })
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (error) => reject(error));
    });
  }
}
