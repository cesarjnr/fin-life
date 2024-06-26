import { useState } from 'react';
import { ControllerRenderProps } from 'react-hook-form';
import { IoIosArrowDown } from 'react-icons/io';

export interface SelectInputProps {
  disabled?: boolean;
  error?: string;
  field?: ControllerRenderProps;
  initialValue?: string;
  isLoading?: boolean;
  onChange?: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
}
export interface SelectOption {
  label: string;
  value: string;
}

export default function SelectInput({
  error,
  field,
  initialValue,
  options,
  onChange,
  placeholder
}: SelectInputProps) {
  const initialLabel =
    options.find((option) => option.value === field?.value || option.value === initialValue)?.label || 
    placeholder;
  const [displayOptions, setDisplayOptions] = useState(false);
  const [selectedOptionLabel, setSelectedOptionLabel] = useState(initialLabel);
  const handleOptionClick = (option: SelectOption) => {
    setDisplayOptions(false);
    setSelectedOptionLabel(option.label);
                      
    if (field) {
      field.onChange(option.value);
    }

    if (onChange) {
      onChange(option.value);
    }
  };

  return (
    <div>
      <div
        className={`
          relative
          bg-white/[.03]
          p-4
          text-sm
          text-white/40
          w-full
          cursor-pointer
          ${displayOptions ? 'rounded-t-xl' : 'rounded-xl'}
          ${(displayOptions && !error) ? 'outline outline-1 outline-green-500' : ''}
          ${error ? 'input-error' : ''}
        `}
        onClick={() => setDisplayOptions(!displayOptions)}
      >
        <div
          className="
            flex
            items-center
            justify-between
            gap-5
          "
        >
          <span>
            { selectedOptionLabel }
          </span>
          <IoIosArrowDown />
        </div>
        {
          displayOptions &&
            (
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
                z-10
              ">
                {options.map((option) => (
                  <div
                    key={option.value}
                    className={`
                      px-4
                      py-3
                      cursor-pointer
                      hover:bg-white/[.05]
                      hover:text-white
                      ${option.value === field?.value ? 'text-white bg-white/[.08] hover:bg-white/[.08]' : ''}
                    `}
                    onClick={() => handleOptionClick(option)}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            )
        }
      </div>
    </div>
  );
}