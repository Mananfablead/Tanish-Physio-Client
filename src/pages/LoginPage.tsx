import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { 
  ClipboardList, 
  UserCheck, 
  Video, 
  Star, 
  Shield, 
  Award,
  ArrowRight,
  CheckCircle,
  Users,
  Clock,
  Activity,
  HeartPulse,
  Stethoscope,
  Bone,
  Dumbbell,
  Zap,
  Quote,
  HelpCircle,
  Lock,
  ShieldCheck,
  AlertCircle,
  Stethoscope,
  Activity,
  Clock,
  ClipboardList,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import { login } from '@/store/slices/authSlice';
import { selectAuthLoading, selectCurrentUser } from '@/store/slices/authSlice';
import { useToast } from '@/hooks/use-toast';

import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip";

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    rememberMe: z.string().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

const LoginPage = () => {
    const dispatch: any = useDispatch();
    const navigate = useNavigate();
    const loading = useSelector(selectAuthLoading);
    const error = useSelector((state: any) => state.auth.error);
    const user = useSelector(selectCurrentUser);
    const { toast } = useToast();
    
    const location = useLocation() as any;
    
    // Redirect if already logged in
    if (user) {
        // Check for redirect after login in sessionStorage
        const redirectAfterLogin = sessionStorage.getItem('redirect_after_login');
        if (redirectAfterLogin) {
            sessionStorage.removeItem('redirect_after_login'); // Clean up
            navigate(redirectAfterLogin, { replace: true });
        } else {
            // Check if there's a redirect location in state
            const from = location.state?.from?.pathname || '/';
            navigate(from, { replace: true });
        }
    }

    const loginForm = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '', rememberMe: 'false' },
    });

    const valuePoints = [
        // {
        //     icon: ShieldCheck,
        //     title: "Clinical Grade Security",
        //     description: "Encrypted, HIPAA-compliant patient data handling."
        // },
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
                        <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
                            <div className="flex items-center gap-3">
                                <img src={logo} alt="Tanish Physio" className="h-20 w-auto object-contain" />
                                <span className="text-2xl font-bold tracking-tight text-slate-900">
                                    Tanish <span className="text-green-600">Physio & Fitness</span>
                                </span>
                            </div>
                        </Link>
                        <h1 className="mt-8 text-3xl font-extrabold text-slate-900 leading-tight">
                            Premium Healthcare <br />
                            <span className="text-green-600">At Your Fingertips</span>
                        </h1>
                        <p className="mt-4 text-lg text-slate-600 font-medium max-w-md">
                            Join thousands of patients who have accelerated their recovery through our clinically-backed digital platform.
                        </p>
                    </div>

                    <div className="space-y-8">
                        {valuePoints.map((point, index) => (
                            <div key={index} className="flex gap-4 group">
                                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white shadow-sm border border-green-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <point.icon className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">{point.title}</h3>
                                    <p className="text-slate-500 text-sm mt-1 font-medium">{point.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-4 flex items-center gap-2 text-slate-400">
                        <ShieldAlert className="h-4 w-4 text-green-500" />
                        <span className="text-xs font-semibold tracking-wide">Trusted by leading clinical practitioners worldwide.</span>
                    </div>
                </div>

                {/* Right Column: Login Card */}
                <div className="lg:col-span-7 flex justify-center lg:justify-start">
                    <div className="w-full max-w-[520px] bg-white rounded-[2rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] border border-slate-100 p-8 md:p-12 relative animate-in fade-in zoom-in-95 duration-700">
                        
                        {/* Mobile Logo */}
                        <div className="lg:hidden flex justify-center mb-8">
                            <img src={logo} alt="Tanish Physio" className="h-16 w-auto" />
                        </div>

                        {/* Header */}
                        <div className="text-center lg:text-left mb-8">
                            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                                Welcome back
                            </h2>
                            <p className="text-slate-500 mt-2 font-medium">
                                Access your personalized clinical dashboard
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
                            
                            <Form {...loginForm}>
                                <form onSubmit={loginForm.handleSubmit(async (data) => { 
                                    try {
                                        const result = await dispatch(login({
                                            email: data.email,
                                            password: data.password
                                        }));
                                        
                                        if (login.fulfilled.match(result)) {
                                            // Show success toast
                                            toast({
                                                title: "Login Successful",
                                                description: `Welcome back, ${data.email}!`,
                                            });
                                            
                                            // Check if there was a pending booking from guest checkout
                                            const pendingBooking = sessionStorage.getItem('qw_pending_booking');
                                            if (pendingBooking) {
                                                // Remove the pending booking data
                                                sessionStorage.removeItem('qw_pending_booking');
                                                // Navigate to profile where they can manage their booking
                                                navigate('/profile', { replace: true });
                                            } else {
                                                // Check for redirect after login in sessionStorage
                                                const redirectAfterLogin = sessionStorage.getItem('redirect_after_login');
                                                if (redirectAfterLogin) {
                                                    sessionStorage.removeItem('redirect_after_login'); // Clean up
                                                    navigate(redirectAfterLogin, { replace: true });
                                                } else {
                                                    // Redirect to intended location or home
                                                    const from = location.state?.from?.pathname || '/';
                                                    navigate(from, { replace: true });
                                                }
                                            }
                                        } else {
                                            // Handle error
                                            throw result.payload;
                                        }
                                    } catch (error) {
                                        // Error is handled by Redux and displayed through useSelector
                                    }
                                })} className="space-y-5" noValidate>
                                    <FormField
                                        control={loginForm.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1">Email Address</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <input
                                                            {...field}
                                                            type="email"
                                                            placeholder="name@clinical.com"
                                                            className="w-full bg-green-50/30 border border-slate-200 rounded-xl px-4 py-4 pl-12 focus:ring-4 focus:ring-green-500/10 focus:border-green-500 focus:bg-white transition-all outline-none font-medium placeholder:text-slate-400"
                                                        />
                                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="text-xs font-medium text-red-500" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={loginForm.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <div className="flex justify-between items-center ml-1">
                                                    <FormLabel className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Password</FormLabel>
                                                    <Link 
                                                        to="/forgot-password"
                                                        className="text-[11px] font-bold text-primary hover:text-green-700 uppercase tracking-wider transition-colors"
                                                    >
                                                        Forgot?
                                                    </Link>
                                                </div>
                                                <FormControl>
                                                    <div className="relative">
                                                        <input
                                                            {...field}
                                                            type="password"
                                                            placeholder="••••••••"
                                                            className="w-full bg-green-50/30 border border-slate-200 rounded-xl px-4 py-4 pl-12 focus:ring-4 focus:ring-green-500/10 focus:border-green-500 focus:bg-white transition-all outline-none font-medium placeholder:text-slate-400"
                                                        />
                                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="text-xs font-medium text-red-500" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={loginForm.control}
                                        name="rememberMe"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center space-x-2 space-y-0 py-1 ml-1">
                                                <input
                                                    type="checkbox"
                                                    checked={!!field.value}
                                                    onChange={field.onChange}
                                                    id="rememberMe"
                                                    className="h-4 w-4 rounded border-slate-300 text-green-600 focus:ring-green-500 transition-all cursor-pointer"
                                                />
                                                <label htmlFor="rememberMe" className="text-sm text-slate-600 font-medium cursor-pointer select-none">
                                                    Keep me signed in for 30 days
                                                </label>
                                            </FormItem>
                                        )}
                                    />

                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button 
                                                type="submit" 
                                                disabled={loading}
                                                className="w-full bg-primary text-white font-bold py-4 rounded-xl  active:scale-[0.99] transition-all shadow-lg shadow-green-200 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                                            >
                                                {loading ? (
                                                    <>
                                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Signing In...
                                                    </>
                                                ) : (
                                                    <>
                                                        Sign In to Account
                                                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                                    </>
                                                )}
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Securely log in to your clinical dashboard</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </form>
                            </Form>
                            
                            <div className="text-center mt-6">
                                <p className="text-sm text-slate-600 font-medium">
                                    Don't have an account?{' '}
                                    <Link to="/register" className="text-primary font-bold hover:text-green-700 transition-colors">
                                        Sign up here
                                    </Link>
                                </p>
                            </div>
                        </div>

                        {/* Trust Microcopy */}
                        {/* <div className="mt-8 pt-8 border-t border-slate-100 text-center">
                            <div className="flex items-center justify-center gap-2 text-slate-400 mb-1">
                                <ShieldCheck className="h-4 w-4 text-green-500" />
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Secure Patient Portal</span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-medium">
                                Your clinical data is protected by hospital-grade AES-256 encryption.
                            </p>
                        </div> */}
                    </div>
                </div>
            </div>
            </div>
        </TooltipProvider>
    );
};

export default LoginPage;