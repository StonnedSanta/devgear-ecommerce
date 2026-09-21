import { useState, useEffect } from 'react';
import API from '../api/axios';
import { Plus, Trash2, Edit, XCircle } from 'lucide-react';

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageUrl: '',
    stock: ''
  });

  const fetchProducts = async () => {
    try {
      const res = await API.get('/api/products');
      // Defensive check to avoid e.map is not a function
      const data = Array.isArray(res.data) ? res.data : (res.data?.products || []);
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditClick = (p) => {
    setEditingId(p._id || p.id);
    setFormData({
      name: p.name || '',
      description: p.description || '',
      price: p.price ?? '',
      category: p.category || '',
      imageUrl: p.imageUrl || '',
      stock: p.stock ?? ''
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', description: '', price: '', category: '', imageUrl: '', stock: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      price: Number(formData.price),
      stock: Number(formData.stock)
    };

    try {
      if (editingId) {
        await API.put(`/api/products/${editingId}`, payload);
      } else {
        await API.post('/api/products', payload);
      }
      handleCancelEdit();
      fetchProducts();
    } catch (err) {
      console.error('Error saving product:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await API.delete(`/api/products/${id}`);
      fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage catalog inventory and update developer gear.</p>
      </div>

      {/* Product Creation / Edit Form */}
      <div className="bg-card border rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" /> {editingId ? 'Edit Product' : 'Add New Gear'}
          </h2>
          {editingId && (
            <button
              onClick={handleCancelEdit}
              className="text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground"
            >
              <XCircle className="w-4 h-4" /> Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="name"
            placeholder="Product Name (e.g. Keychron K2 Keyboard)"
            value={formData.name}
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
            placeholder="Price ($)"
            value={formData.price}
            onChange={handleChange}
            required
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
            className="border p-2 rounded-lg bg-background"
          />
          <input
            type="url"
            name="imageUrl"
            placeholder="Image URL"
            value={formData.imageUrl}
            onChange={handleChange}
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
        <h2 className="text-xl font-bold mb-4">Current Inventory</h2>
        {loading ? (
          <div className="text-muted-foreground py-4 text-center">Loading inventory...</div>
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
                    <td colSpan="5" className="p-4 text-center text-muted-foreground">
                      No products found. Add your first item above!
                    </td>
                  </tr>
                ) : (
                  products.map((p) => {
                    const id = p._id || p.id;
                    return (
                      <tr key={id} className="border-b hover:bg-muted/50 transition">
                        <td className="p-3 font-medium">{p.name}</td>
                        <td className="p-3 text-muted-foreground">{p.category}</td>
                        <td className="p-3 font-semibold">${Number(p.price).toFixed(2)}</td>
                        <td className="p-3">{p.stock}</td>
                        <td className="p-3 text-right space-x-2">
                          <button
                            onClick={() => handleEditClick(p)}
                            className="text-primary hover:opacity-70 p-1"
                            title="Edit Product"
                          >
                            <Edit className="w-5 h-5 inline" />
                          </button>
                          <button
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