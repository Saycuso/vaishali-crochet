import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth'; // Assuming you use this or similar state hook
import { auth } from '@/firebase'; // Your Firebase auth instance
import ADMIN_UIDS from '@/config/adminConfig';
import { Loader2 } from 'lucide-react';

const AdminRoute = ({ children }) => {
  // Use a listener to get the current auth state
  const [user, loading] = useAuthState(auth); 

  if (loading) {
    // Show a spinner while fetching user state
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin w-8 h-8 text-orange-500" />
      </div>
    );
  }

  // 1. Check if user is logged in AND 
  // 2. Check if their UID is in the authorized list
  const isAdmin = user && ADMIN_UIDS.includes(user.uid);

  if (isAdmin) {
    return children; // Authorized: Render the Admin Dashboard
  } else if (user) {
    // Logged in, but not an Admin: Redirect to home or show error
    return <Navigate to="/" replace />;
  } else {
    // Not logged in: Redirect to login page
    return <Navigate to="/login" state={{ from: '/admin' }} replace />;
  }
};

export default AdminRoute;
