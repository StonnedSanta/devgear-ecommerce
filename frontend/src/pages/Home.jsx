import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { ShoppingCart, PackageX } from 'lucide-react';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    API.get('/api/products')
      .then((res) => {
        // Defensive array checks for safe state initialization
        const data = Array.isArray(res.data) ? res.data : (res.data?.products || []);
        setProducts(data);
      })
      .catch((err) => {
        console.error('Failed to fetch products:', err);
        setError('Failed to load products. Please check connection.');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground font-medium">Loading DevGear products...</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-destructive font-medium">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight">Developer Gear Catalog</h1>
        <p className="text-muted-foreground">{products.length} Items Available</p>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border rounded-xl bg-card">
          <PackageX className="w-12 h-12 text-muted-foreground mb-3" />
          <h3 className="text-lg font-semibold">No products found</h3>
          <p className="text-sm text-muted-foreground mt-1">Check back later or add items from the admin panel.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => {
            const productId = p._id || p.id;
            const price = typeof p.price === 'number' ? p.price.toFixed(2) : p.price;

            return (
              <div key={productId} className="bg-card border rounded-xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <img
                  src={p.imageUrl || 'https://via.placeholder.com/300'}
                  alt={p.name}
                  className="h-48 w-full object-cover"
                />
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                      {p.category || 'Gear'}
                    </span>
                    <h2 className="text-lg font-bold mt-1 line-clamp-1">{p.name}</h2>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{p.description}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-lg font-extrabold">${price}</span>
                    <Link
                      to={`/product/${productId}`}
                      className="inline-flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                      <ShoppingCart className="w-4 h-4" /> View
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}