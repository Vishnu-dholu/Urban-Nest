import { combineReducers, configureStore } from '@reduxjs/toolkit'
import userReducer from './user/userSlice';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

//  Combine reducers into a single root reducer
const rootReducer = combineReducers({
  user: userReducer //  Combine userReducer into the 'user' slice of the state
})

//  Configuration for persisting Redux state
const persistConfig = {
    key: 'root',  //  Key for the persisted state in local storage
    storage,  //  Specify storage mechanism (localStorage by default)
    version: 1, //  Version of the persisted state
}

//  Create a persisted reducer with the root reducer and persist configuration
const persistedReducer = persistReducer(persistConfig, rootReducer)

//  Create the Redux store with persisted reducer and additional configuration
export const store = configureStore({
  reducer: persistedReducer,  //  Set the persisted reducer as the root reducer
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false, //  Disable serialization check to allow non-serializable data in Redux state
  }),
})

//  Create a persistor to persist Redux state
export const persistor = persistStore(store);