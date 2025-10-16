import React, { useState } from "react";
import {
  signInWithEmailAndPassword, // For email/password login
  GoogleAuthProvider, // For creating Google provider
  signInWithPopup, // For Google login
} from "firebase/auth";
import { auth } from "@/firebase";
import { useNavigate, useLocation } from "react-router-dom";
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || "/";

  // -----------------------------------------------------------------
  // 1. EMAIL/PASSWORD LOGIN HANDLER
  // -----------------------------------------------------------------
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage("");

    try {
      // Call the Firebase sign-in function
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Success!
      setMessage("Login successful! Welcome back.");
      setEmail("");
      setPassword("");

      // The user object is in userCredential.user
      console.log("User logged in:", userCredential.user);
      navigate(from, { replace: true });
    } catch (error) {
      // Handle Firebase-specific errors (e.g., invalid-credential, wrong-password, user-not-found)
      setError(`Login Failed: ${error.message}`);
      console.error(error.code, error.message);
    }
  };

  // -----------------------------------------------------------------
  // 2. GOOGLE SIGN-IN HANDLER (Same logic as Signup, but just signs them in)
  // -----------------------------------------------------------------
  const handleGoogleLogin = async () => {
    setError(null);
    setMessage("");

    try {
      // 1. Create a Google Auth Provider instance
      const provider = new GoogleAuthProvider();

      // 2. Call the Firebase sign-in function
      const userCredential = await signInWithPopup(auth, provider);

      // Success!
      setMessage("Successfully signed in with Google! Welcome back.");
      console.log("User logged in with Google:", userCredential.user);

      navigate(from, { replace: true });
    } catch (error) {
      // Handle errors
      setError(`Google Sign-In Failed: ${error.message}`);
      console.error(error.code, error.message);
    }
  };
  // -----------------------------------------------------------------

  return (
    <form
      onSubmit={handleLogin}
      style={{ padding: "20px", border: "1px solid #ccc" }}
    >
      <h2>Log In to Your Account</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <br />
      <br />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <br />
      <br />

      {/* Button for Email/Password Login */}
      <button type="submit">Log In</button>

      <p style={{ textAlign: "center", margin: "10px 0" }}>OR</p>

      {/* Button for Google Sign-In */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        style={{
          backgroundColor: "#DB4437",
          color: "white",
          border: "none",
          padding: "10px 15px",
          cursor: "pointer",
        }}
      >
        Log In with Google 🚀
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}
    </form>
  );
}

export default Login;
