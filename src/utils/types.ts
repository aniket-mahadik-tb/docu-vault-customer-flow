

export interface CustomerType {
    pan: string;
    name: string;
    email: string;
    phone: string;
    clientType: "Individual" | "Organisation";
    createdAt?: string;
    documentStatus?: DocumentStatusType;
    documents: GetDocumentByPanCardResponseType;
}


export interface DocumentStatusType {
    total: number;
    pending: number;
    submitted: number;
    approved: number;
    rejected: number;
    processCompleted: number;

}


export interface GetDocumentByPanCardResponseType {
    customerType: String,
    documentsByCategory: DocumentsByCategoryType[]
}


export interface DocumentsByCategoryType {
    category: String,
    documents: DocumentResponseType[]
}

export interface DocumentResponseType {
    documentMasterId: String,
    documentType: String,
    isMandatory: boolean,
    isMultiple: boolean,
    files: FileResponseType[],
    status: String
    category?: String
    customerType?: string
}


export interface FileResponseType {
    docId: String,
    docName: String,
    docStatus: String
}