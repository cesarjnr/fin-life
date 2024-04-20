import { ControllerRenderProps } from 'react-hook-form';
import { NumericFormat } from 'react-number-format';

export interface NumberInputProps {
  disabled?: boolean;
  error?: string;
  field?: ControllerRenderProps;
  initialValue?: string;
  placeholder?: string;
}

export default function NumberInput({ error, field, placeholder }: NumberInputProps) {
  let fieldProps = {};

  if (field) {
    fieldProps = { ...field, ref: undefined };
  }

  return (
    <NumericFormat
      {...fieldProps}
      className={`
        bg-white/[.03]
        p-4
        border-transparent
        rounded-xl
        text-sm
        text-white/40
        ${error && 'input-error'}
      `}
      getInputRef={field?.ref}
      placeholder={placeholder}
    />
  );
}