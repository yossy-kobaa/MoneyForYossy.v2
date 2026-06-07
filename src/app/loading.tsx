export default function Loading() {
  return (
    <main className="min-h-screen bg-gray-50/50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans">
      <div className="max-w-md mx-auto min-h-screen flex flex-col relative pb-12">
        {/* Decorative Background Blur */}
        <div className="absolute top-0 inset-x-0 h-[400px] bg-gradient-to-b from-blue-100/50 via-emerald-50/30 to-transparent dark:from-blue-900/20 dark:via-emerald-900/10 -z-10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-200/40 dark:bg-emerald-800/20 rounded-full blur-[80px] -z-10 pointer-events-none translate-x-1/3 -translate-y-1/3" />
        <div className="absolute top-20 left-0 w-[250px] h-[250px] bg-blue-200/40 dark:bg-blue-800/20 rounded-full blur-[80px] -z-10 pointer-events-none -translate-x-1/3" />

        {/* Loading Skeleton */}
        <div className="flex-1 px-4 pt-12 flex flex-col gap-6 animate-pulse">
          {/* Progress Chart Skeleton */}
          <section className="w-full">
            <div className="w-full h-[280px] bg-white/60 dark:bg-gray-900/60 rounded-3xl shadow-sm backdrop-blur-xl border border-white/20 dark:border-white/5" />
          </section>

          {/* Expense Form Skeleton */}
          <section className="w-full mt-2">
            <div className="w-full h-[320px] bg-white/60 dark:bg-gray-900/60 rounded-3xl shadow-sm backdrop-blur-xl border border-white/20 dark:border-white/5" />
          </section>
        </div>
      </div>
    </main>
  );
}
