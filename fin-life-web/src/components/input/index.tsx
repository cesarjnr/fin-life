'use client'

import { Control, Controller, FieldErrors, Message, ValidationRule } from 'react-hook-form';

import SelectInput, { SelectOption } from './select-input';
import TextInput from './text-input';
import NumberInput from './number-input';
import CurrencyInput from './currency-input';
import DateInput from './date-input';
import SwitchInput from './switch-input';

export type InputProps = {
  control?: Control<any>;
  disabled?: boolean;
  errors?: FieldErrors;
  initialValue?: string;
  isLoading?: boolean;
  name: string;
  onChange?: (value: string) => void;
  options?: SelectOption[];
  placeholder?: string;
  type: 'text' | 'select' | 'number' | 'currency' | 'date' | 'switch';
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
  ['date', DateInput],
  ['switch', SwitchInput]
]);

export default function Input({
  control,
  disabled,
  errors,
  initialValue,
  isLoading,
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
    <div className="flex flex-col gap-2">
      {control ?
        (
          <Controller
            control={control}
            disabled={disabled}
            name={name}
            render={({ field }) => (
              <Component
                disabled={disabled}
                error={error}
                field={field}
                initialValue={field.value}
                isLoading={isLoading}
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
            disabled={disabled}
            error={error}
            initialValue={initialValue}
            isLoading={isLoading}
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