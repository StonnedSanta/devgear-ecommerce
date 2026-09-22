import { Link } from 'react-router-dom';
import { ShoppingBag, LayoutDashboard, LogOut, LogIn, ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-primary" />
          <span>DevGear</span>
        </Link>
        <nav className="flex items-center gap-6">
          {/* <Link to="/" className="hover:text-primary font-medium transition-colors">
            Catalog
          </Link> */}

          <Link to="/cart" className="relative flex items-center gap-1 hover:text-primary font-medium transition-colors">
            <ShoppingCart className="w-5 h-5" />
            <span>Cart</span>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-3 bg-primary text-primary-foreground text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>

          {user ? (
            <>
              <Link to="/admin" className="flex items-center gap-1 hover:text-primary font-medium transition-colors">
                <LayoutDashboard className="w-4 h-4" />
                Admin
              </Link>
              <button onClick={logout} className="flex items-center gap-1 text-destructive font-medium hover:opacity-80">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="flex items-center gap-1 hover:text-primary font-medium transition-colors">
              <LogIn className="w-4 h-4" /> Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}