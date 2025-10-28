import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "@/firebase";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Loader2, Mail, Lock, LogIn, UserPlus } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("User logged in:", userCredential.user);
      navigate(from, { replace: true });
    } catch (err) {
      console.error("Login failed:", err);
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("User logged in with Google:", result.user);
      navigate(from, { replace: true });
    } catch (err) {
      console.error("Google Sign-In Failed:", err);
      setError("Google sign-in failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-white px-4 py-6">
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-xl shadow-md p-5">
        <h2 className="text-xl font-semibold text-center text-gray-800 mb-4">
          Log In
        </h2>

        <form onSubmit={handleLogin} className="space-y-3">
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

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm py-2 rounded-lg flex justify-center items-center gap-2 transition"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin w-4 h-4" /> Logging in...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" /> Log In
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="text-xs text-gray-500 text-center my-3">OR</div>

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-2 rounded-lg flex justify-center items-center gap-2 transition"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="w-4 h-4"
          />
          Log in with Google
        </button>

        {/* Error Message */}
        {error && (
          <p className="text-red-500 text-xs text-center mt-2">{error}</p>
        )}

        {/* Sign Up Link */}
        <div className="text-xs text-gray-600 text-center mt-3">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="text-orange-500 font-medium hover:underline inline-flex items-center gap-1"
          >
            <UserPlus className="w-3 h-3" /> Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
