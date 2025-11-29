import React, { useMemo } from 'react';
import { User, Transaction, TransactionType, TransactionStatus } from '../../types';
import { TransactionService } from '../../services/mockDatabase';
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

interface ClientDashboardProps {
  user: User;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ user }) => {
  const transactions = useMemo(() => TransactionService.getTransactions(user.id), [user.id]);

  const stats = useMemo(() => {
    const income = transactions
      .filter(t => t.type === TransactionType.DEPOSIT && t.status === TransactionStatus.COMPLETED)
      .reduce((acc, curr) => acc + curr.amount, 0);
    const expense = transactions
      .filter(t => t.type === TransactionType.TRANSFER && t.status !== TransactionStatus.REJECTED)
      .reduce((acc, curr) => acc + curr.amount, 0);
    return { income, expense };
  }, [transactions]);

  const chartData = [
    { name: 'Dépôts', value: stats.income, color: '#10B981' },
    { name: 'Transferts', value: stats.expense, color: '#EF4444' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">Bonjour, {user.name}</h2>
            <p className="text-slate-500">Bienvenue sur votre espace financier.</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
            <span className="text-sm text-slate-500 font-medium">Solde Disponible</span>
            <span className="text-2xl font-bold text-slate-900">{user.balance.toLocaleString('fr-FR')} FCFA</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Income */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-bl-full -mr-4 -mt-4"></div>
            <div className="relative z-10">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-4">
                    <ArrowDownLeft size={20} />
                </div>
                <p className="text-slate-500 text-sm font-medium">Total Dépôts</p>
                <h3 className="text-2xl font-bold text-slate-800">{stats.income.toLocaleString('fr-FR')} FCFA</h3>
            </div>
        </div>

        {/* Card 2: Expense */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-bl-full -mr-4 -mt-4"></div>
            <div className="relative z-10">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-4">
                    <ArrowUpRight size={20} />
                </div>
                <p className="text-slate-500 text-sm font-medium">Total Transferts</p>
                <h3 className="text-2xl font-bold text-slate-800">{stats.expense.toLocaleString('fr-FR')} FCFA</h3>
            </div>
        </div>

        {/* Card 3: Chart */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-center">
             <h4 className="text-sm font-semibold text-slate-600 mb-2">Aperçu</h4>
             <div className="h-24 w-full">
                {stats.income === 0 && stats.expense === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-slate-400">Aucune donnée</div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={chartData} cx="50%" cy="50%" innerRadius={25} outerRadius={35} paddingAngle={5} dataKey="value">
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <RechartsTooltip />
                        </PieChart>
                    </ResponsiveContainer>
                )}
             </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Transactions Récentes</h3>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                    <tr>
                        <th className="px-6 py-3 text-left">Type</th>
                        <th className="px-6 py-3 text-left">Méthode</th>
                        <th className="px-6 py-3 text-left">Montant</th>
                        <th className="px-6 py-3 text-left">Date</th>
                        <th className="px-6 py-3 text-left">Statut</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {transactions.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-slate-500 text-sm">Aucune transaction récente.</td>
                        </tr>
                    ) : (
                        transactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        {tx.type === TransactionType.DEPOSIT ? <ArrowDownLeft size={16} className="text-green-500"/> : <ArrowUpRight size={16} className="text-red-500"/>}
                                        <span className={`font-medium ${tx.type === TransactionType.DEPOSIT ? 'text-green-600' : 'text-slate-700'}`}>
                                            {tx.type}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{tx.method}</td>
                                <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-700">{tx.amount.toLocaleString()} FCFA</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                    {new Date(tx.date).toLocaleDateString('fr-FR')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                                        ${tx.status === TransactionStatus.COMPLETED ? 'bg-green-100 text-green-700' : 
                                          tx.status === TransactionStatus.REJECTED ? 'bg-red-100 text-red-700' : 
                                          'bg-yellow-100 text-yellow-700'}`}>
                                        {tx.status === TransactionStatus.COMPLETED && <CheckCircle size={12} />}
                                        {tx.status === TransactionStatus.REJECTED && <XCircle size={12} />}
                                        {tx.status === TransactionStatus.PENDING && <Clock size={12} />}
                                        {tx.status}
                                    </span>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;