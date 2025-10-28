/* eslint-disable no-irregular-whitespace */
import React, { useState, useEffect } from "react";
import { CardContent, Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"; // Using Textarea for comment
import { Input } from "@/components/ui/input"; // Assuming you have an Input component
import { auth, db, app } from "@/firebase";
import { doc, collection, query, where, getDocs, getDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

const appId = app.options.appId;
// Component Start
const ProductReviewSection = ({ productId }) => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [newReviewTitle, setNewReviewTitle] = useState(""); // <-- NEW STATE FOR TITLE
  const [newReviewText, setNewReviewText] = useState("");
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewerName, setReviewerName] = useState(null);
  const [userId, setUserId] = useState(null)
  // --- 1. FETCH EXISTING REVIEWS ---
  useEffect(() => {
   if (!productId) return;

   const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const currentUserId = user.uid;
        setUserId(currentUserId);
        
        // 🅰️ FETCH REVIEWER NAME FROM ARTIFACTS
        try {
          // Construct the path using appId and userId
          const profileDocPath = `artifacts/${appId}/users/${currentUserId}/profile/details`;
          const profileDocRef = doc(db, profileDocPath);
          const docSnap = await getDoc(profileDocRef);

          if (docSnap.exists()) {
            // Use the 'name' field from the profile document
            setReviewerName(docSnap.data().name || user.email.split('@')[0]); // Fallback to email prefix
          } else {
            console.warn("User profile details not found. Using email prefix as name.");
            setReviewerName(user.email.split('@')[0]);
          }
        } catch (error) {
          console.error("Error fetching user name:", error);
          setReviewerName("Anonymous User");
        }

        // 🅱️ FETCH REVIEWS (This logic is fine)
        fetchExistingReviews(productId);
      } else {
        // User is not logged in
        setUserId(null);
        setReviewerName(null);
        fetchExistingReviews(productId);
      }
    });
    const fetchExistingReviews = async (pId) => {
      try {
        const reviewsRef = collection(db, "reviews");
        const q = query(reviewsRef, where("productId", "==", pId));
        const snapshot = await getDocs(q);

        const fetchedReviews = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReviews(fetchedReviews);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    return () => unsubscribeAuth();
  }, [productId]);

  // --- 2. SUBMIT NEW REVIEW HANDLER ---
  const handleSubmitReview = async (e) => {
    e.preventDefault();

    // A. Check for Name:
    if (!reviewerName || !userId) {
      alert("Please enter your details first to submit a review.");
      // NOTE: You are navigating to /detailspage, but your details page is likely /checkout
      navigate("/detailspage"); 
      return;
    }
    if (!newReviewTitle.trim() || !newReviewText.trim() || rating < 1 || rating > 5) {
      alert("Please provide a title, rating, and a comment.");
      return;
    }

    setIsSubmitting(true);
    try {
      const newReview = {
        productId,
        reviewerName,
        reviewerId: userId,
        rating,
        title: newReviewTitle.trim(), // <-- ADDED TITLE
        comment: newReviewText.trim(),
        createdAt: serverTimestamp(),
        isVerified: false,
      };

      const reviewsRef = collection(db, "reviews");
      const docRef = await addDoc(reviewsRef, newReview);

      // Add the new review to the state array for instant display
      setReviews(prev => [
        { ...newReview, id: docRef.id, createdAt: new Date() },
        ...prev,
      ]);

      setNewReviewTitle(""); // Clear the title field
      setNewReviewText("");
      setRating(5);
      alert("Review submitted successfully!");

    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };


  // --- 3. RENDER UI ---
  return (
    <div className="space-y-8">
      <h2 className="text-2xl md:text-3xl font-bold">Customer Reviews</h2>

      {/* --- WRITE A REVIEW FORM --- */}
      {/* ADDED BORDER AND PADDING TO THE CARD HERE, as requested earlier */}
      <Card className="p-6 border border-gray-300 rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold mb-4">Write a Review</h3>
        <form onSubmit={handleSubmitReview} className="space-y-4">
          <div className="flex items-center space-x-2">
            <label className="font-medium">Your Name:</label>
            <span className="text-orange-600 font-bold">
              {reviewerName || "Redirecting to Details..."}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <label className="font-medium">Rating:</label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`text-2xl cursor-pointer ${
                    star <= rating ? "text-yellow-500" : "text-gray-300"
                  }`}
                  onClick={() => setRating(star)}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
          
          {/* <-- NEW REVIEW TITLE INPUT FIELD --> */}
          <div>
            <label htmlFor="review-title" className="sr-only">Review Title</label>
            <input // Using a standard input for the short title
              id="review-title"
              type="text"
              placeholder="Give your review a title (e.g., 'Loved It!')"
              value={newReviewTitle}
              onChange={(e) => setNewReviewTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md placeholder-gray-500 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              required
              maxLength={100} // Optional: Limit title length
            />
          </div>
          
          <Textarea
            placeholder="Share your detailed thoughts on the product..."
            value={newReviewText}
            onChange={(e) => setNewReviewText(e.target.value)}
            rows={4}
            required
          />

          <Button type="submit" disabled={isSubmitting} className="bg-orange-600 hover:bg-orange-700">
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      </Card>

      {/* --- DISPLAY EXISTING REVIEWS --- */}
      <div className="space-y-6 pt-4 border-t border-gray-200">
        {reviews.length === 0 && <p className="text-gray-500">Be the first to leave a review!</p>}

        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-6 space-y-2">
              <div className="flex justify-between items-center mb-1">
                {/* <-- DISPLAY NEW TITLE PROMINENTLY --> */}
                <h4 className="text-lg font-bold text-gray-900">
                    {review.title}
                </h4>
                <span className="text-yellow-500">
                  {"★".repeat(review.rating) + "☆".repeat(5 - review.rating)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span className="font-semibold text-gray-700">{review.reviewerName || "Anonymous"}</span>
                <p className="text-xs">
                  {review.createdAt && review.createdAt.toDate ? review.createdAt.toDate().toLocaleDateString() : 'Just Now'}
                </p>
              </div>
              <p className="text-gray-700 mt-2">{review.comment}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProductReviewSection;