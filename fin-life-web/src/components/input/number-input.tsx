import { ControllerRenderProps, FieldErrors } from 'react-hook-form';
import { NumericFormat } from 'react-number-format';

export interface NumberInputProps {
  errors?: FieldErrors;
  field?: ControllerRenderProps;
  name: string;
  placeholder?: string;
}

export default function NumberInput({ errors, field, name, placeholder }: NumberInputProps) {
  let fieldProps = {};

  if (field) {
    fieldProps = { ...field, ref: undefined };
  }

  return (
    <NumericFormat
      {...fieldProps}
      className="
        bg-white/[.03]
        p-4
        border-transparent
        rounded-xl
        text-sm
        text-white/40
      "
      getInputRef={field?.ref}
      placeholder={placeholder}
    />
  );
}