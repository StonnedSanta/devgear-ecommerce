import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();

  const formattedTotal = Number(totalPrice || 0).toFixed(2);

  if (!cart || cart.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-16 bg-card border rounded-xl p-8 shadow-sm">
        <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Your Cart is Empty</h2>
        <p className="text-sm text-muted-foreground mb-6">Explore the developer catalog and grab some gear.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90"
        >
          <ArrowLeft className="w-4 h-4" /> Browse Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-3xl font-extrabold">Shopping Cart</h1>
        <button onClick={clearCart} className="text-sm text-destructive hover:underline">
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          {cart.map((item) => {
            const id = item._id || item.id;
            const price = Number(item.price || 0);
            return (
              <div key={id} className="flex items-center gap-4 bg-card border rounded-xl p-4 shadow-sm">
                <img
                  src={item.imageUrl || 'https://via.placeholder.com/150'}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg border"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">${price.toFixed(2)} each</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center border rounded bg-background">
                      <button
                        onClick={() => updateQuantity(id, item.quantity - 1)}
                        className="px-2 py-0.5 text-sm font-bold hover:bg-accent rounded-l"
                      >
                        -
                      </button>
                      <span className="px-3 text-xs font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(id, item.quantity + 1)}
                        className="px-2 py-0.5 text-sm font-bold hover:bg-accent rounded-r"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(id)}
                      className="text-destructive hover:opacity-80 p-1"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="text-right font-extrabold text-lg">
                  ${(price * item.quantity).toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="bg-card border rounded-xl p-6 shadow-sm h-fit space-y-4">
          <h2 className="text-xl font-bold border-b pb-3">Order Summary</h2>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-semibold">${formattedTotal}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span className="font-semibold text-emerald-600">Free</span>
          </div>
          <div className="border-t pt-3 flex justify-between font-extrabold text-lg">
            <span>Total</span>
            <span>${formattedTotal}</span>
          </div>
          <Link
            to="/checkout"
            className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-lg hover:opacity-90 block text-center transition"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}