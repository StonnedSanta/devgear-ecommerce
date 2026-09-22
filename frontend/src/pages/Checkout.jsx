
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import API from '../api/axios';
import {
    ArrowLeft,
    Lock,
    CheckCircle2
} from 'lucide-react';

export default function Checkout() {
    const { cart, totalPrice, clearCart } = useCart();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [paymentMethod, setPaymentMethod] = useState('COD');

    const [shippingInfo, setShippingInfo] = useState({
        fullName: '',
        email: '',
        address: '',
        city: '',
        postalCode: '',
        country: ''
    });

    const handleChange = (e) => {
        setShippingInfo({
            ...shippingInfo,
            [e.target.name]: e.target.value
        });
    };

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }

            const script = document.createElement('script');

            script.src =
                'https://checkout.razorpay.com/v1/checkout.js';

            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);

            document.body.appendChild(script);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(
            'Selected payment method:',
            paymentMethod
        );

        if (cart.length === 0) {
            return;
        }

        if (!shippingInfo.fullName.trim()) {
            setError('Customer name is required');
            return;
        }

        setLoading(true);
        setError('');

        const orderItems = cart.map((item) => ({
            productId: item._id || item.id,
            quantity: item.quantity
        }));

        const orderPayload = {
            customerName: shippingInfo.fullName.trim(),
            items: orderItems,
            paymentMethod
        };

        try {
            // COD uses the existing direct order endpoint.
            if (paymentMethod === 'COD') {
                const response = await API.post(
                    '/orders',
                    orderPayload
                );

                console.log(
                    'COD order created:',
                    response.data
                );

                clearCart();
                setSuccess(true);
                return;
            }
            console.log(
                'Razorpay flow started for:',
                paymentMethod
            );
            // Load Razorpay Checkout script.
            const scriptLoaded = await loadRazorpayScript();

            if (!scriptLoaded) {
                throw new Error(
                    'Unable to load Razorpay Checkout'
                );
            }

            // Create Razorpay payment order.
            const paymentOrderResponse = await API.post(
                '/payments/create-order',
                {
                    customerName: orderPayload.customerName,
                    items: orderItems
                }
            );

            const {
                keyId,
                orderId,
                amount,
                currency
            } = paymentOrderResponse.data;

            const options = {
                key:
                    keyId ||
                    import.meta.env.VITE_RAZORPAY_KEY_ID,

                amount,
                currency,

                name: 'DevGear',
                description: 'DevGear purchase',

                order_id: orderId,

                // Request UPI as payment method 
                method: paymentMethod === 'UPI'
                    ? 'upi'
                    : undefined,

                prefill: {
                    name: shippingInfo.fullName,
                    email: shippingInfo.email
                },

                theme: {
                    color: '#6366f1'
                },

                // Runs after successful Razorpay payment.
                handler: async (paymentResponse) => {
                    try {
                        await API.post(
                            '/payments/verify',
                            {
                                ...paymentResponse,
                                customerName:
                                    orderPayload.customerName,
                                items: orderItems,
                                paymentMethod
                            }
                        );

                        clearCart();
                        setSuccess(true);
                    } catch (verificationError) {
                        setError(
                            verificationError.response?.data
                                ?.message ||
                            'Payment succeeded, but order verification failed. Contact support.'
                        );
                    } finally {
                        setLoading(false);
                    }
                },

                modal: {
                    ondismiss: () => {
                        setLoading(false);
                    }
                }
            };

            const razorpayCheckout =
                new window.Razorpay(options);

            razorpayCheckout.on(
                'payment.failed',
                (paymentError) => {
                    setError(
                        paymentError.error?.description ||
                        'Payment failed. Please try again.'
                    );

                    setLoading(false);
                }
            );

            razorpayCheckout.open();
        } catch (err) {
            console.error('Checkout failed:', err);

            setError(
                err.response?.data?.message ||
                err.message ||
                'Failed to place order. Please try again.'
            );

            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="max-w-lg mx-auto text-center py-16 bg-card border rounded-xl p-8 shadow-sm my-8 space-y-4">
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />

                <h1 className="text-3xl font-extrabold">
                    Order Placed Successfully!
                </h1>

                <p className="text-muted-foreground text-sm">
                    Thank you for your purchase. We have received
                    your order and are getting it ready.
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
                <h2 className="text-2xl font-bold mb-2">
                    Your Cart is Empty
                </h2>

                <p className="text-sm text-muted-foreground mb-6">
                    Add items to your cart before proceeding to
                    checkout.
                </p>

                <Link
                    to="/"
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Browse Catalog
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
                <ArrowLeft className="w-4 h-4" />
                Back to Cart
            </Link>

            <h1 className="text-3xl font-extrabold border-b pb-4">
                Checkout
            </h1>

            {error && (
                <div className="bg-destructive/15 text-destructive p-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Shipping Form */}
                <form
                    onSubmit={handleSubmit}
                    className="md:col-span-2 space-y-6 bg-card border rounded-xl p-6 shadow-sm"
                >
                    <h2 className="text-xl font-bold">
                        Shipping Information
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* Full Name */}
                        <div className="md:col-span-2">
                            <label className="text-sm font-medium">
                                Full Name
                            </label>

                            <input
                                type="text"
                                name="fullName"
                                value={shippingInfo.fullName}
                                onChange={handleChange}
                                required
                                className="w-full border p-2 rounded-lg bg-background mt-1"
                                placeholder="Enter your full name"
                            />
                        </div>

                        {/* Email */}
                        <div className="md:col-span-2">
                            <label className="text-sm font-medium">
                                Email Address
                            </label>

                            <input
                                type="email"
                                name="email"
                                value={shippingInfo.email}
                                onChange={handleChange}
                                required
                                className="w-full border p-2 rounded-lg bg-background mt-1"
                                placeholder="Enter your email"
                            />
                        </div>

                        {/* Street Address */}
                        <div className="md:col-span-2">
                            <label className="text-sm font-medium">
                                Street Address
                            </label>

                            <input
                                type="text"
                                name="address"
                                value={shippingInfo.address}
                                onChange={handleChange}
                                required
                                className="w-full border p-2 rounded-lg bg-background mt-1"
                                placeholder="Enter your street address"
                            />
                        </div>

                        {/* City */}
                        <div>
                            <label className="text-sm font-medium">
                                City
                            </label>

                            <input
                                type="text"
                                name="city"
                                value={shippingInfo.city}
                                onChange={handleChange}
                                required
                                className="w-full border p-2 rounded-lg bg-background mt-1"
                                placeholder="Enter city"
                            />
                        </div>

                        {/* Postal Code */}
                        <div>
                            <label className="text-sm font-medium">
                                Postal Code
                            </label>

                            <input
                                type="text"
                                name="postalCode"
                                value={shippingInfo.postalCode}
                                onChange={handleChange}
                                required
                                className="w-full border p-2 rounded-lg bg-background mt-1"
                                placeholder="Enter postal code"
                            />
                        </div>

                        {/* Country */}
                        <div className="md:col-span-2">
                            <label className="text-sm font-medium">
                                Country
                            </label>

                            <input
                                type="text"
                                name="country"
                                value={shippingInfo.country}
                                onChange={handleChange}
                                required
                                className="w-full border p-2 rounded-lg bg-background mt-1"
                                placeholder="Enter country"
                            />
                        </div>

                        {/* Payment Method */}
                        <div className="md:col-span-2">
                            <label className="text-sm font-medium">
                                Payment Method
                            </label>

                            <select
                                value={paymentMethod}
                                onChange={(e) =>
                                    setPaymentMethod(e.target.value)
                                }
                                required
                                className="w-full border p-2 rounded-lg bg-background mt-1"
                            >
                                <option value="COD">
                                    Cash on Delivery
                                </option>

                                <option value="UPI">
                                    UPI
                                </option>

                                <option value="CARD">
                                    Card
                                </option>
                            </select>
                        </div>
                    </div>

                    {/* Place Order Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-lg hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            'Processing Order...'
                        ) : (
                            <>
                                <Lock className="w-4 h-4" />
                                Place Order (₹
                                {totalPrice.toFixed(2)})
                            </>
                        )}
                    </button>
                </form>

                {/* Order Summary */}
                <div className="bg-card border rounded-xl p-6 shadow-sm h-fit space-y-4">
                    <h2 className="text-xl font-bold border-b pb-3">
                        Items in Order
                    </h2>

                    <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                        {cart.map((item) => {
                            const id = item._id || item.id;

                            const productName =
                                item.title ||
                                item.name ||
                                'Unnamed Product';

                            return (
                                <div
                                    key={id}
                                    className="flex justify-between items-center text-sm"
                                >
                                    <div>
                                        <p className="font-semibold line-clamp-1">
                                            {productName}
                                        </p>

                                        <p className="text-xs text-muted-foreground">
                                            Qty: {item.quantity}
                                        </p>
                                    </div>

                                    <span className="font-bold">
                                        ₹
                                        {(
                                            Number(item.price) *
                                            item.quantity
                                        ).toFixed(2)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    <div className="border-t pt-3 space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                Subtotal
                            </span>

                            <span className="font-semibold">
                                ₹{totalPrice.toFixed(2)}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                Shipping
                            </span>

                            <span className="font-semibold text-emerald-600">
                                Free
                            </span>
                        </div>

                        <div className="border-t pt-2 flex justify-between font-extrabold text-lg">
                            <span>Total</span>

                            <span>
                                ₹{totalPrice.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}