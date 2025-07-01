import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { useDocuments, DocumentFile } from "@/contexts/DocumentContext";
import MainLayout from "@/layouts/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, AlertCircle, FileText } from "lucide-react";
import { useDocumentUploadService, DocumentType, DocumentCategory } from "@/services/documentUploadService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import api from "@/instances/axios";

const DocumentStatus = () => {
  const navigate = useNavigate();
  const { userId } = useUser();
  const { getFolderDocuments, isFolderSubmitted } = useDocuments();
  const documentUploadService = useDocumentUploadService();

  const [documentsByCategory, setDocumentsByCategory] = useState<any[]>([]);
  const [customerType, setCustomerType] = useState<string>("");

  useEffect(() => {
    const fetchUploadedDocuments = async () => {
      try {
        const response = await documentUploadService.getUploadedDocuments();
        let customerType = "";
        let documentsByCategory = [];
        if (Array.isArray(response)) {
          if (response.length > 0) {
            customerType = response[0].customerType || "";
            documentsByCategory = response[0].documentsByCategory || [];
          }
        } else {
          customerType = response.customerType || "";
          documentsByCategory = response.documentsByCategory || [];
        }
        setCustomerType(customerType);
        setDocumentsByCategory(documentsByCategory);
      } catch (error) {
        console.error("Error fetching uploaded documents:", error);
      }
    };
    fetchUploadedDocuments();
  }, []);

  const isDocumentSubmitted = (documentId: string): boolean => {
    if (!userId) return false;
    const folderId = `documents_${documentId}`;
    return isFolderSubmitted(userId, folderId);
  };

  const getDocumentStatus = (documentId: string) => {
    const isSubmitted = isDocumentSubmitted(documentId);
    const hasFiles = documentsByCategory.some(cat => cat.documents && cat.documents.some(doc => doc.id === documentId));
    if (!hasFiles) {
      return {
        status: 'pending',
        icon: <Clock className="h-4 w-4 text-yellow-600" />,
        label: 'Pending'
      };
    }
    if (isSubmitted) {
      return {
        status: 'submitted',
        icon: <CheckCircle className="h-4 w-4 text-green-600" />,
        label: 'Submitted'
      };
    } else if (hasFiles) {
      return {
        status: 'uploaded',
        icon: <FileText className="h-4 w-4 text-blue-600" />,
        label: 'Uploaded'
      };
    } else {
      return {
        status: 'pending',
        icon: <AlertCircle className="h-4 w-4 text-yellow-600" />,
        label: 'Pending'
      };
    }
  };

  const getStatusBadge = (documentId: string) => {
    const status = getDocumentStatus(documentId);
    switch (status.status) {
      case 'submitted':
        return <Badge variant="default" className="bg-green-100 text-green-800">Submitted</Badge>;
      case 'uploaded':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Uploaded</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const getLastUploadedDate = (documentId: string): string | null => {
    const files = documentsByCategory.flatMap(cat => cat.documents).find(doc => doc.id === documentId)?.files;
    if (!files || files.length === 0) return null;
    const dates = files.map(file => new Date(file.uploaded));
    const lastDate = new Date(Math.max(...dates.map(d => d.getTime())));
    return lastDate.toLocaleDateString();
  };

  const getFileCount = (documentId: string): number => {
    const files = documentsByCategory.flatMap(cat => cat.documents).find(doc => doc.id === documentId)?.files;
    return files?.length || 0;
  };

  if (!customerType) {
    return (
      <MainLayout showSidebar={true}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading document status...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Flatten all documents for the table
  const allDocuments = documentsByCategory.flatMap((cat: any) =>
    (cat.documents || []).map((doc: any) => ({ ...doc, category: cat.category }))
  );

  return (
    <MainLayout showSidebar={true}>
      <div className="py-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Document Status</h1>
            <p className="text-gray-600 mt-1">
              Track the status of your uploaded documents
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Submitted Documents</CardTitle>
              <p className="text-sm text-muted-foreground">
                {allDocuments.length} documents available
              </p>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[35%] pl-6 text-left">Document Type</TableHead>
                      <TableHead className="w-[20%] px-4 text-center">Category</TableHead>
                      <TableHead className="w-[15%] px-4 text-center">Files Count</TableHead>
                      <TableHead className="w-[15%] px-4 text-center">Status</TableHead>
                      <TableHead className="w-[15%] px-4 text-center">File Name</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allDocuments.length > 0 ? (
                      allDocuments.map((doc: any) => {
                        if (doc.files && doc.files.length > 0) {
                          return doc.files.map((file: any, idx: number) => (
                            <TableRow key={doc.id + '-' + file.docId}>
                              {idx === 0 && (
                                <TableCell className="font-medium pl-6 text-left" rowSpan={doc.files.length}>
                                  {doc.documentType}
                                  {doc.year ? (
                                    <select disabled style={{ marginLeft: 8, padding: '2px 8px', borderRadius: 4, background: '#f3f4f6', color: '#6b7280', fontSize: 13, border: '1px solid #d1d5db', outline: 'none', cursor: 'not-allowed', minWidth: 60 }}>
                                      <option value={doc.year}>{doc.year}</option>
                                    </select>
                                  ) : null}
                                </TableCell>
                              )}
                              {idx === 0 && (
                                <TableCell className="px-4 text-center" rowSpan={doc.files.length}>{doc.category}</TableCell>
                              )}
                              {idx === 0 && (
                                <TableCell className="px-4 text-center" rowSpan={doc.files.length}>{doc.files.length}</TableCell>
                              )}
                              <TableCell className="px-4 text-center">
                                <Badge
                                  variant={file.docStatus === "APPROVED" ? "default" : file.docStatus === "SUBMITTED" ? "secondary" : "outline"}
                                  className={
                                    file.docStatus === "APPROVED"
                                      ? "bg-green-100 text-green-800"
                                      : file.docStatus === "SUBMITTED"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }
                                >
                                  {file.docStatus.charAt(0) + file.docStatus.slice(1).toLowerCase()}
                                </Badge>
                              </TableCell>
                              <TableCell className="px-4 text-center">{file.docName}</TableCell>
                            </TableRow>
                          ));
                        } else {
                          return (
                            <TableRow key={doc.id + '-nofile'}>
                              <TableCell className="font-medium pl-6 text-left">{doc.documentType}</TableCell>
                              <TableCell className="px-4 text-center">{doc.category}</TableCell>
                              <TableCell className="px-4 text-center">0</TableCell>
                              <TableCell className="px-4 text-center">
                                <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>
                              </TableCell>
                              <TableCell className="px-4 text-center text-gray-400">No files</TableCell>
                            </TableRow>
                          );
                        }
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4 px-4">
                          No documents found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
          <div className="mt-6 flex justify-end">
            <Button
              onClick={() => navigate("/customer/dashboard")}
              className="px-6"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DocumentStatus;
