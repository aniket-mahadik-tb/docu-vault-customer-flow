
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import { useUser } from "@/contexts/UserContext";
import { useCustomers } from "@/contexts/CustomerContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye } from "lucide-react";

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
  const [previewDoc, setPreviewDoc] = useState<{id: string, name: string, url?: string} | null>(null);
  const [documentGroups, setDocumentGroups] = useState<DocumentGroup[]>([]);
  const [customerName, setCustomerName] = useState<string>("");
  
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
        
        sectionMap.get(sectionName)?.documents.push({
          id: doc.id,
          name: doc.name,
          type: doc.name.split('.').pop()?.toLowerCase() === 'pdf' ? 'application/pdf' : 'image/jpeg',
          thumbnail: "/placeholder.svg",
          fileUrl: doc.fileUrl
        });
      }
    });
    
    // Convert map to array
    setDocumentGroups(Array.from(sectionMap.values()));
    
  }, [userId, customers]);

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
                      <div className="aspect-square relative bg-muted flex items-center justify-center">
                        <img 
                          src={doc.thumbnail} 
                          alt={doc.name}
                          className="w-16 h-16 opacity-50" 
                        />
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="absolute bottom-2 right-2"
                          onClick={() => setPreviewDoc({...doc, url: doc.fileUrl})}
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

        {previewDoc && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg w-full max-w-3xl max-h-[90vh] overflow-auto flex flex-col">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-medium">{previewDoc.name}</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setPreviewDoc(null)}
                >
                  Close
                </Button>
              </div>
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="bg-muted p-8 rounded flex items-center justify-center">
                  <img 
                    src={previewDoc.url || "/placeholder.svg"} 
                    alt="Preview not available"
                    className="max-w-full max-h-[60vh]" 
                  />
                </div>
              </div>
              <div className="p-4 border-t">
                <p className="text-sm text-muted-foreground">Document preview only. Download is not permitted.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default BankDocuments;
