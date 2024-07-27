import { IconType } from 'react-icons';

interface IconButtonProps {
  disabled?: boolean;
  IconComponent: IconType;
  onClick?: () => void;
  size?: number;
}

export default function IconButton({ disabled, IconComponent, onClick, size }: IconButtonProps) {
  const handleButtonClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <button
      className={`
        p-2
        rounded-full
        text-sm
        ${disabled ? 'text-white/[.26]' : 'hover:bg-white/[.04]'}
      `}
      disabled={disabled}
      onClick={handleButtonClick}
    >
      <IconComponent size={size} />
    </button>
  );
}
