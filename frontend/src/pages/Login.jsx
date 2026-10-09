import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/api';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(formData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userId', response.data.userId);
        localStorage.setItem('userName', response.data.name);
        navigate('/dashboard');
      } else {
        setError(response.data.message || 'Login failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClasses =
    'min-h-11 w-full min-w-0 px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all';

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[min(500px,120vw)] h-[min(500px,120vw)] bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="relative bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-800 p-5 sm:p-8 w-full max-w-md">
        <div className="flex justify-center mb-4">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-3 shadow-lg shadow-emerald-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white mb-1 text-center">Welcome back</h1>
        <p className="text-zinc-500 text-sm text-center mb-6">Log in to your Budget Tracker account</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-zinc-400 text-sm font-semibold mb-1.5">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={inputClasses}
              required
            />
          </div>

          <div>
            <label className="block text-zinc-400 text-sm font-semibold mb-1.5">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={inputClasses}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="min-h-11 w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            {loading && <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center text-zinc-500 mt-6 text-sm">
          Don't have an account?{' '}
          <a href="/register" className="text-emerald-400 hover:text-emerald-300 font-semibold">
            Register
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;