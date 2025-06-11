import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "SuperAdmin";
  status: "active" | "inactive";
  lastLogin: string;
  password?: string; // Only used during creation
}

interface AdminContextType {
  admins: Admin[];
  addAdmin: (admin: Omit<Admin, 'id' | 'lastLogin' | 'status' | 'role'>) => void;
  updateAdmin: (id: string, admin: Partial<Admin>) => void;
  deleteAdmin: (id: string) => void;
  getAdmin: (id: string) => Admin | undefined;
  canEditAdmin: (currentAdminId: string, targetAdminId: string) => boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Mock initial data
const initialAdmins: Admin[] = [
  {
    id: "ADM001",
    name: "John Doe",
    email: "john.doe@example.com",
    role: "Admin",
    status: "active",
    lastLogin: "2024-03-15T10:30:00Z",
  },
  {
    id: "ADM002",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    role: "SuperAdmin",
    status: "active",
    lastLogin: "2024-03-15T09:15:00Z",
  },
];

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [admins, setAdmins] = useState<Admin[]>(initialAdmins);

  const generateAdminId = () => {
    const lastAdmin = admins[admins.length - 1];
    const lastId = lastAdmin ? parseInt(lastAdmin.id.replace('ADM', '')) : 0;
    return `ADM${String(lastId + 1).padStart(3, '0')}`;
  };

  const addAdmin = (adminData: Omit<Admin, 'id' | 'lastLogin' | 'status' | 'role'>) => {
    const newAdmin: Admin = {
      ...adminData,
      id: generateAdminId(),
      role: "Admin", // Default role for new admins
      status: "active",
      lastLogin: new Date().toISOString(),
    };
    setAdmins(prev => [...prev, newAdmin]);
  };

  const updateAdmin = (id: string, adminData: Partial<Admin>) => {
    setAdmins(prev =>
      prev.map(admin =>
        admin.id === id ? { ...admin, ...adminData } : admin
      )
    );
  };

  const deleteAdmin = (id: string) => {
    setAdmins(prev => prev.filter(admin => admin.id !== id));
  };

  const getAdmin = (id: string) => {
    return admins.find(admin => admin.id === id);
  };

  const canEditAdmin = (currentAdminId: string, targetAdminId: string) => {
    const currentAdmin = getAdmin(currentAdminId);
    const targetAdmin = getAdmin(targetAdminId);

    if (!currentAdmin || !targetAdmin) return false;

    // Super Admin can edit anyone
    if (currentAdmin.role === "SuperAdmin") return true;

    // Regular Admin can only edit themselves
    return currentAdmin.id === targetAdmin.id;
  };

  return (
    <AdminContext.Provider
      value={{
        admins,
        addAdmin,
        updateAdmin,
        deleteAdmin,
        getAdmin,
        canEditAdmin,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmins = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmins must be used within an AdminProvider');
  }
  return context;
}; 