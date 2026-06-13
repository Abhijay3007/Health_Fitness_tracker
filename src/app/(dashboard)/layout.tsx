import Sidebar from '@/components/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto max-h-screen">
        <div className="max-w-7xl mx-auto pb-12">
          {children}
        </div>
      </main>
    </div>
  );
}
