

export interface CustomerType {
    pan: string;
    name: string;
    email: string;
    phone: string;
    clientType: "Individual" | "Organisation";
    createdAt?: string;
    documentStatus?: DocumentStatusType;
    documents: CustomerDocument[];
}


export interface DocumentStatusType {
    total: number;
    pending: number;
    submitted: number;
    approved: number;
    rejected: number;
    processCompleted: number;

}


export interface CustomerDocument {
    id: string;
    name: string;
    sectionId: string;
    documentTypeId: string;
    status: "pending" | "approved" | "rejected" | "on_hold";
    remarks?: string;
    uploadedAt: string;
    reviewedAt?: string;
    fileUrl: string;
}