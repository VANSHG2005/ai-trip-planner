export default function SkeletonCard() {
  return (
    <div className="flex flex-col gap-2">
      <div className="bg-slate-200 dark:bg-slate-700 animate-pulse w-full h-50 rounded-2xl" />
      <div className="bg-slate-200 dark:bg-slate-700 animate-pulse h-5 w-3/4 rounded-md" />
      <div className="bg-slate-200 dark:bg-slate-700 animate-pulse h-4 w-1/2 rounded-md" />
    </div>
  )
}
