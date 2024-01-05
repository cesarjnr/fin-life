'use client'

import { ControllerRenderProps, FieldErrors } from 'react-hook-form';

export interface TextInputProps {
  errors?: FieldErrors;
  field?: ControllerRenderProps;
  name: string;
  placeholder?: string;
};

export default function TextInput({ errors, field, name, placeholder }: TextInputProps) {
  const error = errors?.[name];

  return (
    <div className="flex flex-col gap-2">
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
      {error && (
        <span className="inline-block ms-3.5 text-xs text-[#d32f2f]">
          {error.message as string}
        </span>
      )}
    </div>
  );
}
