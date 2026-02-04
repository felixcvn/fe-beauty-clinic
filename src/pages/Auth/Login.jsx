import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, User, ArrowRight } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password);

        if (result.success) {
            navigate('/');
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-secondary-light">
            {/* Background Image with Opacity */}
            <div
                className="absolute inset-0 bg-cover bg-center opacity-30"
                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1516069677934-ccb91316c04e?auto=format&fit=crop&q=80&w=2000")' }}
            ></div>

            {/* Background Decoration (Optional - can be removed or kept for extra flair) */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-gold/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

            <div className="bg-white rounded-3xl shadow-xl w-full max-w-5xl border border-secondary-dark/20 relative z-10 animate-fade-in overflow-hidden flex flex-col md:flex-row h-[600px]">

                {/* Image Side */}
                <div className="hidden md:block w-1/2 relative">
                    <img
                        src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=800"
                        alt="Beauty Clinic Interior"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-primary/40 backdrop-blur-[2px] flex flex-col justify-end p-12 text-white">
                        
                    </div>
                </div>

                {/* Form Side */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative bg-white">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-primary text-accent-gold rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-4 shadow-lg shadow-primary/20">
                            B
                        </div>
                        <h1 className="text-2xl font-bold text-primary">Welcome Back</h1>
                        <p className="text-primary-light mt-1">Sign in to access medical records</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-primary">Email Address</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-light" />
                                <input
                                    type="text"
                                    placeholder="Enter your email"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-secondary-dark/20 outline-none focus:ring-2 focus:ring-primary/20 bg-secondary-light/30 transition-all font-medium text-primary"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-primary">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-light" />
                                <input
                                    type="password"
                                    placeholder="Enter your password"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-secondary-dark/20 outline-none focus:ring-2 focus:ring-primary/20 bg-secondary-light/30 transition-all font-medium text-primary"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg font-medium border border-red-100 animate-pulse">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-secondary py-3 rounded-xl hover:bg-primary-dark hover:scale-[1.02] active:scale-[0.98] transition-all font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Signing In...' : (
                                <>
                                    Sign In <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-primary-light">
                        <p>Demo Account: Any email & password works!</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
