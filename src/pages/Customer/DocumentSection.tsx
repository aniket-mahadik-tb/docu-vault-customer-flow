import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { FileText, X, ChevronDown, ChevronUp, Upload, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Circle } from "lucide-react";
import { DocumentFile } from "@/contexts/DocumentContext";

interface DocumentType {
  id: string;
  name: string;
  description: string;
  required: boolean;
}

interface Section {
  id: string;
  title: string;
  description: string;
  documentTypes: DocumentType[];
}

interface DocumentSectionProps {
  section: Section;
  isOpen: boolean;
  onToggleSection: (sectionId: string) => void;
  isSubmitted: boolean;
  progressPercentage: number;
  subDocumentStates: {
    [key: string]: {
      open: boolean;
      submitting: boolean;
    };
  };
  onFileUpload: (sectionId: string, docId: string, files: FileList) => Promise<void>;
  onRemoveFile: (sectionId: string, docId: string, fileId: string) => void;
  getFolderDocuments: (userId: string, folderId: string) => DocumentFile[];
  isFolderSubmitted: (userId: string, folderId: string) => boolean;
  userId: string | null;
}

const DocumentSection: React.FC<DocumentSectionProps> = ({
  section,
  isOpen,
  onToggleSection,
  isSubmitted,
  progressPercentage,
  subDocumentStates,
  onFileUpload,
  onRemoveFile,
  getFolderDocuments,
  isFolderSubmitted,
  userId
}) => {
  return (
    <Card className={isSubmitted ? "border-green-200 bg-green-50" : ""}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          {!isOpen && (
            <div className="flex items-center gap-2">
              <CardTitle>{section.title}</CardTitle>
              {isSubmitted && (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
            </div>
          )}
          <Collapsible open={isOpen} onOpenChange={() => onToggleSection(section.id)}>
            <CollapsibleTrigger 
              className="rounded-full p-1 hover:bg-accent"
            >
              {isOpen ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <h3 className="text-lg font-medium mb-1">{section.title}</h3>
                {section.documentTypes.filter(doc => doc.required).length > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Upload progress</span>
                      <span>{progressPercentage}%</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {section.documentTypes.map(docType => {
                    const fullFolderId = `${section.id}_${docType.id}`;
                    const docFiles = userId ? getFolderDocuments(userId, fullFolderId) : [];
                    const isDocSubmitted = userId ? isFolderSubmitted(userId, fullFolderId) : false;
                    const docState = subDocumentStates[docType.id] || { open: false, submitting: false };
                    
                    return (
                      <Card key={docType.id} className={`border ${isDocSubmitted ? "border-green-200 bg-green-50" : ""}`}>
                        <CardHeader className="p-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-base">{docType.name}</CardTitle>
                              {docType.required && (
                                <Badge variant="destructive" className="text-xs">Required</Badge>
                              )}
                              {isDocSubmitted && (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                            </div>
                            <CardDescription className="text-xs mt-1">{docType.description}</CardDescription>
                            <div className="text-xs text-muted-foreground mt-2">
                              <span>Max size: 2MB • Accepted: Images, PDF</span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          {!isDocSubmitted && (
                            <label
                              htmlFor={`file-upload-${fullFolderId}`}
                              className="flex justify-center items-center border-2 border-dashed rounded-lg py-4 px-4 cursor-pointer hover:bg-accent/10"
                            >
                              <div className="text-center">
                                <Upload className="mx-auto h-6 w-6 text-muted-foreground mb-1" />
                                <p className="text-sm font-medium">Upload Document</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Click to upload or drag and drop
                                </p>
                              </div>
                              <input
                                id={`file-upload-${fullFolderId}`}
                                type="file"
                                multiple
                                accept=".pdf,.jpg,.jpeg,.png"
                                className="hidden"
                                disabled={docState.submitting}
                                onChange={(e) => e.target.files && onFileUpload(section.id, docType.id, e.target.files)}
                              />
                            </label>
                          )}
                          
                          {docFiles.length > 0 && (
                            <div className="mt-4">
                              <h4 className="text-sm font-medium mb-3">Uploaded Files</h4>
                              <div className="grid grid-cols-2 gap-2">
                                {docFiles.map((file) => (
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
                                        <FileText className="h-8 w-8 text-muted-foreground" />
                                      )}
                                    </div>
                                    <p className="text-xs truncate" title={file.name}>
                                      {file.name}
                                    </p>
                                    {!isDocSubmitted && (
                                      <button
                                        onClick={() => onRemoveFile(section.id, docType.id, file.id)}
                                        className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <X className="h-3 w-3 text-muted-foreground" />
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </div>
        {!isOpen && (
          <>
            <CardDescription>{section.description}</CardDescription>
            <div className="mt-2">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Upload progress</span>
                <span>{progressPercentage}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </>
        )}
      </CardHeader>
    </Card>
  );
};

export default DocumentSection; 