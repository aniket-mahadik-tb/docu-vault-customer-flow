import { AlertCircle, CheckCircle, FileText } from "lucide-react";

// Helper to check if a document is submitted
export const isDocumentSubmitted = (token: string, isFolderSubmitted: any, documentId: string) => {
  if (!token) return false;
  const folderId = `documents_${documentId}`;
  return isFolderSubmitted(token, folderId);
};

// Helper to get document status
export const getDocumentStatus = (token: string, isFolderSubmitted: any, uploadedFiles: any, documentId: string) => {
  const isSubmitted = isDocumentSubmitted(token, isFolderSubmitted, documentId);
  const hasFiles = uploadedFiles[documentId] && uploadedFiles[documentId].length > 0;
  if (!hasFiles) {
    return { status: 'pending', icon: AlertCircle, iconClass: "h-4 w-4 text-yellow-600", label: 'Pending' };
  }
  if (isSubmitted) {
    return { status: 'submitted', icon: CheckCircle, iconClass: "h-4 w-4 text-green-600", label: 'Submitted' };
  } else if (hasFiles) {
    return { status: 'uploaded', icon: FileText, iconClass: "h-4 w-4 text-blue-600", label: 'Uploaded' };
  } else {
    return { status: 'pending', icon: AlertCircle, iconClass: "h-4 w-4 text-yellow-600", label: 'Pending' };
  }
};

// Helper to get status badge info (no JSX)
export const getStatusBadgeInfo = (status: string) => {
  switch (status) {
    case 'submitted':
      return { variant: "default", className: "bg-green-100 text-green-800", label: "Submitted" };
    case 'uploaded':
      return { variant: "secondary", className: "bg-blue-100 text-blue-800", label: "Uploaded" };
    case 'pending':
      return { variant: "outline", className: "bg-yellow-100 text-yellow-800", label: "Pending" };
    default:
      return { variant: "outline", className: "", label: "Pending" };
  }
};
// Usage: In your React component, use <Badge variant={info.variant} className={info.className}>{info.label}</Badge>

// Helper to get files for a document from API response
export const getApiFilesForDocument = (
  apiDocumentMasters: any[],
  customerType: string,
  documentMasterId: string,
  category: string,
  year?: number | string,
  promoterIndex?: number,
  section?: any
) => {
  if (!Array.isArray(apiDocumentMasters)) return [];
  
  // If this is a temporary section (has _instanceId), return empty files
  // until files are actually uploaded to it
  if (section && section._instanceId) {
    return [];
  }
  
  let customerTypeObj;
  if (promoterIndex !== undefined) {
    // Handle promoter types - normalize by removing spaces and converting to lowercase
    customerTypeObj = apiDocumentMasters.find((d) => {
      if (!d.customerType) return false;
      const normalizedApiType = d.customerType.replace(/\s+/g, '').toLowerCase();
      const normalizedExpectedType = `promoter${promoterIndex + 1}`.toLowerCase();
      return normalizedApiType === normalizedExpectedType;
    });
  } else {
    // Handle main customer types (Organization/Individual)
    customerTypeObj = apiDocumentMasters.find((d) =>
      d.customerType?.toUpperCase() === customerType?.toUpperCase()
    );
  }
  
  if (!customerTypeObj) {
    return [];
  }
  
  // Find the category object that matches both category name and section
  const categoryObj = customerTypeObj.documentsByCategory.find(
    (cat: any) => cat.category === category && (!section || cat.section === section.section)
  );
  
  if (!categoryObj) {
    return [];
  }
  
  let docObjs = categoryObj.documents.filter(
    (doc: any) => doc.documentMasterId === documentMasterId
  );
  
  if (year !== undefined && year !== null) {
    docObjs = docObjs.filter((doc: any) => String(doc.year) === String(year));
  }
  
  let files: any[] = [];
  docObjs.forEach((doc: any) => {
    if (doc.files && doc.files.length > 0) {
      files = files.concat(doc.files);
    }
  });
  
  return files;
}; 