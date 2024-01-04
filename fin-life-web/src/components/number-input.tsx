import { Control, Controller, ControllerRenderProps } from 'react-hook-form';
import { NumericFormat } from 'react-number-format';

export interface NumberInputProps {
  control?: Control<any>;
  name: string;
  placeholder: string;
}

export default function NumberInput({ control, name, placeholder }: NumberInputProps) {
  const renderInput = (field?: ControllerRenderProps) => {
    let fieldProps = {};

    if (field) {
      fieldProps = { ...field, onChange: undefined, ref: undefined };
    }

    return (
      <NumericFormat
        className="
          bg-white/[.03]
          p-4
          border-transparent
          rounded-xl
          text-sm
          text-white/40
        "
        placeholder={placeholder}
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