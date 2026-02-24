import React from "react";
import logo from '../assets/logo.webp';
import { 
  Mail, 
  Lock, 
  User, 
  ShieldCheck, 
  ArrowLeft, 
  KeyRound, 
  Shield, 
  CheckCircle2,
  LogIn,
  UserPlus,
  AlertCircle,
  Stethoscope,
  Activity,
  Clock,
  ClipboardList,
  ShieldAlert,
  ArrowRight,
  Phone
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '@/store/slices/authSlice';
import { selectAuthLoading, selectCurrentUser } from '@/store/slices/authSlice';
import { useToast } from '@/hooks/use-toast';

import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip";

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address').min(1, 'Email is required'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits').max(15, 'Phone number cannot exceed 15 digits'),
    
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

const RegisterPage = () => {
    const dispatch: any = useDispatch();
    const navigate = useNavigate();
    const loading = useSelector(selectAuthLoading);
    const error = useSelector((state: any) => state.auth.error);
    const user = useSelector(selectCurrentUser);
    const { toast } = useToast();
    
    const location = useLocation() as any;
    
    // Redirect if already logged in
    if (user) {
        // Check if there's a redirect location in state
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
    }

    const registerForm = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
        defaultValues: { name: '', email: '', phone: '', password: '', confirmPassword: '' },
    });

    const valuePoints = [
  
        {
            icon: Stethoscope,
            title: "Professional Oversight",
            description: "Direct connection with certified physiotherapy experts."
        },
        {
            icon: Activity,
            title: "Evidence-Based Plans",
            description: "Personalized recovery paths based on clinical assessments."
        },
        {
            icon: Clock,
            title: "Seamless Access",
            description: "Manage your appointments and exercises from any device."
        }
    ];

    return (
      <TooltipProvider>
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50/30 flex items-center justify-center p-4 md:p-6 lg:p-8">
          <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Brand & Value Props (Hidden on mobile) */}
            <div className="hidden lg:flex lg:col-span-5 flex-col space-y-12 pr-8 animate-in fade-in slide-in-from-left-8 duration-700">
              <div>
                <Link
                  to="/"
                  className="inline-block hover:opacity-90 transition-opacity"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={logo}
                      alt="Tanish Physio & Fitness"
                      className="h-20 w-auto object-contain"
                    />
                    <span className="text-2xl font-bold tracking-tight text-slate-900">
                      Tanish{" "}
                      <span className="text-green-600">Physio & Fitness</span>
                    </span>
                  </div>
                </Link>
                <h1 className="mt-8 text-3xl font-extrabold text-slate-900 leading-tight">
                  Premium Healthcare <br />
                  <span className="text-green-600">At Your Fingertips</span>
                </h1>
                <p className="mt-4 text-lg text-slate-600 font-medium max-w-md">
                  Join thousands of patients who have accelerated their recovery
                  through our clinically-backed digital platform.
                </p>
              </div>

              <div className="space-y-8">
                {valuePoints.map((point, index) => (
                  <div key={index} className="flex gap-4 group">
                    <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white shadow-sm border border-green-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <point.icon className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                        {point.title}
                      </h3>
                      <p className="text-slate-500 text-sm mt-1 font-medium">
                        {point.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex items-center gap-2 text-slate-400">
                <ShieldAlert className="h-4 w-4 text-green-500" />
                <span className="text-xs font-semibold tracking-wide">
                  Trusted by leading clinical practitioners worldwide.
                </span>
              </div>
            </div>

            {/* Right Column: Register Card */}
            <div className="lg:col-span-7 flex justify-center lg:justify-start">
              <div className="w-full  bg-white rounded-[2rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] border border-slate-100 p-8 md:p-12 relative animate-in fade-in zoom-in-95 duration-700">
                {/* Mobile Logo */}
                <div className="lg:hidden flex justify-center mb-8">
                  <img
                    src={logo}
                    alt="Tanish Physio & Fitness"
                    className="h-16 w-auto"
                  />
                </div>

                {/* Header */}
                <div className="text-center lg:text-left mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                    Create account
                  </h2>
                  <p className="text-slate-500 mt-2 font-medium">
                    Start your journey to professional recovery today
                  </p>
                </div>

                {/* Form Content */}
                <div className="space-y-6">
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                      <div className="flex items-center gap-2 text-red-700">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">{error}</span>
                      </div>
                    </div>
                  )}

                  <Form {...registerForm}>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        registerForm.handleSubmit(async (data) => {
                          try {
                            const result = await dispatch(
                              register({
                                name: data.name,
                                email: data.email,
                                phone: data.phone,
                                password: data.password,
                              })
                            );

                            if (register.fulfilled.match(result)) {
                              // Show success toast
                              toast({
                                title: "Registration Successful",
                                description: `Welcome, ${data.name}! Your account has been created.`,
                              });

                              // Redirect to intended location or home
                              const from = location.state?.from?.pathname || "/";
                              navigate(from, { replace: true });
                            } else {
                              // Handle error
                              throw result.payload;
                            }
                          } catch (error) {
                            // Error is handled by Redux and displayed through useSelector
                          }
                        })(e);
                        return false;
                      }}
                      className="space-y-4"
                      noValidate
                    >
                      <FormField
                        control={registerForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                              Full Name
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <input
                                  {...field}
                                  type="text"
                                  placeholder="John Doe"
                                  className="w-full bg-green-50/30 border border-slate-200 rounded-xl px-4 py-4 pl-12 focus:ring-4 focus:ring-green-500/10 focus:border-green-500 focus:bg-white transition-all outline-none font-medium"
                                />
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                              </div>
                            </FormControl>
                            <FormMessage className="text-xs font-medium text-red-500" />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                                Phone Number
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <input
                                    {...field}
                                    type="tel"
                                    placeholder="Enter your phone number"
                                    className="w-full bg-green-50/30 border border-slate-200 rounded-xl px-4 py-4 pl-12 focus:ring-4 focus:ring-green-500/10 focus:border-green-500 focus:bg-white transition-all outline-none font-medium"
                                  />
                                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                                </div>
                              </FormControl>
                              <FormMessage className="text-xs font-medium text-red-500" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                                Email Address
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <input
                                    {...field}
                                    type="email"
                                    placeholder="name@example.com"
                                    className="w-full bg-green-50/30 border border-slate-200 rounded-xl px-4 py-4 pl-12 focus:ring-4 focus:ring-green-500/10 focus:border-green-500 focus:bg-white transition-all outline-none font-medium"
                                  />
                                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                                </div>
                              </FormControl>
                              <FormMessage className="text-xs font-medium text-red-500" />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                              Create Password
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <input
                                  {...field}
                                  type="password"
                                  placeholder="••••••••"
                                  className="w-full bg-green-50/30 border border-slate-200 rounded-xl px-4 py-4 pl-12 focus:ring-4 focus:ring-green-500/10 focus:border-green-500 focus:bg-white transition-all outline-none font-medium"
                                />
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                              </div>
                            </FormControl>
                            <FormMessage className="text-xs font-medium text-red-500" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                              Confirm Password
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <input
                                  {...field}
                                  type="password"
                                  placeholder="••••••••"
                                  className="w-full bg-green-50/30 border border-slate-200 rounded-xl px-4 py-4 pl-12 focus:ring-4 focus:ring-green-500/10 focus:border-green-500 focus:bg-white transition-all outline-none font-medium"
                                />
                                <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                              </div>
                            </FormControl>
                            <FormMessage className="text-xs font-medium text-red-500" />
                          </FormItem>
                        )}
                      />

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => {
                              registerForm.handleSubmit(async (data) => {
                                try {
                                  const result = await dispatch(
                                    register({
                                      name: data.name,
                                      email: data.email,
                                      phone: data.phone,
                                      password: data.password,
                                    })
                                  );

                                  if (register.fulfilled.match(result)) {
                                    // Show success toast
                                    toast({
                                      title: "Registration Successful",
                                      description: `Welcome, ${data.name}! Your account has been created.`,
                                    });

                                    // Redirect to intended location or home
                                    const from = location.state?.from?.pathname || "/";
                                    navigate(from, { replace: true });
                                  } else {
                                    // Handle error
                                    throw result.payload;
                                  }
                                } catch (error) {
                                  // Error is handled by Redux and displayed through useSelector
                                }
                              })();
                            }}
                            disabled={loading}
                            className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-primary active:scale-[0.99] transition-all shadow-lg shadow-green-200 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                          >
                            {loading ? (
                              <>
                                <svg
                                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                                Creating Account...
                              </>
                            ) : (
                              "Create Your Account"
                            )}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Join Tanish Physio & Fitness and start your recovery
                            journey
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </form>
                  </Form>

                  <div className="text-center mt-6">
                    <p className="text-sm text-slate-600 font-medium">
                      Already have an account?{" "}
                      <Link
                        to="/login"
                        className="text-primary font-bold hover:text-green-700 transition-colors"
                      >
                        Sign in here
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </TooltipProvider>
    );
};

export default RegisterPage;