

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
    id: String,
    documentType: String,
    isMandatory: boolean,
    isMultiple: boolean,
    files: FileResponseType[],
}


export type FileResponseType = string;