export default function StatCard({ label, value, hint, icon: Icon }) {
  return (
    <div className="stat-card group">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="stat-label">{label}</p>
          <p className="stat-value">{value}</p>
          {hint && <p className="mt-0.5 text-xs text-slate-400">{hint}</p>}
        </div>
        {Icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600 transition-colors duration-200 group-hover:bg-primary-100 group-hover:text-primary-700">
            <Icon className="h-5 w-5" strokeWidth={2} />
          </div>
        )}
      </div>
    </div>
  );
}
