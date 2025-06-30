import { DocumentFile, DocumentFolder, DocumentRoot, ModifiedDocumentRoot } from "@/contexts/DocumentContext";
import { GenericApiResponse, useCustomerService } from "./customerService";
import { constants } from "@/utils/globalConstants";
import api from "@/instances/axios";


const { mockFile, mockDocumentFolder1, mockDocumentFolder2, mockDocumentFolder3, mockDocumentRoot } = constants;

const delay = (ms: number) => new Promise((Resolve) => setTimeout(Resolve, ms));

const customerService = useCustomerService();

export function useDocumentService() {
    const service: any = {};

    service.addDocuments = async (userId: string, folder: string, file: File) => {
        try {
            await delay(300);


            const { panCard: pan } = await customerService.getCustomerById(userId);
            if (!pan) throw new Error("User Not Found");

            const userRoot = mockDocumentRoot.find(d => d.userId === userId);
            if (!userRoot) throw new Error("User Not Found");

            if (!userRoot.folders[pan]) {
                userRoot.folders[pan] = [];
            }

            let targetFolder = userRoot.folders[pan].find(f => f.name === folder);

            const newFile: DocumentFile = {
                id: `DOC${Date.now()}`,
                name: file.name,
                lastModified: file.lastModified,
                url: file.webkitRelativePath || file.name,
                size: file.size,
                uploaded: new Date(),
                type: folder,
                isBlobUrl: false,
            };

            if (targetFolder) {
                targetFolder.files.push(newFile);
            } else {
                userRoot.folders[pan].push({
                    name: folder,
                    files: [newFile],
                    submitted: false,
                });
            }

            return newFile;

        } catch (err) {
            console.error("Failed to add document:", err);
            throw err;
        }
    };

    service.getDocumentByDocumentID = async (documentId: string) => {
        try {
            const res = await api.get<GenericApiResponse<any>>(`/documents/${documentId}`)
            return res.data
        } catch (e: any) {
            console.error(e)
            throw e;
        }
    }

    service.getFile = async (url: string) => {
        try {
            const res = await api.get(url, { responseType: "blob" })
            return res.data;
        } catch (e: any) {
            console.error(e)
            throw e;
        }
    }



    service.removeDocuments = async function (userId: string, folder: string, fileId: string): Promise<void> {

        try {
            const { panCard: pan } = await customerService.getCustomerById(userId);
            if (!pan) throw new Error("User Not Found");

            const userRoot = mockDocumentRoot.find(d => d.userId === userId);
            if (!userRoot) throw new Error("User Not Found");

            let targetFolder = userRoot.folders[pan].find(f => f.name === folder);
            if (!targetFolder) throw new Error("No such Folder found");

            const index = targetFolder.files.findIndex(file => file.id === fileId);
            if (index !== -1) {
                targetFolder.files.splice(index, 1);
            }

        }
        catch (err: any) {
            console.error("Failed to remove document");
            throw err;
        }

    }


    service.submitFolder = async (userId: string, folder: string) => {
        try {
            const { panCard: pan } = await customerService.getCustomerById(userId);
            if (!pan) throw new Error("User Not Found");

            const userRoot = mockDocumentRoot.find(d => d.userId === userId);
            if (!userRoot) throw new Error("User Not Found");

            userRoot.folders[pan].push({
                name: folder,
                files: [],
                submitted: false,
            })

        } catch (err: any) {
            console.error("Failed to add folder");
            throw err;
        }

    }

    service.getFolderDocuments = async (userId: string, folder: string): Promise<DocumentFile[]> => {
        try {
            const { panCard: pan } = await customerService.getCustomerById(userId);
            if (!pan) throw new Error("User Not Found");

            const userRoot = mockDocumentRoot.find(d => d.userId === userId);
            if (!userRoot) throw new Error("User Not Found");

            return userRoot.folders[pan].find(f => f.name = folder).files;

        } catch (err: any) {
            console.error("Failed to get folder");
            throw err;
        }

    }

    service.cheackIsFolderSubmitted = async (userId: string, folder: string): Promise<boolean> => {
        try {
            const { panCard: pan } = await customerService.getCustomerById(userId);
            if (!pan) throw new Error("User Not Found");

            const userRoot = mockDocumentRoot.find(d => d.userId === userId);
            if (!userRoot) throw new Error("User Not Found");

            return userRoot.folders[pan].find(f => f.name = folder).submitted;

        } catch (err: any) {
            console.error("Failed to get folder");
            throw err;
        }
    }

    service.clearUserDocuments = async (userId: string): Promise<void> => {
        try {
            const { panCard: pan } = await customerService.getCustomerById(userId);
            if (!pan) throw new Error("User Not Found");

            const userRoot = mockDocumentRoot.find(d => d.userId === userId);
            if (!userRoot) throw new Error("User Not Found");

            userRoot.folders[pan] = [];

        } catch (err: any) {
            console.error("Failed to get folder");
            throw err;
        }
    }

    service.clearFolderDocuments = async (userId: string, folder: string): Promise<void> => {
        try {
            const { panCard: pan } = await customerService.getCustomerById(userId);
            if (!pan) throw new Error("User Not Found");

            const userRoot = mockDocumentRoot.find(d => d.userId === userId);
            if (!userRoot) throw new Error("User Not Found");

            const targetFolder = userRoot.folders[pan]?.find(f => f.name === folder);
            if (!targetFolder) throw new Error("Folder not found");

            targetFolder.files = [];

        } catch (err: any) {
            console.error("Failed to clear folder documents", err);
            throw err;
        }
    };

    return service;
}