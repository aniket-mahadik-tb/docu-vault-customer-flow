
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface DocumentFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  lastModified: number;
  uploaded: Date;
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

interface DocumentContextType {
  documents: Record<string, DocumentRoot>;
  addDocument: (userId: string, folder: string, file: File) => Promise<DocumentFile>;
  removeDocument: (userId: string, folder: string, fileId: string) => void;
  submitFolder: (userId: string, folder: string) => void;
  getFolderDocuments: (userId: string, folder: string) => DocumentFile[];
  isFolderSubmitted: (userId: string, folder: string) => boolean;
  clearUserDocuments: (userId: string) => void;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

const STORAGE_KEY = "document_storage";

export const DocumentProvider = ({ children }: { children: ReactNode }) => {
  const [documents, setDocuments] = useState<Record<string, DocumentRoot>>({});

  // Load documents from localStorage on mount
  useEffect(() => {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      try {
        setDocuments(JSON.parse(storedData));
      } catch (error) {
        console.error("Failed to parse stored documents:", error);
      }
    }
  }, []);

  // Save documents to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
  }, [documents]);

  const addDocument = async (userId: string, folder: string, file: File): Promise<DocumentFile> => {
    return new Promise((resolve) => {
      const fileReader = new FileReader();
      
      fileReader.onload = (e) => {
        const fileId = `${Date.now()}-${file.name}`;
        const newFile: DocumentFile = {
          id: fileId,
          name: file.name,
          type: file.type,
          size: file.size,
          url: e.target?.result as string,
          lastModified: file.lastModified,
          uploaded: new Date(),
        };
        
        setDocuments(prev => {
          const updatedDocs = { ...prev };
          
          // Create user root folder if it doesn't exist
          if (!updatedDocs[userId]) {
            updatedDocs[userId] = { userId, folders: {} };
          }
          
          // Create document folder if it doesn't exist
          if (!updatedDocs[userId].folders[folder]) {
            updatedDocs[userId].folders[folder] = { 
              name: folder, 
              files: [], 
              submitted: false 
            };
          }
          
          // Add file to folder
          updatedDocs[userId].folders[folder].files.push(newFile);
          
          return updatedDocs;
        });
        
        resolve(newFile);
      };
      
      fileReader.readAsDataURL(file);
    });
  };

  const removeDocument = (userId: string, folder: string, fileId: string) => {
    setDocuments(prev => {
      const updatedDocs = { ...prev };
      
      if (updatedDocs[userId] && updatedDocs[userId].folders[folder]) {
        updatedDocs[userId].folders[folder].files = 
          updatedDocs[userId].folders[folder].files.filter(file => file.id !== fileId);
      }
      
      return updatedDocs;
    });
  };

  const submitFolder = (userId: string, folder: string) => {
    setDocuments(prev => {
      const updatedDocs = { ...prev };
      
      if (updatedDocs[userId] && updatedDocs[userId].folders[folder]) {
        updatedDocs[userId].folders[folder].submitted = true;
      }
      
      return updatedDocs;
    });
  };

  const getFolderDocuments = (userId: string, folder: string): DocumentFile[] => {
    if (documents[userId] && documents[userId].folders[folder]) {
      return documents[userId].folders[folder].files;
    }
    return [];
  };

  const isFolderSubmitted = (userId: string, folder: string): boolean => {
    if (documents[userId] && documents[userId].folders[folder]) {
      return documents[userId].folders[folder].submitted;
    }
    return false;
  };

  const clearUserDocuments = (userId: string) => {
    setDocuments(prev => {
      const updatedDocs = { ...prev };
      delete updatedDocs[userId];
      return updatedDocs;
    });
  };

  return (
    <DocumentContext.Provider 
      value={{ 
        documents, 
        addDocument, 
        removeDocument, 
        submitFolder, 
        getFolderDocuments, 
        isFolderSubmitted, 
        clearUserDocuments 
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocuments = () => {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error("useDocuments must be used within a DocumentProvider");
  }
  return context;
};
