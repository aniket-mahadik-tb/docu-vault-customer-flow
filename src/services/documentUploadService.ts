import api from "../instances/axios";

// Types for document upload API
export interface DocumentType {
  id: string;
  documentType: string;
  isMandatory: boolean;
}

export interface DocumentCategory {
  category: string;
  documents: DocumentType[];
}

export interface DocumentMastersResponse {
  customerType: "Individual" | "Organisation";
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

// Mock data for document masters
const mockDocumentMasters: DocumentMastersResponse = {
  customerType: "Individual",
  documentsByCategory: [
    {
      category: "ALL EXISTING LOAN BANK SANCTION LETTERS / REPAYMENT SCHEDULES",
      documents: [
        {
          id: "3aaf87c0-56a4-43c4-8eb6-3aaa0aa08f0f",
          documentType: "Repayment schedules & welcome letter amortisation of Unsecured, Personal Loan or Vehicle Loans",
          isMandatory: true
        }
      ]
    },
    {
      category: "ALL EXISTING FACILITIES LOAN DETAILS (ANNEXURE B)",
      documents: [
        {
          id: "39a97e16-71a7-4d40-825f-d7a42f9803f5",
          documentType: "ANNEXURE B",
          isMandatory: true
        }
      ]
    },
    {
      category: "FINANCIAL STATEMENT & ITR",
      documents: [
        {
          id: "627976bc-67d4-4768-befe-46fa6739468f",
          documentType: "Latest 2 years Audited balance Sheet",
          isMandatory: true
        },
        {
          id: "158bf8ed-ee11-49e0-b46d-691613184355",
          documentType: "Income Tax Returns & Computation of Income",
          isMandatory: true
        },
        {
          id: "82a34422-cd5a-4471-a438-203203c4cbed",
          documentType: "Balance sheet & Profit/Loss Statement",
          isMandatory: true
        },
        {
          id: "269fe14d-87c0-4662-baba-1cbe44755e31",
          documentType: "All schedules & Notes on Accounts",
          isMandatory: true
        },
        {
          id: "b13fd24c-9e01-43f2-8d7f-aa6b9e4c6789",
          documentType: "Form No 16 from Employer for 26 AS statement",
          isMandatory: true
        },
        {
          id: "9b6688f2-3d81-4d54-a730-597df75a9b69",
          documentType: "Net Worth Statement of directors/guarantors/partners/proprietors",
          isMandatory: true
        },
        {
          id: "d11c5040-ea0f-4852-9e08-fa34fd95de6a",
          documentType: "Net Worth Statement of directors/guarantors/partners/proprietors",
          isMandatory: true
        }
      ]
    },
    {
      category: "ALL LOAN ACCOUNT REPAYMENT STATEMENTS (HOME LOAN,BL, PL, CAR LOAN, LAP, OD, ALL)",
      documents: [
        {
          id: "b8dc8486-e5ef-440b-92d9-0e8fae1ebb4d",
          documentType: "Last 12 month saving account statement, Loan Statements since beginning",
          isMandatory: true
        }
      ]
    },
    {
      category: "KYC",
      documents: [
        {
          id: "7e0a84ac-8077-4080-babe-5924af10d17a",
          documentType: "Individual Profile / Bio‑data (Promoters)",
          isMandatory: true
        },
        {
          id: "b07d8f32-5825-4b07-8410-fa03a4ef29a0",
          documentType: "PAN",
          isMandatory: true
        },
        {
          id: "d14534e4-c2bb-47c7-a3e5-3590f62c8091",
          documentType: "Aadhaar (both sides)",
          isMandatory: true
        },
        {
          id: "f8b37233-4abd-4faa-b3fe-a0faeb7a0ea2",
          documentType: "Latest Electricity Bill copy/Address proof",
          isMandatory: true
        },
        {
          id: "a5c24a1d-5099-49e8-9e03-d79cf4d221f7",
          documentType: "Driving Licence/Rent agreement (if rented)",
          isMandatory: true
        }
      ]
    },
    {
      category: "BANK STATEMENTS (ALL SAVING ACCOUNTS LAST 12 MONTHS)",
      documents: [
        {
          id: "0eedcb1b-d34c-4a85-8ac9-d4e5e4e8876f",
          documentType: "Saving Account Statements for last 12 months, can be 12 no of files to be uploaded",
          isMandatory: true
        }
      ]
    }
  ]
};

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useDocumentUploadService() {
  const service: any = {};

  service.getDocumentMasters = async (customerType?: "Individual" | "Organisation"): Promise<ApiResponse<DocumentMastersResponse>> => {
    try {
      await delay(500); // Simulate network delay
      
      // In a real implementation, this would be an API call
      // const response = await api.get(`/api/v1/documents/masters?customerType=${customerType}`);
      // return response.data;
      
      // For now, return mock data
      return {
        status: 200,
        message: "Document masters retrieved successfully",
        data: mockDocumentMasters,
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error("Failed to fetch document masters:", error);
      throw error;
    }
  };

  service.uploadDocuments = async (request: DocumentUploadRequest): Promise<ApiResponse<DocumentUploadResponse>> => {
    try {
      await delay(1000); // Simulate upload delay
      
      console.log("=== DOCUMENT UPLOAD API CALL ===");
      console.log("Customer ID:", request.customerId);
      console.log("Documents to upload:", request.documents);
      console.log("Total documents:", request.documents.length);
      
      // Mock successful upload response
      const response: ApiResponse<DocumentUploadResponse> = {
        status: 200,
        message: "Documents uploaded successfully",
        data: {
          uploadedCount: request.documents.length,
          failedCount: 0,
          uploadedDocuments: request.documents,
          failedDocuments: []
        },
        timestamp: new Date().toISOString()
      };
      
      console.log("Upload Response:", response);
      console.log("=== END DOCUMENT UPLOAD API CALL ===");
      
      return response;
    } catch (error: any) {
      console.error("Failed to upload documents:", error);
      throw error;
    }
  };

  return service;
} 