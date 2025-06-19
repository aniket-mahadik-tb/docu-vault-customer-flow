import React, { useEffect, useState } from "react";
import MainLayout from "@/layouts/MainLayout";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Eye, Trash2, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Customer, useCustomers } from "@/contexts/CustomerContext";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { useCustomerService } from "@/services/customerService";
import { ShimmerThumbnail } from "react-shimmer-effects";
import { CustomerType } from "@/utils/types";
import { useTempCustomer } from "@/utils/TempContext";

const CustomerList = () => {
  // const { customers, deleteCustomer } = useCustomers();
  const customerService = useCustomerService();
  const [customers, setCustomers, deleteCustomer] = [...useState<CustomerType[] | null>(null), customerService.deleteCustomer];
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedCustomer, setSelectedCustomer] = React.useState<CustomerType | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [customerToDelete, setCustomerToDelete] = React.useState<CustomerType | null>(null);
  const { setTempCustomer } = useTempCustomer();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await customerService.getAllCustomers();
        setCustomers(response);
      } catch (error) {
        console.error("Failed to fetch customers", error);
        toast({
          title: "Error",
          description: "Failed to load customers. Please try again later.",
          variant: "destructive",
        });
      }
    };
    fetchCustomers();
  }, []);

  const handleViewCustomer = (customer: CustomerType) => {
    // setViewDialogOpen(true);
    // setSelectedCustomer(customer);
    setTempCustomer(customer);
    navigate(`/admin/customers/${customer.pan}`);
  };

  //UNCOMMENT THIS WHEN YOU WANT TO FETCH CUSTOMERS FROM THE SERVER
  // useEffect(() => {
  //   const fetchCustomers = async () => {
  //     const response = await useCustomerService()?.getAllCustomers();
  //     console.log("response",response);
  //   }
  //   fetchCustomers();
  // }, []);

  const handleDeleteClick = (customer: CustomerType) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (customerToDelete) {
      try {
        deleteCustomer(customerToDelete.pan);
        toast({
          title: "Success",
          description: "Customer has been removed from the system.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete customer. Please try again.",
          variant: "destructive",
        });
      }
      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
    }
  };

  return (
    <MainLayout showSidebar={true}>
      <div className="py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Customer List</h1>
            <p className="text-muted-foreground mt-1">
              View and manage registered customers
            </p>
          </div>
          <Button onClick={() => navigate("/admin/new-customer")}>
            <UserPlus className="mr-2 h-4 w-4" /> Add New Customer
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Registered Customers</CardTitle>
            <CardDescription>
              Total {(customers !== null) && customers.length} customers registered in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {/* <TableHead>Customer ID</TableHead> */}
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>PAN Card</TableHead>
                    <TableHead>Customer Type</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers !== null && customers.length > 0 ? (
                    customers.map((customer) => (
                      <TableRow key={customer.pan}>
                        {/* <TableCell>{customer.id}</TableCell> */}
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell>{customer.phone}</TableCell>
                        <TableCell>{customer.pan}</TableCell>
                        <TableCell className="ps-6">{customer.clientType }</TableCell>
                        <TableCell>
                          {true ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                              Submitted ({customer.documents?.length})
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                              Pending
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewCustomer(customer)}
                            >
                              <Eye className="h-4 w-4 mr-1" /> View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteClick(customer)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" /> Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (customers !== null) ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4">
                        No customers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    [1, 2, 3].map((customer) => (
                      <TableRow key={customer}>
                        <TableCell><p className="mt-3 mb-0"><ShimmerThumbnail height={20} /></p></TableCell>
                        <TableCell><p className="mt-3 mb-0"><ShimmerThumbnail height={20} /></p></TableCell>
                        <TableCell><p className="mt-3 mb-0"><ShimmerThumbnail height={20} /></p></TableCell>
                        <TableCell><p className="mt-3 mb-0"><ShimmerThumbnail height={20} /></p></TableCell>
                        <TableCell><p className="mt-3 mb-0"><ShimmerThumbnail height={20} /></p></TableCell>
                        <TableCell><p className="mt-3 mb-0"><ShimmerThumbnail height={20} /></p></TableCell>
                        <TableCell><p className="mt-3 mb-0"><ShimmerThumbnail height={20} /></p></TableCell>
                        <TableCell><p className="mt-3 mb-0"><ShimmerThumbnail height={20} /></p></TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* View Customer Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Customer Details</DialogTitle>
              <DialogDescription>
                View detailed information about the customer
              </DialogDescription>
            </DialogHeader>
            {selectedCustomer && (
              <div className="space-y-4">
                {/* <div>
                  <p className="text-sm text-muted-foreground">Customer ID</p>
                  <p className="font-medium">{selectedCustomer.id}</p>
                </div> */}
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedCustomer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedCustomer.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedCustomer.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">PAN Card</p>
                  <p className="font-medium">{selectedCustomer.pan}</p>
                </div>
                {/* {false && (
                  <div>
                    <p className="text-sm text-muted-foreground">Business Name</p>
                    <p className="font-medium">{"hii"}</p>
                  </div>
                )} */}
                <div>
                  <p className="text-sm text-muted-foreground">Registration Date</p>
                  <p className="font-medium">
                    {new Date(selectedCustomer.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Documents Status</p>
                  <p className="font-medium">
                    {true
                      ? `Submitted (${selectedCustomer.documents?.length} documents)`
                      : "No documents submitted"}
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Customer</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this customer? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
              >
                Delete Customer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default CustomerList;
