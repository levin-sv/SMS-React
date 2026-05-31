import { useEffect, useState } from 'react';
import { Package, Boxes, Coins, Plus } from 'lucide-react';
import api from '../api/client';
import Alert from '../components/Alert';
import PageHeader from '../components/ui/PageHeader';
import Panel from '../components/ui/Panel';
import StatCard from '../components/ui/StatCard';
import EmptyState from '../components/ui/EmptyState';

const emptyForm = {
  productCode: '',
  productName: '',
  category: '',
  quantityInStock: 0,
  unitPrice: '',
  supplierName: '',
  dateReceived: new Date().toISOString().slice(0, 10),
  warehouseCode: '',
};

export default function Products() {
  const [form, setForm] = useState(emptyForm);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      const [wh, pr] = await Promise.all([api.get('/warehouses'), api.get('/products')]);
      setWarehouses(wh.data);
      setProducts(pr.data);
    } catch {
      setMessage({ type: 'error', text: 'Failed to load data' });
    }
  };

  useEffect(() => {
    load();
  }, []);

  const totalUnits = products.reduce((s, p) => s + Number(p.quantityInStock), 0);
  const totalValue = products.reduce((s, p) => s + Number(p.quantityInStock) * Number(p.unitPrice), 0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await api.post('/products', {
        ...form,
        quantityInStock: Number(form.quantityInStock),
        unitPrice: Number(form.unitPrice),
      });
      setMessage({ type: 'success', text: 'Product registered successfully' });
      setForm({ ...emptyForm, warehouseCode: form.warehouseCode });
      load();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save product' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <PageHeader
        badge="Insert only"
        title="Products"
        subtitle="Register inventory items with code, category, pricing, and warehouse assignment."
      />

      {message.text && (
        <Alert type={message.type} message={message.text} onClose={() => setMessage({ type: '', text: '' })} />
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total products" value={products.length} icon={Package} />
        <StatCard label="Units in stock" value={totalUnits.toLocaleString()} icon={Boxes} />
        <StatCard label="Inventory value" value={`${totalValue.toLocaleString()} RWF`} hint="Qty × unit price" icon={Coins} />
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        {/* Form column */}
        <div className="xl:col-span-4">
          <Panel title="Add new product" description="All fields are required">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-grid">
                <div>
                  <label className="label">Product code</label>
                  <input name="productCode" className="input" value={form.productCode} onChange={handleChange} required placeholder="P001" />
                </div>
                <div>
                  <label className="label">Product name</label>
                  <input name="productName" className="input" value={form.productName} onChange={handleChange} required />
                </div>
                <div>
                  <label className="label">Category</label>
                  <input name="category" className="input" value={form.category} onChange={handleChange} required placeholder="Grains" />
                </div>
                <div>
                  <label className="label">Quantity in stock</label>
                  <input name="quantityInStock" type="number" min="0" className="input" value={form.quantityInStock} onChange={handleChange} required />
                </div>
                <div>
                  <label className="label">Unit price (RWF)</label>
                  <input name="unitPrice" type="number" min="0" step="0.01" className="input" value={form.unitPrice} onChange={handleChange} required />
                </div>
                <div>
                  <label className="label">Supplier name</label>
                  <input name="supplierName" className="input" value={form.supplierName} onChange={handleChange} required />
                </div>
                <div>
                  <label className="label">Date received</label>
                  <input name="dateReceived" type="date" className="input" value={form.dateReceived} onChange={handleChange} required />
                </div>
                <div className="form-grid-full">
                  <label className="label">Warehouse</label>
                  <select name="warehouseCode" className="input" value={form.warehouseCode} onChange={handleChange} required>
                    <option value="">Select warehouse…</option>
                    {warehouses.map((w) => (
                      <option key={w.warehouseCode} value={w.warehouseCode}>
                        {w.warehouseName} ({w.warehouseCode})
                      </option>
                    ))}
                  </select>
                  {warehouses.length === 0 && (
                    <p className="mt-1.5 text-xs text-amber-700">Add a warehouse first before registering products.</p>
                  )}
                </div>
              </div>
              <div className="border-t border-slate-100 pt-4">
                <button type="submit" className="btn-primary w-full gap-2 sm:w-auto" disabled={loading}>
                  <Plus className="h-4 w-4" />
                  {loading ? 'Saving…' : 'Save product'}
                </button>
              </div>
            </form>
          </Panel>
        </div>

        {/* Table column */}
        <div className="xl:col-span-8">
          <Panel
            title="Product inventory"
            description={`${products.length} item${products.length !== 1 ? 's' : ''} registered`}
          >
            {products.length === 0 ? (
              <EmptyState title="No products yet" description="Use the form to add your first product." />
            ) : (
              <div className="data-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Name</th>
                      <th>Category</th>
                      <th className="text-right">Stock</th>
                      <th className="text-right">Price</th>
                      <th>Warehouse</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.productCode}>
                        <td className="font-mono text-xs font-semibold text-primary-700">{p.productCode}</td>
                        <td className="font-medium text-slate-900">{p.productName}</td>
                        <td><span className="badge-neutral">{p.category}</span></td>
                        <td className="text-right font-semibold tabular-nums">{p.quantityInStock}</td>
                        <td className="text-right tabular-nums text-slate-600">{Number(p.unitPrice).toLocaleString()}</td>
                        <td className="text-slate-600">{p.warehouseName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
