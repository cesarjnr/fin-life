export interface ButtonProps {
  label: string;
  variant: 'primary' | 'error'
}

export default function Button({ label, variant }: ButtonProps) {
  const backgroundColor = variant === 'primary' ? 'bg-green-500' : 'bg-red-500';
  const backgroundHoverColor = 'hover:' + (variant === 'primary' ? 'bg-green-600' : 'bg-red-600');

  return (
    <button className={`
      p-3 rounded-2xl
      font-semibold
      ${backgroundColor}
      ${backgroundHoverColor}
    `}>
      {label}
    </button>
  );
}
