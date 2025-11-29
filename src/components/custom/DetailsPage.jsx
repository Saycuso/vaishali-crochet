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
import { auth, db } from "@/firebase"; 
import { onAuthStateChanged } from "firebase/auth";

const DetailsPage = () => {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [currentUid, setCurrentUid] = useState(null);
  const [pincode, setPincode] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userEmail, setUserEmail] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const redirectAfterSave = location.state?.from || "/checkout";
  const isManualEdit = location.state?.isManualEdit === true;

  // --- Helper Function for Fetching ---
  const fetchProfile = useCallback(
    async (user) => {
      const uid = user.uid;
      const profileDocPath = `users/${uid}`;
      const userDocRef = doc(db, profileDocPath);

      try {
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          
          // Check if profile is complete. If so, redirect from checkout
          const profileIsComplete = data.name && data.phone && data.address && data.pincode;
          
          if (profileIsComplete && redirectAfterSave === "/checkout" && !isManualEdit) {
            console.log("Profile exists & is complete. Skipping details form.");
            setIsLoading(false);
            navigate("/checkout", { replace: true });
            return;
          }
          
          // Pre-fill the form for review/edit
          setName(data.name || "");
          setPhone(data.phone || user.phoneNumber || ""); // Use Firestore phone OR Auth phone
          setAddress(data.address || "");
          setPincode(data.pincode || "");
          console.log("Existing profile loaded from Firestore.");
        } else {
          console.log("No existing profile found. Starting with empty form.");
          // If new user via Phone Login, pre-fill the phone number
          if (user.phoneNumber) {
            setPhone(user.phoneNumber);
          }
        }
      } catch (e) {
        console.error("Error fetching the document: ", e);
        setError("Failed to load existing details.");
      } finally {
        setIsLoading(false);
      }
    },
    [navigate, isManualEdit, redirectAfterSave]
  );

  // --- EFFECT: AUTH STATE LISTENER & PROFILE FETCH ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUid(user.uid);
        setUserEmail(user.email || ""); // Phone users will have "" here
        fetchProfile(user);
      } else {
        setCurrentUid(null);
        setUserEmail("");
        console.error("User not authenticated. Redirecting to login.");
        setIsLoading(false);
        navigate("/signup", { state: { from: "/detailspage" } });
      }
    });
    return () => unsubscribe();
  }, [navigate, fetchProfile]);

  // --- HANDLER: SAVE TO FIRESTORE ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 🛠️ FIX 1: Removed '!userEmail' check. Now we only check for UID.
    if (!currentUid) {
      setError("You must be logged in to save details.");
      return;
    }

    if (!name || !phone || !address || !pincode) {
      setError("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    setError(null);

    // If userEmail exists (Email login), save it. If empty (Phone login), save empty string.
    const profileData = { name, phone, address, pincode, email: userEmail };

    try {
      const profileDocPath = `users/${currentUid}`;
      const userDocRef = doc(db, profileDocPath);

      await setDoc(userDocRef, profileData, { merge: true });

      console.log(`User profile saved to Firestore at ${profileDocPath}`);

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

  return (
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

            {/* 🛠️ FIX 2: Only show this field if userEmail is not empty */}
            {userEmail && (
              <div className="space-y-2">
                <Label htmlFor="email">Email (Login ID)</Label>
                <Input
                  id="email"
                  type="email"
                  disabled
                  value={userEmail}
                  className="bg-gray-100 cursor-not-allowed"
                />
              </div>
            )}

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