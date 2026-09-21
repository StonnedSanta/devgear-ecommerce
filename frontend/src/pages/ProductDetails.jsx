import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../api/axios';
import { useCart } from '../context/CartContext';
import { ShoppingCart, ArrowLeft, Check, PackageX, Truck, ShieldCheck } from 'lucide-react';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);

    API.get(`/api/products/${id}`)
      .then((res) => {
        const data = res.data?.product || res.data;
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          setProduct(data);
        } else {
          setError('Product not found.');
        }
      })
      .catch((err) => {
        console.error('Failed to fetch product details:', err);
        setError(err.response?.data?.message || 'Failed to load product details.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-muted-foreground font-medium">Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-md mx-auto text-center py-16 bg-card border rounded-xl p-8 shadow-sm my-8">
        <PackageX className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
        <p className="text-sm text-muted-foreground mb-6">{error || 'The requested product does not exist.'}</p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Catalog
        </button>
      </div>
    );
  }

  const price = typeof product.price === 'number' ? product.price.toFixed(2) : product.price;
  const isOutOfStock = product.stock === 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Catalog
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-card border rounded-xl p-6 shadow-sm">
        <div className="overflow-hidden rounded-lg bg-muted border flex items-center justify-center aspect-square">
          <img
            src={product.imageUrl || 'https://via.placeholder.com/600'}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                {product.category || 'Developer Gear'}
              </span>
              <h1 className="text-3xl font-extrabold mt-3">{product.name}</h1>
            </div>

            <div className="text-3xl font-bold text-foreground">${price}</div>

            <p className="text-muted-foreground leading-relaxed text-sm">
              {product.description || 'No description provided for this gear.'}
            </p>

            <div className="flex items-center gap-2 text-sm font-medium">
              <span className={`w-2.5 h-2.5 rounded-full ${isOutOfStock ? 'bg-destructive' : 'bg-emerald-500'}`} />
              <span className={isOutOfStock ? 'text-destructive' : 'text-emerald-600'}>
                {isOutOfStock ? 'Out of Stock' : product.stock ? `${product.stock} units available` : 'In Stock'}
              </span>
            </div>
          </div>

          <div className="space-y-4 border-t pt-6">
            {!isOutOfStock && (
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">Quantity:</label>
                <div className="flex items-center border rounded-lg bg-background">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1 hover:bg-muted font-bold text-lg"
                  >
                    -
                  </button>
                  <span className="px-4 py-1 text-sm font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3 py-1 hover:bg-muted font-bold text-lg"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                added
                  ? 'bg-emerald-600 text-white'
                  : 'bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-5 h-5" /> Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" /> {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                </>
              )}
            </button>

            <div className="grid grid-cols-2 gap-4 pt-4 text-xs text-muted-foreground border-t">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary" /> Fast Worldwide Shipping
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" /> 30-Day Guarantee
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}