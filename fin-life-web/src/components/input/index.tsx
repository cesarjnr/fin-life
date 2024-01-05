import { Control, Controller, FieldErrors } from 'react-hook-form';

import TextInput from './text-input';
import SelectInput, { SelectOption } from './select-input';
import NumberInput from './number-input';
import CurrencyInput from './currency-input';
import DateInput from './date-input';

export type InputProps = {
  control?: Control<any>;
  errors?: FieldErrors;
  name: string;
  onChange?: (value: string) => void;
  options?: SelectOption[];
  placeholder?: string;
  type: 'text' | 'select' | 'number' | 'currency' | 'date';
}

const inputComponentsMap = new Map([
  ['text', TextInput],
  ['select', SelectInput],
  ['number', NumberInput],
  ['currency', CurrencyInput],
  ['date', DateInput]
]);

export default function Input({
  control,
  name,
  options,
  type,
  ...rest
}: InputProps) {
  const Component = inputComponentsMap.get(type)!;

  return control ?
    (
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Component
            {...rest}
            field={field}
            options={options || []}
            name={name}
          />
        )}
        // rules={{ required: `${placeholder} é obrigatório`, minLength: { value: 10, message: `Mínimo de 10 caracteres` } }}
      />
    ) :
    (
      <Component
        {...rest}
        options={options || []}
        name={name}
      />
    );
}