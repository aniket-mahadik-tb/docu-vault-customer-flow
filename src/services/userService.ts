import { UserContextType } from "@/contexts/UserContext";
import { constants } from "@/utils/constants";

const { mockUsers } = constants;

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
            const user = mockUsers.find(u => u.role == "Admin" || u.role == "SuperAdmin");
            if (!user) throw new Error("User Not Found");
            return {
                data: user.role,
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

    return service;

}