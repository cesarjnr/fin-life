export interface ButtonProps {
  color?: 'primary' | 'error';
  label: string;
  onClick?: () => void;
  variant?: 'contained';
}

const variants = {
  basic: {
    primary: 'text-green-500 hover:bg-green-500/[.01]',
    error: 'text-red-500 hover:bg-red-500/[.01]'
  },
  contained: {
    primary: 'bg-green-500 hover:bg-green-600',
    error: 'bg-red-500 hover:bg-red-600'
  }
};

export default function Button({ color, label, onClick, variant }: ButtonProps) {
  return (
    <button
      className={`
        px-4 py-2 rounded-md
        font-semibold
        ${variants[variant || 'basic'][color || 'primary']}
      `}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
