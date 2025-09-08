import { firestore } from './firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  DocumentReference
} from 'firebase/firestore';

interface TranslationRecord {
  originalText: string;
  translatedText: string;
  createdAt: any; // Use serverTimestamp for this
}

/**
 * Finds the most recent translation for a given text in a user's history.
 * @param uid The user's unique ID.
 * @param originalText The text to search for.
 * @returns The translated text if found, otherwise null.
 */
export const findTranslationInHistory = async (
  uid: string,
  originalText: string
): Promise<string | null> => {
  if (!uid) return null;

  const historyCollectionRef = collection(firestore, 'translations', uid, 'history');
  
  const q = query(
    historyCollectionRef,
    where("originalText", "==", originalText),
    orderBy("createdAt", "desc"),
    limit(1)
  );

  try {
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      // Return the translated text from the first document found
      const docData = querySnapshot.docs[0].data();
      return docData.translatedText;
    } else {
      // No record found
      return null;
    }
  } catch (error) {
    console.error("Error searching for translation in history:", error);
    // This might fail due to a missing index. The error message in the console
    // will contain a link to create it in the Firebase console.
    return null;
  }
};


/**
 * Saves a translation record to a user's specific history collection in Firestore.
 * @param uid - The user's unique ID (from Firebase Auth).
 * @param originalText - The text before translation.
 * @param translatedText - The text after translation.
 * @returns A promise that resolves with the new document reference.
 */
export const saveTranslationHistory = (
  uid: string,
  originalText: string,
  translatedText: string
): Promise<DocumentReference> => {
  if (!uid) {
    return Promise.reject("Invalid user ID provided.");
  }

  // Create a reference to the user's specific history subcollection
  const historyCollectionRef = collection(firestore, 'translations', uid, 'history');

  const newRecord: TranslationRecord = {
    originalText,
    translatedText,
    createdAt: serverTimestamp(), // Let Firestore handle the timestamp
  };

  return addDoc(historyCollectionRef, newRecord);
};
