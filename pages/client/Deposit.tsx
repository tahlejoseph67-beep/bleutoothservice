import React, { useState } from 'react';
import { TransactionService } from '../../services/mockDatabase';
import { TransactionType, PaymentMethod } from '../../types';
import { Wallet, Loader2, CheckCircle } from 'lucide-react';

interface DepositProps {
  onSuccess: () => void;
}

const Deposit: React.FC<DepositProps> = ({ onSuccess }) => {
  const [amount, setAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseInt(amount) <= 0) return;

    setIsLoading(true);

    // Simulate KKIAPAY processing time
    setTimeout(() => {
        try {
            TransactionService.createTransaction({
                type: TransactionType.DEPOSIT,
                amount: parseInt(amount),
                method: PaymentMethod.KKIAPAY,
                userId: '', // handled by service
            });
            setIsLoading(false);
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setAmount('');
                onSuccess();
            }, 2000);
        } catch (error) {
            console.error(error);
            setIsLoading(false);
        }
    }, 2000);
  };

  if (success) {
      return (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] animate-fade-in text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle size={40} className="text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Dépôt Réussi !</h2>
              <p className="text-slate-500">Votre solde a été mis à jour via KKIAPAY.</p>
          </div>
      )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Recharger mon Compte</h2>
            <p className="text-slate-500 mt-1">Utilisez l'agrégateur sécurisé KKIAPAY pour déposer des fonds.</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
            <div className="flex items-center justify-center mb-8">
                <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/1200px-Bitcoin.svg.png" 
                    alt="KKIAPAY Logo Simulation" 
                    className="h-12 w-auto opacity-0" // Placeholder hidden, using text instead
                /> 
                <div className="text-3xl font-bold text-blue-900 tracking-tighter">KKIA<span className="text-green-500">PAY</span></div>
            </div>

            <form onSubmit={handleDeposit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Montant à déposer (FCFA)</label>
                    <div className="relative">
                        <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                            type="number" 
                            min="500"
                            required
                            className="w-full pl-12 pr-4 py-4 rounded-lg border border-slate-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none text-lg font-semibold"
                            placeholder="Ex: 5000"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Montant minimum: 500 FCFA</p>
                </div>

                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <Loader2 size={20} className="animate-spin" />
                            Traitement KKIAPAY...
                        </>
                    ) : (
                        "Procéder au Paiement"
                    )}
                </button>
            </form>
        </div>
        
        <div className="flex justify-center gap-4 opacity-50 grayscale">
            {/* Visual cues for payment methods supported by KKIAPAY usually */}
             <div className="h-8 bg-slate-300 w-12 rounded"></div>
             <div className="h-8 bg-slate-300 w-12 rounded"></div>
             <div className="h-8 bg-slate-300 w-12 rounded"></div>
        </div>
    </div>
  );
};

export default Deposit;