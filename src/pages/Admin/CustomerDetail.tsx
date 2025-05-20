import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import { useCustomers, CustomerDocument } from "@/contexts/CustomerContext";
import { useDocuments } from "@/contexts/DocumentContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send, File, RefreshCw, Link, Copy } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Document sections with their titles
const documentSections = [
  { id: "section1", title: "KYC Documents" },
  { id: "section2", title: "Bank Statements" },
  { id: "section3", title: "Loan Statements" },
  { id: "section4", title: "Financial Documents" },
  { id: "section5", title: "Property Documents" },
  { id: "section6", title: "Business Documents" },
];

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

const CustomerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { getCustomer, generateUploadLink, syncCustomerDocuments } = useCustomers();
  const navigate = useNavigate();
  const initialSyncDone = useRef(false);
  const [reuploadLink, setReuploadLink] = useState<string | null>(null);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);

  const customer = getCustomer(id || "");

  useEffect(() => {
    // Only sync documents on initial mount or when customer changes
    // Using a ref to track if we've already synced for this customer
    if (customer && !initialSyncDone.current) {
      syncCustomerDocuments(customer.panCard);
      initialSyncDone.current = true;
    }
  }, [customer?.id]); // Only re-run if customer ID changes, not on every render

  if (!customer) {
    return (
      <MainLayout showSidebar={true}>
        <div className="py-6">
          <p>Customer not found.</p>
          <Button onClick={() => navigate("/admin/customers")} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Customer List
          </Button>
        </div>
      </MainLayout>
    );
  }

  const groupedDocuments = customer.documents.reduce<Record<string, CustomerDocument[]>>(
    (groups, document) => {
      if (!groups[document.sectionId]) {
        groups[document.sectionId] = [];
      }
      groups[document.sectionId].push(document);
      return groups;
    },
    {}
  );

  const handleSendLink = (documentId?: string, remarks?: string) => {
    const link = generateUploadLink(customer.id, documentId, remarks);
    setReuploadLink(link);
    setLinkDialogOpen(true);
    
    if (documentId) {
      toast({
        title: "Document reupload link generated",
        description: `Reupload link for specific document ready to share with ${customer.email}`,
      });
    } else {
      toast({
        title: "Upload link generated",
        description: `Upload link ready to share with ${customer.email}`,
      });
    }
  };

  const copyLinkToClipboard = () => {
    if (reuploadLink) {
      navigator.clipboard.writeText(reuploadLink);
      toast({
        title: "Link copied",
        description: "The link has been copied to your clipboard",
      });
    }
  };

  const handleSyncDocuments = () => {
    if (customer) {
      syncCustomerDocuments(customer.panCard);
      toast({
        title: "Documents Synchronized",
        description: "Customer documents have been updated from uploads",
      });
    }
  };

  return (
    <MainLayout showSidebar={true}>
      <div className="py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/admin/customers")}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Customer List
            </Button>
            <h1 className="text-2xl font-bold">Customer Details</h1>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSyncDocuments} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" /> Sync Documents
            </Button>
            <Button onClick={() => handleSendLink()}>
              <Send className="mr-2 h-4 w-4" /> Send Upload Link
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Customer ID</p>
                <p className="font-medium">{customer.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{customer.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{customer.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{customer.phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">PAN Card</p>
                <p className="font-medium">{customer.panCard}</p>
              </div>
              {customer.businessName && (
                <div>
                  <p className="text-sm text-muted-foreground">Business Name</p>
                  <p className="font-medium">{customer.businessName}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Registration Date</p>
                <p className="font-medium">
                  {new Date(customer.createdAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Submitted Documents</CardTitle>
              <CardDescription>
                {customer.documents.length > 0
                  ? `${customer.documents.length} documents submitted`
                  : "No documents submitted yet"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {customer.documents.length > 0 ? (
                <div className="space-y-6">
                  {documentSections.map((section) => {
                    const sectionDocuments = groupedDocuments[section.id] || [];
                    if (sectionDocuments.length === 0) return null;

                    return (
                      <div key={section.id} className="space-y-3">
                        <h3 className="text-lg font-medium">{section.title}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {sectionDocuments.map((doc) => (
                            <Card key={doc.id} className="overflow-hidden">
                              <div className="p-3 border-b flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <File className="h-4 w-4" />
                                  <span className="font-medium text-sm truncate">{doc.name}</span>
                                </div>
                                {getStatusBadge(doc.status)}
                              </div>
                              <CardContent className="p-3">
                                <div className="flex flex-col gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    onClick={() => navigate(`/admin/review/${customer.id}/${doc.id}`)}
                                  >
                                    Review Document
                                  </Button>
                                  {doc.status === "rejected" && doc.remarks && (
                                    <>
                                      <div className="text-xs text-muted-foreground mt-1">
                                        <span className="font-medium">Rejection reason:</span> {doc.remarks}
                                      </div>
                                      <Button
                                        variant="default"
                                        size="sm"
                                        className="w-full"
                                        onClick={() => handleSendLink(doc.id, doc.remarks)}
                                      >
                                        <Send className="mr-2 h-3 w-3" /> Send Reupload Link
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    This customer has not uploaded any documents yet.
                  </p>
                  <div className="flex justify-center mt-4 gap-2">
                    <Button
                      variant="outline"
                      onClick={handleSyncDocuments}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" /> Sync Documents
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleSendLink()}
                    >
                      <Send className="mr-2 h-4 w-4" /> Send Upload Link
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Document Upload Link</DialogTitle>
              <DialogDescription>
                Share this link with the customer to allow them to upload the requested document.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="link" className="sr-only">
                  Link
                </Label>
                <Input
                  id="link"
                  defaultValue={reuploadLink || ""}
                  readOnly
                />
              </div>
              <Button type="submit" size="sm" className="px-3" onClick={copyLinkToClipboard}>
                <span className="sr-only">Copy</span>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                Click the link to preview the customer's view:
              </p>
              <Button
                variant="link"
                className="mt-2 w-full justify-start"
                onClick={() => {
                  if (reuploadLink) {
                    window.open(reuploadLink, '_blank');
                  }
                }}
              >
                <Link className="mr-2 h-4 w-4" /> Open in new tab
              </Button>
            </div>
            <DialogFooter className="sm:justify-start">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Close
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default CustomerDetail;
