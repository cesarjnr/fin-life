import Sidebar from './sidebar';

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full">
      <Sidebar />

      <div className="flex justify-center items-start overflow-auto flex-1 p-8">
        {children}
      </div>
    </div>
  );
}
