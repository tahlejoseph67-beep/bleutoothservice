
export enum UserRole {
  ADMIN = 'ADMIN',
  CLIENT = 'CLIENT',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  balance: number;
  pinCode: string; // Nouveau: Code unique de connexion
  faceData?: string; // Nouveau: Base64 de la photo de référence
  isVerified: boolean; // Nouveau: Statut de vérification d'identité
}

export enum TransactionType {
  DEPOSIT = 'DÉPÔT',
  TRANSFER = 'TRANSFERT',
}

export enum TransactionStatus {
  PENDING = 'EN ATTENTE',
  COMPLETED = 'VALIDÉ',
  REJECTED = 'REJETÉ',
}

export enum PaymentMethod {
  KKIAPAY = 'KKIAPAY',
  BANK_TRANSFER = 'VIREMENT BANCAIRE',
  WESTERN_UNION = 'WESTERN UNION',
  MOBILE_MONEY = 'MOBILE MONEY',
  MOOV_MONEY = 'MOOV MONEY',
}

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  type: TransactionType;
  amount: number;
  method: PaymentMethod;
  recipient?: string;
  date: string;
  status: TransactionStatus;
  adminNote?: string;
}

export interface DashboardStats {
  totalBalance: number;
  totalTransactions: number;
  pendingTransactions: number;
}
