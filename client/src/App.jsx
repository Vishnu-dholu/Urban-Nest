import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AppHeader from './components/AppHeader'
import Home from './pages/Home'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import About from './pages/About'
import Profile from './pages/Profile'
import PrivateRoute from './components/PrivateRoute'

export default function App() {
  return (
    <BrowserRouter>
        <AppHeader />
        <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/sign-in' element={<SignIn />} />
            <Route path='/sign-up' element={<SignUp />} />
            <Route path='/about' element={<About />} />
            <Route element={<PrivateRoute />}>
              <Route path='/profile' element={<Profile />} />
            </Route>
        </Routes>
    </BrowserRouter>
  )
}
