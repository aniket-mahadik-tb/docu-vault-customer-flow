import React from "react";
import MainLayout from "@/layouts/MainLayout";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAdmins, Admin } from "@/contexts/AdminContext";
import { useUser } from "@/contexts/UserContext";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const AdminsList = () => {
  const { admins, deleteAdmin, canEditAdmin } = useAdmins();
  const { userId } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedAdmin, setSelectedAdmin] = React.useState<Admin | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = React.useState(false);

  const handleViewAdmin = (admin: Admin) => {
    setSelectedAdmin(admin);
    setViewDialogOpen(true);
  };

  const handleEditAdmin = (admin: Admin) => {
    if (!userId) return;
    
    if (canEditAdmin(userId, admin.id)) {
      navigate(`/admin/admins/${admin.id}/edit`);
    } else {
      toast({
        title: "Access Denied",
        description: "You don't have permission to edit this admin.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAdmin = (admin: Admin) => {
    if (!userId) return;
    
    if (canEditAdmin(userId, admin.id)) {
      try {
        deleteAdmin(admin.id);
        toast({
          title: "Success",
          description: "Admin has been removed from the system.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete admin. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Access Denied",
        description: "You don't have permission to delete this admin.",
        variant: "destructive",
      });
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
          {userId && canEditAdmin(userId, "ADM001") && (
            <Button onClick={() => navigate("/admin/new-admin")}>
              <UserPlus className="mr-2 h-4 w-4" /> Add New Admin
            </Button>
          )}
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
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
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
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            admin.role === "Super Admin" 
                              ? "bg-purple-100 text-purple-800" 
                              : "bg-blue-100 text-blue-800"
                          }`}>
                            {admin.role}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            admin.status === "active" 
                              ? "bg-green-100 text-green-800" 
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            {admin.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          {new Date(admin.lastLogin).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewAdmin(admin)}
                            >
                              <Eye className="h-4 w-4 mr-1" /> View
                            </Button>
                            {userId && canEditAdmin(userId, admin.id) && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditAdmin(admin)}
                                >
                                  <Pencil className="h-4 w-4 mr-1" /> Edit
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleDeleteAdmin(admin)}
                                >
                                  <Trash2 className="h-4 w-4 mr-1" /> Remove
                                </Button>
                              </>
                            )}
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

        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Admin Details</DialogTitle>
              <DialogDescription>
                View detailed information about the administrator
              </DialogDescription>
            </DialogHeader>
            {selectedAdmin && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Admin ID</p>
                  <p className="font-medium">{selectedAdmin.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedAdmin.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedAdmin.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <p className="font-medium">{selectedAdmin.role}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium capitalize">{selectedAdmin.status}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Login</p>
                  <p className="font-medium">
                    {new Date(selectedAdmin.lastLogin).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default AdminsList;