
export interface DocumentFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  lastModified: number;
  uploaded: Date;
  // Track if URL is a Blob URL that needs to be revoked
  isBlobUrl?: boolean;
}

export interface DocumentFolder {
  name: string;
  files: DocumentFile[];
  submitted: boolean;
}

export interface DocumentRoot {
  userId: string;
  folders: Record<string, DocumentFolder>;
}

export interface DocumentContextType {
  documents: Record<string, DocumentRoot>;
  addDocument: (userId: string, folder: string, file: File) => Promise<DocumentFile>;
  removeDocument: (userId: string, folder: string, fileId: string) => void;
  submitFolder: (userId: string, folder: string) => void;
  getFolderDocuments: (userId: string, folder: string) => DocumentFile[];
  isFolderSubmitted: (userId: string, folder: string) => boolean;
  clearUserDocuments: (userId: string) => void;
  clearFolderDocuments: (userId: string, folder: string) => void;
}
