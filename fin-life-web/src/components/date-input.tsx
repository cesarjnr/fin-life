import { DatePicker } from '@mui/x-date-pickers';
import { Control, Controller, ControllerRenderProps } from 'react-hook-form';

interface DateInputProps {
  control?: Control<any>;
  name: string;
}

export default function DateInput({ control, name }: DateInputProps) {
  const renderInput = (field?: ControllerRenderProps) => {
    return (
      <DatePicker
        sx={{
          backgroundColor: 'rgba(255, 255, 255, .03)',
          borderRadius: '0.75rem',
          input: {
            color: 'rgba(255, 255, 255, .4)',
            fontFamily: '__Poppins_76c3cb, __Poppins_Fallback_76c3cb',
            fontSize: '0.875rem',
            lineHeight: '1.25rem',
            ":focus": {
              borderColor: '#00e663'
            },
            "::placeholder": {
              opacity: '1'
            }
          },
          '.Mui-focused': {
            '.MuiOutlinedInput-notchedOutline': {
              borderWidth: '1px'
            }
          },
          '.MuiOutlinedInput-notchedOutline': {
            borderRadius: '0.75rem',
            borderWidth: '0',
          },
          '.MuiInputAdornment-root': {
            button: {
              svg: {
                fill: 'rgba(255, 255, 255, .4)'
              }
            }
          },
        }}
        {...field}
      />
    );
  };

  return control ?
    <Controller
      control={control}
      name={name}
      render={({ field }) => renderInput(field)}
    /> :
    renderInput()
}