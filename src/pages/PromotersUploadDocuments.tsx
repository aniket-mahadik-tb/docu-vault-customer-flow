import React, { useEffect, useState } from "react";
import MainLayout from "@/layouts/MainLayout";
import { usePromoter } from "@/contexts/PromoterContext";
import { useDocumentUploadService, DocumentCategory, DocumentType } from "@/services/documentUploadService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Trash2, CheckCircle, FileText, AlertCircle, Plus, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DocumentFile {
  id: string;
  name: string;
  url?: string;
  type?: string;
}

const PromotersUploadDocuments = () => {
  const { selectedPromoter } = usePromoter();
  const documentUploadService = useDocumentUploadService();
  const [promoterCategories, setPromoterCategories] = useState<DocumentCategory[]>([]);
  const [uploadingDocuments, setUploadingDocuments] = useState<Record<string, boolean>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, DocumentFile[]>>({});

  useEffect(() => {
    const fetchDocumentMasters = async () => {
      try {
        const response = await documentUploadService.getDocumentMasters();
        const promoter = response.data.find(
          (item: any) => item.customerType?.toUpperCase() === "PROMOTER"
        );
        setPromoterCategories(promoter?.documentsByCategory || []);
      } catch (error) {
        console.error("Error fetching promoter document masters:", error);
      }
    };
    fetchDocumentMasters();
  }, []);

  const handleFileUpload = async (documentId: string, files: FileList) => {
    if (!selectedPromoter) return;
    try {
      setUploadingDocuments(prev => ({ ...prev, [documentId]: true }));
      // Simulate upload and add to local state
      const uploaded: DocumentFile[] = Array.from(files).map((file, idx) => ({
        id: `${documentId}_${Date.now()}_${idx}`,
        name: file.name,
        type: file.type,
      }));
      setUploadedFiles(prev => ({
        ...prev,
        [documentId]: [...(prev[documentId] || []), ...uploaded],
      }));
      toast({ title: "Files uploaded", description: `${files.length} file(s) uploaded successfully` });
    } catch (error) {
      toast({ title: "Upload failed", description: "There was an error uploading your files", variant: "destructive" });
    } finally {
      setUploadingDocuments(prev => ({ ...prev, [documentId]: false }));
    }
  };

  const handleRemoveFile = (documentId: string, fileId: string) => {
    setUploadedFiles(prev => ({
      ...prev,
      [documentId]: (prev[documentId] || []).filter(file => file.id !== fileId),
    }));
    toast({ title: "File removed", description: "Document has been removed" });
  };

  const getStatusBadge = (documentId: string) => {
    const hasFiles = uploadedFiles[documentId] && uploadedFiles[documentId].length > 0;
    if (!hasFiles) {
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
    return <Badge variant="default" className="bg-green-100 text-green-800">Uploaded</Badge>;
  };

  return (
    <MainLayout showSidebar={true}>
      <div className="py-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Upload Documents</h1>
        {selectedPromoter ? (
          <div className="bg-gray-50 border rounded p-6 mb-6">
            <h2 className="text-xl font-semibold mb-2">Promoter Details</h2>
            <div className="space-y-1">
              <div><strong>Full Name:</strong> {selectedPromoter.name}</div>
              <div><strong>Email:</strong> {selectedPromoter.email}</div>
              <div><strong>Phone Number:</strong> {selectedPromoter.phone}</div>
              <div><strong>PAN Number:</strong> {selectedPromoter.pan}</div>
            </div>
          </div>
        ) : (
          <div className="text-red-500">No promoter selected.</div>
        )}
        {/* Dynamic upload fields for promoter documents */}
        {promoterCategories.map((category, categoryIndex) => (
          <Card key={categoryIndex} className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">
                {category.category}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Document Type</TableHead>
                    <TableHead className="w-[15%]">Status</TableHead>
                    <TableHead className="w-[20%]">Uploaded Files</TableHead>
                    <TableHead className="w-[15%] text-center">Mandatory</TableHead>
                    <TableHead className="w-[10%]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {category.documents.map((document: DocumentType) => (
                    <TableRow key={document.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {document.documentType}
                          {document.isMultiple && (
                            <TooltipProvider>
                              <Tooltip delayDuration={0}>
                                <TooltipTrigger asChild>
                                  <span className="cursor-pointer">
                                    <Info className="h-4 w-4 text-blue-500" />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="top" align="center" className="max-w-xs whitespace-pre-line text-sm">
                                  Multiple files required (e.g., front and back sides)
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(document.id)}
                      </TableCell>
                      <TableCell>
                        {uploadedFiles[document.id] && uploadedFiles[document.id].length > 0 ? (
                          <div className="space-y-1">
                            {uploadedFiles[document.id].map((file, fileIndex) => (
                              <div key={file.id} className="flex items-center text-sm" style={{ textAlign: 'start' }}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveFile(document.id, file.id)}
                                  className="h-6 w-6 p-0 text-red-600 hover:text-red-800 mr-1"
                                  aria-label="Delete file"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                                <span className="truncate max-w-[120px]" title={file.name} style={{ marginRight: document.isMultiple ? '0.5rem' : 0 }}>
                                  {file.name}
                                </span>
                                {document.isMultiple && fileIndex === uploadedFiles[document.id].length - 1 && (
                                  <>
                                    <input
                                      type="file"
                                      id={`file-plus-${document.id}`}
                                      multiple
                                      onChange={(e) => e.target.files && handleFileUpload(document.id, e.target.files)}
                                      className="hidden"
                                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                    />
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800 ml-2 rounded-full border border-blue-200 bg-blue-50"
                                      aria-label="Add more files"
                                      onClick={() => window.document.getElementById(`file-plus-${document.id}`)?.click()}
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : document.isMultiple ? (
                          <span className="text-gray-400 text-sm">No files uploaded (multiple files required)</span>
                        ) : (
                          <span className="text-gray-400 text-sm">No files uploaded</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {document.isMandatory ? (
                          <Badge variant="destructive" className="bg-red-100 text-red-800">Required</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100 text-gray-800">Optional</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <input
                            type="file"
                            id={`file-${document.id}`}
                            multiple
                            onChange={(e) => e.target.files && handleFileUpload(document.id, e.target.files)}
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          />
                          <label htmlFor={`file-${document.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={uploadingDocuments[document.id]}
                              className="cursor-pointer min-w-[140px] flex items-center justify-center"
                              asChild
                            >
                              <span>
                                {uploadingDocuments[document.id] ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                                ) : (
                                  <Upload className="h-4 w-4" />
                                )}
                                <span className="ml-1 block truncate">
                                  Upload Document
                                </span>
                              </span>
                            </Button>
                          </label>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>
    </MainLayout>
  );
};

export default PromotersUploadDocuments; 