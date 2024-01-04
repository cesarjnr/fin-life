'use client'

import { Control, Controller, ControllerRenderProps } from 'react-hook-form';

export interface TextInputProps {
  control?: Control<any>;
  name: string;
  placeholder: string;
};

export default function TextInput({ control, name, placeholder }: TextInputProps) {
  const renderInput = (field?: ControllerRenderProps) => (
    <input
      className="
        bg-white/[.03]
        p-4
        border-transparent
        rounded-xl
        text-sm
        text-white/40
      "
      placeholder={placeholder}
      {...field}
    />
  );

  return control ? 
    <Controller
      control={control}
      name={name}
      render={({ field }) => renderInput(field)}
    /> :
    renderInput();
}
