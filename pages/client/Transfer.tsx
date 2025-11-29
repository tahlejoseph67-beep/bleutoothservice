import React, { useState } from 'react';
import { TransactionService } from '../../services/mockDatabase';
import { TransactionType, PaymentMethod } from '../../types';
import { Send, Smartphone, Building, Globe, Loader2, CheckCircle } from 'lucide-react';

interface TransferProps {
  onSuccess: () => void;
}

const Transfer: React.FC<TransferProps> = ({ onSuccess }) => {
  const [method, setMethod] = useState<PaymentMethod>(PaymentMethod.MOBILE_MONEY);
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
        try {
            TransactionService.createTransaction({
                type: TransactionType.TRANSFER,
                amount: parseInt(amount),
                method: method,
                recipient: recipient,
                userId: '' // Handled by service
            });
            setIsLoading(false);
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setAmount('');
                setRecipient('');
                onSuccess();
            }, 2000);
        } catch (err: any) {
            setError(err.message || "Une erreur est survenue.");
            setIsLoading(false);
        }
    }, 1500);
  };

  const getMethodIcon = (m: PaymentMethod) => {
      switch(m) {
          case PaymentMethod.BANK_TRANSFER: return <Building size={20} />;
          case PaymentMethod.WESTERN_UNION: return <Globe size={20} />;
          default: return <Smartphone size={20} />;
      }
  };

  if (success) {
      return (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] animate-fade-in text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle size={40} className="text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Transfert Initié !</h2>
              <p className="text-slate-500">Votre demande est en cours de validation par un administrateur.</p>
          </div>
      )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
          <h2 className="text-2xl font-bold text-slate-800">Effectuer un Transfert</h2>
          <p className="text-slate-500">Envoyez de l'argent vers différents réseaux en toute simplicité.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[PaymentMethod.MOBILE_MONEY, PaymentMethod.MOOV_MONEY, PaymentMethod.BANK_TRANSFER, PaymentMethod.WESTERN_UNION].map((m) => (
            <button
                key={m}
                onClick={() => setMethod(m)}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${
                    method === m 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
            >
                {getMethodIcon(m)}
                <span className="text-sm font-bold text-center">{m}</span>
            </button>
        ))}
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="font-semibold text-lg border-b pb-2 mb-4">Détails du transfert</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Montant (FCFA)</label>
                    <input 
                        type="number" 
                        required
                        min="500"
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Ex: 10000"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        {method === PaymentMethod.BANK_TRANSFER ? 'IBAN / Numéro de compte' : 'Numéro de téléphone / Bénéficiaire'}
                    </label>
                    <input 
                        type="text" 
                        required
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        placeholder="Infos du destinataire"
                    />
                </div>
            </div>

            {error && <div className="p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>}

            <div className="pt-4">
                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    {isLoading ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                    Valider le transfert
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default Transfer;