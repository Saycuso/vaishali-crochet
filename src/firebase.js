import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// 👇 1. IMPORT THE APP CHECK STUFF
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

// Your web app's Firebase configuration
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
const db = getFirestore(app);
const auth = getAuth(app);

// 👇 2. INITIALIZE APP CHECK
// This code reads the Site Key from your .env file
const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_SITE_KEY),
  isTokenAutoRefreshEnabled: true, // Automatically refreshes the token
});

// 👇 3. EXPORT APPCHECK
export { app, db, auth, appCheck };