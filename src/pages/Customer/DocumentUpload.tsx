
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { useDocuments, DocumentFile } from "@/contexts/DocumentContext";
import MainLayout from "@/layouts/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { FileText, X, ChevronDown, ChevronUp, Upload, CheckCircle, Save } from "lucide-react";

const documentSections = [
  {
    id: "kyc",
    title: "KYC Documents",
    description: "Identity and address proof documents",
    acceptedTypes: ".pdf,.jpg,.jpeg,.png",
  },
  {
    id: "bank_statements",
    title: "Bank Statements",
    description: "Last 6 months bank statements",
    acceptedTypes: ".pdf,.jpg,.jpeg,.png",
  },
  {
    id: "financials",
    title: "Financial Documents",
    description: "Income tax returns, financial statements",
    acceptedTypes: ".pdf,.jpg,.jpeg,.png",
  },
  {
    id: "property",
    title: "Property Documents",
    description: "Property ownership and valuation documents",
    acceptedTypes: ".pdf,.jpg,.jpeg,.png",
  }
];

const DocumentUpload = () => {
  const navigate = useNavigate();
  const { userId } = useUser();
  const { addDocument, removeDocument, submitFolder, getFolderDocuments, isFolderSubmitted } = useDocuments();
  
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    if (!userId) {
      navigate("/customer");
    }
  }, [userId, navigate]);

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleFileUpload = async (sectionId: string, files: FileList) => {
    if (!userId) return;
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        await addDocument(userId, sectionId, file);
      }
      
      toast({
        title: "Files uploaded",
        description: `${files.length} file(s) added to ${sectionId}`,
      });
    } catch (error) {
      console.error("Error uploading files:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your files",
        variant: "destructive",
      });
    }
  };

  const handleRemoveFile = (sectionId: string, fileId: string) => {
    if (!userId) return;
    
    removeDocument(userId, sectionId, fileId);
    
    toast({
      title: "File removed",
      description: "Document has been removed",
    });
  };

  const handleSaveProgress = (sectionId: string) => {
    if (!userId) return;
    
    setSaving(prev => ({ ...prev, [sectionId]: true }));
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Progress saved",
        description: "Your upload progress has been saved",
      });
      setSaving(prev => ({ ...prev, [sectionId]: false }));
    }, 500);
  };

  const handleSubmitSection = (sectionId: string) => {
    if (!userId) return;
    
    setSubmitting(prev => ({ ...prev, [sectionId]: true }));
    
    // Simulate API call
    setTimeout(() => {
      submitFolder(userId, sectionId);
      
      toast({
        title: "Documents submitted",
        description: "Your documents have been successfully submitted",
      });
      
      setSubmitting(prev => ({ ...prev, [sectionId]: false }));
    }, 1000);
  };

  if (!userId) {
    return null; // Will redirect in useEffect
  }

  return (
    <MainLayout showSidebar={true}>
      <div className="py-6">
        <h1 className="text-2xl font-bold mb-6">Document Upload</h1>
        
        <div className="space-y-6">
          {documentSections.map(section => {
            const sectionFiles = userId ? getFolderDocuments(userId, section.id) : [];
            const isSubmitted = userId ? isFolderSubmitted(userId, section.id) : false;
            const isOpen = openSections[section.id] || false;
            
            return (
              <Card key={section.id} className={isSubmitted ? "border-green-200 bg-green-50" : ""}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <CardTitle>{section.title}</CardTitle>
                      {isSubmitted && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                    <CollapsibleTrigger 
                      onClick={() => toggleSection(section.id)}
                      className="rounded-full p-1 hover:bg-accent"
                    >
                      {isOpen ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </CollapsibleTrigger>
                  </div>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
                
                <Collapsible open={isOpen}>
                  <CollapsibleContent>
                    <CardContent>
                      {!isSubmitted && (
                        <div className="mb-4">
                          <label 
                            htmlFor={`file-upload-${section.id}`}
                            className="flex justify-center items-center border-2 border-dashed rounded-lg py-6 px-4 cursor-pointer hover:bg-accent/10"
                          >
                            <div className="text-center">
                              <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                              <p className="text-sm font-medium">Click to upload or drag and drop</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Allowed types: {section.acceptedTypes}
                              </p>
                            </div>
                            <input
                              id={`file-upload-${section.id}`}
                              type="file"
                              multiple
                              accept={section.acceptedTypes}
                              className="hidden"
                              onChange={(e) => e.target.files && handleFileUpload(section.id, e.target.files)}
                            />
                          </label>
                        </div>
                      )}
                      
                      {sectionFiles.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-3">Uploaded Files</h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {sectionFiles.map((file) => (
                              <div 
                                key={file.id} 
                                className="relative border rounded-md p-2 group"
                              >
                                <div className="aspect-square w-full flex items-center justify-center bg-gray-100 rounded mb-1">
                                  {file.type.includes('image') ? (
                                    <img 
                                      src={file.url} 
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
                                {!isSubmitted && (
                                  <button
                                    onClick={() => handleRemoveFile(section.id, file.id)}
                                    className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X className="h-4 w-4 text-muted-foreground" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                    
                    {!isSubmitted && sectionFiles.length > 0 && (
                      <CardFooter className="gap-2 flex-wrap">
                        <Button 
                          variant="outline" 
                          onClick={() => handleSaveProgress(section.id)}
                          disabled={saving[section.id]}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {saving[section.id] ? 'Saving...' : 'Save Progress'}
                        </Button>
                        <Button 
                          onClick={() => handleSubmitSection(section.id)}
                          disabled={submitting[section.id]}
                        >
                          {submitting[section.id] ? 'Submitting...' : 'Submit Documents'}
                        </Button>
                      </CardFooter>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
};

export default DocumentUpload;
