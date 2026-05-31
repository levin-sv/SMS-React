import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Package, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { navItems } from '../config/navigation';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const current = navItems.find((n) => location.pathname.startsWith(n.to));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <>
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-500 text-white shadow-sm transition-transform duration-200 hover:scale-105">
          <Package className="h-5 w-5" strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-bold text-white">StockHub SMS</p>
          <p className="truncate text-xs text-slate-400">Kigali, Rwanda</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
          Main menu
        </p>
        {navItems.map(({ to, label, desc, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => (isActive ? 'nav-link-active' : 'nav-link-inactive')}
          >
            <Icon className="h-5 w-5 shrink-0" strokeWidth={2} />
            <span className="min-w-0">
              <span className="block truncate">{label}</span>
              <span className="block truncate text-xs font-normal opacity-70">{desc}</span>
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="mb-3 rounded-lg bg-slate-800/80 px-3 py-2.5 transition-colors hover:bg-slate-800">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Logged in as</p>
          <p className="truncate text-sm font-semibold text-white">{user?.username}</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="btn-secondary flex w-full items-center justify-center gap-2 !border-slate-600 !bg-slate-800 !text-slate-200 hover:!-translate-y-0.5 hover:!border-red-400/50 hover:!bg-red-950/50 hover:!text-red-100"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-slate-950 shadow-sidebar lg:flex">
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close menu"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col bg-slate-950 shadow-sidebar transition-transform duration-300 ease-out lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          type="button"
          className="absolute right-3 top-3 rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        <SidebarContent />
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex h-14 items-center justify-between gap-4 px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                className="rounded-lg p-2 text-slate-600 transition hover:bg-primary-50 hover:text-primary-700 lg:hidden"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="min-w-0">
                <p className="truncate font-display text-sm font-bold text-slate-900 sm:text-base">
                  {current?.label ?? 'StockHub'}
                </p>
                <p className="hidden truncate text-xs text-slate-500 sm:block">
                  {current?.desc ?? 'Stock Management System'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 sm:inline">
                {user?.username}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="btn-ghost btn-sm gap-1.5 lg:hidden"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <Outlet />
        </main>

        <footer className="border-t border-slate-200 bg-white px-4 py-4 text-center text-xs text-slate-400 sm:px-6">
          © 2026 StockHub Ltd · SMS
        </footer>
      </div>
    </div>
  );
}
