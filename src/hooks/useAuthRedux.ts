import { useDispatch, useSelector } from 'react-redux';
import { login, register, logout, fetchProfile, clearError } from '../store/authSlice';
import { RootState, AppDispatch } from '../store';
import { useNavigate } from 'react-router-dom';
import { useToast } from './use-toast';

export const useAuthRedux = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { user, isAuthenticated, loading, error } = useSelector(
    (state: RootState) => state.auth
  );

  const handleLogin = async (email: string, password: string) => {
    try {
      const result = await dispatch(login({ email, password }));
      if (login.fulfilled.match(result)) {
        toast({
          title: "Login Successful",
          description: "You have been successfully logged in.",
        });
        navigate('/');
      } else if (login.rejected.match(result)) {
        toast({
          title: "Login Failed",
          description: result.payload as string,
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Login Failed",
        description: "An error occurred during login.",
        variant: "destructive",
      });
    }
  };

  const handleRegister = async (name: string, email: string, password: string, phone?: string) => {
    try {
      const result = await dispatch(register({ name, email, password, phone }));
      if (register.fulfilled.match(result)) {
        toast({
          title: "Registration Successful",
          description: "Your account has been created successfully.",
        });
        navigate('/');
      } else if (register.rejected.match(result)) {
        toast({
          title: "Registration Failed",
          description: result.payload as string,
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Registration Failed",
        description: "An error occurred during registration.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await dispatch(logout());
      toast({
        title: "Logout Successful",
        description: "You have been successfully logged out.",
      });
      navigate('/login');
    } catch (err) {
      toast({
        title: "Logout Failed",
        description: "An error occurred during logout.",
        variant: "destructive",
      });
    }
  };

  const clearAuthError = () => {
    dispatch(clearError());
  };

  return {
    user,
    isAuthenticated,
    loading,
    error,
    handleLogin,
    handleRegister,
    handleLogout,
    clearAuthError,
  };
};