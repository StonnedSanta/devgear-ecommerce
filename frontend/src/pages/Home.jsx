import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import { ShoppingCart } from 'lucide-react';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/api/products')
      .then((res) => setProducts(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-12">Loading DevGear products...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight">Developer Gear Catalog</h1>
        <p className="text-muted-foreground">{products.length} Items Available</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((p) => (
          <div key={p._id} className="bg-card border rounded-xl overflow-hidden shadow-sm flex flex-col justify-between">
            <img src={p.imageUrl || 'https://via.placeholder.com/300'} alt={p.name} className="h-48 w-full object-cover" />
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{p.category}</span>
                <h2 className="text-lg font-bold mt-1">{p.name}</h2>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{p.description}</p>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-lg font-extrabold">${p.price}</span>
                <Link to={`/product/${p._id}`} className="inline-flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-sm font-medium hover:opacity-90">
                  <ShoppingCart className="w-4 h-4" /> View
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}