

import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import { useGlobalDispatch } from '../store';
import { api } from '../services/api';
import { socketService } from '../services/socket';
import { authService } from '../services/auth';

interface AuthProps {
  onSuccess?: () => void;
  onNavigate: () => void;
}

export const SplashScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white dark:bg-slate-950 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-red-50 dark:bg-red-900/10 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-red-50 dark:bg-red-900/10 rounded-full blur-3xl opacity-50"></div>

      <div className="relative z-10 flex flex-col items-center animate-in fade-in zoom-in duration-700">
        <div className="w-24 h-24 bg-[#ff1744] rounded-3xl flex items-center justify-center shadow-xl shadow-red-500/30 mb-6 transform rotate-3">
          <Zap className="w-12 h-12 text-white fill-white" />
        </div>
        <h1 className="text-4xl font-bold font-[Poppins] text-slate-900 dark:text-white tracking-tight mb-2">
          Ping<span className="text-[#ff1744]">Space</span>
        </h1>
        <p className="text-gray-400 font-medium tracking-wide text-sm">Connect. Chat. Trade. Discover.</p>
      </div>

      <div className="absolute bottom-12 flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-4 border-[#ff1744]/20 border-t-[#ff1744] rounded-full animate-spin"></div>
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export const LoginScreen: React.FC<AuthProps> = ({ onNavigate }) => {
  const dispatch = useGlobalDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({ email: '', password: '', form: '' });

  const validate = () => {
    let isValid = true;
    const newErrors = { email: '', password: '', form: '' };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const user = await api.auth.login(formData.email, formData.password);
      
      // Initialize Data after login
      dispatch({ type: 'SET_LOADING', payload: true });
      const [chats, products, spaces, transactions] = await Promise.all([
        api.chats.list(),
        api.market.getProducts(),
        api.spaces.list(),
        api.wallet.getTransactions()
      ]);
      
      dispatch({ type: 'SET_DATA', payload: { chats, products, spaces, transactions } });
      dispatch({ type: 'SET_LOADING', payload: false });
      
      socketService.connect(authService.getToken()!);
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'success', message: 'Welcome back to PingSpace!' } });
    } catch (error) {
      dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'error', message: 'Invalid credentials. Try again.' } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 p-6 flex flex-col justify-center relative transition-colors">
      <div className="mb-10 animate-in slide-in-from-bottom-4 duration-500">
        <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mb-4 text-[#ff1744]">
          <Zap className="w-6 h-6 fill-[#ff1744]" />
        </div>
        <h1 className="text-3xl font-bold font-[Poppins] text-slate-900 dark:text-white mb-2">Welcome Back</h1>
        <p className="text-gray-500 dark:text-slate-400">Sign in to continue to PingSpace</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5 animate-in slide-in-from-bottom-8 duration-700" noValidate>
        
        {/* Email Field */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
          <div className="relative">
            <Mail className={`absolute left-4 top-3.5 w-5 h-5 ${errors.email ? 'text-[#ff1744]' : 'text-gray-400'}`} />
            <input 
              id="email"
              type="email" 
              value={formData.email}
              onChange={(e) => {
                setFormData({...formData, email: e.target.value});
                if (errors.email) setErrors({...errors, email: ''});
              }}
              placeholder="hello@example.com" 
              className={`w-full bg-gray-50 dark:bg-slate-900 border rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 transition-all ${
                errors.email 
                  ? 'border-[#ff1744] focus:ring-[#ff1744]/20' 
                  : 'border-gray-100 dark:border-slate-800 focus:ring-[#ff1744]/20 focus:border-[#ff1744]'
              }`}
              aria-invalid={!!errors.email}
            />
          </div>
          {errors.email && (
            <p role="alert" className="text-xs font-bold text-[#ff1744] flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.email}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
          <div className="relative">
            <Lock className={`absolute left-4 top-3.5 w-5 h-5 ${errors.password ? 'text-[#ff1744]' : 'text-gray-400'}`} />
            <input 
              id="password"
              type={showPassword ? "text" : "password"} 
              value={formData.password}
              onChange={(e) => {
                 setFormData({...formData, password: e.target.value});
                 if (errors.password) setErrors({...errors, password: ''});
              }}
              placeholder="••••••••" 
              className={`w-full bg-gray-50 dark:bg-slate-900 border rounded-2xl py-3.5 pl-12 pr-12 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 transition-all ${
                errors.password 
                  ? 'border-[#ff1744] focus:ring-[#ff1744]/20' 
                  : 'border-gray-100 dark:border-slate-800 focus:ring-[#ff1744]/20 focus:border-[#ff1744]'
              }`}
              aria-invalid={!!errors.password}
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-3.5 text-gray-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && (
            <p role="alert" className="text-xs font-bold text-[#ff1744] flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.password}
            </p>
          )}
          <div className="flex justify-end">
            <button type="button" className="text-xs font-bold text-[#ff1744] hover:text-red-700">Forgot Password?</button>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-4 bg-[#ff1744] text-white font-bold rounded-2xl shadow-lg shadow-red-500/30 hover:bg-red-600 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>Sign In <ArrowRight className="w-5 h-5" /></>
          )}
        </button>
      </form>

      <div className="mt-8 text-center animate-in slide-in-from-bottom-10 duration-1000">
        <p className="text-gray-400 text-sm mb-6 font-medium">Or continue with</p>
        <div className="flex justify-center gap-4 mb-8">
           {['Google', 'Apple', 'Facebook'].map((social) => (
             <button key={social} className="w-14 h-14 rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors" aria-label={`Sign in with ${social}`}>
               <img src={`https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${social.toLowerCase()}/${social.toLowerCase()}-original.svg`} className="w-6 h-6" alt="" />
             </button>
           ))}
        </div>
        <p className="text-slate-600 dark:text-slate-400 font-medium">
          Don't have an account?{' '}
          <button onClick={onNavigate} className="text-[#ff1744] font-bold hover:underline">Sign Up</button>
        </p>
      </div>
    </div>
  );
};

export const SignupScreen: React.FC<AuthProps> = ({ onNavigate }) => {
  const dispatch = useGlobalDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({ name: '', email: '', password: '' });

  const validate = () => {
    let isValid = true;
    const newErrors = { name: '', email: '', password: '' };

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const user = await api.auth.signup(formData);
      
      // Initialize Data
      dispatch({ type: 'SET_LOADING', payload: true });
      const [chats, products, spaces, transactions] = await Promise.all([
        api.chats.list(),
        api.market.getProducts(),
        api.spaces.list(),
        api.wallet.getTransactions()
      ]);
      
      dispatch({ type: 'SET_DATA', payload: { chats, products, spaces, transactions } });
      dispatch({ type: 'SET_LOADING', payload: false });
      
      socketService.connect(authService.getToken()!);
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'success', message: 'Account created successfully!' } });
    } catch (error) {
      dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'error', message: 'Signup failed. Please try again.' } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 p-6 flex flex-col justify-center relative transition-colors">
      <div className="mb-8 animate-in slide-in-from-bottom-4 duration-500">
        <button onClick={onNavigate} className="mb-6 p-2 -ml-2 text-gray-400 hover:text-slate-600 dark:hover:text-slate-300" aria-label="Go back to login">
           <ArrowRight className="w-6 h-6 rotate-180" />
        </button>
        <h1 className="text-3xl font-bold font-[Poppins] text-slate-900 dark:text-white mb-2">Create Account</h1>
        <p className="text-gray-500 dark:text-slate-400">Join the future of social commerce</p>
      </div>

      <form onSubmit={handleSignup} className="space-y-4 animate-in slide-in-from-bottom-8 duration-700" noValidate>
        {/* Name Field */}
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
          <div className="relative">
            <User className={`absolute left-4 top-3.5 w-5 h-5 ${errors.name ? 'text-[#ff1744]' : 'text-gray-400'}`} />
            <input 
              id="name"
              type="text" 
              value={formData.name}
              onChange={(e) => {
                 setFormData({...formData, name: e.target.value});
                 if(errors.name) setErrors({...errors, name: ''});
              }}
              placeholder="Alex Nova" 
              className={`w-full bg-gray-50 dark:bg-slate-900 border rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 transition-all ${
                errors.name 
                  ? 'border-[#ff1744] focus:ring-[#ff1744]/20' 
                  : 'border-gray-100 dark:border-slate-800 focus:ring-[#ff1744]/20 focus:border-[#ff1744]'
              }`}
              aria-invalid={!!errors.name}
            />
          </div>
          {errors.name && <p role="alert" className="text-xs font-bold text-[#ff1744]">{errors.name}</p>}
        </div>

        {/* Email Field */}
        <div className="space-y-1.5">
          <label htmlFor="email-signup" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
          <div className="relative">
            <Mail className={`absolute left-4 top-3.5 w-5 h-5 ${errors.email ? 'text-[#ff1744]' : 'text-gray-400'}`} />
            <input 
              id="email-signup"
              type="email" 
              value={formData.email}
              onChange={(e) => {
                 setFormData({...formData, email: e.target.value});
                 if(errors.email) setErrors({...errors, email: ''});
              }}
              placeholder="hello@example.com" 
              className={`w-full bg-gray-50 dark:bg-slate-900 border rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 transition-all ${
                errors.email 
                  ? 'border-[#ff1744] focus:ring-[#ff1744]/20' 
                  : 'border-gray-100 dark:border-slate-800 focus:ring-[#ff1744]/20 focus:border-[#ff1744]'
              }`}
              aria-invalid={!!errors.email}
            />
          </div>
          {errors.email && <p role="alert" className="text-xs font-bold text-[#ff1744]">{errors.email}</p>}
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <label htmlFor="password-signup" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
          <div className="relative">
            <Lock className={`absolute left-4 top-3.5 w-5 h-5 ${errors.password ? 'text-[#ff1744]' : 'text-gray-400'}`} />
            <input 
              id="password-signup"
              type={showPassword ? "text" : "password"} 
              value={formData.password}
              onChange={(e) => {
                 setFormData({...formData, password: e.target.value});
                 if(errors.password) setErrors({...errors, password: ''});
              }}
              placeholder="••••••••" 
              className={`w-full bg-gray-50 dark:bg-slate-900 border rounded-2xl py-3.5 pl-12 pr-12 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 transition-all ${
                errors.password 
                  ? 'border-[#ff1744] focus:ring-[#ff1744]/20' 
                  : 'border-gray-100 dark:border-slate-800 focus:ring-[#ff1744]/20 focus:border-[#ff1744]'
              }`}
              aria-invalid={!!errors.password}
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-3.5 text-gray-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && <p role="alert" className="text-xs font-bold text-[#ff1744]">{errors.password}</p>}
        </div>
        
        <div className="flex items-start gap-3 py-2">
            <div className="mt-1 w-5 h-5 rounded-md border-2 border-gray-300 dark:border-slate-700 flex items-center justify-center text-white peer-checked:bg-[#ff1744] peer-checked:border-[#ff1744]">
               <CheckCircle className="w-3.5 h-3.5 text-transparent" />
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-500 leading-relaxed">
              By signing up, you agree to our <span className="font-bold text-slate-900 dark:text-white">Terms of Service</span> and <span className="font-bold text-slate-900 dark:text-white">Privacy Policy</span>.
            </p>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-4 bg-[#ff1744] text-white font-bold rounded-2xl shadow-lg shadow-red-500/30 hover:bg-red-600 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>Create Account <ArrowRight className="w-5 h-5" /></>
          )}
        </button>
      </form>

      <div className="mt-6 text-center animate-in slide-in-from-bottom-10 duration-1000">
        <p className="text-slate-600 dark:text-slate-400 font-medium">
          Already have an account?{' '}
          <button onClick={onNavigate} className="text-[#ff1744] font-bold hover:underline">Sign In</button>
        </p>
      </div>
    </div>
  );
};