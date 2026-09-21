import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import API from '../api/axios';
import { ArrowLeft, CreditCard, Lock, CheckCircle2 } from 'lucide-react';

export default function Checkout() {
    const { cart, totalPrice, clearCart } = useCart();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [shippingInfo, setShippingInfo] = useState({
        fullName: '',
        email: '',
        address: '',
        city: '',
        postalCode: '',
        country: '',
    });

    const handleChange = (e) => {
        setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (cart.length === 0) return;

        setLoading(true);
        setError('');

        const orderPayload = {
            orderItems: cart.map((item) => ({
                product: item._id || item.id,
                name: item.name,
                quantity: item.quantity,
                price: Number(item.price),
            })),
            shippingAddress: shippingInfo,
            totalPrice,
        };

        try {
            await API.post('/orders', orderPayload);
            clearCart();
            setSuccess(true);
        } catch (err) {
            console.error('Checkout failed:', err);
            setError(err.response?.data?.message || 'Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="max-w-lg mx-auto text-center py-16 bg-card border rounded-xl p-8 shadow-sm my-8 space-y-4">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
                <h1 className="text-3xl font-extrabold">Order Placed Successfully!</h1>
                <p className="text-muted-foreground text-sm">
                    Thank you for your purchase. We have received your order and are getting it ready.
                </p>
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-semibold hover:opacity-90 transition mt-4"
                >
                    Continue Shopping
                </Link>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="max-w-md mx-auto text-center py-16 bg-card border rounded-xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold mb-2">Your Cart is Empty</h2>
                <p className="text-sm text-muted-foreground mb-6">Add items to your cart before proceeding to checkout.</p>
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
            <Link
                to="/cart"
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Cart
            </Link>

            <h1 className="text-3xl font-extrabold border-b pb-4">Checkout</h1>

            {error && <div className="bg-destructive/15 text-destructive p-3 rounded-lg text-sm">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Shipping Form */}
                <form onSubmit={handleSubmit} className="md:col-span-2 space-y-6 bg-card border rounded-xl p-6 shadow-sm">
                    <h2 className="text-xl font-bold">Shipping Information</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="text-sm font-medium">Full Name</label>
                            <input
                                type="text"
                                name="fullName"
                                value={shippingInfo.fullName}
                                onChange={handleChange}
                                required
                                className="w-full border p-2 rounded-lg bg-background mt-1"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-sm font-medium">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={shippingInfo.email}
                                onChange={handleChange}
                                required
                                className="w-full border p-2 rounded-lg bg-background mt-1"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-sm font-medium">Street Address</label>
                            <input
                                type="text"
                                name="address"
                                value={shippingInfo.address}
                                onChange={handleChange}
                                required
                                className="w-full border p-2 rounded-lg bg-background mt-1"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">City</label>
                            <input
                                type="text"
                                name="city"
                                value={shippingInfo.city}
                                onChange={handleChange}
                                required
                                className="w-full border p-2 rounded-lg bg-background mt-1"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Postal Code</label>
                            <input
                                type="text"
                                name="postalCode"
                                value={shippingInfo.postalCode}
                                onChange={handleChange}
                                required
                                className="w-full border p-2 rounded-lg bg-background mt-1"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-sm font-medium">Country</label>
                            <input
                                type="text"
                                name="country"
                                value={shippingInfo.country}
                                onChange={handleChange}
                                required
                                className="w-full border p-2 rounded-lg bg-background mt-1"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-lg hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            'Processing Order...'
                        ) : (
                            <>
                                <Lock className="w-4 h-4" /> Place Order (${totalPrice.toFixed(2)})
                            </>
                        )}
                    </button>
                </form>

                {/* Order Summary */}
                <div className="bg-card border rounded-xl p-6 shadow-sm h-fit space-y-4">
                    <h2 className="text-xl font-bold border-b pb-3">Items in Order</h2>
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                        {cart.map((item) => {
                            const id = item._id || item.id;
                            return (
                                <div key={id} className="flex justify-between items-center text-sm">
                                    <div>
                                        <p className="font-semibold line-clamp-1">{item.name}</p>
                                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                    </div>
                                    <span className="font-bold">${(Number(item.price) * item.quantity).toFixed(2)}</span>
                                </div>
                            );
                        })}
                    </div>

                    <div className="border-t pt-3 space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span className="font-semibold">${totalPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Shipping</span>
                            <span className="font-semibold text-emerald-600">Free</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between font-extrabold text-lg">
                            <span>Total</span>
                            <span>${totalPrice.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}