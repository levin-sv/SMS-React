import { useEffect, useState } from 'react';
import { ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight, Pencil, Trash2, Save } from 'lucide-react';
import api from '../api/client';
import Alert from '../components/Alert';
import PageHeader from '../components/ui/PageHeader';
import Panel from '../components/ui/Panel';
import StatCard from '../components/ui/StatCard';
import EmptyState from '../components/ui/EmptyState';

const emptyForm = {
  transactionDate: new Date().toISOString().slice(0, 16),
  quantityMoved: '',
  transactionType: 'IN',
  productCode: '',
  warehouseCode: '',
};

export default function Transactions() {
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      const [t, p, w] = await Promise.all([
        api.get('/transactions'),
        api.get('/products'),
        api.get('/warehouses'),
      ]);
      setTransactions(t.data);
      setProducts(p.data);
      setWarehouses(w.data);
    } catch {
      setMessage({ type: 'error', text: 'Failed to load transactions' });
    }
  };

  useEffect(() => {
    load();
  }, []);

  const stockIn = transactions.filter((t) => t.transactionType === 'IN').length;
  const stockOut = transactions.filter((t) => t.transactionType === 'OUT').length;

  const resetForm = () => {
    setForm(emptyForm);
    setEditId(null);
  };

  const handleEdit = (row) => {
    setEditId(row.transactionId);
    setForm({
      transactionDate: row.transactionDate?.slice(0, 16),
      quantityMoved: row.quantityMoved,
      transactionType: row.transactionType,
      productCode: row.productCode,
      warehouseCode: row.warehouseCode,
    });
    document.getElementById('transaction-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transaction? Stock quantities will be reversed.')) return;
    try {
      await api.delete(`/transactions/${id}`);
      setMessage({ type: 'success', text: 'Transaction deleted' });
      load();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Delete failed' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    const payload = {
      ...form,
      quantityMoved: Number(form.quantityMoved),
      transactionDate: new Date(form.transactionDate).toISOString(),
    };
    try {
      if (editId) {
        await api.put(`/transactions/${editId}`, payload);
        setMessage({ type: 'success', text: 'Transaction updated' });
      } else {
        await api.post('/transactions', payload);
        setMessage({ type: 'success', text: 'Transaction recorded' });
      }
      resetForm();
      load();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Operation failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <PageHeader
        badge="Full CRUD"
        title="Stock transactions"
        subtitle="Record stock in and stock out movements. Edit or delete entries to adjust inventory automatically."
      />

      {message.text && (
        <Alert type={message.type} message={message.text} onClose={() => setMessage({ type: '', text: '' })} />
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total transactions" value={transactions.length} icon={ArrowLeftRight} />
        <StatCard label="Stock in" value={stockIn} hint="IN type" icon={ArrowDownToLine} />
        <StatCard label="Stock out" value={stockOut} hint="OUT type" icon={ArrowUpFromLine} />
      </div>

      <div id="transaction-form">
        <Panel
          title={editId ? `Edit transaction #${editId}` : 'Record transaction'}
          description="Stock levels update automatically based on type"
          action={
            editId && (
              <button type="button" className="btn-secondary btn-sm" onClick={resetForm}>
                Cancel edit
              </button>
            )
          }
        >
          <form onSubmit={handleSubmit}>
            <div className="form-grid lg:grid-cols-3">
              <div>
                <label className="label">Transaction date</label>
                <input
                  type="datetime-local"
                  className="input"
                  value={form.transactionDate}
                  onChange={(e) => setForm({ ...form, transactionDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {['IN', 'OUT'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setForm({ ...form, transactionType: type })}
                      className={`flex items-center justify-center gap-2 rounded-lg border-2 py-2.5 text-sm font-semibold transition-all duration-200 ${
                        form.transactionType === type
                          ? type === 'IN'
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm'
                            : 'border-amber-500 bg-amber-50 text-amber-900 shadow-sm'
                          : 'border-slate-200 bg-white text-slate-500 hover:border-primary-300 hover:bg-primary-50/50'
                      }`}
                    >
                      {type === 'IN' ? 'Stock In' : 'Stock Out'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Quantity moved</label>
                <input
                  type="number"
                  min="1"
                  className="input"
                  value={form.quantityMoved}
                  onChange={(e) => setForm({ ...form, quantityMoved: e.target.value })}
                  required
                  placeholder="0"
                />
              </div>
              <div>
                <label className="label">Product</label>
                <select
                  className="input"
                  value={form.productCode}
                  onChange={(e) => setForm({ ...form, productCode: e.target.value })}
                  required
                >
                  <option value="">Select product…</option>
                  {products.map((p) => (
                    <option key={p.productCode} value={p.productCode}>
                      {p.productName} — {p.quantityInStock} in stock
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Warehouse</label>
                <select
                  className="input"
                  value={form.warehouseCode}
                  onChange={(e) => setForm({ ...form, warehouseCode: e.target.value })}
                  required
                >
                  <option value="">Select warehouse…</option>
                  {warehouses.map((w) => (
                    <option key={w.warehouseCode} value={w.warehouseCode}>
                      {w.warehouseName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-100 pt-4">
              <button type="submit" className="btn-primary gap-2" disabled={loading}>
                <Save className="h-4 w-4" />
                {loading ? 'Saving…' : editId ? 'Update transaction' : 'Record transaction'}
              </button>
              {editId && (
                <button type="button" className="btn-ghost" onClick={resetForm}>
                  Clear form
                </button>
              )}
            </div>
          </form>
        </Panel>
      </div>

      <Panel title="Transaction history" description="Retrieve, update, or delete records">
        {transactions.length === 0 ? (
          <EmptyState title="No transactions" description="Record your first stock in or stock out movement above." />
        ) : (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Date & time</th>
                  <th>Type</th>
                  <th>Product</th>
                  <th>Warehouse</th>
                  <th className="text-right">Qty</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.transactionId}>
                    <td className="font-mono text-xs text-slate-400">#{t.transactionId}</td>
                    <td className="whitespace-nowrap text-slate-700">
                      {new Date(t.transactionDate).toLocaleString()}
                    </td>
                    <td>
                      <span className={t.transactionType === 'IN' ? 'badge-in' : 'badge-out'}>
                        {t.transactionType}
                      </span>
                    </td>
                    <td className="font-medium">{t.productName}</td>
                    <td className="text-slate-600">{t.warehouseName}</td>
                    <td className="text-right font-semibold tabular-nums">{t.quantityMoved}</td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        <button type="button" className="btn-secondary btn-sm gap-1" onClick={() => handleEdit(t)}>
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button type="button" className="btn-danger btn-sm gap-1" onClick={() => handleDelete(t.transactionId)}>
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
