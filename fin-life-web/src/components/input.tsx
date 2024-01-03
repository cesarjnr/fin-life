'use client'

import { useState } from 'react';
import { IoIosArrowDown } from 'react-icons/io';
import { Control, Controller, ControllerRenderProps } from 'react-hook-form';

export type InputProps = {
  control?: Control<any>;
  initialValue?: string;
  isPassword?: boolean;
  onChange?: (value: string) => void;
  name: string;
  placeholder: string;
  selectOptions?: SelectOption[];
  type: 'text' | 'select';
};
export interface SelectOption {
  label: string;
  value: string;
};

export default function Input({
  control,
  initialValue,
  onChange,
  name,
  placeholder,
  selectOptions,
  type
}: InputProps) {
  const [displaySelectOptions, setDisplaySelectOptions] = useState(false);
  const [value, setValue] = useState(initialValue || '');
  const renderInput = (field?: ControllerRenderProps) => (
    type === 'select' && selectOptions?.length ?
      (
        <div className={`
          relative
          bg-white/[.03]
          p-4
          text-sm
          text-white/40
          w-full
          ${displaySelectOptions ? 'rounded-t-xl' : 'rounded-xl'}
        `}>
          <div
            className="
              flex
              items-center
              justify-between
              gap-5
              cursor-pointer
            "
            onClick={() => setDisplaySelectOptions(!displaySelectOptions)}
          >
            <span>{
              selectOptions.find((option) => option.value === value)?.label || placeholder
            }</span>
            <IoIosArrowDown />
          </div>
          {
            displaySelectOptions &&
            <div className="
              bg-black-700
              flex
              flex-col
              w-full
              absolute
              left-0
              top-14
              rounded-b-md
              overflow-hidden
            ">
              {selectOptions.map((option) => (
                <div
                  key={option.value}
                  className={`
                    px-4
                    py-3
                    cursor-pointer
                    hover:bg-white/[.05]
                    hover:text-white
                    ${option.value === value ? 'text-white bg-white/[.08] hover:bg-white/[.08]' : ''}
                  `}
                  onClick={() => {
                    setValue(option.value);
                    setDisplaySelectOptions(false);
                    
                    if (field) {
                      field.onChange(option.value);
                    }

                    if (onChange) {
                      onChange(option.value);
                    }
                  }}
                >
                  {option.label}
                </div>
              ))}
            </div>
          }
        </div>
      ) :
      (
        <input
          className="
            bg-white/[.03]
            p-4
            border-transparent
            rounded-xl
            text-sm
            text-white/40
          "
          type="text"
          placeholder={placeholder}
          {...field}
        />
      )
  );

  return control ? 
    <Controller
      control={control}
      name={name}
      render={({ field }) => renderInput(field)}
    /> :
    renderInput()
}
