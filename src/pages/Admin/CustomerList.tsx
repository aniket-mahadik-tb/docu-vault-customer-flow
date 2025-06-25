import React, { useEffect, useState } from "react";
import MainLayout from "@/layouts/MainLayout";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Eye, Trash2, UserPlus, CheckCircle, X, Check, Clock, AlertCircle, ChevronDown, Filter } from "lucide-react";
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
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

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
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [statusPopoverOpen, setStatusPopoverOpen] = useState(false);

  const statusOptions = [
    { value: "ALL", label: "All", icon: <Check className="h-4 w-4 text-gray-400" /> },
    { value: "SUBMITTED", label: "Submitted", icon: <CheckCircle className="h-4 w-4 text-green-600" /> },
    { value: "REJECTED", label: "Rejected", icon: <X className="h-4 w-4 text-red-600" /> },
    { value: "APPROVED", label: "Approved", icon: <Check className="h-4 w-4 text-blue-600" /> },
    { value: "PENDING", label: "Pending", icon: <Clock className="h-4 w-4 text-yellow-600" /> },
  ];

  useEffect(() => {
    fetchCustomers();
  }, []);

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

  const handleViewCustomer = async (customer: CustomerType) => {
    // setViewDialogOpen(true);
    // setSelectedCustomer(customer);
    const response = await customerService.getCustomerDocuments(customer.pan);
    customer.documents = response;
    customer.clientType = response.customerType;
    setTempCustomer(customer);
    navigate(`/admin/customers/details`);
  };

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

  const handleFilterCustomer = async (status: String) => {
    if (status === "ALL") {
      fetchCustomers();
      return
    }
    try {
      const res: CustomerType[] = await customerService.getCustomerByStatus(status);
      setCustomers(res);
    } catch (e) {
      console.error(e)
      toast({
        title: "Error",
        description: "Failed to filter customer. Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <MainLayout showSidebar={true}>
      <div className="py-6">
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-4 rounded-lg shadow-sm border">
            <div>
              <h1 className="text-2xl font-bold">Customer List</h1>
              <p className="text-muted-foreground mt-1">View and manage registered customers</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch gap-2 min-w-[260px]">
              <div className="flex items-center gap-2">
                <Popover open={statusPopoverOpen} onOpenChange={setStatusPopoverOpen}>
                  <PopoverTrigger asChild>
                    <button
                      id="statusFilter"
                      className="flex items-center gap-2 border border-gray-300 rounded-md px-4 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-700 hover:border-blue-400 min-w-[160px]"
                      aria-haspopup="listbox"
                      aria-expanded={statusPopoverOpen}
                    >
                      {statusOptions.find(opt => opt.value === statusFilter)?.icon}
                      <span>{statusOptions.find(opt => opt.value === statusFilter)?.label}</span>
                      <ChevronDown className="h-4 w-4 ml-auto text-gray-400" />
                      <span className="mx-1 h-5 w-px bg-gray-200" />
                      <Filter className="h-4 w-4 text-gray-400 ml-1" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="p-0 w-48">
                    <ul className="py-1" role="listbox">
                      {statusOptions.map(option => (
                        <li key={option.value}>
                          <button
                            className={`flex items-center w-full px-4 py-2 gap-2 text-left hover:bg-blue-50 focus:bg-blue-100 transition ${statusFilter === option.value ? 'bg-blue-50 font-semibold' : ''}`}
                            onClick={() => {
                              handleFilterCustomer(option.value)
                              setStatusFilter(option.value);
                              setStatusPopoverOpen(false);
                            }}
                            role="option"
                            aria-selected={statusFilter === option.value}
                          >
                            {option.icon}
                            <span>{option.label}</span>
                            {statusFilter === option.value && <Check className="h-4 w-4 text-blue-500 ml-auto" />}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </PopoverContent>
                </Popover>
              </div>
              <Button onClick={() => navigate("/admin/new-customer")}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                <UserPlus className="h-4 w-4" /> Add New Customer
              </Button>
            </div>
          </div>
        </div>

        <div className="relative">
          <span className="absolute right-4 top-4 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100 z-10">
            Showing: {statusFilter === "ALL" ? "All Customers" : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1).toLowerCase()}
          </span>
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
                      <TableHead className="text-center">Name</TableHead>
                      <TableHead className="text-center">Email</TableHead>
                      <TableHead className="text-center">Phone</TableHead>
                      <TableHead className="text-center">PAN Card</TableHead>
                      <TableHead className="text-center">Customer Type</TableHead>
                      <TableHead className="text-center">Documents</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers !== null && customers.length > 0 ? (
                      customers.map((customer) => (
                        <TableRow key={customer.pan}>
                          {/* <TableCell>{customer.id}</TableCell> */}
                          <TableCell className="text-center font-medium">{customer.name}</TableCell>
                          <TableCell className="text-center">{customer.email}</TableCell>
                          <TableCell className="text-center">{customer.phone}</TableCell>
                          <TableCell className="text-center">{customer.pan}</TableCell>
                          <TableCell className="text-center">{customer.clientType}</TableCell>
                          <TableCell className="text-center">
                            {true ? (
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                Submitted ({customer.documents?.documentsByCategory[0].documents.length})
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                                Pending
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex gap-2 justify-center">
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
                          <TableCell className="text-center"><p className="mt-3 mb-0"><ShimmerThumbnail height={20} /></p></TableCell>
                          <TableCell className="text-center"><p className="mt-3 mb-0"><ShimmerThumbnail height={20} /></p></TableCell>
                          <TableCell className="text-center"><p className="mt-3 mb-0"><ShimmerThumbnail height={20} /></p></TableCell>
                          <TableCell className="text-center"><p className="mt-3 mb-0"><ShimmerThumbnail height={20} /></p></TableCell>
                          <TableCell className="text-center"><p className="mt-3 mb-0"><ShimmerThumbnail height={20} /></p></TableCell>
                          <TableCell className="text-center"><p className="mt-3 mb-0"><ShimmerThumbnail height={20} /></p></TableCell>
                          <TableCell className="text-center"><p className="mt-3 mb-0"><ShimmerThumbnail height={20} /></p></TableCell>
                          <TableCell className="text-center"><p className="mt-3 mb-0"><ShimmerThumbnail height={20} /></p></TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

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
                      ? `Submitted (${selectedCustomer.documents?.documentsByCategory[0].documents.length} documents)`
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
    </MainLayout >
  );
};

export default CustomerList;
