import { ChangeEvent, useState } from "react";
import { ControllerRenderProps } from "react-hook-form";
import { CircularProgress, Switch } from "@mui/material";

export interface SwitchInputProps {
  disabled?: boolean;
  field?: ControllerRenderProps;
  initialValue?: string;
  isLoading?: boolean;
  onChange?: (value: string) => void;
}

export default function SwitchInput({ disabled, field, initialValue, isLoading, onChange }: SwitchInputProps) {
  const [checked, setChecked] = useState(initialValue === 'true');
  const handleChange = (event: ChangeEvent<HTMLInputElement>, checked: boolean) => {
    setChecked(checked);

    if (field) {
      field.onChange(event);
    }

    if (onChange) {
      onChange(String(checked));
    }
  };

  return (
    <>
      {isLoading ? 
        (
          <div className="h-[38px] flex items-center">
            <CircularProgress size={22} />
          </div>
        ) :
        <Switch
          checked={checked}
          disabled={disabled}
          onChange={handleChange}
          sx={{
            '& .MuiSwitch-input': {
              height: '100%'
            },
            '& .MuiSwitch-track': {
              backgroundColor: 'rgba(255, 255, 255, .7)'
            }
          }}
        />
      }
    </>
  );
}
