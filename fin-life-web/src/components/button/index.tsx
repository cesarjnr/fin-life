import { CircularProgress } from '@mui/material';
import { useMemo } from 'react';

export interface ButtonProps {
  color?: 'primary' | 'error';
  disabled?: boolean;
  label: string;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'contained';
}

export default function Button({
  color,
  disabled,
  label,
  loading,
  onClick,
  type,
  variant
}: ButtonProps) {
  const variants = useMemo(
    () => ({
      basic: {
        primary: `
          text-green-500
          ${(loading) ? 'bg-green-500/[.01]' : 'hover:bg-green-500/[.01]'}
        `,
        error: `
          text-red-500
          ${(loading) ? 'bg-red-500/[.01]' : 'hover:bg-red-500/[.01]'}
        `
      },
      contained: {
        primary: `
          bg-green-500
          ${(loading) ? 'bg-green-600' : 'hover:bg-green-600'}
        `,
        error: `
          bg-red-500
          ${(loading) ? 'bg-red-600' : 'hover:bg-red-600'}
        `
      }
    }),
    [loading]
  );

  return (
    <button
      className={`
        px-4 py-2 rounded-md
        font-semibold
        ${variants[variant || 'basic'][color || 'primary']}
        ${loading && 'w-full'}
      `}
      disabled={disabled || loading}
      onClick={onClick}
      type={type || 'button'}
    >
      {loading ? 
        (
          <CircularProgress
            color={color}
            size={22}
            sx={
              variant === 'contained' ? 
              { root: { color: 'rgb(255, 255, 255)' } } :
              null
            }
          />
        ) :
        label
      }
    </button>
  );
}
