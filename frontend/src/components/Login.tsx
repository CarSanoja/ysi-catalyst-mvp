/**
 * Login Component
 * Modern vivid design with full-screen gradient and centered login box
 */

import React, { useState } from 'react';
import { Button } from './ui/button';
import { User, Lock, Eye, EyeOff, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email.trim(), password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Gradient Background */}
      <div
        className="absolute inset-0 animate-gradient-shift"
        style={{
          background: 'linear-gradient(135deg, #14B8A6 0%, #6366F1 50%, #EC4899 100%)',
          backgroundSize: '200% 200%'
        }}
      />

      {/* Floating Orbs for Depth */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute animate-float"
          style={{
            top: '25%',
            left: '25%',
            width: '384px',
            height: '384px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            filter: 'blur(80px)'
          }}
        />
        <div
          className="absolute animate-float-delayed"
          style={{
            bottom: '25%',
            right: '25%',
            width: '320px',
            height: '320px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            filter: 'blur(80px)'
          }}
        />
        <div
          className="absolute animate-pulse"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '288px',
            height: '288px',
            background: 'rgba(251, 191, 36, 0.1)',
            borderRadius: '50%',
            filter: 'blur(80px)'
          }}
        />
      </div>

      {/* Login Box */}
      <div
        className="relative z-10 w-full bg-white shadow-2xl animate-fadeInUp"
        style={{
          maxWidth: '360px',
          borderRadius: '24px',
          padding: '32px',
          ...(window.innerWidth >= 1024 ? { width: '420px', padding: '40px' } : {})
        }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center mb-4 shadow-lg"
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #14B8A6 0%, #6366F1 100%)'
            }}
          >
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1
            className="mb-1"
            style={{
              fontSize: '28px',
              fontWeight: 'bold',
              background: 'linear-gradient(90deg, #14B8A6 0%, #6366F1 50%, #EC4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            YSI Admin
          </h1>
          <p className="text-gray-600 text-sm">Youth & Social Innovation</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Error Message */}
          {error && (
            <div
              className="flex items-start gap-3 p-3 animate-slideIn"
              style={{
                borderRadius: '12px',
                background: 'linear-gradient(90deg, #FEE2E2 0%, #FBCFE8 100%)',
                border: '2px solid rgba(236, 72, 153, 0.3)'
              }}
            >
              <AlertCircle className="w-5 h-5 shrink-0" style={{ color: '#EC4899' }} />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {/* Username Field */}
          <div className="space-y-2">
            <label htmlFor="username" className="block text-sm font-semibold text-gray-700">
              Username
            </label>
            <div className="relative group" style={{ position: 'relative' }}>
              <User
                className="absolute w-5 h-5 transition-colors duration-300"
                style={{
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9CA3AF'
                }}
              />
              <input
                id="username"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your username"
                required
                disabled={loading}
                className="w-full outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  paddingLeft: '44px',
                  paddingRight: '16px',
                  paddingTop: '12px',
                  paddingBottom: '12px',
                  borderRadius: '12px',
                  border: '2px solid #E5E7EB',
                  backgroundColor: '#F9FAFB',
                  color: '#111827'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#14B8A6';
                  e.target.style.backgroundColor = '#FFFFFF';
                  e.target.style.boxShadow = '0 10px 15px -3px rgba(20, 184, 166, 0.2)';
                  const icon = e.target.previousElementSibling as HTMLElement;
                  if (icon) icon.style.color = '#14B8A6';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E5E7EB';
                  e.target.style.backgroundColor = '#F9FAFB';
                  e.target.style.boxShadow = 'none';
                  const icon = e.target.previousElementSibling as HTMLElement;
                  if (icon) icon.style.color = '#9CA3AF';
                }}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
              Password
            </label>
            <div className="relative group" style={{ position: 'relative' }}>
              <Lock
                className="absolute w-5 h-5 transition-colors duration-300"
                style={{
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9CA3AF'
                }}
              />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={loading}
                className="w-full outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  paddingLeft: '44px',
                  paddingRight: '44px',
                  paddingTop: '12px',
                  paddingBottom: '12px',
                  borderRadius: '12px',
                  border: '2px solid #E5E7EB',
                  backgroundColor: '#F9FAFB',
                  color: '#111827'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#14B8A6';
                  e.target.style.backgroundColor = '#FFFFFF';
                  e.target.style.boxShadow = '0 10px 15px -3px rgba(20, 184, 166, 0.2)';
                  const icon = e.target.previousElementSibling as HTMLElement;
                  if (icon) icon.style.color = '#14B8A6';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E5E7EB';
                  e.target.style.backgroundColor = '#F9FAFB';
                  e.target.style.boxShadow = 'none';
                  const icon = e.target.previousElementSibling as HTMLElement;
                  if (icon) icon.style.color = '#9CA3AF';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute text-gray-400 transition-colors duration-300"
                style={{
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)'
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                disabled={loading}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#6366F1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#9CA3AF';
                }}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full text-white shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              height: '48px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 'bold',
              background: 'linear-gradient(90deg, #14B8A6 0%, #6366F1 50%, #EC4899 100%)',
              border: 'none'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(99, 102, 241, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(99, 102, 241, 0.2)';
            }}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div
                  className="rounded-full animate-spin"
                  style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTopColor: '#FFFFFF'
                  }}
                />
                <span>Signing in...</span>
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>© 2025 Youth & Social Innovation</p>
        </div>
      </div>
    </div>
  );
}
