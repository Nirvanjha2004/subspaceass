import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useSignInEmailPassword, useSignUpEmailPassword } from "@nhost/react";
import { useNavigate } from "react-router-dom";

function SignupPage() {
  const [tab, setTab] = useState("signup");
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { toast } = useToast();
  const navigate = useNavigate();

  const {
    signUpEmailPassword,
    isLoading: isLoadingSignUp,
  } = useSignUpEmailPassword();

  const {
    signInEmailPassword,
    isLoading: isLoadingSignIn,
  } = useSignInEmailPassword();

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (tab === "signup") {
      try {
        const res = await signUpEmailPassword(formData.email, formData.password);
        if (res.error) {
          toast({
            title: "Error",
            description: res.error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Success",
            description: "Signup successful. Please login.",
            variant: "default",
          });
          setTab("login");
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Something went wrong during signup. Error: " + error,
          variant: "destructive",
        });
      }
    } else {
      try {
        const res = await signInEmailPassword(formData.email, formData.password);
        if (res.error) {
          toast({
            title: "Error",
            description: res.error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Success",
            description: "Login successful. Redirecting...",
            variant: "default",
          });
          navigate("/verify-email");
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Something went wrong during login. Error: " + error,
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-background to-secondary flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <Card className="p-6">
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            {/* Tabs Header */}
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="login" className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Login
              </TabsTrigger>
              <TabsTrigger value="signup" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Signup
              </TabsTrigger>
            </TabsList>

            {/* Login Form */}
            <TabsContent value="login" className="mt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  type="email"
                  placeholder="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <Input
                  type="password"
                  placeholder="Password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <Button
                  type="submit"
                  disabled={isLoadingSignIn}
                  className="w-full"
                >
                  {isLoadingSignIn ? "Processing..." : "Login"}
                </Button>
              </form>
            </TabsContent>

            {/* Signup Form */}
            <TabsContent value="signup" className="mt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  type="email"
                  placeholder="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <Input
                  type="password"
                  placeholder="Password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <Button
                  type="submit"
                  disabled={isLoadingSignUp}
                  className="w-full"
                >
                  {isLoadingSignUp ? "Processing..." : "Signup"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Footer */}
          <div className="mt-4 text-center text-sm text-muted-foreground">
            {tab === "login"
              ? "Don't have an account? Switch to Signup"
              : "Already have an account? Switch to Login"}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

export default SignupPage;
