import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { SignUp } from "./pages/SignUp";
import { AuthenticatedRoutes } from './components/AuthenticatedRoutes/AuthenticatedRoutes';

export const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/signup" element={<SignUp />} />
      <Route path="*" element={<AuthenticatedRoutes />} />
    </Routes>
  </BrowserRouter>
);
