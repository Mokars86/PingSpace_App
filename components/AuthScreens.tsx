
import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Zap, CheckCircle, AlertCircle, Loader2, ArrowLeft, Key, RefreshCw } from 'lucide-react';
import { useGlobalDispatch } from '../store';
import { api } from '../services/api';
import { socketService } from '../services/socket';
import { authService } from '../services/auth';

interface AuthProps {
  onSuccess?: () => void;
  onNavigate: () => void;
  onForgotPassword?: () => void;
}

export const SplashScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white dark:bg-slate-950 relative overflow-hidden">
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

export const LoginScreen: React.FC<AuthProps> = ({ onNavigate, onForgotPassword }) => {
  const dispatch = useGlobalDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [showResend, setShowResend] = useState(false);
  
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
    setShowResend(false);
    try {
      const user = await api.auth.login(formData.email, formData.password);
      
      dispatch({ type: 'SET_LOADING', payload: true });
      const [chats, contacts, products, spaces, transactions, stories] = await Promise.all([
        api.chats.list(),
        api.contacts.list(),
        api.market.getProducts(),
        api.spaces.list(),
        api.wallet.getTransactions(),
        api.stories.list()
      ]);
      
      dispatch({ type: 'SET_DATA', payload: { chats, contacts, products, spaces, transactions, stories } });
      dispatch({ type: 'SET_LOADING', payload: false });
      
      const token = await authService.getToken();
      if (token) socketService.connect(token);
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'success', message: `Welcome back, ${user.name}!` } });
    } catch (error: any) {
      console.error(error);
      const isConfirmationPending = error.message.toLowerCase().includes('confirmation pending') || error.message.toLowerCase().includes('not confirmed');
      
      if (isConfirmationPending) {
        setShowResend(true);
      }

      dispatch({ 
        type: 'ADD_NOTIFICATION', 
        payload: { type: 'error', message: error.message || 'Invalid credentials. Try again.' } 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!formData.email) return;
    setResending(true);
    try {
      await api.auth.resendConfirmationEmail(formData.email);
      dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'success', message: 'Verification link resent! Please check your email.' } });
      setShowResend(false);
    } catch (error: any) {
      dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'error', message: error.message || 'Failed to resend email.' } });
    } finally {
      setResending(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    setLoading(true);
    try {
      await api.auth.socialLogin(provider);
    } catch (error: any) {
       dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'error', message: error.message || `${provider} login failed.` } });
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
        {showResend && (
          <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-2xl animate-in zoom-in-95">
             <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Email verification required.
             </p>
             <button 
                type="button"
                onClick={handleResendConfirmation}
                disabled={resending}
                className="w-full py-2.5 bg-amber-500 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 hover:bg-amber-600 transition-all disabled:opacity-50"
             >
                {resending ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                Resend Verification Link
             </button>
          </div>
        )}

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
            />
          </div>
          {errors.email && (
            <p role="alert" className="text-xs font-bold text-[#ff1744] flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.email}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label htmlFor="password" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
            <button 
              type="button" 
              onClick={onForgotPassword}
              className="text-xs font-bold text-[#ff1744] hover:underline"
            >
              Forgot Password?
            </button>
          </div>
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
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-4 bg-[#ff1744] text-white font-bold rounded-2xl shadow-lg shadow-red-500/30 hover:bg-red-600 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign In <ArrowRight className="w-5 h-5" /></>}
        </button>
      </form>

      <div className="mt-8 text-center animate-in slide-in-from-bottom-10 duration-1000">
        <p className="text-gray-400 text-sm mb-6 font-medium">Or continue with</p>
        <div className="flex justify-center gap-4 mb-8">
           {['Google', 'Apple', 'Facebook'].map((social) => (
             <button 
                key={social} 
                onClick={() => handleSocialLogin(social)}
                disabled={loading}
                className="w-14 h-14 rounded-2xl border border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50" 
             >
               <img src={`https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${social.toLowerCase()}/${social.toLowerCase()}-original.svg`} className="w-6 h-6" alt={social} />
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
    if (!formData.name.trim()) { newErrors.name = 'Full name is required'; isValid = false; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) { newErrors.email = 'Email is required'; isValid = false; } 
    else if (!emailRegex.test(formData.email)) { newErrors.email = 'Please enter a valid email address'; isValid = false; }
    if (!formData.password) { newErrors.password = 'Password is required'; isValid = false; } 
    else if (formData.password.length < 6) { newErrors.password = 'Min 6 characters'; isValid = false; }
    setErrors(newErrors);
    return isValid;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await api.auth.signup(formData);
      dispatch({ 
        type: 'ADD_NOTIFICATION', 
        payload: { type: 'success', message: 'Account created! IMPORTANT: Check your email inbox to verify your account before logging in.' } 
      });
      onNavigate();
    } catch (error: any) {
      console.error(error);
      dispatch({ 
        type: 'ADD_NOTIFICATION', 
        payload: { type: 'error', message: error.message || 'Signup failed. Please try again.' } 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 p-6 flex flex-col justify-center relative transition-colors">
      <div className="mb-8 animate-in slide-in-from-bottom-4 duration-500">
        <button onClick={onNavigate} className="mb-6 p-2 -ml-2 text-gray-400 hover:text-slate-600 dark:hover:text-slate-300">
           <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-3xl font-bold font-[Poppins] text-slate-900 dark:text-white mb-2">Create Account</h1>
        <p className="text-gray-500 dark:text-slate-400">Join the future of social commerce</p>
      </div>

      <form onSubmit={handleSignup} className="space-y-4 animate-in slide-in-from-bottom-8 duration-700" noValidate>
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
          <div className="relative">
            <User className={`absolute left-4 top-3.5 w-5 h-5 ${errors.name ? 'text-[#ff1744]' : 'text-gray-400'}`} />
            <input id="name" type="text" value={formData.name}
              onChange={(e) => { setFormData({...formData, name: e.target.value}); if(errors.name) setErrors({...errors, name: ''}); }}
              placeholder="Alex Nova" className="w-full bg-gray-50 dark:bg-slate-900 border rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#ff1744]" 
            />
          </div>
          {errors.name && <p className="text-xs font-bold text-[#ff1744]">{errors.name}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email-signup" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
          <div className="relative">
            <Mail className={`absolute left-4 top-3.5 w-5 h-5 ${errors.email ? 'text-[#ff1744]' : 'text-gray-400'}`} />
            <input id="email-signup" type="email" value={formData.email}
              onChange={(e) => { setFormData({...formData, email: e.target.value}); if(errors.email) setErrors({...errors, email: ''}); }}
              placeholder="hello@example.com" className="w-full bg-gray-50 dark:bg-slate-900 border rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#ff1744]" 
            />
          </div>
          {errors.email && <p className="text-xs font-bold text-[#ff1744]">{errors.email}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password-signup" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
          <div className="relative">
            <Lock className={`absolute left-4 top-3.5 w-5 h-5 ${errors.password ? 'text-[#ff1744]' : 'text-gray-400'}`} />
            <input id="password-signup" type={showPassword ? "text" : "password"} value={formData.password}
              onChange={(e) => { setFormData({...formData, password: e.target.value}); if(errors.password) setErrors({...errors, password: ''}); }}
              placeholder="••••••••" className="w-full bg-gray-50 dark:bg-slate-900 border rounded-2xl py-3.5 pl-12 pr-12 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#ff1744]" 
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-gray-400">
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && <p className="text-xs font-bold text-[#ff1744]">{errors.password}</p>}
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-4 bg-[#ff1744] text-white font-bold rounded-2xl shadow-lg shadow-red-500/30 hover:bg-red-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Create Account <ArrowRight className="w-5 h-5" /></>}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-slate-600 dark:text-slate-400 font-medium">
          Already have an account?{' '}
          <button onClick={onNavigate} className="text-[#ff1744] font-bold hover:underline">Sign In</button>
        </p>
      </div>
    </div>
  );
};

export const ForgotPasswordScreen: React.FC<AuthProps> = ({ onNavigate }) => {
  const dispatch = useGlobalDispatch();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await api.auth.resetPassword(email);
      setSent(true);
      dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'success', message: 'Reset link sent to your email!' } });
    } catch (error: any) {
      dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'error', message: error.message || 'Failed to send reset email.' } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 p-6 flex flex-col justify-center relative transition-colors">
      <div className="mb-8 animate-in slide-in-from-bottom-4 duration-500">
        <button onClick={onNavigate} className="mb-6 p-2 -ml-2 text-gray-400 hover:text-slate-600 dark:hover:text-slate-300">
           <ArrowLeft className="w-6 h-6" />
        </button>
        
        <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mb-4 text-[#ff1744]">
          <Key className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-bold font-[Poppins] text-slate-900 dark:text-white mb-2">Reset Password</h1>
        <p className="text-gray-500 dark:text-slate-400">Enter your email and we'll send you a link to reset your password.</p>
      </div>

      {sent ? (
        <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 p-6 rounded-3xl text-center animate-in zoom-in-95">
           <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-emerald-500/30">
              <CheckCircle className="w-8 h-8" />
           </div>
           <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Email Sent</h3>
           <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">We've sent a password reset link to <span className="font-bold text-slate-700 dark:text-slate-200">{email}</span></p>
           <button 
             onClick={onNavigate}
             className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-2xl"
           >
             Return to Sign In
           </button>
        </div>
      ) : (
        <form onSubmit={handleReset} className="space-y-6 animate-in slide-in-from-bottom-8 duration-700">
          <div className="space-y-1.5">
            <label htmlFor="reset-email" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input 
                id="reset-email"
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hello@example.com" 
                className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#ff1744]/20"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading || !email}
            className="w-full py-4 bg-[#ff1744] text-white font-bold rounded-2xl shadow-lg shadow-red-500/30 hover:bg-red-600 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Send Reset Link <ArrowRight className="w-5 h-5" /></>}
          </button>
        </form>
      )}

      {!sent && (
        <div className="mt-8 text-center">
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            Remembered your password?{' '}
            <button onClick={onNavigate} className="text-[#ff1744] font-bold hover:underline">Sign In</button>
          </p>
        </div>
      )}
    </div>
  );
};
