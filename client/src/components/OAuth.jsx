import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';
import { app } from '../firebase';
import { useDispatch } from 'react-redux';
import { signInSuccess } from '../redux/user/userSlice';
import { useNavigate } from 'react-router-dom';

//  Define and export the OAuth component
export default function OAuth() {
    //  Initialize Redux dispatch and React Router navigation
    const dispatch = useDispatch();
    const navigate = useNavigate();

    //  Define a function to handle Google sign-in
    const handleGoogleClick = async () =>{
        try {
            //Create a new Google auth provider
            const provider = new GoogleAuthProvider();
            //  Get the Firebase authentication instance
            const auth = getAuth(app)

            //  Sign in with Google using Firebase's signInWithPopup method
            const result = await signInWithPopup(auth, provider)

            //  Send user data to the server for authentication
            const res = await fetch('/api/auth/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                //  Send user's name, email and photo URL to the server
                body: JSON.stringify({ name: result.user.displayName, email: result.user.email, photo: result.user.photoURL}),
            })
            //  Parse the response from the server
            const data = await res.json()
            //  Dispatch a Redux action to update user state upon successful sign-in
            dispatch(signInSuccess(data));
            //  Navigate the user to the home page
            navigate('/');
        } catch (error) {
            console.log('could not sign in with google', error)
        }
    };
    // Render a button for Google sign-in
  return (
    <button onClick={handleGoogleClick} type='button' className='bg-red-700 text-white p-3 rounded-lg uppercase hover:opacity-95'>
        CONTINUE WITH GOOGLE</button>
  )
}
