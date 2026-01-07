
import React, { useState } from 'react';
import { AuthService } from '../services/mockDatabase';
import { User } from '../types';
import { Wallet, ShieldCheck, ArrowRight, Lock } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      const user = AuthService.login(email, pin);
      if (user) {
        onLogin(user);
      } else {
        setError("Identifiants incorrects. Vérifiez votre email et code PIN.");
      }
    } else {
      if (!name || pin.length < 4) {
        setError("Le nom est requis et le code PIN doit faire au moins 4 chiffres.");
        return;
      }
      const user = AuthService.register(name, email, pin);
      onLogin(user);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[550px]">
        
        <div className="w-full md:w-1/2 bg-slate-900 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://picsum.photos/800/800?grayscale&blur=2')] opacity-10 bg-cover bg-center"></div>
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-2">BLEUTOOTH</h1>
            <h2 className="text-xl text-blue-400 font-medium">SERVICE</h2>
          </div>
          
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                <Wallet size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Fintech de Confiance</h3>
                <p className="text-slate-400 text-sm">Transferts instantanés</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Biométrie Faciale</h3>
                <p className="text-slate-400 text-sm">Sécurisez vos transactions</p>
              </div>
            </div>
          </div>
          
          <p className="text-xs text-slate-500 relative z-10">© 2024 Bleutooth Service Inc. - Version 2.0</p>
        </div>

        <div className="w-full md:w-1/2 p-12 flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
                {isLogin ? 'Accès Sécurisé' : 'Rejoindre le Service'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nom complet</label>
                        <input 
                            type="text" 
                            required 
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="Ex: Jean Dupont"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Adresse Email</label>
                    <input 
                        type="email" 
                        required 
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="jean@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Code PIN Unique</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="password" 
                            inputMode="numeric"
                            maxLength={6}
                            required 
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="******"
                            value={pin}
                            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                        />
                    </div>
                </div>

                {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                <button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 group"
                >
                    {isLogin ? 'Se connecter' : "S'inscrire"}
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-slate-600 text-sm">
                    {isLogin ? "Nouveau ici ?" : "Déjà membre ?"}
                    <button 
                        onClick={() => { setIsLogin(!isLogin); setError(''); setPin(''); }}
                        className="ml-2 text-blue-600 font-semibold hover:underline"
                    >
                        {isLogin ? "S'inscrire" : "Se connecter"}
                    </button>
                </p>
                <div className="mt-6 p-3 bg-blue-50 rounded border border-blue-100 text-[10px] text-blue-800 text-left">
                    <p className="font-bold mb-1 uppercase tracking-wider">Accès Démo:</p>
                    <p>Client: jean@test.com | PIN: 123456</p>
                    <p>Admin: admin@bluetooth.com | PIN: 000000</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
