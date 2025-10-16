import React, { useState } from 'react';
import { 
  createUserWithEmailAndPassword,
  GoogleAuthProvider, 
  signInWithPopup    
} from 'firebase/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '@/firebase';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  const navigate = useNavigate()
  const location = useLocation();

  const redirectTo = location.state?.from || "/";
  // -----------------------------------------------------------------
  // 1. YOUR ORIGINAL EMAIL/PASSWORD SIGNUP HANDLER (The missing one!)
  // -----------------------------------------------------------------
  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null); 
    setMessage('');

    try {
      // CALL THE FIREBASE SIGN UP FUNCTION
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      
      // Success!
      setMessage('User successfully registered! You can now log in.');
      setEmail('');
      setPassword('');

      console.log('User signed up:', userCredential.user);
      navigate(redirectTo, { replace: true });
      
      
    } catch (error) {
      // Handle Firebase-specific errors
      setError(`Signup Failed: ${error.message}`);
      console.error(error.code, error.message);
    }
  };
  // -----------------------------------------------------------------

  // -----------------------------------------------------------------
  // 2. THE NEW GOOGLE SIGNUP HANDLER
  // -----------------------------------------------------------------
  const handleGoogleSignup = async () => {
    setError(null); 
    setMessage('');

    try {
      // 1. Create a Google Auth Provider instance
      const provider = new GoogleAuthProvider();
      
      // 2. Call the Firebase sign-in function
      const userCredential = await signInWithPopup(auth, provider);
      
      // Success!
      setMessage('Successfully signed in with Google! You can now access the app.');
      console.log('User signed up with Google:', userCredential.user);
      
       navigate(redirectTo, { replace: true });
      
    } catch (error) {
      // Handle errors 
      setError(`Google Sign-In Failed: ${error.message}`);
      console.error(error.code, error.message);
    }
  };
  // -----------------------------------------------------------------


  return (
    <form onSubmit={handleSignup} style={{ padding: '20px', border: '1px solid #ccc' }}>
      <h2>Sign Up for an Account</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <br/><br/>
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <br/><br/>
      
      {/* This button calls the defined handleSignup function */}
      <button type="submit">Register Account</button>
      
      <p style={{textAlign: 'center', margin: '10px 0'}}>OR</p>
      
      {/* This button calls the defined handleGoogleSignup function */}
      <button 
        type="button" 
        onClick={handleGoogleSignup}
        style={{ backgroundColor: '#DB4437', color: 'white', border: 'none', padding: '10px 15px', cursor: 'pointer' }}
      >
        Sign Up with Google 
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}
    </form>
  );
}

export default Signup;