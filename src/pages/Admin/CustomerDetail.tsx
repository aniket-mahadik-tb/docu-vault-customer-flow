import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import { useCustomers, CustomerDocument, Customer } from "@/contexts/CustomerContext";
import { useDocuments } from "@/contexts/DocumentContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send, File, RefreshCw, Link, Copy, FileText, Folder, Eye } from "lucide-react";
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
import ReviewDocuments from "./ReviewDocuments";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCustomerService } from "@/services/customerService";
import { ShimmerButton, ShimmerSectionHeader, ShimmerText, ShimmerThumbnail, ShimmerTitle } from "react-shimmer-effects";
import { resolve } from "path";
import { set } from "date-fns";
import { useTempCustomer } from "@/utils/TempContext";
import { CustomerType, DocumentResponseType } from "@/utils/types";

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

  const { getCustomer, generateUploadLink, syncCustomerDocuments } = useCustomers();
  const navigate = useNavigate();
  const customerService = useCustomerService();
  // const initialSyncDone = useRef(false);
  const [reuploadLink, setReuploadLink] = useState<string | null>(null);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [generatingLink, setGeneratingLink] = useState(false);

  const documentSections = {
    section1: "KYC Documents",
    section2: "Bank Statements",
    section3: "Loan Statements",
    section4: "Financial Documents",
    section5: "Property Documents",
    section6: "Business Documents"
  }

  const [customer, setCustomer] = useState<CustomerType | null>(null);
  const { tempCustomer } = useTempCustomer();
  const [allDocuments, setAllDocuments] = useState<DocumentResponseType[] | null>(null);

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


  useEffect(() => {
    (async function fetchCustomer() {
      try {
        if (true) {

          if (tempCustomer) {
            setCustomer(tempCustomer);
            const documents: DocumentResponseType[] = tempCustomer.documents.documentsByCategory.flatMap((cat: any) =>
              (cat.documents || []).map((doc: any) => ({ ...doc, category: cat.category }))
            );
            console.log(documents);
            setAllDocuments(documents);
          } else {
            // If customer not found, redirect to customer list
            toast({
              title: `failed to fetch customer details`,
              description: "Something went wrong please try again",
              variant: "destructive",
            });
            navigate("/admin/customers");
          }

        }
      } catch (error) {
        console.error("Error fetching customer:", error);
        toast({
          title: "Error",
          description: "Failed to fetch customer details. Please try again.",
          variant: "destructive",
        });
        navigate("/admin/customers");
      }
    }
    )();
  }, [])


  if (!customer) {
    return (
      <MainLayout showSidebar={true}>
        <div >
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
                <Button onClick={() => { }} variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" /> Sync Documents
                </Button>
                <Button onClick={() => { }}>
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
                    <p className="font-medium mt-1"><ShimmerTitle line={1} variant="secondary" /></p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium mt-1"><ShimmerTitle variant="secondary" line={1} /></p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium mt-1"><ShimmerTitle variant="secondary" line={1} /></p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium mt-1"><ShimmerTitle variant="secondary" line={1} /></p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">PAN Card</p>
                    <p className="font-medium mt-1"><ShimmerTitle variant="secondary" line={1} /></p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Registration Date</p>
                    <p className="font-medium">
                      <p className="font-medium mt-1"><ShimmerTitle variant="secondary" line={1} /></p>
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Submitted Documents</CardTitle>
                  <CardDescription>
                    <p className="font-medium mt-2  "><ShimmerTitle variant="secondary" line={1} /></p>
                  </CardDescription>
                </CardHeader>
                <CardContent>

                  <div className="space-y-6">


                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Document Type</TableHead>
                            <TableHead>Document Name</TableHead>
                            <TableHead>Uploaded</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>

                          {[1].map((item) => {
                            return (<TableRow >
                              <TableCell >
                                <p className="mt-3 mb-0">
                                  <ShimmerThumbnail height={20} />
                                </p>
                              </TableCell>
                              <TableCell>
                                <p className="mt-3 mb-0">
                                  <ShimmerThumbnail height={20} />
                                </p>
                              </TableCell>
                              <TableCell>
                                <p className="mt-3 mb-0">
                                  <ShimmerThumbnail height={20} />
                                </p>
                              </TableCell>
                              <TableCell>
                                <p className="mt-3 mb-0">
                                  <ShimmerThumbnail height={20} />
                                </p>
                              </TableCell>
                              <TableCell>
                                <p className="mt-3 mb-0">
                                  <ShimmerThumbnail height={20} />
                                </p>
                              </TableCell>
                            </TableRow>)
                          })}

                        </TableBody>
                      </Table>
                    </div>

                  </div>

                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }



  const handleSendLink = async (documentId?: string, remarks?: string) => {
    if (generatingLink) return;
    setGeneratingLink(true);
    try {
      const link = await customerService.generateUploadLink(customer.pan, documentId, remarks);
      setReuploadLink(link);
      setLinkDialogOpen(true);
      setGeneratingLink(false);
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


    } catch (error) {
      console.error("Error generating upload link:", error);

      setGeneratingLink(false);
      toast({
        title: "Error",
        description: "Failed to generate upload link. Please try again.",
        variant: "destructive",
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

  const handleSyncDocuments = async () => {
    if (customer) {
      const res = await customerService.getCustomerById("hiii");
      if (res.status == 200) {
        setCustomer(res.data);
      } else {
        // If customer not found, redirect to customer list
        toast({
          title: `failed to fetch customer details`,
          description: "Something went wrong please try again",
          variant: "destructive",

        });
        navigate("/admin/customers");
      }
      toast({
        title: "Documents Synchronized",
        description: "Customer documents have been updated from uploads",
      });
    }
  };

  return (
    <MainLayout showSidebar={true}>
      <div className="py-8 px-2 md:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin/customers")}
            className="mb-2 md:mb-0"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Customer List
          </Button>
          <div className="flex gap-2 w-full md:w-auto">
            <Button onClick={handleSyncDocuments} variant="outline" className="bg-gray-200">
              <RefreshCw className="mr-2  w-4" /> Sync Documents
            </Button>

            <Button onClick={() => handleSendLink()}>
              {generatingLink ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Generating Link
                </span>
              ) : (
                <><Send className="mr-2  w-4" />Send Upload Link</>
              )}
            </Button>
          </div>
        </div>

        {/* Customer Info Card */}
        <Card className="mb-8 shadow-sm border-0 bg-white max-w-full w-full mx-auto">
          <CardContent className="flex flex-row flex-wrap items-center gap-x-4 gap-y-2 py-2 px-3 min-h-0 text-sm w-full">
            <div className="flex flex-col min-w-[90px]">
              <span className="text-[11px] text-gray-400 font-medium">PAN</span>
              <span className="font-semibold text-gray-900">{customer.pan}</span>
            </div>
            <span className="mx-2 h-6 border-l border-gray-200 hidden sm:inline-block" />
            <div className="flex flex-col min-w-[90px]">
              <span className="text-[11px] text-gray-400 font-medium">Name</span>
              <span className="font-semibold text-gray-900">{customer.name}</span>
            </div>
            <span className="mx-2 h-6 border-l border-gray-200 hidden sm:inline-block" />
            <div className="flex flex-col min-w-[120px]">
              <span className="text-[11px] text-gray-400 font-medium">Email</span>
              <span className="font-semibold text-gray-900">{customer.email}</span>
            </div>
            <span className="mx-2 h-6 border-l border-gray-200 hidden sm:inline-block" />
            <div className="flex flex-col min-w-[90px]">
              <span className="text-[11px] text-gray-400 font-medium">Phone</span>
              <span className="font-semibold text-gray-900">{customer.phone}</span>
            </div>
            <span className="mx-2 h-6 border-l border-gray-200 hidden sm:inline-block" />
            <div className="flex flex-col min-w-[70px]">
              <span className="text-[11px] text-gray-400 font-medium">Type</span>
              <span className="font-semibold text-gray-900">{customer.clientType}</span>
            </div>
          </CardContent>
        </Card>

        {/* Documents Table - revert to previous look */}
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between">
              Submitted Documents
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {allDocuments.length} documents available
            </p>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[35%] pl-6">Document Type</TableHead>
                    <TableHead className="w-[20%] px-4">Category</TableHead>
                    <TableHead className="w-[15%] px-4">Status</TableHead>
                    <TableHead className="w-[15%] px-4">Files Count</TableHead>
                    <TableHead className="w-[15%] px-4">Files</TableHead>
                    <TableHead className="w-[15%] px-4">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allDocuments.length > 0 ? (
                    allDocuments.map((doc: DocumentResponseType) => (
                      <TableRow key={`` + doc.id}>
                        <TableCell className="font-medium pl-6">{doc.documentType}</TableCell>
                        <TableCell className="px-4">{doc.category}</TableCell>
                        <TableCell className="px-4">
                          {doc.status === "UPLOADED" ? (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">Uploaded</Badge>
                          ) : doc.status === "REJECTED" ? (
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Rejected</Badge>
                          ) : doc.status === "SUBMITTED" ?
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Submitted</Badge>
                            :
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Aproved</Badge>
                          }
                        </TableCell>
                        <TableCell className="px-4">{doc.files ? doc.files.length : 0}</TableCell>
                        <TableCell className="px-4">
                          {doc.files && doc.files.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {doc.files.map((file: string, idx: number) => (
                                <span key={idx} className="inline-block bg-gray-100 rounded px-2 py-1 text-xs text-gray-700">{file}</span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">No files</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/admin/customers/details/review/${doc.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-1" /> Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 px-4">
                        No documents found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Dialog for Upload Link */}
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
