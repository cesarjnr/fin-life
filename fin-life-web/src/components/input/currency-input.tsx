import { ControllerRenderProps, FieldErrors } from 'react-hook-form';
import { NumericFormat } from 'react-number-format';

interface CurrencyInputProps {
  errors?: FieldErrors;
  field?: ControllerRenderProps;
  name: string;
  placeholder?: string;
}

export default function CurrencyInput({ errors, field, name, placeholder }: CurrencyInputProps) {
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
