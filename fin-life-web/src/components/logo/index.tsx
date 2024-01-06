export interface LogoProps {
  fontSize: string;
}

export default function Logo({ fontSize }: LogoProps) {
  return (
    <h1 className={`${fontSize} font-semibold text-center`}>
      <span className="text-green-500">Fin</span>Life
    </h1>
  );
}
