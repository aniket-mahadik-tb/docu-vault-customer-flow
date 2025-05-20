
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { useDocuments } from "@/contexts/DocumentContext";
import MainLayout from "@/layouts/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

const documentSections = [
  {
    id: "kyc",
    title: "KYC Documents",
  },
  {
    id: "bank_statements",
    title: "Bank Statements",
  },
  {
    id: "financials",
    title: "Financial Documents",
  },
  {
    id: "property",
    title: "Property Documents",
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

  return (
    <MainLayout showSidebar={true}>
      <div className="py-6">
        <h1 className="text-2xl font-bold mb-6">Document Status</h1>
        
        <div className="space-y-4">
          {documentSections.map(section => {
            const sectionFiles = getFolderDocuments(userId, section.id);
            const isSubmitted = isFolderSubmitted(userId, section.id);
            
            let status = "Not Started";
            let statusIcon = <Clock className="h-5 w-5 text-gray-500" />;
            let statusColor = "bg-gray-100 text-gray-700";
            
            if (sectionFiles.length > 0) {
              if (isSubmitted) {
                status = "Submitted";
                statusIcon = <CheckCircle className="h-5 w-5 text-green-500" />;
                statusColor = "bg-green-100 text-green-700";
              } else {
                status = "In Progress";
                statusIcon = <AlertCircle className="h-5 w-5 text-yellow-500" />;
                statusColor = "bg-yellow-100 text-yellow-700";
              }
            }
            
            return (
              <Card key={section.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle>{section.title}</CardTitle>
                    <CardDescription>
                      {sectionFiles.length} document{sectionFiles.length !== 1 ? 's' : ''}
                    </CardDescription>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${statusColor}`}>
                    {statusIcon}
                    <span>{status}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  {sectionFiles.length > 0 ? (
                    <div className="text-sm">
                      <p className="font-medium">Last updated: {" "}
                        <span className="font-normal">
                          {new Date(Math.max(...sectionFiles.map(f => f.uploaded.getTime()))).toLocaleDateString()}
                        </span>
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
