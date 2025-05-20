
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye } from "lucide-react";

// Mock shared document data
const SHARED_DOCUMENTS = {
  "ABCDE1234F": {
    customerName: "John Doe",
    folders: [
      {
        name: "KYC Documents",
        documents: [
          { id: "1", name: "ID Proof.pdf", type: "application/pdf", thumbnail: "/placeholder.svg" },
          { id: "2", name: "Address Proof.jpg", type: "image/jpeg", thumbnail: "/placeholder.svg" }
        ]
      },
      {
        name: "Income Documents",
        documents: [
          { id: "3", name: "Salary Slip.pdf", type: "application/pdf", thumbnail: "/placeholder.svg" },
          { id: "4", name: "Tax Return.pdf", type: "application/pdf", thumbnail: "/placeholder.svg" }
        ]
      }
    ]
  },
  "PQRST5678G": {
    customerName: "Alice Smith",
    folders: [
      {
        name: "KYC Documents",
        documents: [
          { id: "5", name: "Passport.pdf", type: "application/pdf", thumbnail: "/placeholder.svg" },
          { id: "6", name: "Utility Bill.jpg", type: "image/jpeg", thumbnail: "/placeholder.svg" }
        ]
      }
    ]
  },
  "XYZAB9012C": {
    customerName: "Bob Johnson",
    folders: [
      {
        name: "KYC Documents",
        documents: [
          { id: "7", name: "Aadhar Card.pdf", type: "application/pdf", thumbnail: "/placeholder.svg" }
        ]
      },
      {
        name: "Financial Documents",
        documents: [
          { id: "8", name: "Bank Statement.pdf", type: "application/pdf", thumbnail: "/placeholder.svg" },
          { id: "9", name: "Investment Proof.pdf", type: "application/pdf", thumbnail: "/placeholder.svg" }
        ]
      },
      {
        name: "Property Documents",
        documents: [
          { id: "10", name: "Property Deed.pdf", type: "application/pdf", thumbnail: "/placeholder.svg" }
        ]
      }
    ]
  }
};

const BankDocuments = () => {
  const navigate = useNavigate();
  const { userId } = useUser();
  const [previewDoc, setPreviewDoc] = useState<{id: string, name: string} | null>(null);
  
  // Redirect if not authenticated
  React.useEffect(() => {
    if (!userId) {
      navigate("/bank");
    }
  }, [userId, navigate]);

  if (!userId || !SHARED_DOCUMENTS[userId as keyof typeof SHARED_DOCUMENTS]) {
    return null; // Will redirect in useEffect
  }

  const customerData = SHARED_DOCUMENTS[userId as keyof typeof SHARED_DOCUMENTS];

  return (
    <MainLayout showSidebar={true}>
      <div className="py-6">
        <h1 className="text-2xl font-bold mb-2">Shared Documents</h1>
        <p className="text-muted-foreground mb-6">
          Viewing documents shared for customer: <span className="font-medium">{customerData.customerName}</span> (PAN: {userId})
        </p>

        <Tabs defaultValue={customerData.folders[0].name} className="w-full">
          <TabsList className="mb-4">
            {customerData.folders.map((folder) => (
              <TabsTrigger key={folder.name} value={folder.name}>
                {folder.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {customerData.folders.map((folder) => (
            <TabsContent key={folder.name} value={folder.name} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {folder.documents.map((doc) => (
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
                        onClick={() => setPreviewDoc(doc)}
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
                    src="/placeholder.svg" 
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
