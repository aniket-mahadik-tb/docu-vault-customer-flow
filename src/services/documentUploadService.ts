import api from "../instances/axios";

// Types for document upload API
export interface DocumentType {
  isMultipleFiles: boolean;
  id: string;
  documentType: string;
  isMandatory: boolean;
  isMultipleYears?: boolean;
  documentMasterId:string
}

export interface DocumentCategory {
  category: string;
  documents: DocumentType[];
  isMultipleSection?: boolean;
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
        const response = await api.get(`document/master/customer-type`);
        return response.data;
      
    } catch (error: any) {
      console.error("Failed to fetch document masters:", error);
      throw error;
    }
  };

  service.uploadDocuments = async (formData: FormData): Promise<ApiResponse<DocumentUploadResponse>> => {
   
    try {
      const response = await api.post("/documents", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        }
      });
      return response.data;
    } catch (error: any) {
      console.error("Failed to upload documents:", error);
      throw error;
    }
  };

  

  service.getUploadedDocuments = async (): Promise<any> => {
    try {
      const response = await api.get("documents/client");
      return response.data;
    } catch (error: any) {
      console.error("Failed to fetch uploaded documents:", error);
      throw error;
    }
  };

  service.getPromoterDocumentMasters = async (): Promise<ApiResponse<DocumentMastersResponse>> => {
    try {
      const response = await api.get(`document/master/promoter`);
      return response.data;
    } catch (error: any) {
      console.error("Failed to fetch promoter document masters:", error);
      throw error;
    }
  };

  // Fetches a document preview by docId
  service.getDocumentPreview = async (docId: string): Promise<any> => {
    try {
      const response = await api.get(`/documents/preview/${docId}`, {
        responseType: 'blob', // or 'arraybuffer' if needed
      });
      return response.data;
    } catch (error: any) {
      console.error("Failed to fetch document preview:", error);
      throw error;
    }
  };

  // Fetches document details (metadata and preview URL) by docId
  service.getDocumentDetails = async (docId: string): Promise<any> => {
    try {
      const response = await api.get(`/documents/${docId}`);
      return response.data;
    } catch (error: any) {
      console.error("Failed to fetch document details:", error);
      throw error;
    }
  };

  return service;
} 
