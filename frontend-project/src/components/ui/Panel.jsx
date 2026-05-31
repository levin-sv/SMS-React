export default function Panel({ title, description, action, children, className = '' }) {
  return (
    <section className={`panel ${className}`}>
      {(title || description || action) && (
        <div className="panel-header">
          <div>
            {title && <h2 className="panel-title">{title}</h2>}
            {description && <p className="panel-desc">{description}</p>}
          </div>
          {action && <div className="mt-2 sm:mt-0">{action}</div>}
        </div>
      )}
      <div className="panel-body">{children}</div>
    </section>
  );
}
