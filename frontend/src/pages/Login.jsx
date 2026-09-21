import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            navigate('/admin');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-12 bg-card border rounded-xl p-6 shadow-sm">
            <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <LogIn className="w-6 h-6 text-primary" /> Admin Login
            </h1>
            <p className="text-sm text-muted-foreground mb-6">Sign in to access catalog management.</p>

            {error && <div className="bg-destructive/15 text-destructive p-3 rounded-lg text-sm mb-4">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="text-sm font-medium">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full border p-2 rounded-lg bg-background mt-1"
                    />
                </div>
                <div>
                    <label className="text-sm font-medium">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full border p-2 rounded-lg bg-background mt-1"
                    />
                </div>
                <button type="submit" className="w-full bg-primary text-primary-foreground font-semibold py-2 rounded-lg hover:opacity-90">
                    Sign In
                </button>
            </form>
        </div>
    );
}