import { useState, useEffect } from 'react';
import API from '../api/axios';
import {
    Plus,
    Trash2,
    Edit,
    XCircle,
    TrendingUp,
    BarChart3,
    CalendarDays,
    Layers,
    ArrowUpRight,
} from 'lucide-react';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(amount) || 0);
};

const EMPTY_FORM = {
    title: '',
    description: '',
    price: '',
    category: '',
    image: '',
    stock: '',
};

export default function AdminDashboard() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [orders, setOrders] = useState([]);

    const fetchProducts = async () => {
        try {
            setError('');

            const res = await API.get('/products');

            const data = Array.isArray(res.data)
                ? res.data
                : res.data?.products || [];

            setProducts(data);
        } catch (err) {
            console.error('Error fetching products:', err);
            setProducts([]);
            setError(
                err.response?.data?.message || 'Failed to load products.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchOrders();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const fetchOrders = async () => {
        try {
            const res = await API.get('/admin/orders');

            setOrders(
                Array.isArray(res.data)
                    ? res.data
                    : []
            );
        } catch (err) {
            console.error('Error fetching orders:', err);
        }
    };

    const handleEditClick = (product) => {
        setEditingId(product._id);

        setFormData({
            title: product.title || '',
            description: product.description || '',
            price: product.price ?? '',
            category: product.category || '',
            image: product.image || '',
            stock: product.stock ?? '',
        });

        setError('');
        setSuccess('');
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData({ ...EMPTY_FORM });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError('');
        setSuccess('');

        const price = Number(formData.price);
        const stock = Number(formData.stock);

        if (price < 0 || stock < 0) {
            setError('Price and stock cannot be negative.');
            return;
        }

        const payload = {
            title: formData.title.trim(),
            description: formData.description.trim(),
            price,
            category: formData.category.trim(),
            image: formData.image.trim(),
            stock,
        };

        try {
            if (editingId) {
                await API.put(`/products/${editingId}`, payload);
                setSuccess('Product updated successfully.');
            } else {
                await API.post('/products', payload);
                setSuccess('Product added successfully.');
            }

            handleCancelEdit();
            await fetchProducts();
        } catch (err) {
            console.error('Error saving product:', err);

            setError(
                err.response?.data?.message || 'Failed to save product.'
            );
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this product?')) return;

        try {
            setError('');
            setSuccess('');

            await API.delete(`/products/${id}`);

            setSuccess('Product deleted successfully.');
            await fetchProducts();
        } catch (err) {
            console.error('Error deleting product:', err);

            setError(
                err.response?.data?.message || 'Failed to delete product.'
            );
        }
    };

    const totalRevenue = orders.reduce(
        (sum, order) => sum + Number(order.totalAmount || 0),
        0
    );

    const totalOrders = orders.length;

    const lowStockProducts = products.filter(
        (product) => Number(product.stock) <= 5
    );

    const categorySales = orders.reduce((accumulator, order) => {
        (order.items || []).forEach((item) => {
            const category =
                products.find(
                    (product) =>
                        String(product._id) === String(item.productId)
                )?.category || 'Other';

            const itemRevenue =
                Number(item.price || 0) * Number(item.quantity || 0);

            accumulator[category] =
                (accumulator[category] || 0) + itemRevenue;
        });

        return accumulator;
    }, {});

    const categorySalesData = Object.entries(categorySales)
        .sort(([, first], [, second]) => second - first)
        .slice(0, 6);

    const dailySales = orders.reduce((accumulator, order) => {
        if (!order.createdAt) return accumulator;

        const dateKey = new Date(order.createdAt)
            .toISOString()
            .slice(0, 10);

        accumulator[dateKey] =
            (accumulator[dateKey] || 0) +
            Number(order.totalAmount || 0);

        return accumulator;
    }, {});

    const formatSalesDate = (dateKey) => {
        const date = new Date(`${dateKey}T00:00:00`);

        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const dailySalesData = Object.entries(dailySales)
        .sort(([first], [second]) => first.localeCompare(second))
        .slice(-7)
        .map(([date, amount]) => [
            formatSalesDate(date),
            amount,
        ]);

    const maxCategorySales = Math.max(
        ...categorySalesData.map(([, amount]) => amount),
        1
    );

    const maxDailySales = Math.max(
        ...dailySalesData.map(([, amount]) => amount),
        1
    );

    const totalCategoryRevenue = categorySalesData.reduce(
        (sum, [, amount]) => sum + amount,
        0
    );

    const totalDailyRevenue = dailySalesData.reduce(
        (sum, [, amount]) => sum + amount,
        0
    );

    const getPercentage = (amount, total) => {
        if (!total || total <= 0) return 0;

        return Math.round((amount / total) * 100);
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight">
                    Admin Dashboard
                </h1>

                <p className="text-muted-foreground">
                    Manage catalog inventory and update developer gear.
                </p>
            </div>

            {error && (
                <div className="rounded-lg bg-destructive/15 p-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            {success && (
                <div className="rounded-lg bg-emerald-500/15 p-3 text-sm text-emerald-600">
                    {success}
                </div>
            )}

            {/* Analytics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card border rounded-xl p-5 shadow-sm">
                    <p className="text-sm text-muted-foreground">
                        Total Revenue
                    </p>
                    <h2 className="text-2xl font-bold mt-1">
                        {formatCurrency(totalRevenue)}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">
                        Across all created orders
                    </p>
                </div>

                <div className="bg-card border rounded-xl p-5 shadow-sm">
                    <p className="text-sm text-muted-foreground">
                        Total Orders
                    </p>
                    <h2 className="text-2xl font-bold mt-1">
                        {totalOrders}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">
                        Orders recorded in the system
                    </p>
                </div>

                <div className="bg-card border rounded-xl p-5 shadow-sm">
                    <p className="text-sm text-muted-foreground">
                        Low Stock Items
                    </p>
                    <h2 className="text-2xl font-bold mt-1">
                        {lowStockProducts.length}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1">
                        Products with five or fewer units
                    </p>
                </div>
            </div>

            {/* Sales Analytics */}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                {/* Sales Trend */}

                <div className="bg-card border rounded-2xl p-6 shadow-sm">

                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">

                        <div>
                            <div className="flex items-center gap-2">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                                    <TrendingUp className="h-5 w-5 text-primary" />
                                </div>

                                <h2 className="text-xl font-bold">
                                    Sales Trend
                                </h2>
                            </div>

                            <p className="text-sm text-muted-foreground mt-3">
                                Revenue performance across recent order dates
                            </p>
                        </div>

                        <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                            Last 7 dates
                        </span>

                    </div>

                    {/* Summary */}
                    <div className="mt-6 rounded-xl border bg-muted/30 p-4">

                        <div className="flex items-center justify-between gap-3">

                            <div>
                                <p className="text-xs font-medium text-muted-foreground">
                                    Recent Revenue
                                </p>

                                <p className="text-2xl font-extrabold tracking-tight mt-1">
                                    {formatCurrency(totalDailyRevenue)}
                                </p>
                            </div>

                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
                                <ArrowUpRight className="h-5 w-5 text-emerald-600" />
                            </div>

                        </div>

                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <CalendarDays className="h-3.5 w-3.5" />
                            <span>Based on recorded order dates</span>
                        </div>

                    </div>

                    {/* Chart */}
                    {dailySalesData.length === 0 ? (

                        <div className="py-12 text-center text-sm text-muted-foreground">
                            No sales data available yet.
                        </div>

                    ) : (

                        <div className="mt-6 space-y-5">

                            {dailySalesData.map(([date, amount]) => {

                                const percentage = getPercentage(
                                    amount,
                                    maxDailySales
                                );

                                return (
                                    <div key={date}>

                                        <div className="flex items-center justify-between gap-4 mb-2">

                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="h-2 w-2 rounded-full bg-primary shrink-0" />

                                                <span className="text-sm font-medium text-muted-foreground truncate">
                                                    {date}
                                                </span>
                                            </div>

                                            <span className="text-sm font-bold whitespace-nowrap">
                                                {formatCurrency(amount)}
                                            </span>

                                        </div>

                                        <div className="h-3 w-full rounded-full bg-muted overflow-hidden">

                                            <div
                                                className="h-full rounded-full bg-primary transition-all duration-700"
                                                style={{
                                                    width: `${percentage}%`,
                                                }}
                                            />

                                        </div>

                                        <div className="flex justify-end mt-1">
                                            <span className="text-[11px] text-muted-foreground">
                                                {percentage}% of peak daily revenue
                                            </span>
                                        </div>

                                    </div>
                                );
                            })}

                        </div>

                    )}

                </div>

                {/* Category-wise Sales */}

                <div className="bg-card border rounded-2xl p-6 shadow-sm">

                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">

                        <div>
                            <div className="flex items-center gap-2">

                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10">
                                    <BarChart3 className="h-5 w-5 text-emerald-600" />
                                </div>

                                <h2 className="text-xl font-bold">
                                    Category-wise Sales
                                </h2>

                            </div>

                            <p className="text-sm text-muted-foreground mt-3">
                                Revenue distribution across product categories
                            </p>
                        </div>

                        <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                            Top 6
                        </span>

                    </div>

                    {/* Summary */}
                    <div className="mt-6 rounded-xl border bg-muted/30 p-4">

                        <div className="flex items-center justify-between gap-3">

                            <div>
                                <p className="text-xs font-medium text-muted-foreground">
                                    Category Revenue
                                </p>

                                <p className="text-2xl font-extrabold tracking-tight mt-1">
                                    {formatCurrency(totalCategoryRevenue)}
                                </p>
                            </div>

                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
                                <Layers className="h-5 w-5 text-emerald-600" />
                            </div>

                        </div>

                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <BarChart3 className="h-3.5 w-3.5" />
                            <span>Revenue grouped by product category</span>
                        </div>

                    </div>

                    {/* Category Chart */}
                    {categorySalesData.length === 0 ? (

                        <div className="py-12 text-center text-sm text-muted-foreground">
                            No category sales data available yet.
                        </div>

                    ) : (

                        <div className="mt-6 space-y-5">

                            {categorySalesData.map(
                                ([category, amount], index) => {

                                    const percentage = getPercentage(
                                        amount,
                                        totalCategoryRevenue
                                    );

                                    const barWidth = getPercentage(
                                        amount,
                                        maxCategorySales
                                    );

                                    return (
                                        <div key={category}>

                                            <div className="flex items-center justify-between gap-4 mb-2">

                                                <div className="flex items-center gap-3 min-w-0">

                                                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold">
                                                        {index + 1}
                                                    </span>

                                                    <span className="font-semibold text-sm truncate">
                                                        {category}
                                                    </span>

                                                </div>

                                                <div className="text-right shrink-0">

                                                    <p className="text-sm font-bold">
                                                        {formatCurrency(amount)}
                                                    </p>

                                                    <p className="text-[11px] text-muted-foreground">
                                                        {percentage}% share
                                                    </p>

                                                </div>

                                            </div>

                                            <div className="h-3 w-full rounded-full bg-muted overflow-hidden">

                                                <div
                                                    className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                                                    style={{
                                                        width: `${barWidth}%`,
                                                    }}
                                                />

                                            </div>

                                        </div>
                                    );
                                }
                            )}

                        </div>

                    )}

                </div>

            </div>

            {/* Product Creation / Edit Form */}
            <div className="bg-card border rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Plus className="w-5 h-5 text-primary" />

                        {editingId ? 'Edit Product' : 'Add New Gear'}
                    </h2>

                    {editingId && (
                        <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground"
                        >
                            <XCircle className="w-4 h-4" />
                            Cancel Edit
                        </button>
                    )}
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                    <input
                        type="text"
                        name="title"
                        placeholder="Product Name (e.g. Keychron K2 Keyboard)"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="border p-2 rounded-lg bg-background"
                    />

                    <input
                        type="text"
                        name="category"
                        placeholder="Category (e.g. Keyboards, Monitors)"
                        value={formData.category}
                        onChange={handleChange}
                        required
                        className="border p-2 rounded-lg bg-background"
                    />

                    <input
                        type="number"
                        name="price"
                        placeholder="Price (₹)"
                        value={formData.price}
                        onChange={handleChange}
                        required
                        min="0"
                        step="0.01"
                        className="border p-2 rounded-lg bg-background"
                    />

                    <input
                        type="number"
                        name="stock"
                        placeholder="Stock Quantity"
                        value={formData.stock}
                        onChange={handleChange}
                        required
                        min="0"
                        step="1"
                        className="border p-2 rounded-lg bg-background"
                    />

                    <input
                        type="url"
                        name="image"
                        placeholder="Image URL"
                        value={formData.image}
                        onChange={handleChange}
                        required
                        className="border p-2 rounded-lg bg-background md:col-span-2"
                    />

                    <textarea
                        name="description"
                        placeholder="Product Description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        rows="3"
                        className="border p-2 rounded-lg bg-background md:col-span-2"
                    />

                    <button
                        type="submit"
                        className="md:col-span-2 bg-primary text-primary-foreground font-semibold py-2 rounded-lg hover:opacity-90 transition"
                    >
                        {editingId ? 'Update Product' : 'Save Product'}
                    </button>
                </form>
            </div>

            {/* Inventory Table */}
            <div className="bg-card border rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-4">
                    Current Inventory
                </h2>

                {loading ? (
                    <div className="text-muted-foreground py-4 text-center">
                        Loading inventory...
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b text-muted-foreground text-sm">
                                    <th className="p-3">Item</th>
                                    <th className="p-3">Category</th>
                                    <th className="p-3">Price</th>
                                    <th className="p-3">Stock</th>
                                    <th className="p-3 text-right">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {!Array.isArray(products) || products.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="p-4 text-center text-muted-foreground"
                                        >
                                            No products found. Add your first item above!
                                        </td>
                                    </tr>
                                ) : (
                                    products.map((product) => {
                                        const id = product._id;

                                        return (
                                            <tr
                                                key={id}
                                                className="border-b hover:bg-muted/50 transition"
                                            >
                                                <td className="p-3 font-medium">
                                                    {product.title}
                                                </td>

                                                <td className="p-3 text-muted-foreground">
                                                    {product.category}
                                                </td>

                                                <td className="p-3 font-semibold">
                                                    {formatCurrency(product.price)}
                                                </td>

                                                <td className="p-3">
                                                    {product.stock}
                                                </td>

                                                <td className="p-3 text-right space-x-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEditClick(product)}
                                                        className="text-primary hover:opacity-70 p-1"
                                                        title="Edit Product"
                                                    >
                                                        <Edit className="w-5 h-5 inline" />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(id)}
                                                        className="text-destructive hover:opacity-70 p-1"
                                                        title="Delete Product"
                                                    >
                                                        <Trash2 className="w-5 h-5 inline" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}