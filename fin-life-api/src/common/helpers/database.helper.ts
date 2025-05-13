import { ValueTransformer } from 'typeorm';

export const transformer: ValueTransformer = {
  to: (value: number) => value,
  from: (value: string) => parseFloat(value)
};
