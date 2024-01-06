import { DatePicker } from '@mui/x-date-pickers';
import { ControllerRenderProps } from 'react-hook-form';

interface DateInputProps {
  error?: string;
  field?: ControllerRenderProps;
}

export default function DateInput({ error, field }: DateInputProps) {
  return (
    <DatePicker
      {...field}
      inputRef={field?.ref}
      slotProps={{ textField: { error: Boolean(error) } }}
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
        '.Mui-error': {
          '.MuiOutlinedInput-notchedOutline': {
            borderWidth: '1px'
          }
        },
        '.Mui-focused': {
          '.MuiOutlinedInput-notchedOutline': {
            borderWidth: '1px !important'
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
    />
  );
}