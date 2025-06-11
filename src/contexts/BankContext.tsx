import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface BankUser {
  id: string;
  name: string;
  email: string;
  bankName: string;
  status: "active" | "inactive";
  lastLogin: string;
  password?: string; // Only used during creation
}

interface BankContextType {
  bankUsers: BankUser[];
  addBankUser: (bankUser: Omit<BankUser, 'id' | 'lastLogin' | 'status'>) => void;
  updateBankUser: (id: string, bankUser: Partial<BankUser>) => void;
  deleteBankUser: (id: string) => void;
  getBankUser: (id: string) => BankUser | undefined;
}

const BankContext = createContext<BankContextType | undefined>(undefined);

const STORAGE_KEY = "bank_users";

// Mock initial data
const initialBankUsers: BankUser[] = [
  {
    id: "BNK001",
    name: "Robert Johnson",
    email: "robert.johnson@hdfc.com",
    bankName: "HDFC Bank",
    status: "active",
    lastLogin: "2024-03-15T10:30:00Z",
  },
  {
    id: "BNK002",
    name: "Sarah Williams",
    email: "sarah.williams@icici.com",
    bankName: "ICICI Bank",
    status: "active",
    lastLogin: "2024-03-15T09:15:00Z",
  },
];

export const BankProvider = ({ children }: { children: ReactNode }) => {
  const [bankUsers, setBankUsers] = useState<BankUser[]>([]);

  // Load bank users from localStorage on mount
  useEffect(() => {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      try {
        setBankUsers(JSON.parse(storedData));
      } catch (error) {
        console.error("Failed to parse stored bank users:", error);
        // If parsing fails, use initial data
        setBankUsers(initialBankUsers);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialBankUsers));
      }
    } else {
      // If no stored data, use initial data
      setBankUsers(initialBankUsers);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialBankUsers));
    }
  }, []);

  // Save bank users to localStorage whenever they change
  useEffect(() => {
    if (bankUsers.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bankUsers));
    }
  }, [bankUsers]);

  const generateBankUserId = () => {
    const lastUser = bankUsers[bankUsers.length - 1];
    const lastId = lastUser ? parseInt(lastUser.id.replace('BNK', '')) : 0;
    return `BNK${String(lastId + 1).padStart(3, '0')}`;
  };

  const addBankUser = (bankUserData: Omit<BankUser, 'id' | 'lastLogin' | 'status'>) => {
    const newBankUser: BankUser = {
      ...bankUserData,
      id: generateBankUserId(),
      status: "active",
      lastLogin: new Date().toISOString(),
    };
    setBankUsers(prev => [...prev, newBankUser]);
  };

  const updateBankUser = (id: string, bankUserData: Partial<BankUser>) => {
    setBankUsers(prev =>
      prev.map(user =>
        user.id === id ? { ...user, ...bankUserData } : user
      )
    );
  };

  const deleteBankUser = (id: string) => {
    setBankUsers(prev => prev.filter(user => user.id !== id));
  };

  const getBankUser = (id: string) => {
    return bankUsers.find(user => user.id === id);
  };

  return (
    <BankContext.Provider
      value={{
        bankUsers,
        addBankUser,
        updateBankUser,
        deleteBankUser,
        getBankUser,
      }}
    >
      {children}
    </BankContext.Provider>
  );
};

export const useBankUsers = () => {
  const context = useContext(BankContext);
  if (context === undefined) {
    throw new Error('useBankUsers must be used within a BankProvider');
  }
  return context;
}; 