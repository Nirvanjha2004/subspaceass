import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, LogIn } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { nhost } from './lib/nhost';
import { useNavigate } from 'react-router-dom';

function SignupPage() {
  const [tab, setTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({email: "", password: "" });
  const { toast } = useToast();
  const navigate = useNavigate();


  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Simulate signup/login API calls
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (tab === "signup") {
        await nhost.auth.signUp({
          email: formData.email,
          password: formData.password,
        }).then( () => {
          toast({
            title: "Success",
            description: "Signup successful",
            variant: "default",
          });
          // navigate('/');
          setLoading(false);
        });
      } else {
        await nhost.auth.signIn({
          email: formData.email,
          password: formData.password,
        }).then(() => {
          toast({
            title: "Success",
            description: "Login successful",
            variant: "default",
          });
          navigate("/");
          setLoading(false);
        });
      }
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });

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
          <Tabs defaultValue="login" onValueChange={setTab} className="w-full">
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
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Processing..." : "Login"}
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
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Processing..." : "Signup"}
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
