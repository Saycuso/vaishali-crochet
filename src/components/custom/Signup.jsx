import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { auth } from "@/firebase";
import { Loader2, Mail, Lock, UserPlus, LogIn, Phone, CheckCircle } from "lucide-react";

const Signup = () => {
  // Toggle between "email" and "phone" modes
  const [authMode, setAuthMode] = useState("email");

  // --- STATE: Email Signup ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // --- STATE: Phone Signup ---
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [verificationResult, setVerificationResult] = useState(null);
  const [otpSent, setOtpSent] = useState(false);

  // --- STATE: UI ---
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/";

  // ==============================
  // 1. RECAPTCHA SETUP
  // ==============================
  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container-signup", {
        size: "invisible",
        callback: () => {
          console.log("Recaptcha verified");
        },
      });
    }
  };

  // ==============================
  // 2. PHONE SIGNUP FUNCTIONS
  // ==============================
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (phoneNumber.length < 10) {
      setError("Please enter a valid phone number.");
      setLoading(false);
      return;
    }

    const formattedNumber = phoneNumber.startsWith("+") 
      ? phoneNumber 
      : `+91${phoneNumber}`;

    try {
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedNumber,
        appVerifier
      );
      
      window.confirmationResult = confirmationResult;
      setVerificationResult(confirmationResult);
      setOtpSent(true);
      console.log("OTP Sent");
    } catch (err) {
      console.error("Error sending OTP:", err);
      setError("Failed to send OTP. Try again.");
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await verificationResult.confirm(otp);
      console.log("User signed up/in with Phone:", result.user);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      console.error("OTP Verification failed:", err);
      setError("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // 3. EMAIL SIGNUP
  // ==============================
  const handleEmailSignup = async (e) => {
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

  // ==============================
  // 4. GOOGLE SIGNUP
  // ==============================
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
        
        {/* --- TABS --- */}
        <div className="flex justify-center mb-6 space-x-4 border-b pb-2">
          <button
            onClick={() => setAuthMode("email")}
            className={`text-sm font-medium pb-1 transition-colors ${
              authMode === "email"
                ? "text-orange-600 border-b-2 border-orange-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Email Signup
          </button>
          <button
            onClick={() => setAuthMode("phone")}
            className={`text-sm font-medium pb-1 transition-colors ${
              authMode === "phone"
                ? "text-orange-600 border-b-2 border-orange-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Phone Signup
          </button>
        </div>

        <h2 className="text-xl font-semibold text-center text-gray-800 mb-4">
          {authMode === "email" ? "Create Account" : otpSent ? "Verify OTP" : "Phone Sign Up"}
        </h2>

        {/* --- EMAIL FORM --- */}
        {authMode === "email" && (
          <form onSubmit={handleEmailSignup} className="space-y-3">
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
        )}

        {/* --- PHONE FORM --- */}
        {authMode === "phone" && (
          <div className="space-y-3">
            {/* Unique ID for Signup Page Recaptcha */}
            <div id="recaptcha-container-signup"></div>

            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-3">
                <div className="flex items-center border border-gray-300 rounded-lg px-2 py-1">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500 pl-2 pr-1 text-sm border-r mr-2">+91</span>
                  <input
                    type="tel"
                    placeholder="Mobile Number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="flex-1 px-1 py-1 outline-none text-sm"
                    maxLength={10}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm py-2 rounded-lg flex justify-center items-center gap-2 transition"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin w-4 h-4" /> Sending OTP...
                    </>
                  ) : (
                    "Get OTP"
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-3">
                <div className="text-center text-xs text-gray-500 mb-2">
                  OTP sent to +91 {phoneNumber}
                </div>
                <div className="flex items-center border border-gray-300 rounded-lg px-2 py-1">
                  <Lock className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="flex-1 px-2 py-1 outline-none text-sm tracking-widest text-center"
                    maxLength={6}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium text-sm py-2 rounded-lg flex justify-center items-center gap-2 transition"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin w-4 h-4" /> Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" /> Verify & Create Account
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => { setOtpSent(false); setOtp(""); }}
                  className="w-full text-xs text-gray-500 hover:text-gray-700 underline mt-2"
                >
                  Change Phone Number
                </button>
              </form>
            )}
          </div>
        )}

        {/* --- FOOTER --- */}
        <div className="text-xs text-gray-500 text-center my-3">OR</div>

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

        {error && (
          <p className="text-red-500 text-xs text-center mt-2 bg-red-50 p-2 rounded border border-red-100 animate-pulse">
            {error}
          </p>
        )}

        {authMode === "email" && (
          <div className="text-xs text-gray-600 text-center mt-3">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-orange-500 font-medium hover:underline inline-flex items-center gap-1"
            >
              <LogIn className="w-3 h-3" /> Log In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Signup;