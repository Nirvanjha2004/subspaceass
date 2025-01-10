import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthenticationStatus, useNhostClient } from "@nhost/react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function VerifyEmailPage() {
  const { isAuthenticated } = useAuthenticationStatus();
  const nhost = useNhostClient();
  const navigate = useNavigate();

  const handleVerifyEmail = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to verify your email.");
      return;
    }

    try {
      const user = nhost.auth.getUser();
      console.log(user);
      if (user && user.emailVerified) {
        toast.success("Your email is verified!");
        navigate("/");
      } else {
        toast.error("Your email is not verified. Please check your inbox.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-lg w-full"
      >
        <Card className="p-8 shadow-xl rounded-lg bg-white/90 backdrop-blur-md">
          <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">
            Verify Your Email
          </h2>
          <p className="text-sm text-gray-600 text-center mb-6">
            Please check your inbox for a verification link to complete your registration.
          </p>

          <Tabs defaultValue="verify" className="w-full">
            {/* Tabs Header */}
            <TabsList className="grid grid-cols-1 mb-4">
              <TabsTrigger
                value="verify"
                className="flex items-center justify-center gap-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md px-4 py-2 transition-all"
                onClick={handleVerifyEmail}
              >
                Verified
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </Card>
      </motion.div>
    </div>
  );
}

export default VerifyEmailPage;
