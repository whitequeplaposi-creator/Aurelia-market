'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';

const ADMIN_EMAIL = 'ngabulokana75@gmail.com';
const ADMIN_PASSWORD = 'a-z,A-Z,9-1'; // Hårdkodat admin-lösenord

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Kontrollera att det är admin-emailen
    if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      setError('Endast administratörer kan logga in här');
      setLoading(false);
      return;
    }

    // Kontrollera att lösenordet är korrekt
    if (password !== ADMIN_PASSWORD) {
      setError('Felaktigt administratörslösenord');
      setLoading(false);
      return;
    }

    try {
      // För admin, använd hårdkodat lösenord istället för databas
      // Skapa en mock admin-användare
      const adminUser = {
        id: 'admin-user-id',
        email: ADMIN_EMAIL,
        role: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Generera JWT token
      const mockToken = btoa(JSON.stringify({
        userId: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
        timestamp: Date.now(),
      }));

      // Spara token och user i localStorage
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(adminUser));

      // Redirect till admin dashboard
      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Ett fel uppstod vid inloggning');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gold-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold-600 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Logo />
          </Link>
          <h1 className="text-3xl font-bold text-white mt-6 mb-2">Administratörsinloggning</h1>
          <p className="text-gray-400">Endast för behöriga administratörer</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
            <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
            </svg>
            <span className="text-sm font-semibold text-red-900">Säker administratörsåtkomst</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Administratörs E-post
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                placeholder="ngabulokana75@gmail.com"
                autoComplete="email"
              />
              <p className="mt-1 text-xs text-gray-500">
                Endast {ADMIN_EMAIL} kan logga in här
              </p>
              <p className="mt-1 text-xs font-semibold text-gold-600">
                Administratörslösenord: a-z,A-Z,9-1
              </p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Lösenord
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-gold-600 to-gold-700 hover:from-gold-700 hover:to-gold-800 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loggar in...
                </span>
              ) : (
                'Logga in som Administratör'
              )}
            </button>
          </form>

          {/* Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-center text-sm text-gray-600">
              <p className="mb-2">Är du kund?</p>
              <Link
                href="/login"
                className="text-gold-600 hover:text-gold-700 font-semibold"
              >
                Logga in som kund här →
              </Link>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
              </svg>
              <div className="text-xs text-gray-600">
                <p className="font-semibold mb-1">Säkerhetsmeddelande</p>
                <p>Alla inloggningsförsök loggas. Obehörig åtkomst är förbjuden och kan leda till rättsliga åtgärder.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-400">
          <p>© 2024 Aurelia Market. Alla rättigheter förbehållna.</p>
          <p className="mt-2">
            <a href="mailto:info@aurelia-market.com" className="hover:text-gold-400 transition-colors">
              info@aurelia-market.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
