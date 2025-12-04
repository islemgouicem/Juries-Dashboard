import React, { useState } from 'react';
import { User } from '../types';
import { Logo } from './Logo';
import { Users, ArrowRight } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    onLogin({ name, email });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <Logo className="mb-4 scale-125" />
        <h2 className="text-2xl text-gray-200 tracking-wide mt-4">Judges <span className="text-amber-400 font-semibold">Evaluation</span> Portal</h2>
      </div>

      <div className="glass-card w-full max-w-lg p-8 rounded-2xl relative overflow-hidden">
        {/* Decorative corner borders */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
           <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-amber-500/20 rounded-tl-3xl"></div>
           <div className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-amber-500/20 rounded-br-3xl"></div>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-amber-900/30 rounded-full border border-amber-500/20 text-amber-500">
            <Users size={24} />
          </div>
          <h3 className="text-2xl font-medium text-white">Judge Login</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-200 mb-2 font-medium">Full Name <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full glass-input rounded-xl p-4 placeholder-gray-500 transition-all"
            />
            <p className="text-xs text-red-400 mt-2 h-4">{!name && error ? '* This field is required.' : ''}</p>
          </div>

          <div>
            <label className="block text-gray-200 mb-2 font-medium">Address Email <span className="text-red-400">*</span></label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your address email"
              className="w-full glass-input rounded-xl p-4 placeholder-gray-500 transition-all"
            />
             <p className="text-xs text-red-400 mt-2 h-4">{!email && error ? '* This field is required.' : ''}</p>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white font-medium py-4 rounded-xl shadow-lg shadow-amber-900/20 transition-all flex items-center justify-center gap-2 group mt-4"
          >
            Continue to Dashboard
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-8">
          Your information will be used to track your evaluations
        </p>
      </div>
    </div>
  );
};

export default Login;