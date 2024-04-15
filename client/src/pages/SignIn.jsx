import { useState } from 'react'
import {Link, useNavigate} from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux';
import { signInStart, signInSuccess, signInFailure} from '../redux/user/userSlice';
import OAuth from '../components/OAuth';

export default function SignIn() {
  const [formData, setFormData] = useState({})
  const { loading, error } = useSelector((state) => state.user);

  // Hook from react-router-dom to navigate between routes
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
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
      dispatch(signInStart());
      //  Make a POST request to the signup endpoint with form data
      const res = await fetch('/api/auth/signin', 
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
        dispatch(signInFailure(data.message));
        return;
      }

      dispatch(signInSuccess(data));
      navigate('/');
    } catch (error) {
      dispatch(signInFailure(error.message));
    }
  };

  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl text-center font-semibold my-7'>
        Sign In
      </h1>
      <form onSubmit={handleSubmit}
      className='flex flex-col gap-4'>
        <input type='email' placeholder='email'
        className='p-3 border rounded-lg' id='email'
        onChange={handleChange} />

        <input type='password' placeholder='password'
        className='p-3 border rounded-lg' id='password'
        onChange={handleChange} />

        <button disabled={loading} className='bg-slate-700 text-white p-3 rounded-lg uppercase hover::opacity-95 disabled:opacity-80'>
          {loading ? 'Loading...' : 'Sign In'}
        </button>
        <OAuth />
      </form>

      <div className='flex gap-2 mt-5'>
        <p>Dont have an account?</p>
        <Link to={"/sign-up"}>
          <span className='text-blue-700'>Sign up</span>
        </Link>
      </div>
      {error && <p className='text-red-500 mt-5'>{error}</p>}
    </div>
  )
}
