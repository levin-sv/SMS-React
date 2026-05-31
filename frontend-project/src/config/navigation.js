import {
  Package,
  Warehouse,
  ArrowLeftRight,
  BarChart3,
  LogOut,
} from 'lucide-react';

export const navItems = [
  { to: '/products', label: 'Products', desc: 'Inventory items', icon: Package },
  { to: '/warehouses', label: 'Warehouses', desc: 'Storage locations', icon: Warehouse },
  { to: '/transactions', label: 'Transactions', desc: 'Stock in & out', icon: ArrowLeftRight },
  { to: '/reports', label: 'Reports', desc: 'Analytics', icon: BarChart3 },
];

export { LogOut };
