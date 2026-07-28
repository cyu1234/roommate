import puter from "@heyputer/puter.js";
import { STORAGE_PATHS } from "./constants";

export const signIn = async () => await puter.auth.signIn(); 

export const signOut = async () => puter.auth.signOut();

export const getCurrentUser = async () => {
    try {
        return await puter.auth.getUser();
    } catch {
        return null;
    }
};

export const createProject = async (base64Image: string) => {
    const mimeType = base64Image.match(/^data:(image\/(?:jpeg|png));base64,/)?.[1];

    if (!mimeType) {
        throw new Error("Unsupported project image format");
    }

    const imageBlob = await fetch(base64Image).then((response) => response.blob());
    const extension = mimeType === "image/png" ? "png" : "jpg";
    const projectFile = await puter.fs.write(
        `${STORAGE_PATHS.SOURCES}/${crypto.randomUUID()}.${extension}`,
        imageBlob,
        { createMissingParents: true },
    );

    return { id: projectFile.id };
};
