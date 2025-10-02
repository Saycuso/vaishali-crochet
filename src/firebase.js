import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration from your Firebase project settings
// Use environment variables for security
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

// Initialize Firestore and export it
const db = getFirestore(app);

export { app, db };
