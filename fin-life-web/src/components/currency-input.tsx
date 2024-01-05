import { Control, Controller, ControllerRenderProps } from 'react-hook-form';
import { NumericFormat } from 'react-number-format';

interface CurrencyInputProps {
  control?: Control<any>;
  name: string;
  placeholder: string;
}

export default function CurrencyInput({ control, name, placeholder }: CurrencyInputProps) {
  const renderInput = (field?: ControllerRenderProps) => {
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
        placeholder={placeholder}
        prefix="R$"
        thousandSeparator="."
        onChange={() => {}}
        onValueChange={(values) => {
          if (field) {
            field.onChange(String(values.floatValue));
          }
        }}
        getInputRef={field?.ref}
      />
    );
  };

  return control ?
    <Controller
      control={control}
      name={name}
      render={({ field }) => renderInput(field)}
    /> :
    renderInput();
}
