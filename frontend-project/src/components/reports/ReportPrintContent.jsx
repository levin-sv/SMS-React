export default function ReportPrintContent({ report, reportTypeId }) {
  if (!report) return null;

  const formatDt = (iso) =>
    iso ? new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—';

  const summaryEntries = report.summary ? Object.entries(report.summary) : [];

  const formatSummaryValue = (key, val) => {
    if (typeof val === 'number' && key.toLowerCase().includes('value')) {
      return `${val.toLocaleString()} RWF`;
    }
    return val?.toLocaleString?.() ?? String(val);
  };

  return (
    <div className="report-print-document bg-white text-black">
      <header className="report-print-header border-b-2 border-slate-800 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">StockHub Ltd</h1>
            <p className="text-sm text-slate-600">Stock Management System — Inventory Report</p>
            <p className="text-xs text-slate-500">Kigali City, Rwanda</p>
          </div>
          <div className="text-right text-sm">
            <p className="font-semibold text-slate-900">{report.reportType}</p>
            <p className="text-slate-600">Generated: {formatDt(report.generatedAt)}</p>
          </div>
        </div>
        <div className="mt-4 grid gap-1 rounded-lg bg-slate-50 p-3 text-sm sm:grid-cols-2">
          <p>
            <span className="font-semibold">From:</span> {formatDt(report.dateFrom)}
          </p>
          <p>
            <span className="font-semibold">To:</span> {formatDt(report.dateTo)}
          </p>
        </div>
      </header>

      {summaryEntries.length > 0 && (
        <section className="report-print-summary mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {summaryEntries.map(([key, val]) => (
            <div key={key} className="rounded border border-slate-200 p-2 text-center">
              <p className="text-[10px] font-semibold uppercase text-slate-500">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </p>
              <p className="text-lg font-bold text-slate-900">{formatSummaryValue(key, val)}</p>
            </div>
          ))}
        </section>
      )}

      <section className="report-print-table mt-6">
        {report.data.length === 0 ? (
          <p className="py-8 text-center text-slate-500">No records for this date range.</p>
        ) : reportTypeId === 'available' ? (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-slate-800 bg-slate-100">
                <th className="px-2 py-2 text-left">Code</th>
                <th className="px-2 py-2 text-left">Product</th>
                <th className="px-2 py-2 text-left">Category</th>
                <th className="px-2 py-2 text-right">Stock</th>
                <th className="px-2 py-2 text-right">Unit price</th>
                <th className="px-2 py-2 text-left">Warehouse</th>
              </tr>
            </thead>
            <tbody>
              {report.data.map((row) => (
                <tr key={row.productCode} className="border-b border-slate-200">
                  <td className="px-2 py-2 font-mono text-xs">{row.productCode}</td>
                  <td className="px-2 py-2">{row.productName}</td>
                  <td className="px-2 py-2">{row.category}</td>
                  <td className="px-2 py-2 text-right font-semibold">{row.quantityInStock}</td>
                  <td className="px-2 py-2 text-right">{Number(row.unitPrice).toLocaleString()}</td>
                  <td className="px-2 py-2">{row.warehouseName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-slate-800 bg-slate-100">
                <th className="px-2 py-2 text-left">Date</th>
                <th className="px-2 py-2 text-left">Product</th>
                <th className="px-2 py-2 text-left">Warehouse</th>
                <th className="px-2 py-2 text-right">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {report.data.map((row) => (
                <tr key={row.transactionId} className="border-b border-slate-200">
                  <td className="px-2 py-2">{new Date(row.transactionDate).toLocaleString()}</td>
                  <td className="px-2 py-2">{row.productName}</td>
                  <td className="px-2 py-2">{row.warehouseName}</td>
                  <td className="px-2 py-2 text-right font-semibold">{row.quantityMoved}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <footer className="report-print-footer mt-8 border-t border-slate-300 pt-3 text-center text-xs text-slate-500">
        StockHub SMS · Page 1
      </footer>
    </div>
  );
}
