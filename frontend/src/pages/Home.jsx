import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';

import {
    ShoppingCart,
    PackageX,
    ArrowRight,
    Truck,
    ShieldCheck,
    Headphones,
    Settings,
    Zap,
    Trophy,
    Heart,
} from 'lucide-react';

// Helpers

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(amount) || 0);
};

// Benefits

const benefits = [
    {
        icon: Settings,
        title: 'Curated for Developers',
        description: 'Only the best gear',
    },
    {
        icon: Zap,
        title: 'Boost Productivity',
        description: 'Gear that keeps you in flow',
    },
    {
        icon: Trophy,
        title: 'Quality & Reliability',
        description: 'Trusted by creators',
    },
    {
        icon: Heart,
        title: 'A Growing Community',
        description: 'Built by devs, for devs',
    },
];

// Home Component

export default function Home() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await API.get('/products');

                const data = Array.isArray(response.data)
                    ? response.data
                    : response.data?.products || [];

                setProducts(data);
            } catch (err) {
                console.error('Failed to fetch products:', err);

                setError(
                    err.response?.data?.message ||
                    'Failed to load products. Please try again.'
                );
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Loading State

    if (loading) {
        return (
            <div className="text-center py-20 text-muted-foreground font-medium">
                Loading DevGear products...
            </div>
        );
    }

    // Error State

    if (error) {
        return (
            <div className="text-center py-20 text-destructive font-medium">
                {error}
            </div>
        );
    }

    const heroProductNames = [
        'Ergonomic Wireless Mouse',
        'UltraWide 34" Curved Monitor',
        'Noise-Canceling Wireless Headphones',
        'Adjustable Aluminium Laptop Stand',
    ];

    const heroProducts = products.filter((product) => {
        const productName = (
            product.title ||
            product.name ||
            ''
        ).trim().toLowerCase();

        return heroProductNames.some(
            (heroName) => heroName.toLowerCase() === productName
        );
    });

    // Main Page

    return (
        <div className="space-y-16 pb-10">

            {/* Hero Section */}

            <section className="relative overflow-hidden rounded-3xl bg-muted/40 border">
                <div className="grid grid-cols-1 lg:grid-cols-2">

                    {/* Hero Content */}
                    <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-14">
                        <span className="text-sm font-bold tracking-widest text-muted-foreground uppercase mb-4">
                            Built for Developers
                        </span>

                        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                            Gear Up Your
                            <br />
                            Development Journey
                        </h1>

                        <p className="text-muted-foreground text-base sm:text-lg mt-5 max-w-lg leading-relaxed">
                            Premium tech gear for developers, designers,
                            and creators. Productivity. Performance.
                            Possibilities.
                        </p>

                        <div className="mt-8">
                            <a
                                href="#featured-products"
                                className="inline-flex items-center gap-3 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95"
                            >
                                Browse Catalog
                                <ArrowRight size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Dynamic Product Showcase */}
                    <div className="relative min-h-[320px] lg:min-h-[430px] bg-background p-5 sm:p-8">
                        <div className="grid grid-cols-2 gap-4 h-full">
                            {heroProducts.map((product, index) => {
                                const productId =
                                    product._id || product.id;

                                const productName =
                                    product.title ||
                                    product.name ||
                                    'Product';

                                const productImage =
                                    product.image ||
                                    product.imageUrl ||
                                    'https://via.placeholder.com/300';

                                return (
                                    <Link
                                        key={productId}
                                        to={`/product/${productId}`}
                                        className={`relative overflow-hidden rounded-2xl border bg-card group ${index === 0
                                            ? 'row-span-2'
                                            : ''
                                            }`}
                                    >
                                        <img
                                            src={productImage}
                                            alt={productName}
                                            loading="lazy"
                                            decoding="async"
                                            className="w-full h-full min-h-32 object-cover group-hover:scale-105 transition-transform duration-500"
                                            onError={(event) => {
                                                event.currentTarget.onerror =
                                                    null;

                                                event.currentTarget.src =
                                                    'https://via.placeholder.com/300';
                                            }}
                                        />

                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-10">
                                            <p className="text-white text-xs sm:text-sm font-semibold line-clamp-1">
                                                {productName}
                                            </p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Service Highlights */}

                <div className="border-t bg-card">
                    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 py-7 sm:grid-cols-3 sm:gap-4">

                        {/* Free Shipping */}
                        <div className="flex items-center justify-center gap-3">
                            <Truck
                                className="w-7 h-7 shrink-0"
                                strokeWidth={1.8}
                            />

                            <div className="text-left">
                                <p className="font-bold text-sm">
                                    Free Shipping
                                </p>

                                <p className="text-xs text-muted-foreground">
                                    On all orders
                                </p>
                            </div>
                        </div>

                        {/* Secure Payments */}
                        <div className="flex items-center justify-center gap-3">
                            <ShieldCheck
                                className="w-7 h-7 shrink-0"
                                strokeWidth={1.8}
                            />

                            <div className="text-left">
                                <p className="font-bold text-sm">
                                    Secure Payments
                                </p>

                                <p className="text-xs text-muted-foreground">
                                    Safe and trusted checkout
                                </p>
                            </div>
                        </div>

                        {/* Developer Support */}
                        <div className="flex items-center justify-center gap-3">
                            <Headphones
                                className="w-7 h-7 shrink-0"
                                strokeWidth={1.8}
                            />

                            <div className="text-left">
                                <p className="font-bold text-sm">
                                    Developer Support
                                </p>

                                <p className="text-xs text-muted-foreground">
                                    Here to help
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Featured Products */}

            <section
                id="featured-products"
                className="scroll-mt-24 space-y-6"
            >
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 border-b pb-5">
                    <div>
                        <h2 className="text-3xl font-extrabold tracking-tight">
                            Featured Products
                        </h2>

                        <p className="text-muted-foreground mt-2">
                            Handpicked gear to power your workflow.
                        </p>
                    </div>

                    <p className="text-sm text-muted-foreground font-medium">
                        {products.length} Items Available
                    </p>
                </div>

                {products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center border rounded-xl bg-card">
                        <PackageX className="w-12 h-12 text-muted-foreground mb-3" />

                        <h3 className="text-lg font-semibold">
                            No products found
                        </h3>

                        <p className="text-sm text-muted-foreground mt-1">
                            Add products from the admin panel.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {products.map((product) => {
                            const productId =
                                product._id || product.id;

                            const productName =
                                product.title ||
                                product.name ||
                                'Unnamed Product';

                            const productImage =
                                product.image ||
                                product.imageUrl ||
                                'https://via.placeholder.com/300';

                            const productPrice = formatCurrency(
                                product.price
                            );

                            return (
                                <div
                                    key={productId}
                                    className="bg-card border rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-lg transition-shadow duration-300"
                                >
                                    <Link
                                        to={`/product/${productId}`}
                                        className="block overflow-hidden"
                                    >
                                        <img
                                            src={productImage}
                                            alt={productName}
                                            loading="lazy"
                                            decoding="async"
                                            className="h-52 w-full object-cover hover:scale-105 transition-transform duration-500"
                                            onError={(event) => {
                                                event.currentTarget.onerror =
                                                    null;

                                                event.currentTarget.src =
                                                    'https://via.placeholder.com/300';
                                            }}
                                        />
                                    </Link>

                                    <div className="p-4 flex-1 flex flex-col justify-between">
                                        <div>
                                            <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold">
                                                {product.category || 'Gear'}
                                            </span>

                                            <h3 className="text-lg font-bold mt-2 line-clamp-1">
                                                {productName}
                                            </h3>

                                            <p className="text-sm text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
                                                {product.description ||
                                                    'No description available.'}
                                            </p>
                                        </div>

                                        <div className="mt-5 flex items-center justify-between gap-2">
                                            <span className="text-lg font-extrabold">
                                                {productPrice}
                                            </span>

                                            <Link
                                                to={`/product/${productId}`}
                                                className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
                                            >
                                                <ShoppingCart className="w-4 h-4" />
                                                View
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Benefits Strip */}

            <section className="border-y py-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {benefits.map((benefit) => {
                        const Icon = benefit.icon;

                        return (
                            <div
                                key={benefit.title}
                                className="flex items-center justify-center gap-4"
                            >
                                <Icon className="w-8 h-8 shrink-0" />

                                <div>
                                    <p className="font-bold text-sm">
                                        {benefit.title}
                                    </p>

                                    <p className="text-xs text-muted-foreground mt-1">
                                        {benefit.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

        </div>
    );
}