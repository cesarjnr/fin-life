'use client'

import { ControllerRenderProps } from 'react-hook-form';

export interface TextInputProps {
  error?: string;
  field?: ControllerRenderProps;
  placeholder?: string;
};

export default function TextInput({ error, field, placeholder }: TextInputProps) {
  return (
      <input
        className={`
          bg-white/[.03]
          p-4
          border-transparent
          rounded-xl
          text-sm
          text-white/40
          ${error && 'input-error'}
        `
        }
        placeholder={placeholder}
        {...field}
      />
  );
}
