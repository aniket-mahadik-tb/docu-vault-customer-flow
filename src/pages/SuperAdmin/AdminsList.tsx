import React, { FormEventHandler } from "react";
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
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
const AdminsList = () => {
  const { admins, deleteAdmin, canEditAdmin } = useAdmins();
  const { userId } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedAdmin, setSelectedAdmin] = React.useState<Admin | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = React.useState(false);
  const [editAdmin, setEditAdmin] = React.useState<boolean>(false);
  const [editAdminData, setEditAdminData] = React.useState<Admin | null>(null);
  const [submit, setSubmit] = React.useState<boolean>(false);

  const handleViewAdmin = (admin: Admin) => {
    setSelectedAdmin(admin);
    setViewDialogOpen(true);
  };

  const handleEditAdmin = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.preventDefault();
    setEditAdminData({ ...editAdminData, [e.target.name]: e.target.value });
  };

  const handleEditAdminSubmit = async (e: React.FormEvent) => {
    // e.preventDefault();
    if (!editAdminData.id) return;

    if (editAdminData.status !== "active" && editAdminData.status !== "inactive") {
      await setEditAdminData({ ...editAdminData, status: "active" });
    }

    if (canEditAdmin(userId, editAdminData.id)) {
      navigate(`/admin/admins/${editAdminData.id}/edit`);
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
                          <span className={`px-2 py-1 rounded-full text-xs ${admin.role === "SuperAdmin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                            }`}>
                            {admin.role}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${admin.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                            }`}>
                            {admin.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          {new Date(admin.lastLogin).toLocaleDateString()}
                        </TableCell>
                        {/* <TableCell>
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
                        </TableCell> */}
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => { setEditAdminData(admin); setEditAdmin(true); e.stopPropagation(); }}
                            >
                              {/* <Eye className="h-4 w-4 mr-1" /> View */}
                              <Pencil className="mr-1 h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteAdmin(admin)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" /> Delete
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

        <AlertDialog open={editAdmin} onOpenChange={() => setEditAdmin(false)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Edit Bank User</AlertDialogTitle>
              {/* <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the bank user
                and remove their data from our servers.
              </AlertDialogDescription> */}
            </AlertDialogHeader>
            <form onSubmit={handleEditAdminSubmit}>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <label htmlFor="pan" className="text-sm font-medium">
                      Name
                    </label>
                    <Input
                      name="name"
                      placeholder="Jhon doe"
                      value={editAdminData?.name || ""}
                      onChange={handleEditAdmin}
                      maxLength={50}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="pan" className="text-sm font-medium">
                      Email
                    </label>
                    <Input
                      name="email"
                      type="email"
                      placeholder="abc@gmail.com"
                      value={editAdminData?.email || ""}
                      onChange={handleEditAdmin}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <label htmlFor="status" className="text-sm font-medium">
                      Status
                    </label>
                    <select
                      name="status"
                      value={editAdminData?.status || ""}
                      onChange={handleEditAdmin}
                      required
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="">Select Status</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

              </CardContent>
              {/* <CardFooter>
                <Button type="submit" className="w-full" disabled={true}>
                  {false ? "Verifying..." : "Continue"}
                </Button>
              </CardFooter> */}
            </form>


            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => handleEditAdminSubmit(e)}
                className="bg-green-600 hover:bg-green-700"
              >
                {submit ? "submitting..." : "submit"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
    </MainLayout>
  );
};

export default AdminsList;