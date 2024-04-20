import { ControllerRenderProps } from 'react-hook-form';
import { NumericFormat } from 'react-number-format';

interface CurrencyInputProps {
  disabled?: boolean;
  error?: string;
  field?: ControllerRenderProps;
  initialValue?: string;
  placeholder?: string;
}

export default function CurrencyInput({ error, field, placeholder }: CurrencyInputProps) {
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
      decimalScale={2}
      decimalSeparator=","
      getInputRef={field?.ref}
      onChange={() => {}}
      onValueChange={(values) => {
        if (field) {
          field.onChange(String(values.floatValue));
        }
      }}
      placeholder={placeholder}
      prefix="R$"
      thousandSeparator="."
    />
  );
}
