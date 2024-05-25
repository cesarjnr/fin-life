import PortfolioSelector from "./portfolio-selector";

export default function PortfoliosLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col gap-7 h-full">
      <div className="flex justify-end bg-black-800 p-5 rounded-lg">
        <PortfolioSelector />
      </div>

      {children}
    </div>
  );
}