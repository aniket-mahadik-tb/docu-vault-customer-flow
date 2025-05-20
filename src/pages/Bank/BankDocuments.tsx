
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import { useUser } from "@/contexts/UserContext";
import { useCustomers } from "@/contexts/CustomerContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, FileImage, FileText, File } from "lucide-react";

interface DocumentGroup {
  name: string;
  documents: Array<{
    id: string;
    name: string;
    type?: string;
    thumbnail: string;
    fileUrl: string;
  }>;
}

const BankDocuments = () => {
  const navigate = useNavigate();
  const { userId } = useUser();
  const { customers } = useCustomers();
  const [previewDoc, setPreviewDoc] = useState<{id: string, name: string, url: string, type: string} | null>(null);
  const [documentGroups, setDocumentGroups] = useState<DocumentGroup[]>([]);
  const [customerName, setCustomerName] = useState<string>("");
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!userId) {
      navigate("/bank");
    }
  }, [userId, navigate]);

  // Get shared documents based on the PAN (userId)
  useEffect(() => {
    if (!userId) return;
    
    // Find the customer with matching PAN
    const customer = customers.find(c => c.panCard === userId);
    
    if (!customer) return;
    
    setCustomerName(customer.name);
    
    // Get approved documents and organize them by section
    const sectionMap = new Map<string, DocumentGroup>();
    
    customer.documents.forEach(doc => {
      // Only include approved documents
      if (doc.status === "approved") {
        const sectionName = doc.sectionId === "section1" ? "KYC Documents" :
                            doc.sectionId === "section2" ? "Business Documents" :
                            doc.sectionId === "section3" ? "Address Documents" :
                            doc.sectionId === "section4" ? "Financial Documents" :
                            "Other Documents";
        
        if (!sectionMap.has(sectionName)) {
          sectionMap.set(sectionName, {
            name: sectionName,
            documents: []
          });
        }
        
        // Determine file type
        const fileExtension = doc.name.split('.').pop()?.toLowerCase() || '';
        const fileType = 
          fileExtension === 'pdf' ? 'application/pdf' : 
          ['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension) ? 'image' : 
          'other';
        
        sectionMap.get(sectionName)?.documents.push({
          id: doc.id,
          name: doc.name,
          type: fileType,
          thumbnail: doc.fileUrl,
          fileUrl: doc.fileUrl
        });
      }
    });
    
    // Convert map to array
    setDocumentGroups(Array.from(sectionMap.values()));
    
  }, [userId, customers]);

  const handlePreviewClick = (doc: {id: string, name: string, type?: string, fileUrl: string}) => {
    const fileExtension = doc.name.split('.').pop()?.toLowerCase() || '';
    const fileType = 
      fileExtension === 'pdf' ? 'application/pdf' : 
      ['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension) ? 'image' : 
      'other';
    
    // Check if fileUrl is a placeholder or actual file content
    let docUrl = doc.fileUrl;
    
    // If it's a placeholder, use a demo image instead
    if (docUrl === "/placeholder.svg" || !docUrl) {
      // Use placeholder based on file type
      if (fileType === 'image') {
        docUrl = "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=800&q=80";
      } else if (fileType === 'application/pdf') {
        // For PDFs, use a sample PDF that's publicly accessible
        docUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
      }
    }
    
    setPreviewDoc({
      id: doc.id,
      name: doc.name,
      url: docUrl,
      type: fileType
    });
    setOpenDialog(true);
  };

  // Helper to render document icon based on type
  const renderDocumentIcon = (docName: string) => {
    const fileExtension = docName.split('.').pop()?.toLowerCase() || '';
    
    if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
      return <FileImage className="h-12 w-12 text-blue-500" />;
    } else if (fileExtension === 'pdf') {
      return <FileText className="h-12 w-12 text-red-500" />;
    } else {
      return <File className="h-12 w-12 text-gray-500" />;
    }
  };

  if (!userId) {
    return null; // Will redirect in useEffect
  }

  return (
    <MainLayout showSidebar={true}>
      <div className="py-6">
        <h1 className="text-2xl font-bold mb-2">Shared Documents</h1>
        <p className="text-muted-foreground mb-6">
          Viewing documents shared for customer: <span className="font-medium">{customerName}</span> (PAN: {userId})
        </p>

        {documentGroups.length > 0 ? (
          <Tabs defaultValue={documentGroups[0]?.name} className="w-full">
            <TabsList className="mb-4">
              {documentGroups.map((group) => (
                <TabsTrigger key={group.name} value={group.name}>
                  {group.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {documentGroups.map((group) => (
              <TabsContent key={group.name} value={group.name} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.documents.map((doc) => (
                    <Card key={doc.id} className="overflow-hidden">
                      <div className="aspect-video relative bg-muted flex items-center justify-center">
                        {doc.type === 'image' ? (
                          <img 
                            src={doc.fileUrl === "/placeholder.svg" ? 
                              "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=800&q=80" : 
                              doc.fileUrl
                            } 
                            alt={doc.name}
                            className="w-full h-full object-contain opacity-80" 
                            onError={(e) => {
                              // Fallback to placeholder if image fails to load
                              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=800&q=80";
                            }}
                          />
                        ) : (
                          renderDocumentIcon(doc.name)
                        )}
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="absolute bottom-2 right-2"
                          onClick={() => handlePreviewClick(doc)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                      </div>
                      <CardContent className="p-3">
                        <p className="text-sm font-medium truncate">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">View only</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="bg-muted p-8 rounded-lg text-center">
            <h3 className="text-lg font-medium mb-2">No Documents Available</h3>
            <p className="text-muted-foreground">
              No approved documents have been shared for this customer yet.
            </p>
          </div>
        )}

        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>{previewDoc?.name}</DialogTitle>
              <DialogClose />
            </DialogHeader>
            <ScrollArea className="flex-1 p-6">
              {previewDoc && (
                <div className="flex items-center justify-center min-h-[50vh]">
                  {previewDoc.type === 'image' ? (
                    <img 
                      src={previewDoc.url}
                      alt={previewDoc.name}
                      className="max-w-full max-h-[70vh] object-contain" 
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=800&q=80";
                      }}
                    />
                  ) : previewDoc.type === 'application/pdf' ? (
                    <iframe 
                      src={previewDoc.url} 
                      title={previewDoc.name}
                      className="w-full h-[70vh] border-0" 
                      onError={() => {
                        console.error("Failed to load PDF preview");
                      }}
                    />
                  ) : (
                    <div className="text-center p-8 bg-muted rounded-lg">
                      <File className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                      <p>Preview not available for this file type</p>
                      <p className="text-sm text-muted-foreground mt-2">{previewDoc.name}</p>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
            <div className="p-4 border-t mt-4">
              <p className="text-sm text-muted-foreground">Document preview only. Download is not permitted.</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default BankDocuments;
