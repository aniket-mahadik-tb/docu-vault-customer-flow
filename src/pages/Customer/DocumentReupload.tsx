
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { useDocuments } from "@/contexts/DocumentContext";
import { useCustomers } from "@/contexts/CustomerContext";
import MainLayout from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Upload, X, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const DocumentReupload = () => {
  const [searchParams] = useSearchParams();
  const customerId = searchParams.get("customerId");
  const documentId = searchParams.get("documentId");
  const remarks = searchParams.get("remarks");
  
  const navigate = useNavigate();
  const { userId, setUserId } = useUser();
  const { addDocument, submitFolder } = useDocuments();
  const { getCustomer, syncCustomerDocuments, updateDocumentStatus } = useCustomers();
  
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [document, setDocument] = useState<any>(null);
  
  useEffect(() => {
    // If we have a customer ID in the URL, set it as the current user
    if (customerId) {
      setUserId(customerId);
    }
    
    // Get document info if we have both IDs
    if (customerId && documentId) {
      const customer = getCustomer(customerId);
      if (customer) {
        const doc = customer.documents.find(d => d.id === documentId);
        if (doc) {
          setDocument(doc);
        }
      }
    }
  }, [customerId, documentId, getCustomer, setUserId]);
  
  if (!customerId || !documentId || !document) {
    return (
      <MainLayout>
        <div className="py-6">
          <Card>
            <CardHeader>
              <CardTitle>Invalid Link</CardTitle>
              <CardDescription>
                This document reupload link appears to be invalid or expired.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/customer")} className="w-full">
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }
  
  // Extract section ID and doc type ID from the document
  const sectionId = document.sectionId;
  const docTypeId = document.name.toLowerCase().replace(/\s+/g, '_');
  const fullFolderId = `${sectionId}_${docTypeId}`;
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setFiles(filesArray);
    }
  };
  
  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one file to upload",
        variant: "destructive",
      });
      return;
    }
    
    setUploading(true);
    try {
      for (const file of files) {
        await addDocument(customerId, fullFolderId, file);
      }
      
      // Submit the document
      submitFolder(customerId, fullFolderId);
      
      // Update the document status to pending in the CustomerContext
      updateDocumentStatus(customerId, documentId, "pending");
      
      // Sync the documents with the customer context
      syncCustomerDocuments(customerId);
      
      toast({
        title: "Document uploaded successfully",
        description: "Your document has been submitted for review.",
      });
      
      // Redirect to status page after successful upload
      navigate("/customer/status");
    } catch (error) {
      console.error("Error uploading document:", error);
      toast({
        title: "Upload failed",
        description: "An error occurred while uploading your document",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <MainLayout>
      <div className="py-6">
        <h1 className="text-2xl font-bold mb-6">Document Reupload</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{document.name}</CardTitle>
            <CardDescription>
              This document was rejected and needs to be reuploaded
            </CardDescription>
          </CardHeader>
          <CardContent>
            {remarks && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Rejection Reason</AlertTitle>
                <AlertDescription>
                  {remarks}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-6">
                <label htmlFor="file-upload" className="flex flex-col items-center cursor-pointer">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-lg font-medium">Drag files here or click to upload</span>
                  <span className="text-sm text-muted-foreground mt-1">
                    Please upload the corrected document
                  </span>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={uploading}
                  />
                </label>
              </div>
              
              {files.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-3">Selected Files</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {files.map((file, index) => (
                      <div key={index} className="border rounded-md p-2 relative group">
                        <div className="aspect-square w-full flex items-center justify-center bg-gray-100 rounded mb-2">
                          {file.type.includes('image') ? (
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="h-full w-full object-cover rounded"
                            />
                          ) : (
                            <FileText className="h-10 w-10 text-muted-foreground" />
                          )}
                        </div>
                        <p className="text-xs truncate" title={file.name}>
                          {file.name}
                        </p>
                        <button
                          onClick={() => handleRemoveFile(index)}
                          className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow"
                        >
                          <X className="h-3 w-3 text-muted-foreground" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => navigate("/customer")}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={uploading || files.length === 0}
            >
              {uploading ? "Uploading..." : "Submit Document"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
};

export default DocumentReupload;
