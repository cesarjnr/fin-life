export interface InputProps {
  isPassword?: boolean;
  name: string;
  placeholder: string;
}

export default function Input({
  name,
  placeholder
}: InputProps) {
  return (
    <input
      className="border-transparent rounded-xl text-white/40 bg-white/[.03] p-4"
      type="text"
      placeholder={placeholder}
    />
  );
}
