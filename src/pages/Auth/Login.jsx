import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, User, LogIn, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import logo from '../../assets/logo.png';
import bgImage from '../../assets/gambar-pb.png';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(username, password);

        if (result.success) {
            navigate('/');
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-primary">
            {/* Dark Premium Background Layers */}
            <div className="absolute inset-0 z-0">
                <img 
                    src={bgImage} 
                    alt="Background" 
                    className="w-full h-full object-cover opacity-100 grayscale brightness-[0.2]"
                />
                {/* Soft Radial Spotlight to prevent flat background */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(21,71,52,0.5)_0%,rgba(7,25,18,0.98)_100%)]" />
            </div>

            {/* Subtle floating glow elements */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-white/5 blur-[120px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-white/5 blur-[120px]" />

            <div className="w-full max-w-[420px] bg-white rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.4)] border border-white/10 relative z-10 animate-fade-in flex flex-col items-center overflow-hidden">
                
                <div className="p-10 md:p-12 flex flex-col items-center w-full">
                    {/* Brand Logo Section */}
                    <div className="mb-10 flex flex-col items-center">
                        <img src={logo} alt="PB Logo" className="h-10 mb-4" />
                        <p className="text-[10px] font-black text-primary/30 uppercase tracking-[0.4em]">Personal Beauty Clinic</p>
                    </div>

                    <div className="text-center mb-10">
                        <h1 className="text-2xl font-black text-primary tracking-tighter leading-none mb-3">Selamat Datang</h1>
                        <div className="flex items-center justify-center gap-2">
                            <span className="h-[1px] w-4 bg-primary/10" />
                            <p className="text-primary/40 text-[9px] font-black uppercase tracking-[0.3em]">
                                Secured Access System
                            </p>
                            <span className="h-[1px] w-4 bg-primary/10" />
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="w-full space-y-5">
                        <div className="space-y-3">
                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/20 group-focus-within:text-primary transition-all duration-300">
                                    <User className="w-4 h-4" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Masukkan Username Anda"
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-primary/[0.02] border border-primary/5 outline-none focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all font-medium text-primary text-sm placeholder:text-primary/20 shadow-sm"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/20 group-focus-within:text-primary transition-all duration-300">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Kata Sandi"
                                    className="w-full pl-12 pr-12 py-4 rounded-2xl bg-primary/[0.02] border border-primary/5 outline-none focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all font-medium text-primary text-sm placeholder:text-primary/20 shadow-sm"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-primary/20 hover:text-primary transition-colors focus:outline-none"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-between items-center px-1">
                            <div className="flex items-center gap-1.5">
                                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">End-to-End Encryption</span>
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 text-[10px] rounded-2xl font-black border border-red-100 text-center animate-shake shadow-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-secondary py-4.5 rounded-2xl hover:brightness-110 hover:shadow-2xl hover:shadow-primary/20 active:scale-[0.98] transition-all font-black text-[11px] uppercase tracking-[0.25em] flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed mt-4 shadow-xl shadow-primary/10 group"
                        >
                            {loading ? 'Memproses...' : (
                                <>
                                    Masuk Sekarang
                                    <ShieldCheck className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                                </>
                            )}
                        </button>
                    </form>

                </div>
            </div>
        </div>
    );
};

export default Login;
