import { useState, useEffect } from 'react';
import API from '../api/axios';
import { Plus, Trash2, Edit, XCircle, DollarSign, ShoppingCart, AlertTriangle } from 'lucide-react';

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
        const date = order.createdAt
            ? new Date(order.createdAt).toLocaleDateString()
            : 'Unknown';

        accumulator[date] =
            (accumulator[date] || 0) + Number(order.totalAmount || 0);

        return accumulator;
    }, {});

    const dailySalesData = Object.entries(dailySales)
        .sort(([first], [second]) => new Date(first) - new Date(second))
        .slice(-7);

    const maxCategorySales = Math.max(
        ...categorySalesData.map(([, amount]) => amount),
        1
    );

    const maxDailySales = Math.max(
        ...dailySalesData.map(([, amount]) => amount),
        1
    );

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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card border rounded-xl p-6 shadow-sm">
                    <h2 className="text-xl font-bold mb-1">
                        Sales Trend
                    </h2>
                    <p className="text-sm text-muted-foreground mb-6">
                        Revenue from the last seven order dates
                    </p>

                    {dailySalesData.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No sales data available yet.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {dailySalesData.map(([date, amount]) => (
                                <div key={date}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>{date}</span>
                                        <span className="font-semibold">
                                            {formatCurrency(amount)}
                                        </span>
                                    </div>
                                    <div className="h-3 rounded-full bg-muted overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-primary"
                                            style={{
                                                width: `${(amount / maxDailySales) * 100}%`
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-card border rounded-xl p-6 shadow-sm">
                    <h2 className="text-xl font-bold mb-1">
                        Category-wise Sales
                    </h2>
                    <p className="text-sm text-muted-foreground mb-6">
                        Revenue grouped by product category
                    </p>

                    {categorySalesData.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No category sales data available yet.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {categorySalesData.map(([category, amount]) => (
                                <div key={category}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>{category}</span>
                                        <span className="font-semibold">
                                            {formatCurrency(amount)}
                                        </span>
                                    </div>
                                    <div className="h-3 rounded-full bg-muted overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-emerald-500"
                                            style={{
                                                width: `${(amount / maxCategorySales) * 100}%`
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
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