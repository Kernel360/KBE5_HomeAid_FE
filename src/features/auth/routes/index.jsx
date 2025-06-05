import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SignInPage from '../SignInPage';
import SignUpPage from '../SignUpPage';
import SelectUserTypePage from '../SelectUserTypePage';
import CustomerSignUpStep1Page from '../CustomerSignUpStep1Page';
import ManagerSignUpStep1Page from '../ManagerSignUpStep1Page';
import CustomerSignUpStep2Page from '../CustomerSignUpStep2Page';

export const AuthRoutes = () => {
  return (
    <Routes>
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/signup/select-type" element={<SelectUserTypePage />} />
      <Route path="/signup/customer/step1" element={<CustomerSignUpStep1Page />} />
      <Route path="/signup/customer/step2" element={<CustomerSignUpStep2Page />} />
      <Route path="/signup/manager/step1" element={<ManagerSignUpStep1Page />} />
      <Route path="*" element={<SignInPage />} />
    </Routes>
  );
};
