
import React, { useEffect } from "react";
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
  const { getFolderDocuments, isFolderSubmitted } = useDocuments();
  
  useEffect(() => {
    if (!userId) {
      navigate("/customer");
    }
  }, [userId, navigate]);

  if (!userId) {
    return null; // Will redirect in useEffect
  }

  const getStatusForSection = (sectionId: string) => {
    if (!userId) return { status: "Not Started", icon: <Clock className="h-5 w-5 text-gray-500" />, colorClass: "bg-gray-100 text-gray-700" };
    
    // Find the section to get its folderId
    const section = documentSections.find(s => s.id === sectionId);
    if (!section) return { status: "Not Started", icon: <Clock className="h-5 w-5 text-gray-500" />, colorClass: "bg-gray-100 text-gray-700" };
    
    // Check related folderIds in the document context
    // For the section1 we check multiple folders like section1_kyc1, section1_kyc2, etc.
    const sectionPrefix = section.folderId.split('_')[0];
    
    // Check if any documents in this section
    let hasDocuments = false;
    let isSubmitted = false;
    
    // Scan through all possible folders for this section
    for (let i = 1; i <= 5; i++) {
      for (let j = 1; j <= 5; j++) {
        const folderId = `${sectionPrefix}_${section.id}${j}`;
        const files = getFolderDocuments(userId, folderId);
        
        if (files.length > 0) {
          hasDocuments = true;
          if (isFolderSubmitted(userId, folderId)) {
            isSubmitted = true;
          }
        }
      }
      
      // Also check the standardized format used in DocumentUpload.tsx
      const uploadFolderId = `${sectionPrefix}_${sectionPrefix}${i}`;
      const files = getFolderDocuments(userId, uploadFolderId);
      if (files.length > 0) {
        hasDocuments = true;
        if (isFolderSubmitted(userId, uploadFolderId)) {
          isSubmitted = true;
        }
      }
    }
    
    if (hasDocuments) {
      if (isSubmitted) {
        return { 
          status: "Submitted", 
          icon: <CheckCircle className="h-5 w-5 text-green-500" />, 
          colorClass: "bg-green-100 text-green-700" 
        };
      } else {
        return { 
          status: "In Progress", 
          icon: <AlertCircle className="h-5 w-5 text-yellow-500" />, 
          colorClass: "bg-yellow-100 text-yellow-700" 
        };
      }
    }
    
    return { 
      status: "Not Started", 
      icon: <Clock className="h-5 w-5 text-gray-500" />, 
      colorClass: "bg-gray-100 text-gray-700" 
    };
  };

  return (
    <MainLayout showSidebar={true}>
      <div className="py-6">
        <h1 className="text-2xl font-bold mb-6">Document Status</h1>
        
        <div className="space-y-4">
          {documentSections.map(section => {
            const { status, icon, colorClass } = getStatusForSection(section.id);
            
            // Determine if there are any documents for this section
            let documentCount = 0;
            
            // Get documents in this section
            if (userId) {
              const sectionPrefix = section.folderId.split('_')[0];
              
              for (let i = 1; i <= 5; i++) {
                for (let j = 1; j <= 5; j++) {
                  const folderId = `${sectionPrefix}_${section.id}${j}`;
                  documentCount += getFolderDocuments(userId, folderId).length;
                }
                
                const uploadFolderId = `${sectionPrefix}_${sectionPrefix}${i}`;
                documentCount += getFolderDocuments(userId, uploadFolderId).length;
              }
            }
            
            const lastUpdatedDate = getLastUpdatedDate(userId, section);
            
            return (
              <Card key={section.id}>
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

// Helper function to get last updated date for a section
const getLastUpdatedDate = (userId: string | null, section: any) => {
  if (!userId) return null;
  
  const { getFolderDocuments } = useDocuments();
  const sectionPrefix = section.folderId.split('_')[0];
  let lastDate = null;
  let allDates: Date[] = [];
  
  // Check all possible folders for this section
  for (let i = 1; i <= 5; i++) {
    for (let j = 1; j <= 5; j++) {
      const folderId = `${sectionPrefix}_${section.id}${j}`;
      const files = getFolderDocuments(userId, folderId);
      
      if (files.length > 0) {
        files.forEach(file => {
          allDates.push(new Date(file.uploaded));
        });
      }
    }
    
    // Also check the standard format
    const uploadFolderId = `${sectionPrefix}_${sectionPrefix}${i}`;
    const files = getFolderDocuments(userId, uploadFolderId);
    
    if (files.length > 0) {
      files.forEach(file => {
        allDates.push(new Date(file.uploaded));
      });
    }
  }
  
  if (allDates.length > 0) {
    // Get the most recent date
    lastDate = new Date(Math.max(...allDates.map(d => d.getTime())));
    return lastDate.toLocaleDateString();
  }
  
  return null;
};

export default DocumentStatus;
