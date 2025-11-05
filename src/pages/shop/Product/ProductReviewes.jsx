import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { auth, db } from "@/firebase";
import {
  doc,
  collection,
  query,
  where,
  getDocs,
  getDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

const ProductReviewSection = ({ productId }) => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [newReviewText, setNewReviewText] = useState("");
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewerName, setReviewerName] = useState(null);
  const [userId, setUserId] = useState(null);
  const [expandedReviewIds, setExpandedReviewIds] = useState([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const firstReviewRef = useRef(null);


  // Fetch reviews
  useEffect(() => {
    if (!productId) return;

    const fetchExistingReviews = async (pId) => {
      try {
        const reviewsRef = collection(db, "reviews");
        const q = query(reviewsRef, where("productId", "==", pId));
        const snapshot = await getDocs(q);

        const fetchedReviews = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setReviews(
          fetchedReviews.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds)
        );
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const currentUserId = user.uid;
        setUserId(currentUserId);

        try {
          const profileDocRef = doc(db, "users", currentUserId);
          const docSnap = await getDoc(profileDocRef);
          if (docSnap.exists() && docSnap.data().name) {
            setReviewerName(docSnap.data().name);
          } else {
            setReviewerName(user.email.split("@")[0]);
          }
        } catch {
          setReviewerName("Anonymous");
        }

        fetchExistingReviews(productId);
      } else {
        setUserId(null);
        setReviewerName(null);
        fetchExistingReviews(productId);
      }
    });

    return () => unsubscribeAuth();
  }, [productId]);

  // Submit review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewerName || !userId) {
      alert("Please log in to submit a review.");
      navigate("/detailspage", { state: { from: `/product/${productId}` } });
      return;
    }

    if (!newReviewText.trim()) {
      alert("Please write something before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      const newReview = {
        productId,
        reviewerName,
        reviewerId: userId,
        rating,
        comment: newReviewText.trim(),
        createdAt: serverTimestamp(),
      };

      const reviewsRef = collection(db, "reviews");
      const docRef = await addDoc(reviewsRef, newReview);

      setReviews((prev) => [
        { ...newReview, id: docRef.id, createdAt: new Date() },
        ...prev,
      ]);

      setNewReviewText("");
      setRating(5);
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Time ago
  const getTimeAgo = (timestamp) => {
    if (!timestamp) return "Just now";
    const now = new Date();
    const created = timestamp.toDate ? timestamp.toDate() : new Date();
    const diff = (now - created) / 1000 / 60;
    if (diff < 1) return "Just now";
    if (diff < 60) return `${Math.floor(diff)} min ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)} hrs ago`;
    return created.toLocaleDateString();
  };

  // Toggle read more/less
  const toggleExpand = (id) => {
    setExpandedReviewIds((prev) =>
      prev.includes(id) ? prev.filter((rId) => rId !== id) : [...prev, id]
    );
  };

  return (
  <div className="space-y-6">
    <h2 className="text-xl md:text-2xl font-bold">Customer Reviews</h2>

    {/* Write Review */}
    <Card className="p-4 border border-gray-300 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-2">Write a Review</h3>
      <form onSubmit={handleSubmitReview} className="space-y-2.5">
        <div className="flex items-center space-x-1.5 text-sm">
          <label className="font-medium text-gray-800">Name:</label>
          <span className="text-orange-600 font-semibold">
            {reviewerName || "Please log in"}
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <label className="font-medium text-gray-800 text-sm">Rating:</label>
          <div className="flex space-x-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`text-lg cursor-pointer ${
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
          placeholder="Share your experience with this product..."
          value={newReviewText}
          onChange={(e) => setNewReviewText(e.target.value)}
          rows={3}
          className="text-sm"
          required
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-orange-600 hover:bg-orange-700 text-sm px-3 py-1.5"
        >
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </Button>
      </form>
    </Card>

    {/* Reviews */}
    <div className="space-y-3 pt-2 border-t border-gray-200">
      {reviews.length === 0 && (
        <p className="text-gray-500 text-sm">
          No reviews yet. Be the first!
        </p>
      )}

      {reviews.slice(0, visibleCount).map((review, index) => {
        const isExpanded = expandedReviewIds.includes(review.id);
        const comment = review.comment || "";
        const showToggle = comment.length > 180;

 return (
      <Card
        key={review.id}
        ref={index === 0 ? firstReviewRef : null} // 👈 reference the first visible review
        className="rounded-md shadow-sm border border-gray-200"
      >
        <CardContent className="p-3 text-left">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold text-gray-900 text-sm">
                {review.reviewerName || "Anonymous"}
              </p>
              <p className="text-yellow-500 text-xs">
                {"★".repeat(review.rating) + "☆".repeat(5 - review.rating)}
              </p>
            </div>
            <span className="text-xs text-gray-500">
              {getTimeAgo(review.createdAt)}
            </span>
          </div>

          <p className="text-gray-700 text-sm mt-1.5 leading-snug">
            {isExpanded || !showToggle
              ? comment
              : comment.slice(0, 180) + "..."}
            {showToggle && (
              <span
                onClick={() => toggleExpand(review.id)}
                className="text-orange-600 ml-1 cursor-pointer select-none font-medium"
              >
                {isExpanded ? "Read less" : "Read more"}
              </span>
            )}
          </p>
        </CardContent>
      </Card>
    );
  })}

  {/* --- View More / Less --- */}
  {reviews.length > 10 && (
    <div className="text-center mt-3">
      {visibleCount < reviews.length ? (
        <button
          onClick={() => setVisibleCount((prev) => prev + 10)}
          className="text-orange-600 font-medium hover:underline text-sm"
        >
          View more {Math.min(10, reviews.length - visibleCount)} reviews
        </button>
      ) : (
        <button
          onClick={() => {
            setVisibleCount(10);
            // 👇 scroll to the first review instead of top
            setTimeout(() => {
  const el = firstReviewRef.current;
  if (!el) return;

  const elementTop = el.getBoundingClientRect().top + window.scrollY - 80; // offset: 80px above
  const start = window.scrollY;
  const distance = elementTop - start;
  const duration = 600; // milliseconds
  let startTime = null;

  const easeInOutQuad = (t) =>
    t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

  const animateScroll = (timestamp) => {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    const eased = easeInOutQuad(progress);
    window.scrollTo(0, start + distance * eased);

    if (progress < 1) requestAnimationFrame(animateScroll);
  };

  requestAnimationFrame(animateScroll);
}, 150);
          }}
          className="text-orange-600 font-medium hover:underline text-sm"
        >
          View less reviews
        </button>
      )}
    </div>
  )}
    </div>
  </div>
);

};

export default ProductReviewSection;
