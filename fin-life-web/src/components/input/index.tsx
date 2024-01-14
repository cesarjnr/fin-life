'use client'

import { Control, Controller, FieldErrors, Message, ValidationRule } from 'react-hook-form';

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
  validationRules?: {
    required?: Message | ValidationRule<boolean>;
    min?: ValidationRule<number | string>;
    max?: ValidationRule<number | string>;
    maxLength?: ValidationRule<number>;
    minLength?: ValidationRule<number>;
  };
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
  errors,
  name,
  onChange,
  options,
  placeholder,
  type,
  validationRules
}: InputProps) {
  const Component = inputComponentsMap.get(type)!;
  const error = errors?.[name]?.message as string;

  return (
    <div className="mb-4 flex flex-col gap-2">
      {control ?
        (
          <Controller
            control={control}
            name={name}
            render={({ field }) => (
              <Component
                error={error}
                field={field}
                onChange={onChange}
                options={options || []}
                placeholder={placeholder}
              />
            )}
            rules={validationRules}
          />
        ) :
        (
          <Component
            error={error}
            onChange={onChange}
            options={options || []}
            placeholder={placeholder}
          />
        )
      }
      {error && (
        <span className="
          inline-block
          ms-3.5
          text-[0.625rem]
          leading-[0.875rem]
          text-[#d32f2f]
        ">
          {error}
        </span>
      )}
    </div>
  );
}