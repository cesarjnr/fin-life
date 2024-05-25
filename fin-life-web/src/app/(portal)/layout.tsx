import Sidebar from './sidebar';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full">
      <Sidebar />

      <div className="flex justify-center items-start overflow-auto flex-1 p-12">
        {children}
      </div>
    </div>
  );
}
