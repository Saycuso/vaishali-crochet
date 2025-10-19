// src/components/custom/DetailsPage.jsx

import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db, app } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";

// Define the global app ID for Firestore paths (from your previous files)
const appId = app.options.appId;

const DetailsPage = () => {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [currentUid, setCurrentUid] = useState(null); // New state to hold the confirmed UID
  const [pincode, setPincode] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userEmail, setUserEmail] = useState(""); // <-- NEW STATE for email

  const navigate = useNavigate();
  const location = useLocation();
  const redirectAfterSave = location.state?.from || "/checkout";
  const isManualEdit = location.state?.isManualEdit === true;

  // --- Helper Function for Fetching ---
  const fetchProfile = useCallback(
    async (uid) => {
      // 🛑 CRITICAL FIX: Use the correct path structure! 🛑
      // Path: /artifacts/{appId}/users/{userId}/profile/details
      const profileDocPath = `artifacts/${appId}/users/${uid}/profile/details`;
      const userDocRef = doc(db, profileDocPath);

      try {
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          if (redirectAfterSave === "/checkout" && !isManualEdit) {
            console.log(
              "Profile exists & came from checkout. Skipping details form."
            );
            setIsLoading(false);
            navigate("/checkout", { replace: true });
            return; // Stop execution
          }
          // If we didn't skip (because they came from somewhere else or it was a manual edit),
          // we pre-fill the form for review/edit.
          const data = docSnap.data();
          setName(data.name || "");
          setPhone(data.phone || "");
          setAddress(data.address || "");
          setPincode(data.pincode || "");
          console.log("Existing profile loaded from Firestore.");
        } else {
          console.log("No existing profile found. Starting with empty form.");
        }
      } catch (e) {
        console.error("Error fetching the document: ", e);
        setError("Failed to load existing details.");
      } finally {
        setIsLoading(false);
      }
    },
    [
      navigate,
      setName,
      setPhone,
      setAddress,
      setPincode,
      setIsLoading,
      isManualEdit,
      redirectAfterSave,
      setError,
    ]
  );

  // --- EFFECT: AUTH STATE LISTENER & PROFILE FETCH ---
  useEffect(() => {
    // 1. Start the Auth Listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is logged in. Get the UID and start fetch process.
        setCurrentUid(user.uid);
        setUserEmail(user.email || ""); // <-- CAPTURE EMAIL HERE
        fetchProfile(user.uid);
      } else {
        // User is NOT logged in. Redirect to Signup.
        setCurrentUid(null);
        setUserEmail(""); // Reset email state
        console.error("User not authenticated. Redirecting to login.");
        setIsLoading(false);
        navigate("/signup", { state: { from: "/detailspage" } });
      }
    });
    // Cleanup the listener
    return () => unsubscribe();
  }, [navigate, fetchProfile]);

  // --- HANDLER: SAVE TO FIRESTORE ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUid || !userEmail) {
      setError("You must be logged in to save details.");
      return;
    }

    // Basic validation
    if (!name || !phone || !address || !pincode) {
      setError("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    setError(null);
    const profileData = { name, phone, address, pincode, email: userEmail };

    try {
      // 1. **CRITICAL**: SAVE PROFILE TO FIRESTORE
      // Path: /artifacts/{appId}/users/{userId}/profile/details
      const profileDocPath = `artifacts/${appId}/users/${currentUid}/profile/details`;
      const userDocRef = doc(db, profileDocPath);

      await setDoc(userDocRef, profileData, { merge: true });

      console.log(`User profile saved to Firestore under ${profileDocPath}`);

      // 2. REDIRECT
      navigate(redirectAfterSave, { replace: true });
    } catch (e) {
      console.error("Error saving document: ", e);
      setError("Failed to save details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>Loading user data...</p>
      </div>
    );
  }

  // If we reach here, currentUid is confirmed and we can render the form
  return (
    // ... (rest of your return block)
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Your Details</CardTitle>
          <CardDescription>
            Enter your contact and address information to proceed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ... Input fields ... */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode</Label>
              <Input
                id="pincode"
                type="text"
                required
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email (Login ID)</Label>
              <Input
                id="email"
                type="email"
                disabled // <-- Disable editing
                value={userEmail}
                className="bg-gray-100 cursor-not-allowed"
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Details & Proceed"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DetailsPage;
