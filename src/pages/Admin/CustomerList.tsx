
import React from "react";
import MainLayout from "@/layouts/MainLayout";
import { useCustomers } from "@/contexts/CustomerContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Eye, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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

const CustomerList = () => {
  const { customers } = useCustomers();
  const navigate = useNavigate();
  const { toast } = useToast();

  const viewCustomer = (customerId: string) => {
    navigate(`/admin/customers/${customerId}`);
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
            Add New Customer
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Registered Customers</CardTitle>
            <CardDescription>
              Total {customers.length} customers registered in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>PAN Card</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.length > 0 ? (
                    customers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>{customer.id}</TableCell>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell>{customer.panCard}</TableCell>
                        <TableCell>{customer.phone}</TableCell>
                        <TableCell>
                          {customer.documentsSubmitted ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                              Submitted ({customer.documents.length})
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
                              onClick={() => viewCustomer(customer.id)}
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
                        No customers found
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

export default CustomerList;
