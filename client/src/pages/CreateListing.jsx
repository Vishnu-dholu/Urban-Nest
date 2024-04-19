import { useState } from "react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage"; //  Importing Firebase storage functions
import { app } from "../firebase"; //  Importing Firebase app instance
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function CreateListing() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [files, setFiles] = useState([]); //  State for storing uploaded files
  const [formData, setFormData] = useState({
    imageUrls: [], //  State for storing image URLs
    name: '',
    description: '',
    address: '',
    type: 'rent',
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 5000,
    discountPrice: 0,
    offer: false,
    parking: false,
    furnished: false,
  });
  const [imageUploadError, setImageUploadError] = useState(false); //  State for image upload errors
  const [uploading, setUploading] = useState(false); //  State for tracking upload progress
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  //    Function to handle image submission
  const handleImageSubmit = (e) => {
    //  Checking if files are selected and the total number of files is less than 7
    if (files.length > 0 && files.length + formData.imageUrls.length < 7) {
      setUploading(true); //  Set uploading state to true
      setImageUploadError(false); //  Reset image upload error state
      const promises = []; //  Arrays to store promises for each file upload

      //  Loop through each file and store its upload promise
      for (let i = 0; i < files.length; i++) {
        promises.push(storeImage(files[i])); //  Store upload promise for each file
      }

      //    Execute all upload promises concurrently
      Promise.all(promises)
        .then((urls) => {
          //  Once all uploads are completed, update form data with image URLs
          setFormData({
            ...formData,
            imageUrls: formData.imageUrls.concat(urls),
          });
          setImageUploadError(false); //  Reset image upload error state
          setUploading(false); //  Set uploading state to false
        })
        .catch((err) => {
          // If any upload fails, handle the error
          setImageUploadError("Image upload failed (2 mb max per image)");
          setUploading(false); //  Set uploading state to false
        });
    } else {
      //  If no files are selected or the limit is exceeded, display error message
      setImageUploadError("You can only upload 6 images per listing");
      setUploading(false); //  Set uploading state to false
    }
  };

  //    Function to upload a single image to Firebase storage
  const storeImage = async (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app); //  Get Firebase storage instance
      const fileName = new Date().getTime() + file.name; //  Generate a unique file name
      const storageRef = ref(storage, fileName); //  Create a reference to the storage location
      const uploadTask = uploadBytesResumable(storageRef, file); //  Upload the file

      //    Event listener for tracking upload progress
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          //  Handle upload progress
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          reject(error); //  Reject the promise with the error
        },
        () => {
          //  Handle upload completion
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            //  Get the download URL of the uploaded file
            resolve(downloadURL); //  Resolve the promise with the download URL
          });
        }
      );
    });
  };

  //    Function to remove an image from the form data
  const handleRemoveImage = (index) => {
    //  Filter out the image URL at the specified index
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index),
    });
  };

  const handleChange = (e) => {
    if (e.target.id === 'sale' || e.target.id === 'rent'){
        setFormData({
            ...formData,
            type: e.target.id,
        });
    }

    if (
        e.target.id === 'parking' ||
        e.target.id === 'furnished' ||
        e.target.id === 'offer' 
    ) {
        setFormData({
            ...formData,
            [e.target.id]: e.target.checked,
        });
    }

    if (
        e.target.type === 'number' ||
        e.target.type === 'text' ||
        e.target.type === 'textarea'
    ) {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value,
        });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);
    try {
        if (formData.imageUrls.length < 1)
            return setError('You must upload at least one image');
        if (+ formData.regularPrice < +formData.discountPrice)
            return setError('Discount price must be lower than regular price');
        setLoading(true);
        setError(false);

        const res = await fetch('/api/listing/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...formData,
                userRef: currentUser._id,
            })
        });
        const data = await res.json();
        setLoading(false);
        if (data.success === false){
            setError(data.message);
        }
        navigate(`/listing/${data._id}`);
    } catch (error) {
        setError(error.message);
        setLoading(false);
    }
  }
  
  return (
    <main className="p-3 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7"></h1>
      <form className="flex flex-col sm:flex-row gap-4">
        <div className="flex flex-col gap-4 flex-1">
          <input
            type="text"
            placeholder="Name"
            className="border p-3 rounded-lg"
            id="name"
            maxLength="62"
            minLength="10"
            required
            onChange={handleChange}
            value={formData.name}
          />
          <textarea
            type="text"
            placeholder="Description"
            className="border p-3 rounded-lg"
            id="description"
            required
            onChange={handleChange}
            value={formData.description}
          />
          <input
            type="text"
            placeholder="Address"
            className="border p-3 rounded-lg"
            id="address"
            required
            onChange={handleChange}
            value={formData.address}
          />
          <div className="flex gap-6 flex-wrap">
            <div className="flex gap-2">
              <input type="checkbox" id="sale" className="w-5" onChange={handleChange} checked={formData.type === 'sale'} />
              <span>Sell</span>
            </div>
            <div className="flex gap-2">
              <input type="checkbox" id="rent" className="w-5" onChange={handleChange} checked={formData.type === 'rent'} />
              <span>Rent</span>
            </div>
            <div className="flex gap-2">
              <input type="checkbox" id="parking" className="w-5" onChange={handleChange} checked={formData.address} />
              <span>Parking spot</span>
            </div>
            <div className="flex gap-2">
              <input type="checkbox" id="furnished" className="w-5" onChange={handleChange} checked={formData.furnished} />
              <span>Furnished</span>
            </div>
            <div className="flex gap-2">
              <input type="checkbox" id="offer" className="w-5" onChange={handleChange} checked={formData.offer} />
              <span>Offer</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="bedrooms"
                min="1"
                max="10"
                required
                className="p-3 border border-gray-300 rounded-lg"
                onChange={handleChange}
                value={formData.bedrooms}
              />
              <p>Beds</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="bathrooms"
                min="1"
                max="10"
                required
                className="p-3 border border-gray-300 rounded-lg"
                onChange={handleChange}
                value={formData.bathrooms}
              />
              <p>Baths</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="regularPrice"
                min="5000"
                max="100000"
                required
                className="p-3 border border-gray-300 rounded-lg"
                onChange={handleChange}
                value={formData.regularPrice}
              />
              <div className="flex flex-col items-center">
                <p>Regular price</p>
                {formData.type === 'rent' && (
                  <span className="text-xs">(₹ / month)</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="discountPrice"
                min="1"
                max="10"
                required
                className="p-3 border border-gray-300 rounded-lg"
                onChange={handleChange}
                value={formData.discountPrice}
              />
              <div className="flex flex-col items-center">
                <p>Discounted price</p>
                {formData.type === 'rent' && (
                  <span className="text-xs">(₹ / month)</span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col flex-1 gap-4">
          <p className="font-semibold">
            Images:
            <span className="font-normal text-gray-600 ml-2">
              The first image will be the cover (max 6)
            </span>
          </p>
          <div className="flex gap-4">
            <input
              onChange={(e) => setFiles(e.target.files)}
              className="p-3 border border-gray-300 rounded w-full"
              type="file"
              id="images"
              accept="image/*"
              multiple
            />
            <button
              type="button"
              disabled={uploading}
              onClick={handleImageSubmit}
              className="p-3 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
          <p className="text-red-700 text-sm">
            {imageUploadError && imageUploadError}
          </p>
          {formData.imageUrls.length > 0 &&
            formData.imageUrls.map((url, index) => (
              <div
                key={url}
                className="flex justify-between p-3 border items-center"
              >
                <img
                  src={url}
                  alt="listing image"
                  className="w-20 h-20 object-contain rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="p-3 text-red-700 rounded-lg uppercase hover:opacity-75"
                >
                  Delete
                </button>
              </div>
            ))}
          <button onClick={handleSubmit} disabled={loading || uploading}
           className="p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80">
            {loading ? 'Creating...' : 'Create listing'}
          </button>
          {error && <p className="text-sm text-red-700">{error}</p>}
        </div>
      </form>
    </main>
  );
}
