import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { auth } from "@/firebase";
import { Loader2, Mail, Lock, UserPlus, LogIn } from "lucide-react";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/";

  // Email/Password Signup
  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("User signed up:", userCredential.user);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      console.error("Signup failed:", err);
      setError("Signup failed. Try again with a valid email & password.");
    } finally {
      setLoading(false);
    }
  };

  // Google Signup
  const handleGoogleSignup = async () => {
    setError(null);
    setLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      console.log("User signed up with Google:", result.user);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      console.error("Google Sign-Up Failed:", err);
      setError("Google sign-up failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-white px-4 py-6">
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-xl shadow-md p-5">
        <h2 className="text-xl font-semibold text-center text-gray-800 mb-4">
          Create an Account
        </h2>

        <form onSubmit={handleSignup} className="space-y-3">
          {/* Email */}
          <div className="flex items-center border border-gray-300 rounded-lg px-2 py-1">
            <Mail className="w-4 h-4 text-gray-400" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-2 py-1 outline-none text-sm"
              required
            />
          </div>

          {/* Password */}
          <div className="flex items-center border border-gray-300 rounded-lg px-2 py-1">
            <Lock className="w-4 h-4 text-gray-400" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 px-2 py-1 outline-none text-sm"
              required
            />
          </div>

          {/* Signup Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm py-2 rounded-lg flex justify-center items-center gap-2 transition"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin w-4 h-4" /> Creating account...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" /> Sign Up
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="text-xs text-gray-500 text-center my-3">OR</div>

        {/* Google Signup */}
        <button
          onClick={handleGoogleSignup}
          disabled={loading}
          className="w-full bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-2 rounded-lg flex justify-center items-center gap-2 transition"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="w-4 h-4"
          />
          Sign up with Google
        </button>

        {/* Error Message */}
        {error && (
          <p className="text-red-500 text-xs text-center mt-2">{error}</p>
        )}

        {/* Already have an account */}
        <div className="text-xs text-gray-600 text-center mt-3">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-orange-500 font-medium hover:underline inline-flex items-center gap-1"
          >
            <LogIn className="w-3 h-3" /> Log In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
