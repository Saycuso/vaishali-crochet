import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBIe5P6wyLqs0owYXooEDBFiWsKXgsgpbE",
  authDomain: "vaishali-crochet.firebaseapp.com",
  projectId: "vaishali-crochet",
  storageBucket: "vaishali-crochet.firebasestorage.app",
  messagingSenderId: "526666837016",
  appId: "1:526666837016:web:b2ccdcdb8e598ae0d9a76d",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Services
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
