import { useEffect, useState } from 'react';
import { Warehouse, MapPin, Plus } from 'lucide-react';
import api from '../api/client';
import Alert from '../components/Alert';
import PageHeader from '../components/ui/PageHeader';
import Panel from '../components/ui/Panel';
import StatCard from '../components/ui/StatCard';
import EmptyState from '../components/ui/EmptyState';

export default function Warehouses() {
  const [form, setForm] = useState({
    warehouseCode: '',
    warehouseName: '',
    warehouseLocation: '',
  });
  const [list, setList] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get('/warehouses');
      setList(data);
    } catch {
      setMessage({ type: 'error', text: 'Failed to load warehouses' });
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await api.post('/warehouses', form);
      setMessage({ type: 'success', text: 'Warehouse registered successfully' });
      setForm({ warehouseCode: '', warehouseName: '', warehouseLocation: '' });
      load();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save warehouse' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <PageHeader
        badge="Insert only"
        title="Warehouses"
        subtitle="Register storage locations where products are held and transactions occur."
      />

      {message.text && (
        <Alert type={message.type} message={message.text} onClose={() => setMessage({ type: '', text: '' })} />
      )}

      <StatCard label="Active warehouses" value={list.length} icon={Warehouse} />

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Panel title="Add warehouse" description="Warehouse code must be unique">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Warehouse code</label>
                <input
                  className="input"
                  value={form.warehouseCode}
                  onChange={(e) => setForm({ ...form, warehouseCode: e.target.value })}
                  required
                  placeholder="WH001"
                />
              </div>
              <div>
                <label className="label">Warehouse name</label>
                <input
                  className="input"
                  value={form.warehouseName}
                  onChange={(e) => setForm({ ...form, warehouseName: e.target.value })}
                  required
                  placeholder="Kigali Central Depot"
                />
              </div>
              <div>
                <label className="label">Location</label>
                <input
                  className="input"
                  value={form.warehouseLocation}
                  onChange={(e) => setForm({ ...form, warehouseLocation: e.target.value })}
                  required
                  placeholder="Kigali City, Rwanda"
                />
              </div>
              <div className="border-t border-slate-100 pt-4">
                <button type="submit" className="btn-primary w-full gap-2" disabled={loading}>
                  <Plus className="h-4 w-4" />
                  {loading ? 'Saving…' : 'Save warehouse'}
                </button>
              </div>
            </form>
          </Panel>
        </div>

        <div className="lg:col-span-8">
          <Panel title="Warehouse directory" description="All registered locations">
            {list.length === 0 ? (
              <EmptyState title="No warehouses" description="Register your first warehouse using the form." />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {list.map((w) => (
                  <article
                    key={w.warehouseCode}
                    className="card-hover rounded-xl border border-slate-200 bg-slate-50/50 p-5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="rounded-md bg-primary-100 px-2 py-0.5 font-mono text-xs font-bold text-primary-800">
                        {w.warehouseCode}
                      </span>
                    </div>
                    <h3 className="mt-3 font-display text-lg font-bold text-slate-900">{w.warehouseName}</h3>
                    <p className="mt-2 flex items-start gap-2 text-sm text-slate-500">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" strokeWidth={2} />
                      {w.warehouseLocation}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
