export interface ButtonProps {
  label: string;
  variant: 'primary' | 'error'
}

const variants = {
  primary: 'bg-green-500 hover:bg-green-600',
  error: 'bg-red-500 hover:bg-red-600'
};

export default function Button({ label, variant }: ButtonProps) {
  return (
    <button className={`
      p-3 rounded-2xl
      font-semibold
      ${variants[variant]}
    `}>
      {label}
    </button>
  );
}
