import { DocumentFile, DocumentFolder, ModifiedDocumentRoot } from "@/contexts/DocumentContext"
import { BarChart2, ClipboardList, FileText, Folder, Home, MessageSquare, Share2, Shield, Upload, User, Users } from "lucide-react";
// import { SidebarLinkProps } from "@/components/AppSidebar";
import { UserContextType } from "@/contexts/UserContext"
import { Customer } from "@/contexts/CustomerContext";

interface SidebarLinkProps {
    to: string;
    icon: React.ComponentType<any>;
    label: string;
}

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
        role: "SuperAdmin",
    }
];


export const CustomerLinks: SidebarLinkProps[] = [
    { to: "/customer/dashboard", icon: Home, label: "Dashboard" },
    { to: "/customer/upload", icon: Upload, label: "Upload Documents" },
    { to: "/customer/status", icon: ClipboardList, label: "View Status" },
];

export const AdminLinks: SidebarLinkProps[] = [
    { to: "/admin/dashboard", icon: BarChart2, label: "Dashboard" },
    { to: "/admin/customers", icon: Users, label: "Customer List" },
    // { to: "/admin/review", icon: FileText, label: "Review Documents" },
    { to: "/admin/share", icon: Share2, label: "Share with Bank" },
    { to: "/admin/new-customer", icon: User, label: "New Customer" },
];

export const SuperAdminLinks: SidebarLinkProps[] = [
    { to: "/admin/dashboard", icon: BarChart2, label: "Dashboard" },
    { to: "/admin/new-customer", icon: User, label: "Create New Customer" },
    { to: "/admin/customers", icon: Users, label: "Customer List" },
    // { to: "/admin/review", icon: FileText, label: "Review Documents" },
    { to: "/admin/share", icon: Share2, label: "Share with Bank" },
    { to: "/admin/new-admin", icon: User, label: "Create New Admin" },
    { to: "/admin/admins", icon: Shield, label: "Admin List" },
    { to: "/admin/new-bank-user", icon: User, label: "Create New Bank User" },
    { to: "/admin/bank-users", icon: Users, label: "Bank User List" },

];

export const BankLinks: SidebarLinkProps[] = [
    { to: "/bank/dashboard", icon: BarChart2, label: "Dashboard" },
    { to: "/bank/documents", icon: Folder, label: "Shared Documents" },
    { to: "/bank/notes", icon: MessageSquare, label: "View Notes" },
];

export const initialCustomers: Customer[] = [
    {
        id: "CUST001",
        name: "Rajesh Kumar",
        email: "rajesh@example.com",
        phone: "9876543210",
        panCard: "ABCDE1234F",
        businessName: "Kumar Enterprises",
        documentsSubmitted: true,
        createdAt: new Date().toISOString(),
        documents: [
            {
                id: "DOC001",
                name: "PAN Card.pdf",
                sectionId: "section1",
                documentTypeId: "kyc1",
                status: "pending",
                uploadedAt: new Date().toISOString(),
                fileUrl: "/placeholder.svg",
            },
            {
                id: "DOC002",
                name: "Aadhaar Card.pdf",
                sectionId: "section1",
                documentTypeId: "kyc2",
                status: "pending",
                uploadedAt: new Date().toISOString(),
                fileUrl: "/placeholder.svg",
            },
            {
                id: "DOC001",
                name: "PAN Card.pdf",
                sectionId: "section1",
                documentTypeId: "kyc1",
                status: "pending",
                uploadedAt: new Date().toISOString(),
                fileUrl: "/placeholder.svg",
            },
            {
                id: "DOC003",
                name: "Bank Statement.pdf",
                sectionId: "section2",
                documentTypeId: "kyc2",
                status: "pending",
                uploadedAt: new Date().toISOString(),
                fileUrl: "/placeholder.svg",
            },
            {
                id: "DOC004",
                name: "Bank Noc.pdf",
                sectionId: "section2",
                documentTypeId: "kyc1",
                status: "pending",
                uploadedAt: new Date().toISOString(),
                fileUrl: "/placeholder.svg",
            },
            {
                id: "DOC005",
                name: "Tax Reciept.pdf",
                sectionId: "section1",
                documentTypeId: "kyc4",
                status: "pending",
                uploadedAt: new Date().toISOString(),
                fileUrl: "/placeholder.svg",
            },
            {
                id: "DOC006",
                name: "Loan Statement.pdf",
                sectionId: "section3",
                documentTypeId: "kyc1",
                status: "pending",
                uploadedAt: new Date().toISOString(),
                fileUrl: "/placeholder.svg",
            },
            {
                id: "DOC007",
                name: "7/12.pdf",
                sectionId: "section5",
                documentTypeId: "kyc2",
                status: "pending",
                uploadedAt: new Date().toISOString(),
                fileUrl: "/placeholder.svg",
            },
            {
                id: "DOC008",
                name: "8A.pdf",
                sectionId: "section5",
                documentTypeId: "kyc1",
                status: "pending",
                uploadedAt: new Date().toISOString(),
                fileUrl: "/placeholder.svg",
            },
            {
                id: "DOC009",
                name: "Loan Closure.pdf",
                sectionId: "section3",
                documentTypeId: "kyc2",
                status: "pending",
                uploadedAt: new Date().toISOString(),
                fileUrl: "/placeholder.svg",
            },
        ],
    },
    {
        id: "CUST002",
        name: "Priya Sharma",
        email: "priya@example.com",
        phone: "8765432109",
        panCard: "FGHIJ5678K",
        businessName: "Sharma Trading Co.",
        documentsSubmitted: true,
        createdAt: new Date().toISOString(),
        documents: [
            {
                id: "DOC003",
                name: "Income Tax Returns.pdf",
                sectionId: "section4",
                documentTypeId: "fin1",
                status: "pending",
                uploadedAt: new Date().toISOString(),
                fileUrl: "/placeholder.svg",
            },
        ],
    },
    {
        id: "CUST003",
        name: "Amit Patel",
        email: "amit@example.com",
        phone: "7654321098",
        panCard: "LMNOP9012Q",
        businessName: "Patel Industries",
        documentsSubmitted: false,
        createdAt: new Date().toISOString(),
        documents: [],
    },
];





export const constants = { mockFile, mockDocumentFolder1, mockDocumentFolder2, mockDocumentFolder3, mockDocumentRoot, mockUsers, CustomerLinks, AdminLinks, SuperAdminLinks, BankLinks };

