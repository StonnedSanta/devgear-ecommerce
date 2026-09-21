import { Link } from 'react-router-dom';
import { ShoppingBag, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-primary" />
          <span>DevGear</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link to="/" className="hover:text-primary font-medium transition-colors">
            Catalog
          </Link>
          <Link to="/admin" className="flex items-center gap-1 hover:text-primary font-medium transition-colors">
            <LayoutDashboard className="w-4 h-4" />
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}