import React, { useState } from 'react';
import Background from '@/assets/login2.png';
import Trial from '@/assets/abs.jpg';
import Victory from '@/assets/victory.svg';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client.js';
import { LOGIN_ROUTE, SIGNUP_ROUTE } from '@/utils/constants';
import { useNavigate } from 'react-router-dom';
import { userAppStore } from '@/store';

const Auth = () => {
  const navigate = useNavigate();
  const { setUserInfo } = userAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password Validation Function
  const isValidPassword = (pwd) => {
    const lengthCheck = pwd.length >= 8;
    const upperCheck = /[A-Z]/.test(pwd);
    const lowerCheck = /[a-z]/.test(pwd);
    const specialCheck = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);

    if (!lengthCheck) {
      toast.error('Password must be at least 8 characters long.');
      return false;
    }
    if (!upperCheck) {
      toast.error('Password must contain at least one uppercase letter.');
      return false;
    }
    if (!lowerCheck) {
      toast.error('Password must contain at least one lowercase letter.');
      return false;
    }
    if (!specialCheck) {
      toast.error('Password must contain at least one special character.');
      return false;
    }
    return true;
  };

  const validateSignUp = () => {
    if (!email.length) {
      toast.error('Email is required');
      return false;
    }
    if (!isValidPassword(password)) {
      return false;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    return true;
  };

  const validateLogin = () => {
    if (!email.length) {
      toast.error('Email is required');
      return false;
    }
    if (!password.length) {
      toast.error('Password is required');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (validateLogin()) {
      try {
        const response = await apiClient.post(
          LOGIN_ROUTE,
          { email, password },
          { withCredentials: true }
        );
        toast.success('User Logged In Successfully!');
        if (response.data.user.id) {
          setUserInfo(response.data.user);
          navigate(response.data.user.profileSetup ? '/chat' : '/profile');
        }
      } catch (error) {
        toast.error(error.response?.status === 400 ? 'User Does Not Exist!' : 'Internal Server Error!');
      }
    }
  };

  const handleSignUp = async () => {
    if (validateSignUp()) {
      try {
        const response = await apiClient.post(
          SIGNUP_ROUTE,
          { email, password },
          { withCredentials: true }
        );
        toast.success('User Created Successfully!');
        if (response.status === 201) {
          setUserInfo(response.data.user);
          navigate('/profile');
        }
      } catch (error) {
        toast.error(error.response?.status === 400 ? 'User Already Exists!' : 'Internal Server Error!');
      }
    }
  };

  return (
    <div className="h-[100vh] flex items-center justify-center w-full">
      <div className="h-[100vh] w-[100vw] flex justify-around items-center xl:grid-cols-2">
        {/* Left Side (Form) */}
        <div className="bg-white flex flex-col items-center justify-center gap-5 w-full h-full">
          <div className="flex items-start justify-start flex-col w-5/6">
            <div className="flex items-center justify-start">
              <h1 className="text-5xl font-bold md:text-6xl">Welcome</h1>
              <img src={Victory} className="h-[100px]" alt="Victory IMG" />
            </div>
            <p className="text-left font-normal">Fill this to get started with the best chat application.</p>
          </div>

          {/* Tabs for Login & Signup */}
          <div className="flex items-center justify-center w-full">
            <Tabs defaultValue="login" className="w-5/6 flex items-center justify-center flex-col">
              <TabsList className="w-full bg-transparent rounded-none">
                <TabsTrigger
                  value="signup"
                  className="data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2 rounded-none w-full data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:border-b-purple-500 p-3 transition-all duration-300"
                >
                  Sign Up
                </TabsTrigger>
                <TabsTrigger
                  value="login"
                  className="data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2 rounded-none w-full data-[state=active]:text-black data-[state=active]:font-semibold data-[state=active]:border-b-purple-500 p-3 transition-all duration-300"
                >
                  Login
                </TabsTrigger>
              </TabsList>

              {/* Sign Up Tab */}
              <TabsContent className="flex flex-col mt-5 w-full gap-3" value="signup">
                <Input placeholder="Email" className="rounded-xl p-6" value={email} onChange={(e) => setEmail(e.target.value)} />
                <Input
                  placeholder="Password"
                  type="password"
                  className="rounded-xl p-6"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Input
                  placeholder="Confirm Password"
                  type="password"
                  className="rounded-xl p-6"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Button onClick={handleSignUp} className="rounded-full p-6 hover:bg-opacity-60">
                  Sign Up
                </Button>
              </TabsContent>

              {/* Login Tab */}
              <TabsContent className="flex flex-col w-full gap-3" value="login">
                <Input placeholder="Email" className="rounded-xl p-6" value={email} onChange={(e) => setEmail(e.target.value)} />
                <Input
                  placeholder="Password"
                  type="password"
                  className="rounded-xl p-6"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button onClick={handleLogin} className="rounded-full p-6 hover:bg-opacity-60">
                  Login
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Right Side (Image) */}
        <div className="hidden md:flex items-center justify-center w-full">
          <img src={Trial} className="h-screen w-full object-cover" alt="Background IMG" />
        </div>
      </div>
    </div>
  );
};

export default Auth;
