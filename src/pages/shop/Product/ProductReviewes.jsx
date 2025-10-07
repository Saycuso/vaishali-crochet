import React, { useState, useEffect } from "react";
import { CardContent, Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { db } from "@/firebase";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

// Helper function to read customer info from local storage
const getCustomerNameFromLocalStorage = () => {
  try {
    const customerInfo = localStorage.getItem("customerInfo");
    if (customerInfo) {
      const { fullName } = JSON.parse(customerInfo);
      return fullName || null; // Return the name if it exists, otherwise null
    }
    return null;
  } catch (error) {
    console.error("Error reading customerInfo from local storage:", error);
    return null;
  }
};

// Component Start
const ProductReviewSection = ({ productId }) => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [newReviewText, setNewReviewText] = useState("");
  const [rating, setRating] = useState(5); // Default to 5 stars
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewerName, setReviewerName] = useState(null); // Will hold the name from local storage

  // --- 1. FETCH EXISTING REVIEWS ---
  useEffect(() => {
    // Also check for the reviewer's name when the component mounts
    setReviewerName(getCustomerNameFromLocalStorage());

    const fetchReviews = async () => {
      if (!productId) return;
      try {
        const reviewsRef = collection(db, "reviews");
        // Query reviews where the productId matches the current product
        const q = query(reviewsRef, where("productId", "==", productId));
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
    fetchReviews();
  }, [productId]);

  // --- 2. SUBMIT NEW REVIEW HANDLER ---
  const handleSubmitReview = async (e) => {
    e.preventDefault();

    // A. Check for Name: If the name is null, redirect them to the details page.
    if (!reviewerName) {
      alert("Please enter your details first to submit a review.");
      navigate("/login"); // Assuming your details page is at /login
      return;
    }
    if (!newReviewText.trim() || rating < 1 || rating > 5) {
      alert("Please provide a rating and a comment.");
      return;
    }

    setIsSubmitting(true);
    try {
      const newReview = {
        productId,
        reviewerName, // The name pulled from local storage
        rating,
        comment: newReviewText.trim(),
        createdAt: serverTimestamp(),
        isVerified: false, // Always false for our anonymous system
      };

      const reviewsRef = collection(db, "reviews");
      const docRef = await addDoc(reviewsRef, newReview);

      // Add the new review to the state array for instant display
      setReviews(prev => [
        { ...newReview, id: docRef.id, createdAt: new Date() }, // Use new Date() for immediate display
        ...prev,
      ]);

      setNewReviewText(""); // Clear the form
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
      <Card className="p-6">
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
          
          <Textarea
            placeholder="Share your thoughts on the product..."
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
              <div className="flex justify-between items-center">
                <span className="font-semibold">{review.reviewerName || "Anonymous"}</span>
                <span className="text-yellow-500">
                  {"★".repeat(review.rating) + "☆".repeat(5 - review.rating)}
                </span>
              </div>
              <p className="text-gray-700">{review.comment}</p>
              <p className="text-xs text-gray-400">
                {review.createdAt && review.createdAt.toDate ? review.createdAt.toDate().toLocaleDateString() : 'Just Now'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProductReviewSection;