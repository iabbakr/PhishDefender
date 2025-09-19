
'use server';

import { db } from "@/lib/firebase";
import { doc, deleteDoc, collection, writeBatch, getDocs } from "firebase/firestore";

export async function deleteArticleAction(id: string): Promise<{ error?: string }> {
    try {
        if (!id) throw new Error("Article ID is required.");
        
        const articleRef = doc(db, 'learningResources', id);
        await deleteDoc(articleRef);

        return {};
    } catch (error) {
        console.error("Error deleting article:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { error: `Failed to delete article. ${errorMessage}` };
    }
}

export async function deleteAllArticlesAction(): Promise<{ error?: string }> {
    try {
        const resourcesCollection = collection(db, 'learningResources');
        const snapshot = await getDocs(resourcesCollection);

        if (snapshot.empty) {
            return { error: "There are no articles to delete." };
        }

        const batch = writeBatch(db);
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });

        await batch.commit();

        return {};
    } catch (error) {
        console.error("Error deleting all articles:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { error: `Failed to clear articles. ${errorMessage}` };
    }
}
