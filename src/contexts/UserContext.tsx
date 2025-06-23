
import React, { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "Customer" | "Admin" | "Bank" | "SuperAdmin" | null;

export interface UserContextType {
  role: UserRole;
  userId: string | null;
  setRole: (role: UserRole) => void;
  setUserId: (id: string | null) => void;
  clearUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<UserRole>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const clearUser = () => {
    setRole(null);
    setUserId(null);
  };

  return (
    <UserContext.Provider value={{ role, userId, setRole, setUserId, clearUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
