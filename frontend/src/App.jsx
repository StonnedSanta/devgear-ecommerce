import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Checkout from './pages/Checkout';
import AdminDashboard from './pages/AdminDashboard';
import PrivacyPolicy from './pages/PrivacyPolicy';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen bg-background text-foreground flex flex-col">

            {/* Navigation */}
            <Navbar />

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-4 py-8">
              <Routes>

                {/* Public Routes */}
                <Route path="/" element={<Home />} />

                <Route
                  path="/product/:id"
                  element={<ProductDetails />}
                />

                <Route path="/cart" element={<Cart />} />

                <Route path="/login" element={<Login />} />

                <Route
                  path="/checkout"
                  element={<Checkout />}
                />

                <Route
                  path="/privacy-policy"
                  element={<PrivacyPolicy />}
                />

                {/* Protected Admin Route */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

              </Routes>
            </main>

            {/* Footer */}
            <Footer />

          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}