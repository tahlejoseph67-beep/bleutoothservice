
import { User, UserRole, Transaction, TransactionType, TransactionStatus, PaymentMethod } from '../types';

const USERS_KEY = 'bts_users';
const TRANSACTIONS_KEY = 'bts_transactions';
const CURRENT_USER_KEY = 'bts_current_user';

const INITIAL_USERS: User[] = [
  { id: 'admin1', name: 'Super Admin', email: 'admin@bluetooth.com', role: UserRole.ADMIN, balance: 0, pinCode: '000000', isVerified: true },
  { id: 'user1', name: 'Jean Dupont', email: 'jean@test.com', role: UserRole.CLIENT, balance: 50000, pinCode: '123456', isVerified: false },
];

const initStorage = () => {
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
  }
};

initStorage();

export const AuthService = {
  login: (email: string, pin: string): User | null => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const user = users.find((u: User) => u.email === email && u.pinCode === pin);
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return user;
    }
    return null;
  },
  register: (name: string, email: string, pin: string): User => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      role: UserRole.CLIENT,
      balance: 0,
      pinCode: pin,
      isVerified: false
    };
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    return newUser;
  },
  updateVerification: (faceData: string) => {
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) return;
    
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const idx = users.findIndex((u: User) => u.id === currentUser.id);
    if (idx >= 0) {
        users[idx].faceData = faceData;
        users[idx].isVerified = true;
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(users[idx]));
    }
  },
  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem(CURRENT_USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }
};

export const TransactionService = {
  getTransactions: (userId?: string): Transaction[] => {
    const all = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '[]');
    if (userId) return all.filter((t: Transaction) => t.userId === userId).reverse();
    return all.reverse();
  },

  createTransaction: (transaction: Omit<Transaction, 'id' | 'date' | 'status' | 'userName'>): Transaction => {
    const transactions = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '[]');
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) throw new Error("User not found");

    const newTx: Transaction = {
      ...transaction,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      status: TransactionStatus.PENDING,
      userName: currentUser.name,
    };

    if (newTx.type === TransactionType.DEPOSIT) {
       newTx.status = TransactionStatus.COMPLETED;
        const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
        const userIndex = users.findIndex((u: User) => u.id === currentUser.id);
        if (userIndex >= 0) {
            users[userIndex].balance += newTx.amount;
            localStorage.setItem(USERS_KEY, JSON.stringify(users));
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(users[userIndex]));
        }
    } else {
        const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
        const userIndex = users.findIndex((u: User) => u.id === currentUser.id);
        if (userIndex >= 0) {
            if (users[userIndex].balance < newTx.amount) throw new Error("Solde insuffisant");
            users[userIndex].balance -= newTx.amount;
            localStorage.setItem(USERS_KEY, JSON.stringify(users));
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(users[userIndex]));
        }
    }

    transactions.push(newTx);
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
    return newTx;
  },

  updateStatus: (txId: string, status: TransactionStatus, note?: string) => {
    const transactions = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || '[]');
    const txIndex = transactions.findIndex((t: Transaction) => t.id === txId);
    if (txIndex >= 0) {
        const tx = transactions[txIndex];
        if (status === TransactionStatus.REJECTED && tx.type === TransactionType.TRANSFER && tx.status === TransactionStatus.PENDING) {
             const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
             const userIndex = users.findIndex((u: User) => u.id === tx.userId);
             if (userIndex >= 0) {
                 users[userIndex].balance += tx.amount;
                 localStorage.setItem(USERS_KEY, JSON.stringify(users));
             }
        }
        transactions[txIndex].status = status;
        if (note) transactions[txIndex].adminNote = note;
        localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
    }
  }
};
