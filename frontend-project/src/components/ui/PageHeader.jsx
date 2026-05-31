export default function PageHeader({ title, subtitle, badge, children }) {
  return (
    <header className="page-header flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 flex-1">
        {badge && (
          <span className="mb-2 inline-block rounded-md bg-primary-100 px-2.5 py-0.5 text-xs font-semibold text-primary-800">
            {badge}
          </span>
        )}
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle mt-1">{subtitle}</p>}
      </div>
      {children && <div className="flex shrink-0 flex-wrap gap-2">{children}</div>}
    </header>
  );
}
