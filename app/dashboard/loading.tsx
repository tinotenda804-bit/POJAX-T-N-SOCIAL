
export default function DashboardLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#07182d] px-4 text-white">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-cyan-900 border-t-cyan-400" />
        <h1 className="mt-5 text-xl font-black tracking-wider text-cyan-300">
          POJAX T-N
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Preparing your dashboard...
        </p>
      </div>
    </main>
  );
}
