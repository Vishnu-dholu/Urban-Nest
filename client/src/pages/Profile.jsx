import { useEffect, useRef, useState } from 'react';
import {useSelector} from 'react-redux';
import {getDownloadURL, getStorage, ref, uploadBytesResumable} from 'firebase/storage';
import { app } from '../firebase';
import { updateUserStart, updateUserSuccess, updateUserFailure,
         deleteUserStart, deleteUserSuccess, deleteUserFailure,
         signOutUserStart, signOutUserSuccess, signOutUserFailure} from '../redux/user/userSlice';
import { useDispatch } from 'react-redux';

export default function Profile() {
  const fileRef = useRef(null)  //  Reference to file input element
  const {currentUser, error} = useSelector((state) => state.user)  //  Current user data from Redux store
  const [file, setFile] = useState(); //  State for selected file
  const [filePerc, setFilePerc] = useState(0);  //  State for file upload progress
  const [fileUploadError, setFileUploadError] = useState(false);  //   State for file upload error
  const [formData, setFormData] = useState({});   //  State for form data
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const dispatch = useDispatch(); //  Dispatch function for Redux actions

  //  Effect to handle file upload when 'file' state changes
  useEffect(() => {
    if(file) {
      handleFileUpload();
    }
  }, [file]);

  //  Function to handle file upload to Firebase Storage
  const handleFileUpload = () => {
    if (file) {
        const storage = getStorage(app);  //  Firebase Storage instance
        const fileName = new Date().getTime() + file.name;  //  Generate unique file name
        const storageRef = ref(storage, fileName);  //  Reference to the file in Firebase Storage
        const uploadTask = uploadBytesResumable(storageRef, file);  //  Upload task for the file 

        //  Event listeners for upload task
        uploadTask.on('state_changed',
            (snapshot) => {
              //  Update file upload progress
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setFilePerc(Math.round(progress));
            },
            (error) => {
                setFileUploadError(true);
            },
            () => {
              //  On upload completion, get the download URL of the uploaded file
              getDownloadURL(uploadTask.snapshot.ref).then
              ((downloadURL) => {
                //  Update form data with the download URL of the uploaded file
                setFormData({ ...formData, avatar: downloadURL });
              })
            }
        );
    }
};

  //  Function to handle form input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id] : e.target.value });
  }
  //  Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());  //  Dispatch action to indicate user update start
      const res = await fetch(`/api/user/update/${currentUser._id}`,{
        //  Send POST request to update user data
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData), //  Send form data in JSON format
      });
      const data = await res.json();  //  Parse response data
      if (data.success === false) {
        //  If update fails, dispatch failue action
        dispatch(updateUserFailure(data.message));
        return;
      }

      //  If update successful, dispatch success action
      dispatch(updateUserSuccess(data));
    } catch (error) {
      //  If an error occurs, dispatch failure action
      dispatch(updateUserFailure(error.message));
    }
  }
  //  Function to handle deleting the user
  const handleDeleteUser = async (e) => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  const handleSignOut = async (e) => {
    try {
      dispatch(signOutUserStart());
      const res = await fetch('/api/user/signout');
      const data = await res.json();

      if(data.success === false) {
        dispatch(signOutUserFailure(error.message));
      }
      dispatch(signOutUserSuccess(data));
    } catch (error) {
      dispatch(signOutUserFailure(error.message));
    }
  }

  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='my-7 text-3xl font-semibold text-center'>Profile</h1>

      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input onChange={(e) => setFile(e.target.files[0])}
        type='file' ref={fileRef} hidden accept='image/*' />

        <img onClick={() => fileRef.current.click()} src={formData.avatar || currentUser.avatar} alt='profile' 
        className='h-24 w-24 rounded-full object-cover cursor-pointer self-center mt-2'/>

        <p className='text-sm self-center'>
          {fileUploadError ?
          (<span className='text-red-700'>Error Image upload( image must be less than 2 mb)
          </span> ):
          filePerc > 0 && filePerc < 100 ? (
            <span className='text-slate-700'>
              {`Uploading ${filePerc}%`}
            </span>
          ):
            filePerc === 100 ? (
              <span className='text-green-700'>Image successfully 
              uploaded!</span>
            ) : (
              ''
          )
          }
        </p>

        <input type='text' placeholder='username' defaultValue={currentUser.username}
        onChange={handleChange}
         id='username' className='p-3 border rounded-lg'/>
        <input type='email' placeholder='email' defaultValue={currentUser.email}
        onChange={handleChange}
         id='email' className='p-3 border rounded-lg'/>
        <input type='password' placeholder='password' 
         id='password' className='p-3 border rounded-lg'/>

         <button className='p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80'
         >update</button>
      </form>
      <div className='flex justify-between mt-5'>
        <span onClick={handleDeleteUser}
         className='text-red-700 cursor-pointer'>Delete account</span>
        <span onClick={handleSignOut}
         className='text-red-700 cursor-pointer'>Sign out</span>
      </div>
      
      <p className='text-red-700 mt-5'>{error ? error : ''}</p>
      <p className='text-green-700 mt-5'>
        {updateSuccess ? 'User is updated successfully!' : ''}
      </p>
    </div>
  )
}