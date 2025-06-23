import { DocumentFile, DocumentFolder, ModifiedDocumentRoot } from "@/contexts/DocumentContext"
import { BarChart2, ClipboardList, FileText, Folder, Home, MessageSquare, Share2, Shield, Upload, User, Users } from "lucide-react";
// import { SidebarLinkProps } from "@/components/AppSidebar";
import { UserContextType } from "@/contexts/UserContext"
import { Customer } from "@/contexts/CustomerContext";
import { GetDocumentByPanCardResponseType } from "./types";

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

export const documentSections = [
  {
    id: 'section1',
    title: 'KYC Documents',
    description: 'Identity and address verification documents',
    documentTypes: [
      {
        id: 'kyc1',
        name: 'PAN Card',
        description: 'Permanent Account Number card issued by Income Tax Department',
        required: true,
      },
      {
        id: 'kyc2',
        name: 'Aadhaar Card',
        description: 'Unique Identification Authority of India (UIDAI) issued Aadhaar card',
        required: true,
      },
      {
        id: 'kyc3',
        name: 'Certificate of Incorporation',
        description: 'For registered businesses and companies',
        required: false,
      },
      {
        id: 'kyc4',
        name: 'GST Registration',
        description: 'Goods and Services Tax registration certificate',
        required: false,
      }
    ]
  },
  {
    id: 'section2',
    title: 'Bank Statements',
    description: 'Banking transaction documents',
    documentTypes: [
      {
        id: 'bank1',
        name: 'Current Account Statements',
        description: 'Last 6 months statements of primary business account',
        required: true,
      },
      {
        id: 'bank2',
        name: 'Savings Account Statements',
        description: 'Last 6 months statements of proprietor/director accounts',
        required: false,
      },
      {
        id: 'bank3',
        name: 'Bank Account Opening Letter',
        description: 'Document confirming account details and signatories',
        required: false,
      }
    ]
  },
  {
    id: 'section3',
    title: 'Loan Statements',
    description: 'Existing loan and credit documentation',
    documentTypes: [
      {
        id: 'loan1',
        name: 'Existing Loan Statements',
        description: 'Last 12 months statements of existing business loans',
        required: true,
      },
      {
        id: 'loan2',
        name: 'Credit Card Statements',
        description: 'Last 6 months statements of business credit cards',
        required: false,
      },
      {
        id: 'loan3',
        name: 'Loan Sanction Letters',
        description: 'Approval documents for existing loans',
        required: false,
      },
      {
        id: 'loan4',
        name: 'Repayment Track Record',
        description: 'Proof of timely repayment of previous loans',
        required: false,
      }
    ]
  },
  {
    id: 'section4',
    title: 'Financial Documents',
    description: 'Business financial records and statements',
    documentTypes: [
      {
        id: 'fin1',
        name: 'Income Tax Returns',
        description: 'Last 3 years ITR filings with computation sheet',
        required: true,
      },
      {
        id: 'fin2',
        name: 'Balance Sheet',
        description: 'Audited balance sheets for previous 3 financial years',
        required: false,
      },
      {
        id: 'fin3',
        name: 'Profit & Loss Statement',
        description: 'P&L statements for previous 3 financial years',
        required: false,
      },
      {
        id: 'fin4',
        name: 'Cash Flow Statement',
        description: 'Statement of cash flows for the business',
        required: false,
      },
      {
        id: 'fin5',
        name: 'Sales Tax Returns',
        description: 'GST/VAT returns for the last year',
        required: false,
      }
    ]
  },
  {
    id: 'section5',
    title: 'Property Documents',
    description: 'Business premises and collateral documentation',
    documentTypes: [
      {
        id: 'prop1',
        name: 'Property Ownership Deed',
        description: 'Legal document proving ownership of property offered as collateral',
        required: false,
      },
      {
        id: 'prop2',
        name: 'Rent Agreement',
        description: 'Rental agreement for business premises if not owned',
        required: false,
      },
      {
        id: 'prop3',
        name: 'Property Tax Receipts',
        description: 'Last 3 years property tax payment receipts',
        required: false,
      },
      {
        id: 'prop4',
        name: 'Property Valuation Report',
        description: 'Recent valuation of property by authorized valuer',
        required: false,
      },
      {
        id: 'prop5',
        name: 'Property Insurance',
        description: 'Insurance documents for the property offered as security',
        required: false,
      }
    ]
  },
  {
    id: 'section6',
    title: 'Business Documents',
    description: 'Business registration and operational documents',
    documentTypes: [
      {
        id: 'biz1',
        name: 'Business Plan',
        description: 'Detailed business plan including projections',
        required: false,
      },
      {
        id: 'biz2',
        name: 'Trade License',
        description: 'Valid trade license issued by local municipality',
        required: false,
      },
      {
        id: 'biz3',
        name: 'MSME Registration',
        description: 'Micro, Small, Medium Enterprise registration certificate',
        required: false,
      },
      {
        id: 'biz4',
        name: 'Partnership Deed',
        description: 'For partnership firms',
        required: false,
      }
    ]
  }
];



export const GetDocumentByPanCardResponse: GetDocumentByPanCardResponseType = {
  "customerType": "INDIVIDUAL",
  "documentsByCategory": [
    {
      "category": "All Documents",
      "documents": [
        {
          "id": "90a0f933-36f9-47a9-b800-c09d6eba7a4a",
          "documentType": "Latest 2 years Audited balance Sheet",
          "isMandatory": true,
          "isMultiple": true,
          "files": [
            "gst1.pdf"
          ]
        },
        {
          "id": "f1d8e02a-49cc-4092-8ec4-9f8522a0a750",
          "documentType": "Latest Electricity Bill and Live rent agreement",
          "isMandatory": false,
          "isMultiple": false,
          "files": [
            "address1.pdf"
          ]
        },
        {
          "id": "2138aa5a-d57c-40c1-8dbd-89ea97c36596",
          "documentType": "Aadhaar (both sides)",
          "isMandatory": true,
          "isMultiple": true,
          "files": [
            "aadhaar1.pdf"
          ]
        },
        {
          "id": "1f0b18ab-1cab-4865-be3b-dc7bd96b2eae",
          "documentType": "PAN",
          "isMandatory": true,
          "isMultiple": true,
          "files": [
            "pan1.pdf"
          ]
        }
      ]
    }
  ]
}


export const basePath = "http://localhost:8080/api/v1";
export const constants = { mockFile, mockDocumentFolder1, mockDocumentFolder2, mockDocumentFolder3, mockDocumentRoot, mockUsers, CustomerLinks, AdminLinks, SuperAdminLinks, BankLinks, documentSections };

