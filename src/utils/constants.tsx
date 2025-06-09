import { DocumentFile, DocumentFolder, ModifiedDocumentRoot } from "@/contexts/DocumentContext"
import { UserContextType } from "@/contexts/UserContext"

const mockFile: DocumentFile[] = [
    {
        id: "DOC001",
        name: "PAN Card.pdf",
        type: "kyc1",
        size: 1.5 * 1024 * 1024,
        uploaded: new Date(),
        lastModified: 123456789,
        url: "/placeholder.svg",
        isBlobUrl: false
    },
    {
        id: "DOC002",
        name: "ADHAR Card.pdf",
        type: "kyc1",
        size: 1.5 * 1024 * 1024,
        uploaded: new Date(),
        lastModified: 123456789,
        url: "/placeholder.svg",
        isBlobUrl: false
    },
    {
        id: "DOC003",
        name: "BANK STATEMENT.pdf",
        type: "kyc1",
        size: 1.5 * 1024 * 1024,
        uploaded: new Date(),
        lastModified: 123456789,
        url: "/placeholder.svg",
        isBlobUrl: false
    },
]

const mockDocumentFolder1: DocumentFolder[] = [
    {
        name: "kyc1",
        files: mockFile,
        submitted: true,
    },
    {
        name: "bank documents",
        files: [],
        submitted: false,
    },
    {
        name: "Financial Documents",
        files: [],
        submitted: false,
    },
    {
        name: "Financial Documents",
        files: [],
        submitted: false,
    }
]

const mockDocumentFolder2: DocumentFolder[] = []
const mockDocumentFolder3: DocumentFolder[] = []


const mockDocumentRoot: ModifiedDocumentRoot[] = [
    {
        userId: "CUST001",
        folders: { "AAAAA1234A": mockDocumentFolder1 }
    },
    {
        userId: "CUST002",
        folders: { "ABCDE1234G": mockDocumentFolder2 }
    },
    {
        userId: "CUST003",
        folders: { "PQRST1234U": mockDocumentFolder3 }
    }
]

const mockUsers: Partial<UserContextType>[] = [
    {
        role: "Admin",
    }
]

export const constants = { mockFile, mockDocumentFolder1, mockDocumentFolder2, mockDocumentFolder3, mockDocumentRoot, mockUsers };

