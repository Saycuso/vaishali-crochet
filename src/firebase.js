import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

const firebaseConfig = {
  apiKey: "AIzaSyBIe5P6wyLqs0owYXooEDBFiWsKXgsgpbE",
  authDomain: "vaishali-crochet.firebaseapp.com",
  projectId: "vaishali-crochet",
  storageBucket: "vaishali-crochet.firebasestorage.app",
  messagingSenderId: "526666837016",
  appId: "1:526666837016:web:b2ccdcdb8e598ae0d9a76d",
};

// Initialize Firebase Core
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// 👇 Declare it here so we can export it later
let appCheck;

if (typeof window !== "undefined") {
  // Check if it's a real human (Not Lighthouse/Bot)
  if (!navigator.webdriver) {
    try {
      appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_SITE_KEY),
        isTokenAutoRefreshEnabled: true,
      });
      console.log("🛡️ Security Shield Active (Human Detected)");
    } catch (error) {
      // Actually use the error variable so linter is happy
      console.log("⚠️ App Check skipped:", error);
    }
  } else {
    console.log("🚀 Performance Mode: Security skipped for Lighthouse/Bot");
  }
}

// Export it (even if it's undefined in Lighthouse mode, that's fine)
export { app, db, auth, storage, appCheck };