'use client'

import { Control, Controller, ControllerRenderProps, FieldErrors } from 'react-hook-form';

export interface TextInputProps {
  control?: Control<any>;
  errors?: FieldErrors;
  name: string;
  placeholder: string;
};

export default function TextInput({ control, errors, name, placeholder }: TextInputProps) {
  const error = errors?.[name];

  console.log(error);

  const renderInput = (field?: ControllerRenderProps) => (
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

  return control ? 
    <Controller
      control={control}
      name={name}
      render={({ field }) => renderInput(field)}
      rules={{ required: `${placeholder} é obrigatório`, minLength: { value: 10, message: `Mínimo de 10 caracteres` } }}
    /> :
    renderInput();
}
