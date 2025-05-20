import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import { useCustomers, CustomerDocument, Customer } from "@/contexts/CustomerContext";
import { Button } from "@/components/ui/button";
import { Check, X, Clock, User, FileText, Eye, RefreshCw } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
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

type StatusFilter = "all" | "pending" | "approved" | "rejected" | "on_hold";

const getStatusBadge = (status: string) => {
  switch (status) {
    case "approved":
      return <Badge variant="default" className="bg-green-500">Approved</Badge>;
    case "rejected":
      return <Badge variant="destructive">Rejected</Badge>;
    case "on_hold":
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">On Hold</Badge>;
    default:
      return <Badge variant="secondary">Pending</Badge>;
  }
};

const ReviewDocuments = () => {
  const { customers, syncCustomerDocuments } = useCustomers();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // On load, sync all customers' documents
  useEffect(() => {
    customers.forEach(customer => {
      syncCustomerDocuments(customer.panCard);
    });
  }, []); // Run once on component mount

  // Get all documents from all customers
  const allDocuments = customers.flatMap(customer => 
    customer.documents.map(doc => ({
      ...doc,
      customerId: customer.id,
      customerName: customer.name
    }))
  );

  const filteredDocuments = statusFilter === "all" 
    ? allDocuments 
    : allDocuments.filter(doc => doc.status === statusFilter);

  const handleSyncAllDocuments = () => {
    customers.forEach(customer => {
      syncCustomerDocuments(customer.panCard);
    });
    toast({
      title: "All Documents Synchronized",
      description: "All customers' documents have been updated from uploads",
    });
  };

  return (
    <MainLayout showSidebar={true}>
      <div className="py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Review Documents</h1>
          <Button onClick={handleSyncAllDocuments} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" /> Sync All Documents
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Document Status Filters</CardTitle>
            <CardDescription>
              Filter documents by their current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                onClick={() => setStatusFilter("all")}
              >
                All
              </Button>
              <Button
                variant={statusFilter === "pending" ? "default" : "outline"}
                onClick={() => setStatusFilter("pending")}
              >
                <Clock className="mr-2 h-4 w-4" /> Pending
              </Button>
              <Button
                variant={statusFilter === "approved" ? "default" : "outline"}
                onClick={() => setStatusFilter("approved")}
                className={statusFilter === "approved" ? "bg-green-600 hover:bg-green-700" : ""}
              >
                <Check className="mr-2 h-4 w-4" /> Approved
              </Button>
              <Button
                variant={statusFilter === "rejected" ? "default" : "outline"}
                onClick={() => setStatusFilter("rejected")}
                className={statusFilter === "rejected" ? "bg-destructive hover:bg-destructive/90" : ""}
              >
                <X className="mr-2 h-4 w-4" /> Rejected
              </Button>
              <Button
                variant={statusFilter === "on_hold" ? "default" : "outline"}
                onClick={() => setStatusFilter("on_hold")}
                className={statusFilter === "on_hold" ? "bg-yellow-500 hover:bg-yellow-600" : ""}
              >
                <Clock className="mr-2 h-4 w-4" /> On Hold
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Submitted Documents</CardTitle>
              <p className="text-sm text-muted-foreground">
                Showing {filteredDocuments.length} documents
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document Name</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.length > 0 ? (
                    filteredDocuments.map((doc) => (
                      <TableRow key={`${doc.customerId}-${doc.id}`}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            {doc.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {doc.customerName}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(doc.uploadedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(doc.status)}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/admin/review/${doc.customerId}/${doc.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-1" /> Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        No documents found matching the selected filter
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

export default ReviewDocuments;
