import { ValueTransformer } from 'typeorm';

export const transformer: ValueTransformer = {
  to: (value: number) => value,
  from: (value: string) => (value ? parseFloat(value) : value)
};
