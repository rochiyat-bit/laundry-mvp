import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import {
  LogOut,
  LayoutDashboard,
  ShoppingBag,
  DollarSign,
  Users,
  Package,
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return <>{children}</>;
  }

  const isAdmin = user.role === 'ADMIN';
  const isStaff = user.role === 'STAFF' || isAdmin;

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-primary-800 text-white">
        <div className="p-6">
          <h1 className="text-2xl font-bold">Laundry System</h1>
          <p className="text-primary-200 text-sm mt-1">{user.name}</p>
          <p className="text-primary-300 text-xs">{user.role}</p>
        </div>

        <nav className="mt-6">
          <Link
            to="/dashboard"
            className="flex items-center px-6 py-3 hover:bg-primary-700 transition-colors"
          >
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Dashboard
          </Link>

          <Link
            to="/orders"
            className="flex items-center px-6 py-3 hover:bg-primary-700 transition-colors"
          >
            <ShoppingBag className="w-5 h-5 mr-3" />
            Orders
          </Link>

          {isStaff && (
            <>
              <Link
                to="/services"
                className="flex items-center px-6 py-3 hover:bg-primary-700 transition-colors"
              >
                <Package className="w-5 h-5 mr-3" />
                Services & Pricing
              </Link>
            </>
          )}

          {isAdmin && (
            <Link
              to="/users"
              className="flex items-center px-6 py-3 hover:bg-primary-700 transition-colors"
            >
              <Users className="w-5 h-5 mr-3" />
              User Management
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center w-full px-6 py-3 hover:bg-primary-700 transition-colors text-left"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
