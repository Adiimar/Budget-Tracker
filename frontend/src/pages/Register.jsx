import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/api';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
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
      const response = await authAPI.register(formData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userId', response.data.userId);
        localStorage.setItem('userName', response.data.name);
        navigate('/dashboard');
      } else {
        setError(response.data.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[min(500px,120vw)] h-[min(500px,120vw)] bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="relative bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-800 p-5 sm:p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-1 text-center">Create Account</h1>
        <p className="text-zinc-500 text-sm text-center mb-6">Get started with your Budget Tracker</p>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-zinc-400 text-sm font-semibold mb-1.5">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="min-h-11 w-full min-w-0 px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-zinc-400 text-sm font-semibold mb-1.5">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="min-h-11 w-full min-w-0 px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-zinc-400 text-sm font-semibold mb-1.5">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="min-h-11 w-full min-w-0 px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="min-h-11 w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        
        <p className="text-center text-zinc-500 mt-6 text-sm">
          Already have an account?{' '}
          <a href="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
