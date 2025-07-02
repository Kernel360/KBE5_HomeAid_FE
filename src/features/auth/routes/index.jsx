import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SignInPage from '../SignInPage';
import SignUpPage from '../SignUpPage';
import SelectUserTypePage from '../SelectUserTypePage';
import CustomerSignUpStep1Page from '../CustomerSignUpStep1Page';
import ManagerSignUpStep1Page from '../ManagerSignUpStep1Page';
import ManagerSignUpStep2Page from '../ManagerSignUpStep2Page';
import AdminLoginPage from '../AdminLoginPage';

const AuthRoutes = () => (
  <Routes>
    <Route path="signin" element={<SignInPage />} />
    <Route path="signup" element={<SignUpPage />} />
    <Route path="signup/select" element={<SelectUserTypePage />} />
    <Route path="signup/customer/step1" element={<CustomerSignUpStep1Page />} />
    <Route path="signup/manager/step1" element={<ManagerSignUpStep1Page />} />
    <Route path="signup/manager/step2" element={<ManagerSignUpStep2Page />} />
    <Route path="admin/signin" element={<AdminLoginPage />} />
  </Routes>
);

export default AuthRoutes;
