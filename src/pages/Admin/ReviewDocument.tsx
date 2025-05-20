
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import { useCustomers } from "@/contexts/CustomerContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, X, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const ReviewDocument = () => {
  const { customerId, documentId } = useParams<{ customerId: string; documentId: string }>();
  const { getCustomer, updateDocumentStatus, generateUploadLink } = useCustomers();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [remarks, setRemarks] = useState("");

  const customer = getCustomer(customerId || "");
  const document = customer?.documents.find((doc) => doc.id === documentId);

  if (!customer || !document) {
    return (
      <MainLayout showSidebar={true}>
        <div className="py-6">
          <p>Document not found.</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </div>
      </MainLayout>
    );
  }

  const handleUpdateStatus = (status: "approved" | "rejected" | "on_hold") => {
    updateDocumentStatus(customer.id, document.id, status, remarks);

    const statusMessage = 
      status === "approved" ? "Document approved successfully" :
      status === "rejected" ? "Document rejected - customer notified" : 
      "Document put on hold";

    toast({
      title: statusMessage,
      description: remarks ? `Remarks: ${remarks}` : undefined,
    });

    if (status === "rejected") {
      const link = generateUploadLink(customer.id);
      // In a real app, this would send an email with the link
      toast({
        title: "Reupload link generated",
        description: `Link for document reupload sent to ${customer.email}`,
      });
    }

    navigate(`/admin/customers/${customer.id}`);
  };

  return (
    <MainLayout showSidebar={true}>
      <div className="py-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/admin/customers/${customer.id}`)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Customer
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Review</CardTitle>
              <CardDescription>
                Review and provide a decision for the document
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium">{customer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Document Name</p>
                  <p className="font-medium">{document.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Uploaded On</p>
                  <p className="font-medium">
                    {new Date(document.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Status</p>
                  <p className="font-medium capitalize">
                    {document.status.replace("_", " ")}
                  </p>
                </div>
                <div>
                  <label htmlFor="remarks" className="text-sm text-muted-foreground">
                    Remarks
                  </label>
                  <Textarea
                    id="remarks"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Add optional remarks here..."
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="grid grid-cols-3 gap-4 w-full">
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleUpdateStatus("approved")}
                >
                  <Check className="mr-2 h-4 w-4" /> Approve
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleUpdateStatus("rejected")}
                >
                  <X className="mr-2 h-4 w-4" /> Reject
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleUpdateStatus("on_hold")}
                >
                  <Clock className="mr-2 h-4 w-4" /> On Hold
                </Button>
              </div>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Document Preview</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center items-center min-h-[400px] bg-muted/40">
              <div className="text-center">
                <img
                  src={document.fileUrl || "/placeholder.svg"}
                  alt={document.name}
                  className="max-w-full max-h-[350px] object-contain mx-auto"
                />
                <p className="mt-4 text-sm text-muted-foreground">
                  {document.name}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default ReviewDocument;
