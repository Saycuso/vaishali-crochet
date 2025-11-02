import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase';
import ADMIN_UIDS from '@/config/adminConfig'; // We'll create this next
import { Loader2 } from 'lucide-react';

const AdminRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin w-8 h-8 text-orange-500" />
      </div>
    );
  }

  const isAdmin = user && ADMIN_UIDS.includes(user.uid);

  if (isAdmin) {
    return children; // Render the AdminOrdersPage
  } else if (user) {
    return <Navigate to="/" replace />; // Logged in, but not admin
  } else {
    return <Navigate to="/login" state={{ from: '/admin/orders' }} replace />; // Not logged in
  }
};

export default AdminRoute;