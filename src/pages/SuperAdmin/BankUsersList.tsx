import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import { BankUser, useBankUsers } from "@/contexts/BankContext";
import { Button } from "@/components/ui/button";
import { Plus, MoreVertical, Pencil, Trash2, Search, ArrowUpDown, Eye } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CardContent, CardFooter } from "@/components/ui/card";


type SortField = "name" | "email" | "bankName" | "status" | "lastLogin";
type SortOrder = "asc" | "desc";

const BankUsersList = () => {

  const navigate = useNavigate();
  const { bankUsers, deleteBankUser, updateBankUser } = useBankUsers();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [editBankUser, setEditBankUser] = useState<boolean>(false);
  const [editBankUserData, setEditBankUserData] = useState<BankUser | null>(null);
  const [submit, setSubmit] = useState<boolean>(false);
  const handleEditBankUser = function (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    e.preventDefault();
    setEditBankUserData({ ...editBankUserData, [e.target.name]: e.target.value });
  };

  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  const handleSubmitEditBankUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmit(true);
    if (!editBankUserData) return;
    if (editBankUserData.status !== "active" && editBankUserData.status !== "inactive") {
      await setEditBankUserData({ ...editBankUserData, status: "active" });
    }
    try {
      // Assuming you have a function to update the bank user
      // await updateBankUser(editBankUserData);

      await delay(1000);
      updateBankUser(editBankUserData.id, editBankUserData);
      setSubmit(false);
      toast({
        title: "Success",
        description: "Bank user has been updated successfully.",
      });
      setEditBankUser(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update bank user. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to update bank user:", error);
    }
    setSubmit(false);
  };


  // Filter and sort bank users
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = bankUsers.filter(user =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.bankName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "email":
          comparison = a.email.localeCompare(b.email);
          break;
        case "bankName":
          comparison = a.bankName.localeCompare(b.bankName);
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        case "lastLogin":
          comparison = new Date(a.lastLogin).getTime() - new Date(b.lastLogin).getTime();
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [bankUsers, searchQuery, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleDelete = (id: string) => {
    try {
      deleteBankUser(id);
      toast({
        title: "Success",
        description: "Bank user has been deleted successfully.",
      });
      setUserToDelete(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete bank user. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout showSidebar={true}>
      <div className="py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Bank Users</h1>
          <Button onClick={() => navigate("/admin/new-bank-user")}>
            <Plus className="mr-2 h-4 w-4" /> Add Bank User
          </Button>
        </div>

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search bank users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("name")}
                    className="flex items-center gap-1"
                  >
                    Name
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("email")}
                    className="flex items-center gap-1"
                  >
                    Email
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("bankName")}
                    className="flex items-center gap-1"
                  >
                    Bank Name
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("status")}
                    className="flex items-center gap-1"
                  >
                    Status
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("lastLogin")}
                    className="flex items-center gap-1"
                  >
                    Last Login
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.bankName}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                        }`}
                    >
                      {user.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {format(new Date(user.lastLogin), "MMM d, yyyy HH:mm")}
                  </TableCell>
                  {/* <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => navigate(`/admin/edit-bank-user/${user.id}`)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setUserToDelete(user.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell> */}
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setEditBankUserData(user), setEditBankUser(true) }}
                      >
                        {/* <Eye className="h-4 w-4 mr-1" /> View */}
                        <Pencil className="mr-1 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setUserToDelete(user.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </TableCell>

                </TableRow>
              ))}
              {filteredAndSortedUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No bank users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the bank user
                and remove their data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => userToDelete && handleDelete(userToDelete)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>


        <AlertDialog open={editBankUser} onOpenChange={() => setEditBankUser(false)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Edit Bank User</AlertDialogTitle>
              {/* <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the bank user
                and remove their data from our servers.
              </AlertDialogDescription> */}
            </AlertDialogHeader>
            <form onSubmit={handleSubmitEditBankUser}>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <label htmlFor="pan" className="text-sm font-medium">
                      Name
                    </label>
                    <Input
                      name="name"
                      placeholder="Jhon doe"
                      value={editBankUserData?.name || ""}
                      onChange={handleEditBankUser}
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
                      value={editBankUserData?.email || ""}
                      onChange={handleEditBankUser}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="pan" className="text-sm font-medium">
                      Bank Name
                    </label>
                    <Input
                      name="bankName"
                      type="text"
                      placeholder="paisewali bank"
                      value={editBankUserData?.bankName || ""}
                      onChange={handleEditBankUser}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="status" className="text-sm font-medium">
                      Status
                    </label>
                    <select
                      name="status"
                      value={editBankUserData?.status || ""}
                      onChange={handleEditBankUser}
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
                onClick={(e) => handleSubmitEditBankUser(e)}
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

export default BankUsersList; 