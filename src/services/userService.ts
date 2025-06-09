import { UserContextType } from "@/contexts/UserContext";

const mockUsers: Partial<UserContextType>[] = [
    {
        role: "Customer",
        userId: "CUST001",
    },
    {
        role: "Customer",
        userId: "CUST002",
    },
    {
        role: "Customer",
        userId: "CUST003",
    },
    {
        role: "Bank",
        userId: "CUST004",
    },
    {
        role: "Admin",
        userId: "CUST003",
    },
]

const delay = (ms: number) => new Promise(Resolve => setTimeout(Resolve, ms));

export function useUserService() {
    const service: any = {};

    service.getAllUsers = async () => {
        try {
            await delay(500);
            return { status: 200, users: mockUsers };

        } catch (err: any) {
            console.error("Failed to fetch users");
            throw err;
        }
    }

    service.getUserById = async (userId: String) => {
        try {
            await delay(500);
            const user = mockUsers.find(u => u.userId == userId)
            if (!user) throw new Error("User Not Found");
            return {
                data: user,
                status: 200
            }
        }
        catch (err: any) {
            console.error("Failed to Fetch the user")
            throw err;
        }
    }

    service.getUsersByRole = async (role: "Admin" | "Customer" | "Bank") => {
        try {
            await delay(500);
            const user = mockUsers.filter((u) => u.role === role);
            if (!user) throw new Error("User Not Found");
            return {
                data: user,
                status: 200
            }
        }
        catch (err: any) {
            console.error("Failed to Fetch the user")
            throw err;
        }
    }

}