import HomePage from "./HomePage";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import SignupPage from "./AuthPage";
import { NhostProvider } from "@nhost/react";
import { nhost } from "./lib/nhost";
import { Toaster } from "@/components/ui/toaster";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// const authChecker = () => {
//   const auth = nhost.auth.isAuthenticated();
//   console.log(auth);
//   if (auth) {
//     return <HomePage />;
//   }
//   return <SignupPage />;
// }

const auth = nhost.auth.getUser();
console.log(auth);

function App() {
  return (
    <NhostProvider nhost={nhost}>
      <Toaster />
      <ToastContainer />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
      </BrowserRouter>
    </NhostProvider>
  );
}

export default App