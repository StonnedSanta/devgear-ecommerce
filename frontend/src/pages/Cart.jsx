import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import {
    Trash2,
    ShoppingBag,
    ArrowLeft,
} from 'lucide-react';

// Constants

const FALLBACK_PRODUCT_IMAGE =
    'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500&auto=format&fit=crop';

// Helpers

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(amount) || 0);
};

const getProductId = (item) => {
    return item._id || item.id;
};

const getProductName = (item) => {
    return item.title || item.name || 'Unnamed Product';
};

const getProductImage = (item) => {
    return (
        item.image ||
        item.imageUrl ||
        item.thumbnail ||
        FALLBACK_PRODUCT_IMAGE
    );
};

// Cart Component

export default function Cart() {
    const {
        cart,
        removeFromCart,
        updateQuantity,
        totalPrice,
        clearCart,
    } = useCart();

    const formattedTotal = formatCurrency(totalPrice);

    // Empty Cart

    if (!cart || cart.length === 0) {
        return (
            <div className="max-w-md mx-auto text-center py-16 bg-card border rounded-xl p-8 shadow-sm">
                <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />

                <h2 className="text-2xl font-bold mb-2">
                    Your Cart is Empty
                </h2>

                <p className="text-sm text-muted-foreground mb-6">
                    Explore the developer catalog and grab some gear.
                </p>

                <Link
                    to="/"
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90 transition"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Browse Catalog
                </Link>
            </div>
        );
    }

    // Cart Screen

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-4">
                <h1 className="text-3xl font-extrabold">
                    Shopping Cart
                </h1>

                <button
                    type="button"
                    onClick={clearCart}
                    className="text-sm text-destructive hover:underline"
                >
                    Clear Cart
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Cart Items */}

                <div className="md:col-span-2 space-y-4">
                    {cart.map((item) => {
                        const id = getProductId(item);

                        const price = Number(item.price) || 0;

                        const quantity =
                            Number(item.quantity) || 1;

                        const productName = getProductName(item);

                        const productImage = getProductImage(item);

                        return (
                            <div
                                key={id}
                                className="flex items-center gap-4 bg-card border rounded-xl p-4 shadow-sm"
                            >
                                {/* Product Image */}
                                <img
                                    src={productImage}
                                    alt={productName}
                                    className="w-20 h-20 shrink-0 object-cover rounded-lg border bg-background"
                                    onError={(event) => {
                                        event.currentTarget.onerror =
                                            null;

                                        event.currentTarget.src =
                                            FALLBACK_PRODUCT_IMAGE;
                                    }}
                                />

                                {/* Product Details */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-lg line-clamp-2">
                                        {productName}
                                    </h3>

                                    <p className="text-sm text-muted-foreground">
                                        {formatCurrency(price)} each
                                    </p>

                                    {/* Quantity Controls */}
                                    <div className="flex items-center gap-3 mt-2">
                                        <div className="flex items-center border rounded bg-background">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    updateQuantity(
                                                        id,
                                                        quantity - 1
                                                    )
                                                }
                                                disabled={quantity <= 1}
                                                className="px-2 py-0.5 text-sm font-bold hover:bg-accent rounded-l disabled:opacity-40 disabled:cursor-not-allowed"
                                                aria-label={`Decrease quantity of ${productName}`}
                                            >
                                                -
                                            </button>

                                            <span className="px-3 text-xs font-semibold">
                                                {quantity}
                                            </span>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    updateQuantity(
                                                        id,
                                                        quantity + 1
                                                    )
                                                }
                                                className="px-2 py-0.5 text-sm font-bold hover:bg-accent rounded-r"
                                                aria-label={`Increase quantity of ${productName}`}
                                            >
                                                +
                                            </button>
                                        </div>

                                        {/* Remove Item */}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeFromCart(id)
                                            }
                                            className="text-destructive hover:opacity-80 p-1"
                                            title="Remove Item"
                                            aria-label={`Remove ${productName} from cart`}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Item Total */}
                                <div className="text-right font-extrabold text-lg whitespace-nowrap">
                                    {formatCurrency(
                                        price * quantity
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Order Summary */}

                <div className="bg-card border rounded-xl p-6 shadow-sm h-fit space-y-4">
                    <h2 className="text-xl font-bold border-b pb-3">
                        Order Summary
                    </h2>

                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                            Subtotal
                        </span>

                        <span className="font-semibold">
                            {formattedTotal}
                        </span>
                    </div>

                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                            Shipping
                        </span>

                        <span className="font-semibold text-emerald-600">
                            Free
                        </span>
                    </div>

                    <div className="border-t pt-3 flex justify-between font-extrabold text-lg">
                        <span>Total</span>

                        <span>{formattedTotal}</span>
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