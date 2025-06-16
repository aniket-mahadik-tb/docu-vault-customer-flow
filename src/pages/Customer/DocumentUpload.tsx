import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { useCustomers } from "@/contexts/CustomerContext";
import { useDocuments, DocumentFile } from "@/contexts/DocumentContext";
import MainLayout from "@/layouts/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Circle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { documentSections } from "@/utils/globalConstants";
import DocumentSection from "./DocumentSection";
import OverallProgress from "./OverallProgress";

interface SubDocumentState {
  [key: string]: {
    open: boolean;
    submitting: boolean;
  }
}

const DocumentUpload = () => {
  const navigate = useNavigate();
  const { userId } = useUser();
  const { addDocument, removeDocument, submitFolder, getFolderDocuments, isFolderSubmitted } = useDocuments();
  const { syncCustomerDocuments } = useCustomers();
  
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [subDocumentStates, setSubDocumentStates] = useState<SubDocumentState>({});
  
  useEffect(() => {
    if (!userId) {
      navigate("/customer");
    }

    // Initialize states for sub-documents
    const initialSubDocumentStates: SubDocumentState = {};
    documentSections.forEach(section => {
      section.documentTypes.forEach(docType => {
        initialSubDocumentStates[docType.id] = {
          open: false,
          submitting: false
        };
      });
    });
    setSubDocumentStates(initialSubDocumentStates);
  }, [userId, navigate]);

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleFileUpload = async (sectionId: string, docId: string, files: FileList) => {
    if (!userId) return;
    
    try {
      setSubDocumentStates(prev => ({
        ...prev,
        [docId]: {
          ...prev[docId],
          submitting: true
        }
      }));
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fullFolderId = `${sectionId}_${docId}`;
        await addDocument(userId, fullFolderId, file);
      }
      
      // Auto-submit the document when files are uploaded
      const fullFolderId = `${sectionId}_${docId}`;
      submitFolder(userId, fullFolderId);
      
      toast({
        title: "Files uploaded",
        description: `${files.length} file(s) added and submitted successfully`,
      });
      
      setSubDocumentStates(prev => ({
        ...prev,
        [docId]: {
          ...prev[docId],
          submitting: false
        }
      }));
    } catch (error) {
      console.error("Error uploading files:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your files",
        variant: "destructive",
      });
      
      setSubDocumentStates(prev => ({
        ...prev,
        [docId]: {
          ...prev[docId],
          submitting: false
        }
      }));
    }
  };

  const handleRemoveFile = (sectionId: string, docId: string, fileId: string) => {
    if (!userId) return;
    
    const fullFolderId = `${sectionId}_${docId}`;
    removeDocument(userId, fullFolderId, fileId);
    
    toast({
      title: "File removed",
      description: "Document has been removed",
    });
  };

  const isSectionSubmitted = (sectionId: string): boolean => {
    if (!userId) return false;
    
    // Find all document types in this section
    const section = documentSections.find(s => s.id === sectionId);
    if (!section) return false;
    
    // Check if all required documents in the section are submitted
    const requiredDocs = section.documentTypes.filter(doc => doc.required);
    
    for (const doc of requiredDocs) {
      const fullFolderId = `${sectionId}_${doc.id}`;
      if (!isFolderSubmitted(userId, fullFolderId)) {
        return false;
      }
    }
    
    return requiredDocs.length > 0;
  };

  // Calculate progress percentage for a section
  const calculateSectionProgress = (sectionId: string): number => {
    if (!userId) return 0;
    
    // Find section
    const section = documentSections.find(s => s.id === sectionId);
    if (!section) return 0;
    
    // Count required documents and submitted required documents
    const requiredDocs = section.documentTypes.filter(doc => doc.required);
    if (requiredDocs.length === 0) return 100; // If no required docs, progress is 100%
    
    let submittedCount = 0;
    for (const doc of requiredDocs) {
      const fullFolderId = `${sectionId}_${doc.id}`;
      if (isFolderSubmitted(userId, fullFolderId)) {
        submittedCount++;
      }
    }
    
    // Calculate percentage
    return Math.round((submittedCount / requiredDocs.length) * 100);
  };

  // Get the count of required documents in a section
  const getRequiredDocCount = (sectionId: string): number => {
    const section = documentSections.find(s => s.id === sectionId);
    if (!section) return 0;
    return section.documentTypes.filter(doc => doc.required).length;
  };

  // Get the count of submitted required documents
  const getSubmittedRequiredDocCount = (sectionId: string): number => {
    if (!userId) return 0;
    const section = documentSections.find(s => s.id === sectionId);
    if (!section) return 0;
    
    const requiredDocs = section.documentTypes.filter(doc => doc.required);
    let submittedCount = 0;
    
    for (const doc of requiredDocs) {
      const fullFolderId = `${sectionId}_${doc.id}`;
      if (isFolderSubmitted(userId, fullFolderId)) {
        submittedCount++;
      }
    }
    
    return submittedCount;
  };

  // Calculate overall progress
  const calculateOverallProgress = (): number => {
    if (!userId) return 0;
    
    let totalRequiredDocs = 0;
    let totalSubmittedDocs = 0;
    
    documentSections.forEach(section => {
      const requiredDocs = section.documentTypes.filter(doc => doc.required);
      totalRequiredDocs += requiredDocs.length;
      
      requiredDocs.forEach(doc => {
        const fullFolderId = `${section.id}_${doc.id}`;
        if (isFolderSubmitted(userId, fullFolderId)) {
          totalSubmittedDocs++;
        }
      });
    });
    
    if (totalRequiredDocs === 0) return 100;
    return Math.round((totalSubmittedDocs / totalRequiredDocs) * 100);
  };

  // Check if at least one document is uploaded
  const hasAnyDocumentsUploaded = (): boolean => {
    if (!userId) return false;
    
    let hasDocuments = false;
    
    for (const section of documentSections) {
      for (const doc of section.documentTypes) {
        const fullFolderId = `${section.id}_${doc.id}`;
        const documents = getFolderDocuments(userId, fullFolderId);
        if (documents.length > 0) {
          hasDocuments = true;
          break;
        }
      }
      if (hasDocuments) break;
    }
    
    return hasDocuments;
  };

  // Check if all required documents are uploaded
  const areAllRequiredDocsSubmitted = (): boolean => {
    if (!userId) return false;
    
    for (const section of documentSections) {
      const requiredDocs = section.documentTypes.filter(doc => doc.required);
      for (const doc of requiredDocs) {
        const fullFolderId = `${section.id}_${doc.id}`;
        if (!isFolderSubmitted(userId, fullFolderId)) {
          return false;
        }
      }
    }
    
    return true;
  };

  // Handle submit all documents
  const handleSubmitAllDocuments = () => {
    if (!userId) return;
    
    // Submit all folders that have documents but aren't submitted yet
    for (const section of documentSections) {
      for (const doc of section.documentTypes) {
        const fullFolderId = `${section.id}_${doc.id}`;
        const documents = getFolderDocuments(userId, fullFolderId);
        // Only submit folders that have documents and aren't already submitted
        if (documents.length > 0 && !isFolderSubmitted(userId, fullFolderId)) {
          submitFolder(userId, fullFolderId);
        }
      }
    }
    
    // Sync documents with customer context
    syncCustomerDocuments(userId);
    
    toast({
      title: "Documents Submitted",
      description: "Your documents have been successfully submitted for review.",
    });
    
    // Navigate to document status page
    navigate("/customer/status");
  };

  // Prepare sections data for OverallProgress
  const getSectionsStatus = () => {
    return documentSections.map(section => ({
      id: section.id,
      title: section.title,
      submittedCount: getSubmittedRequiredDocCount(section.id),
      requiredCount: getRequiredDocCount(section.id)
    }));
  };

  if (!userId) {
    return null; // Will redirect in useEffect
  }

  return (
    <MainLayout>
      <div className="py-6">
        <h1 className="text-2xl font-bold mb-6">Document Upload</h1>
        
        <div className="space-y-6">
          {documentSections.map(section => (
            <DocumentSection
              key={section.id}
              section={section}
              isOpen={openSections[section.id] || false}
              onToggleSection={toggleSection}
              isSubmitted={isSectionSubmitted(section.id)}
              progressPercentage={calculateSectionProgress(section.id)}
              subDocumentStates={subDocumentStates}
              onFileUpload={handleFileUpload}
              onRemoveFile={handleRemoveFile}
              getFolderDocuments={getFolderDocuments}
              isFolderSubmitted={isFolderSubmitted}
              userId={userId}
            />
          ))}
        </div>
        
        {/* Overall Progress Section */}
        <div className="mt-10">
          <OverallProgress
            sections={getSectionsStatus()}
            hasAnyDocumentsUploaded={hasAnyDocumentsUploaded()}
            onSubmitAllDocuments={handleSubmitAllDocuments}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default DocumentUpload;
