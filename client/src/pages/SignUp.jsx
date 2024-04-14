import { useState } from 'react'
import {Link, useNavigate} from 'react-router-dom'

export default function SignUp() {
  const [formData, setFormData] = useState({})
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Hook from react-router-dom to navigate between routes
  const navigate = useNavigate();
  
  //  Function to handle input change in the form
  const handleChange = (e) => {
    //  Update form data with the new inpput value
    setFormData(
      {
        ...formData,
        [e.target.id]: e.target.value,
      });
  };

  //  Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); //  Prevent default form submission behavior
    try{
      setLoading(true); //  Set loading state to true
      //  Make a POST request to the signup endpoint with form data
      const res = await fetch('/api/auth/signup', 
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      //  Parse the response as JSON
      const data = await res.json();

      // If the signup was not successful, set error message and return
      if(data.success === false) {
        setError(data.message);
        setLoading(false);  // Set loading state to false
        return;
      }

      // If signup was successful, reset error, loading state, and navigate to sign-in page
      setLoading(false);
      setError(null);
      navigate('/sign-in');
    } catch (error) {
      // If an error occurs during form submission, set error message and loading state
      setLoading(false);
      setError(error.message);
    }
  };

  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl text-center font-semibold my-7'>
        Sign up
      </h1>
      <form onSubmit={handleSubmit}
      className='flex flex-col gap-4'>
        <input type='text' placeholder='username'
        className='p-3 border rounded-lg' id='username'
        onChange={handleChange} />

        <input type='email' placeholder='email'
        className='p-3 border rounded-lg' id='email'
        onChange={handleChange} />

        <input type='password' placeholder='password'
        className='p-3 border rounded-lg' id='password'
        onChange={handleChange} />

        <button disabled={loading} className='bg-slate-700 text-white p-3 rounded-lg uppercase hover::opacity-95 disabled:opacity-80'>
          {loading ? 'Loading...' : 'Sign Up'}
        </button>
      </form>

      <div className='flex gap-2 mt-5'>
        <p>Have an account?</p>
        <Link to={"/sign-in"}>
          <span className='text-blue-700'>Sign in</span>
        </Link>
      </div>
      {error && <p className='text-red-500 mt-5'>{error}</p>}
    </div>
  )
}
