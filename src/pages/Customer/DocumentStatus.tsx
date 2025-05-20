
import React from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { useDocuments } from "@/contexts/DocumentContext";
import MainLayout from "@/layouts/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

// Use the same document sections as in DocumentUpload.tsx to ensure consistency
const documentSections = [
  {
    id: "kyc",
    title: "KYC Documents",
    folderId: "section1_kyc1"  // Map to specific folder IDs used in upload
  },
  {
    id: "bank_statements",
    title: "Bank Statements",
    folderId: "section2_bank1"
  },
  {
    id: "financials",
    title: "Financial Documents",
    folderId: "section4_fin1"
  },
  {
    id: "property",
    title: "Property Documents",
    folderId: "section5_prop1"
  }
];

const DocumentStatus = () => {
  const navigate = useNavigate();
  const { userId } = useUser();
  const { getFolderDocuments, isFolderSubmitted, documents } = useDocuments();
  
  React.useEffect(() => {
    if (!userId) {
      navigate("/customer");
    }
  }, [userId, navigate]);

  if (!userId) {
    return null; // Will redirect in useEffect
  }

  const getStatusForSection = (sectionId: string) => {
    if (!userId) return { status: "Not Started", icon: <Clock className="h-5 w-5 text-gray-500" />, colorClass: "bg-gray-100 text-gray-700" };
    
    // Find the section's folder prefix
    let sectionPrefix = "";
    if (sectionId === "kyc") sectionPrefix = "section1";
    else if (sectionId === "bank_statements") sectionPrefix = "section2";
    else if (sectionId === "financials") sectionPrefix = "section4";
    else if (sectionId === "property") sectionPrefix = "section5";
    
    // Check if user has any documents in this section
    const userDocuments = documents[userId];
    if (!userDocuments || !userDocuments.folders) {
      return { status: "Not Started", icon: <Clock className="h-5 w-5 text-gray-500" />, colorClass: "bg-gray-100 text-gray-700" };
    }
    
    // Check if any folders in this section have submitted documents
    let hasSubmittedDocuments = false;
    let hasDocuments = false;
    
    Object.entries(userDocuments.folders).forEach(([folderId, folder]) => {
      if (folderId.startsWith(sectionPrefix) && folder.files.length > 0) {
        hasDocuments = true;
        if (folder.submitted) {
          hasSubmittedDocuments = true;
        }
      }
    });
    
    if (hasSubmittedDocuments) {
      return { 
        status: "Submitted", 
        icon: <CheckCircle className="h-5 w-5 text-green-500" />, 
        colorClass: "bg-green-100 text-green-700" 
      };
    } else if (hasDocuments) {
      return { 
        status: "In Progress", 
        icon: <AlertCircle className="h-5 w-5 text-yellow-500" />, 
        colorClass: "bg-yellow-100 text-yellow-700" 
      };
    }
    
    return { 
      status: "Not Started", 
      icon: <Clock className="h-5 w-5 text-gray-500" />, 
      colorClass: "bg-gray-100 text-gray-700" 
    };
  };

  // Helper function to get last updated date for a section
  const getLastUpdatedDate = (sectionId: string): string | null => {
    if (!userId) return null;
    
    let sectionPrefix = "";
    if (sectionId === "kyc") sectionPrefix = "section1";
    else if (sectionId === "bank_statements") sectionPrefix = "section2";
    else if (sectionId === "financials") sectionPrefix = "section4";
    else if (sectionId === "property") sectionPrefix = "section5";
    
    const userDocuments = documents[userId];
    if (!userDocuments || !userDocuments.folders) return null;
    
    const allDates: Date[] = [];
    
    Object.entries(userDocuments.folders).forEach(([folderId, folder]) => {
      if (folderId.startsWith(sectionPrefix) && folder.files.length > 0) {
        folder.files.forEach(file => {
          allDates.push(new Date(file.uploaded));
        });
      }
    });
    
    if (allDates.length > 0) {
      // Get the most recent date
      const lastDate = new Date(Math.max(...allDates.map(d => d.getTime())));
      return lastDate.toLocaleDateString();
    }
    
    return null;
  };

  // Count documents in section
  const countDocumentsInSection = (sectionId: string): number => {
    if (!userId) return 0;
    
    let sectionPrefix = "";
    if (sectionId === "kyc") sectionPrefix = "section1";
    else if (sectionId === "bank_statements") sectionPrefix = "section2";
    else if (sectionId === "financials") sectionPrefix = "section4";
    else if (sectionId === "property") sectionPrefix = "section5";
    
    const userDocuments = documents[userId];
    if (!userDocuments || !userDocuments.folders) return 0;
    
    let count = 0;
    
    Object.entries(userDocuments.folders).forEach(([folderId, folder]) => {
      if (folderId.startsWith(sectionPrefix)) {
        count += folder.files.length;
      }
    });
    
    return count;
  };

  return (
    <MainLayout showSidebar={true}>
      <div className="py-6">
        <h1 className="text-2xl font-bold mb-6">Document Status</h1>
        
        <div className="space-y-4">
          {documentSections.map(section => {
            const { status, icon, colorClass } = getStatusForSection(section.id);
            const documentCount = countDocumentsInSection(section.id);
            const lastUpdatedDate = getLastUpdatedDate(section.id);
            
            return (
              <Card key={section.id} className={status === "Submitted" ? "border-green-200" : ""}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle>{section.title}</CardTitle>
                    <CardDescription>
                      {documentCount} document{documentCount !== 1 ? 's' : ''}
                    </CardDescription>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${colorClass}`}>
                    {icon}
                    <span>{status}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  {documentCount > 0 && lastUpdatedDate ? (
                    <div className="text-sm">
                      <p className="font-medium">Last updated: {" "}
                        <span className="font-normal">{lastUpdatedDate}</span>
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No documents uploaded yet</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
};

export default DocumentStatus;
