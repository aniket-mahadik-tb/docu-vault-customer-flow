import { z } from "zod";

// Define the admin schema for validation
export const adminSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  userId: z.string().min(3, { message: "User ID must be at least 3 characters" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  role: z.enum(["Admin", "SuperAdmin"]),
});

export type Admin = z.infer<typeof adminSchema> & {
  id: string;
  createdAt: string;
  lastLogin?: string;
};

// Mock data
const mockAdmins: Admin[] = [
  {
    id: "ADM001",
    name: "John Doe",
    email: "john@example.com",
    userId: "admin1",
    password: "admin123", // In real app, this would be hashed
    role: "Admin",
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  },
  {
    id: "ADM002",
    name: "Jane Smith",
    email: "jane@example.com",
    userId: "superadmin",
    password: "super123", // In real app, this would be hashed
    role: "SuperAdmin",
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  },
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to simulate API calls
const mockApiCall = async <T>(data: T, status = 200, delayMs = 300): Promise<{ data: T; status: number }> => {
  await delay(delayMs);
  return { data, status };
};

export interface AdminService {
  getAllAdmins: () => Promise<{ data: Admin[]; status: number }>;
  getAdminById: (id: string) => Promise<{ data: Admin; status: number }>;
  getAdminByUserId: (userId: string) => Promise<{ data: Admin; status: number }>;
  addAdmin: (adminData: Omit<Admin, "id" | "createdAt" | "lastLogin">) => Promise<{ data: Admin; status: number }>;
  updateAdmin: (id: string, adminData: Partial<Admin>) => Promise<{ data: Admin; status: number }>;
  deleteAdmin: (id: string) => Promise<{ data: null; status: number }>;
  validateAdmin: (userId: string, password: string) => Promise<{ data: { isValid: boolean; admin?: Admin }; status: number }>;
}

export function useAdminService(): AdminService {
  const service: AdminService = {
    getAllAdmins: async () => {
      try {
        // In real API:
        // const response = await fetch(`${API_BASE_URL}/admins`);
        // return await response.json();
        return mockApiCall(mockAdmins);
      } catch (error: any) {
        console.error("Failed to fetch admins");
        throw error;
      }
    },

    getAdminById: async (id: string) => {
      try {
        const admin = mockAdmins.find(a => a.id === id);
        if (!admin) throw new Error("Admin not found");
        // In real API:
        // const response = await fetch(`${API_BASE_URL}/admins/${id}`);
        // return await response.json();
        return mockApiCall(admin);
      } catch (error: any) {
        console.error("Failed to fetch admin");
        throw error;
      }
    },

    getAdminByUserId: async (userId: string) => {
      try {
        const admin = mockAdmins.find(a => a.userId === userId);
        if (!admin) throw new Error("Admin not found");
        // In real API:
        // const response = await fetch(`${API_BASE_URL}/admins/user/${userId}`);
        // return await response.json();
        return mockApiCall(admin);
      } catch (error: any) {
        console.error("Failed to fetch admin");
        throw error;
      }
    },

    addAdmin: async (adminData) => {
      try {
        const newAdmin: Admin = {
          ...adminData,
          id: `ADM${String(mockAdmins.length + 1).padStart(3, '0')}`,
          createdAt: new Date().toISOString(),
        };
        // In real API:
        // const response = await fetch(`${API_BASE_URL}/admins`, {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify(newAdmin),
        // });
        // return await response.json();
        return mockApiCall(newAdmin, 201, 500);
      } catch (error: any) {
        console.error("Failed to add admin");
        throw error;
      }
    },

    updateAdmin: async (id: string, adminData) => {
      try {
        const adminIndex = mockAdmins.findIndex(a => a.id === id);
        if (adminIndex === -1) throw new Error("Admin not found");

        const updatedAdmin = {
          ...mockAdmins[adminIndex],
          ...adminData,
        };
        // In real API:
        // const response = await fetch(`${API_BASE_URL}/admins/${id}`, {
        //   method: "PATCH",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify(adminData),
        // });
        // return await response.json();
        return mockApiCall(updatedAdmin);
      } catch (error: any) {
        console.error("Failed to update admin");
        throw error;
      }
    },

    deleteAdmin: async (id: string) => {
      try {
        const adminIndex = mockAdmins.findIndex(a => a.id === id);
        if (adminIndex === -1) throw new Error("Admin not found");
        // In real API:
        // const response = await fetch(`${API_BASE_URL}/admins/${id}`, {
        //   method: "DELETE",
        // });
        // return await response.json();
        return mockApiCall(null, 204);
      } catch (error: any) {
        console.error("Failed to delete admin");
        throw error;
      }
    },

    validateAdmin: async (userId: string, password: string) => {
      try {
        const admin = mockAdmins.find(a => a.userId === userId && a.password === password);
        // In real API:
        // const response = await fetch(`${API_BASE_URL}/admins/validate`, {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify({ userId, password }),
        // });
        // return await response.json();
        return mockApiCall({
          isValid: !!admin,
          admin: admin ? { ...admin, password: undefined } : undefined
        });
      } catch (error: any) {
        console.error("Failed to validate admin");
        throw error;
      }
    },
  };

  return service;
} 