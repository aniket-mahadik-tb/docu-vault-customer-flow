import { DocumentFile, DocumentFolder, ModifiedDocumentRoot } from "@/contexts/DocumentContext"
import { BarChart2, ClipboardList, FileText, Folder, Home, MessageSquare, Share2, Shield, Upload, User, Users } from "lucide-react";
// import { SidebarLinkProps } from "@/components/AppSidebar";
import { UserContextType } from "@/contexts/UserContext"

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
    { to: "/admin/bank-user", icon: User, label: "Create New Bank-User" },
    { to: "/admin/admins", icon: Users, label: "Bank User List" },

];

export const BankLinks: SidebarLinkProps[] = [
    { to: "/bank/dashboard", icon: BarChart2, label: "Dashboard" },
    { to: "/bank/documents", icon: Folder, label: "Shared Documents" },
    { to: "/bank/notes", icon: MessageSquare, label: "View Notes" },
];





export const constants = { mockFile, mockDocumentFolder1, mockDocumentFolder2, mockDocumentFolder3, mockDocumentRoot, mockUsers ,CustomerLinks,AdminLinks,SuperAdminLinks,BankLinks};

