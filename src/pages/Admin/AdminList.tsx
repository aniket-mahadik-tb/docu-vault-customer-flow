import React, { useEffect, useState } from "react";
import MainLayout from "@/layouts/MainLayout";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Eye, UserPlus, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAdminService, Admin } from "@/services/adminService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const AdminList = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const adminService = useAdminService();

  useEffect(() => {
    const loadAdmins = async () => {
      try {
        const response = await adminService.getAllAdmins();
        setAdmins(response.data);
      } catch (error) {
        console.error("Failed to fetch admins:", error);
        toast({
          title: "Error",
          description: "Failed to load admins. Please try again.",
          variant: "destructive",
        });
      }
    };

    loadAdmins();
  }, []);

  const viewAdmin = (adminId: string) => {
    navigate(`/admin/admins/${adminId}`);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "SuperAdmin":
        return <Badge variant="default" className="bg-purple-500">Super Admin</Badge>;
      default:
        return <Badge variant="secondary">Admin</Badge>;
    }
  };

  return (
    <MainLayout showSidebar={true}>
      <div className="py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Admin List</h1>
            <p className="text-muted-foreground mt-1">
              View and manage system administrators
            </p>
          </div>
          <Button onClick={() => navigate("/admin/new-admin")}>
            <UserPlus className="mr-2 h-4 w-4" /> Add New Admin
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>System Administrators</CardTitle>
            <CardDescription>
              Total {admins.length} administrators registered in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Admin ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.length > 0 ? (
                    admins.map((admin) => (
                      <TableRow key={admin.id}>
                        <TableCell>{admin.id}</TableCell>
                        <TableCell className="font-medium">{admin.name}</TableCell>
                        <TableCell>{admin.email}</TableCell>
                        <TableCell>{admin.userId}</TableCell>
                        <TableCell>{getRoleBadge(admin.role)}</TableCell>
                        <TableCell>
                          {admin.lastLogin 
                            ? new Date(admin.lastLogin).toLocaleDateString()
                            : "Never"
                          }
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => viewAdmin(admin.id)}
                            >
                              <Eye className="h-4 w-4 mr-1" /> View
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        No administrators found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AdminList; 