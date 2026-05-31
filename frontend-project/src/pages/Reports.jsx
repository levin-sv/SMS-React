import { useRef, useState } from 'react';
import { FileBarChart, Printer, Package, ArrowDownToLine, ArrowUpFromLine, CalendarRange } from 'lucide-react';
import api from '../api/client';
import Alert from '../components/Alert';
import PageHeader from '../components/ui/PageHeader';
import Panel from '../components/ui/Panel';
import StatCard from '../components/ui/StatCard';
import EmptyState from '../components/ui/EmptyState';
import ReportPrintContent from '../components/reports/ReportPrintContent';

const periods = [
  { id: 'daily', label: 'Today' },
  { id: 'weekly', label: 'Last 7 days' },
  { id: 'monthly', label: 'This month' },
];

const reportTypes = [
  { id: 'available', label: 'Available stock', desc: 'Products received in range', icon: Package },
  { id: 'stock-in', label: 'Stock in', desc: 'Inbound movements', icon: ArrowDownToLine },
  { id: 'stock-out', label: 'Stock out', desc: 'Outbound movements', icon: ArrowUpFromLine },
];

function toDatetimeLocalValue(date) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function getPresetRange(period) {
  const end = new Date();
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  if (period === 'weekly') {
    start.setDate(start.getDate() - 6);
  } else if (period === 'monthly') {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
  }
  return { from: toDatetimeLocalValue(start), to: toDatetimeLocalValue(end) };
}

function defaultRange() {
  return getPresetRange('daily');
}

export default function Reports() {
  const printRef = useRef(null);
  const [from, setFrom] = useState(() => defaultRange().from);
  const [to, setTo] = useState(() => defaultRange().to);
  const [reportType, setReportType] = useState('available');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const applyPreset = (periodId) => {
    const range = getPresetRange(periodId);
    setFrom(range.from);
    setTo(range.to);
  };

  const generate = async () => {
    if (!from || !to) {
      setError('Please select both From and To timestamps');
      return;
    }
    if (new Date(from) > new Date(to)) {
      setError('From timestamp must be before To timestamp');
      return;
    }

    setLoading(true);
    setError('');
    setReport(null);
    try {
      const { data } = await api.get('/reports/generate', {
        params: {
          reportType,
          from: new Date(from).toISOString(),
          to: new Date(to).toISOString(),
        },
      });
      setReport(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!report) {
      setError('Generate a report before printing');
      return;
    }
    window.print();
  };

  const summaryEntries = report?.summary ? Object.entries(report.summary) : [];

  return (
    <div className="page-shell">
      {/* Screen-only controls — hidden when printing */}
      <div className="no-print">
        <PageHeader
          title="Reports"
          subtitle="Select a date/time range and report type, generate results, then print only the report."
        />

        <Alert type="error" message={error} onClose={() => setError('')} />

        <Panel title="Report filters" description="From / To timestamps define what data is included">
          <div className="space-y-6">
            <div>
              <p className="label mb-3 flex items-center gap-2">
                <CalendarRange className="h-4 w-4 text-primary-600" />
                Quick presets
              </p>
              <div className="flex flex-wrap gap-2">
                {periods.map((p) => (
                  <button key={p.id} type="button" onClick={() => applyPreset(p.id)} className="chip-inactive">
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="from-ts">
                  From timestamp
                </label>
                <input
                  id="from-ts"
                  type="datetime-local"
                  className="input"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </div>
              <div>
                <label className="label" htmlFor="to-ts">
                  To timestamp
                </label>
                <input
                  id="to-ts"
                  type="datetime-local"
                  className="input"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </div>
            </div>

            <div>
              <p className="label mb-3">Report type</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {reportTypes.map((r) => {
                  const Icon = r.icon;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setReportType(r.id)}
                      className={`option-card flex gap-3 ${reportType === r.id ? 'option-card-selected' : ''}`}
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors ${
                          reportType === r.id ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className={`font-semibold ${reportType === r.id ? 'text-primary-800' : 'text-slate-800'}`}>
                          {r.label}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">{r.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-4">
              <button type="button" onClick={generate} className="btn-primary gap-2" disabled={loading}>
                <FileBarChart className="h-4 w-4" />
                {loading ? 'Generating…' : 'Generate report'}
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="btn-secondary gap-2"
                disabled={!report}
                title={!report ? 'Generate a report first' : 'Print report only'}
              >
                <Printer className="h-4 w-4" />
                Print report
              </button>
            </div>
          </div>
        </Panel>

        {report && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Report" value={report.reportType} icon={FileBarChart} />
              {summaryEntries.map(([key, val]) => (
                <StatCard
                  key={key}
                  label={key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
                  value={
                    typeof val === 'number' && key.toLowerCase().includes('value')
                      ? `${val.toLocaleString()} RWF`
                      : val?.toLocaleString?.() ?? String(val)
                  }
                />
              ))}
            </div>

            <Panel
              title="Preview (same as print)"
              description={`${new Date(report.dateFrom).toLocaleString()} → ${new Date(report.dateTo).toLocaleString()}`}
            >
              {report.data.length === 0 ? (
                <EmptyState title="No records" description="No data found for the selected range." />
              ) : reportType === 'available' ? (
                <div className="data-table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Product</th>
                        <th>Category</th>
                        <th className="text-right">Stock</th>
                        <th className="text-right">Unit price</th>
                        <th>Warehouse</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.data.map((row) => (
                        <tr key={row.productCode}>
                          <td className="font-mono text-xs font-semibold text-primary-700">{row.productCode}</td>
                          <td className="font-medium">{row.productName}</td>
                          <td>
                            <span className="badge-neutral">{row.category}</span>
                          </td>
                          <td className="text-right font-semibold tabular-nums">{row.quantityInStock}</td>
                          <td className="text-right tabular-nums">{Number(row.unitPrice).toLocaleString()}</td>
                          <td>{row.warehouseName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="data-table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Product</th>
                        <th>Warehouse</th>
                        <th className="text-right">Quantity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.data.map((row) => (
                        <tr key={row.transactionId}>
                          <td>{new Date(row.transactionDate).toLocaleString()}</td>
                          <td className="font-medium">{row.productName}</td>
                          <td>{row.warehouseName}</td>
                          <td className="text-right font-semibold tabular-nums">{row.quantityMoved}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Panel>
          </>
        )}
      </div>

      {/* Print-only block — hidden on screen, shown when printing */}
      <div id="report-print-area" ref={printRef} className="report-print-area hidden print:block">
        <ReportPrintContent report={report} reportTypeId={reportType} />
      </div>
    </div>
  );
}
