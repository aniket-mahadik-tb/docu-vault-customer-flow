import api from "../instances/axios";

// Types for document upload API
export interface DocumentType {
  isMultiple: boolean;
  id: string;
  documentType: string;
  isMandatory: boolean;
}

export interface DocumentCategory {
  category: string;
  documents: DocumentType[];
}

export interface DocumentMastersResponse {
  customerType: "Individual" | "Organization";
  documentsByCategory: DocumentCategory[];
}

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
  timestamp: string;
}

export interface UploadedDocument {
  documentId: string;
  documentType: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
}

export interface DocumentUploadRequest {
  customerId: string;
  documents: UploadedDocument[];
}

export interface DocumentUploadResponse {
  uploadedCount: number;
  failedCount: number;
  uploadedDocuments: UploadedDocument[];
  failedDocuments: string[];
}

export function useDocumentUploadService() {
  const service: any = {};

  service.getDocumentMasters = async (customerType: "Individual" | "Organization" = "Individual"): Promise<ApiResponse<DocumentMastersResponse>> => {
    try {
      // Real API call
      const response = await api.get(`document/master/customer-type/${customerType}`);
      return response.data;
    } catch (error: any) {
      console.error("Failed to fetch document masters:", error);
      throw error;
    }
  };

  service.uploadDocuments = async (request: DocumentUploadRequest): Promise<ApiResponse<DocumentUploadResponse>> => {
    // Keep this as mock for now unless you have a real endpoint
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      status: 200,
      message: "Mock upload successful",
      data: {
        uploadedCount: request.documents.length,
        failedCount: 0,
        uploadedDocuments: request.documents,
        failedDocuments: []
      },
      timestamp: new Date().toISOString()
    };
  };

  return service;
} 