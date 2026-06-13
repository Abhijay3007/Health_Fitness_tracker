export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 z-10 bg-background">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {children}
        </div>
      </div>
      <div className="hidden lg:block relative flex-1 bg-gradient-to-br from-primary via-emerald-800 to-indigo-950 overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        {/* Decorative elements */}
        <div className="absolute top-10 right-10 w-96 h-96 rounded-full bg-emerald-500/10 blur-[80px]" />
        <div className="absolute bottom-10 left-10 w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[100px]" />
        <div className="absolute inset-0 flex flex-col justify-center px-16 text-white">
          <div className="max-w-md">
            <h2 className="text-4xl font-black tracking-tight leading-tight mb-6">
              Empower Your <br />
              Fitness Journey.
            </h2>
            <p className="text-lg text-emerald-100/80 leading-relaxed">
              AuraFit provides the tracking, analytics, and gamification needed to push your boundaries. Track workouts, log calories, build habits, and complete achievements today.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
