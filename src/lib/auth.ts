import { auth } from "./firebase";
import { signInAnonymously, onAuthStateChanged, User } from "firebase/auth";

// This function gets the current user, signing them in anonymously if needed.
export const getAnonymousUser = (): Promise<User> => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe(); // Unsubscribe after the first auth state check
      if (user) {
        // If user is already signed in, resolve with the user object
        resolve(user);
      } else {
        // If no user, sign in anonymously
        signInAnonymously(auth)
          .then((userCredential) => {
            // On successful anonymous sign-in, resolve with the new user object
            resolve(userCredential.user);
          })
          .catch((error) => {
            // If anonymous sign-in fails, reject the promise
            console.error("Anonymous sign-in failed:", error);
            reject(error);
          });
      }
    });
  });
};
