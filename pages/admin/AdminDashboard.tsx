import React, { useState, useEffect } from 'react';
import { Transaction, TransactionStatus, TransactionType } from '../../types';
import { TransactionService } from '../../services/mockDatabase';
import { analyzeTransactionRisk } from '../../services/geminiService';
import { Check, X, ShieldAlert, BrainCircuit, RefreshCw } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<{id: string, text: string} | null>(null);

  const refreshData = () => {
    setTransactions(TransactionService.getTransactions());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleStatusChange = (id: string, status: TransactionStatus) => {
    if (confirm(`Voulez-vous vraiment passer cette transaction en ${status} ?`)) {
        TransactionService.updateStatus(id, status);
        refreshData();
    }
  };

  const handleAnalyze = async (tx: Transaction) => {
    setAnalyzingId(tx.id);
    setAnalysisResult(null);
    const result = await analyzeTransactionRisk(tx);
    setAnalysisResult({ id: tx.id, text: result });
    setAnalyzingId(null);
  };

  // Only show pending transactions or recently modified ones for focus
  const pendingTransactions = transactions.filter(t => t.status === TransactionStatus.PENDING);
  const historyTransactions = transactions.filter(t => t.status !== TransactionStatus.PENDING).slice(0, 10);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Panneau d'Administration</h2>
        <p className="text-slate-500">Validez les demandes de transfert et surveillez les flux.</p>
      </div>

      {/* Pending Queue */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-orange-50 border-b border-orange-100 flex justify-between items-center">
            <h3 className="font-bold text-orange-800 flex items-center gap-2">
                <ShieldAlert size={20} />
                Validations en Attente ({pendingTransactions.length})
            </h3>
            <button onClick={refreshData} className="p-2 hover:bg-orange-100 rounded-full text-orange-700">
                <RefreshCw size={18} />
            </button>
        </div>
        
        {pendingTransactions.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
                Aucune transaction en attente. Tout est à jour !
            </div>
        ) : (
            <div className="divide-y divide-slate-100">
                {pendingTransactions.map(tx => (
                    <div key={tx.id} className="p-6 hover:bg-slate-50 transition-colors">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="font-bold text-slate-800">{tx.userName}</span>
                                    <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">{tx.method}</span>
                                </div>
                                <div className="text-2xl font-bold text-slate-900 mb-1">{tx.amount.toLocaleString()} FCFA</div>
                                <div className="text-sm text-slate-500">
                                    Destinataire: <span className="font-medium text-slate-700">{tx.recipient}</span>
                                </div>
                                <div className="text-xs text-slate-400 mt-1">Date: {new Date(tx.date).toLocaleString()}</div>
                                
                                {analysisResult?.id === tx.id && (
                                    <div className="mt-3 p-3 bg-purple-50 border border-purple-100 rounded-lg text-sm text-purple-800 flex gap-2">
                                        <BrainCircuit size={16} className="mt-0.5 shrink-0" />
                                        <div>
                                            <span className="font-bold">Gemini AI:</span> {analysisResult.text}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-2 min-w-[140px]">
                                <button 
                                    onClick={() => handleAnalyze(tx)}
                                    disabled={analyzingId === tx.id}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {analyzingId === tx.id ? <RefreshCw className="animate-spin" size={16}/> : <BrainCircuit size={16}/>}
                                    Analyser Risque
                                </button>
                                <button 
                                    onClick={() => handleStatusChange(tx.id, TransactionStatus.COMPLETED)}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium flex items-center justify-center gap-2"
                                >
                                    <Check size={16} />
                                    Valider
                                </button>
                                <button 
                                    onClick={() => handleStatusChange(tx.id, TransactionStatus.REJECTED)}
                                    className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm font-medium flex items-center justify-center gap-2"
                                >
                                    <X size={16} />
                                    Rejeter
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* History Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Historique Récent</h3>
          </div>
          <div className="overflow-x-auto">
              <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                      <tr>
                          <th className="px-6 py-3 text-left">Utilisateur</th>
                          <th className="px-6 py-3 text-left">Type</th>
                          <th className="px-6 py-3 text-left">Montant</th>
                          <th className="px-6 py-3 text-left">Statut</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                      {historyTransactions.map(tx => (
                          <tr key={tx.id}>
                              <td className="px-6 py-3">{tx.userName}</td>
                              <td className="px-6 py-3">{tx.type}</td>
                              <td className="px-6 py-3">{tx.amount.toLocaleString()}</td>
                              <td className="px-6 py-3">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      tx.status === TransactionStatus.COMPLETED ? 'bg-green-100 text-green-700' : 
                                      tx.status === TransactionStatus.REJECTED ? 'bg-red-100 text-red-700' : 'bg-slate-100'
                                  }`}>
                                      {tx.status}
                                  </span>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  );
};

export default AdminDashboard;