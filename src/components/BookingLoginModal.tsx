import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { login, clearError } from "@/store/slices/authSlice";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";

interface BookingLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
  email?: string;
}

const BookingLoginModal: React.FC<BookingLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,

  onLoginError,

  email: initialEmail = "",
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    email: initialEmail,
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      dispatch(clearError());
      setFormData({
        email: initialEmail,
        password: "",
      });
    }
  }, [isOpen, dispatch, initialEmail]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    dispatch(clearError());

    try {
      const result = await dispatch(
        login({
          email: formData.email,
          password: formData.password,
        })
      );

      // ✅ SUCCESS CASE
      if (login.fulfilled.match(result)) {
        toast({
          title: "Success",
          description: "Login successful! You can continue your booking.",
        });

        onLoginSuccess?.();
        onClose(); // ONLY here modal closes
      } else if (login.rejected.match(result)) {
        // FAILED CASE - keep modal open
        // The error will be displayed automatically from the Redux state
        console.log("Login failed, keeping modal open");
        onLoginError?.();
      }
    } catch (error) {
      console.error("Login error:", error);
      // Still keep modal open on unexpected errors
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      // Only allow closing when not in loading state and explicitly requested
      if (!loading && !open) {
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Welcome Back
          </DialogTitle>
          <DialogDescription className="text-center">
            Please login to continue with your booking
          </DialogDescription>
        </DialogHeader>

        <Card className="border-0 shadow-none">
          <CardHeader className="space-y-1 p-0 pb-4">
            <CardTitle className="text-xl text-center">
              Login to Your Account
            </CardTitle>
            <CardDescription className="text-center">
              Enter your credentials
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Redux Error Display */}
              {error && (
                <div className="text-sm text-destructive text-center">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default BookingLoginModal;
