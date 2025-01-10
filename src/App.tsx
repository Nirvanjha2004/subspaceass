import HomePage from "./HomePage";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import SignupPage from "./AuthPage";
import { NhostProvider } from "@nhost/react";
import { nhost } from "./lib/nhost";
import { Toaster } from "@/components/ui/toaster";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProtectedRoute from "./ProtectedRoute";
import VerifyEmailPage from "./VerifyEmailPage";


function App() {
  return (
    <NhostProvider nhost={nhost}>
      <Toaster />
      <ToastContainer />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
        </Routes>
      </BrowserRouter>
    </NhostProvider>
  );
}

export default App