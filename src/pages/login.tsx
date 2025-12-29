import React, { useState } from "react";
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
  ArrowRight
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

const forgotSchema = z.object({
    email: z.string().email('Invalid email address'),
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;
type ForgotForm = z.infer<typeof forgotSchema>;

const Login = () => {
    const { login } = useAuth();
    const [mode, setMode] = useState("login"); // login | register | forgot
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const role = searchParams.get('role'); // patient | therapist

    const loginForm = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '', rememberMe: 'false' },
    });

    const registerForm = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
        defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
    });

    const forgotForm = useForm<ForgotForm>({
        resolver: zodResolver(forgotSchema),
        defaultValues: { email: '' },
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
                                <img src={logo} alt="Tanish Physio" className="h-14 w-auto object-contain" />
                                <span className="text-2xl font-bold tracking-tight text-slate-900">
                                    Tanish <span className="text-green-600">Physio</span>
                                </span>
                            </div>
                        </Link>
                        <h1 className="mt-8 text-4xl font-extrabold text-slate-900 leading-tight">
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

                {/* Right Column: Auth Card */}
                <div className="lg:col-span-7 flex justify-center lg:justify-start">
                    <div className="w-full max-w-[520px] bg-white rounded-[2rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] border border-slate-100 p-8 md:p-12 relative animate-in fade-in zoom-in-95 duration-700">
                        
                        {/* Mobile Logo */}
                        <div className="lg:hidden flex justify-center mb-8">
                            <img src={logo} alt="Tanish Physio" className="h-16 w-auto" />
                        </div>

                        {/* Header */}
                        <div className="text-center lg:text-left mb-8">
                            {mode === "login" && (
                                <>
                                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                                        {role === 'therapist' ? 'Therapist Login' : 'Welcome back'}
                                    </h2>
                                    <p className="text-slate-500 mt-2 font-medium">
                                        {role === 'therapist' 
                                            ? 'Access your clinical portal and patient records' 
                                            : 'Access your personalized clinical dashboard'}
                                    </p>
                                </>
                            )}
                            {mode === "register" && (
                                <>
                                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                                        {role === 'therapist' ? 'Join as a Therapist' : 'Create account'}
                                    </h2>
                                    <p className="text-slate-500 mt-2 font-medium">
                                        {role === 'therapist'
                                            ? 'Register to start managing your clinical practice'
                                            : 'Start your journey to professional recovery today'}
                                    </p>
                                </>
                            )}
                            {mode === "forgot" && (
                                <>
                                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Reset password</h2>
                                    <p className="text-slate-500 mt-2 font-medium">Enter your email to receive recovery instructions</p>
                                </>
                            )}
                        </div>

                        {/* Tabs */}
                        {mode !== "forgot" && (
                            <div className="flex p-1 bg-green-50/50 rounded-xl mb-8 border border-green-100/50">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            onClick={() => setMode("login")}
                                            className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all duration-300 ${
                                                mode === "login" 
                                                ? "bg-white text-green-700 shadow-sm" 
                                                : "text-slate-500 hover:text-green-600"
                                            }`}
                                        >
                                            Sign In
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Already have an account? Sign in here.</p>
                                    </TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            onClick={() => setMode("register")}
                                            className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all duration-300 ${
                                                mode === "register" 
                                                ? "bg-white text-green-700 shadow-sm" 
                                                : "text-slate-500 hover:text-green-600"
                                            }`}
                                        >
                                            Create Account
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>New to Tanish Physio? Register today.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        )}

                        {/* Form Content */}
                        <div className="space-y-6">
                            {mode === "login" && (
                                <Form {...loginForm}>
                                    <form onSubmit={loginForm.handleSubmit((data) => { 
                                        login(data.email, 'User', role || 'patient'); 
                                        navigate('/'); 
                                    })} className="space-y-5">
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
                                                        <button 
                                                            type="button" 
                                                            onClick={() => setMode("forgot")}
                                                            className="text-[11px] font-bold text-green-600 hover:text-green-700 uppercase tracking-wider transition-colors"
                                                        >
                                                            Forgot?
                                                        </button>
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
                                                    className="w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 active:scale-[0.99] transition-all shadow-lg shadow-green-200 flex items-center justify-center gap-2 group"
                                                >
                                                    Sign In to Account
                                                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                                </button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Securely log in to your clinical dashboard</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </form>
                                </Form>
                            )}

                            {mode === "register" && (
                                <Form {...registerForm}>
                                    <form onSubmit={registerForm.handleSubmit((data) => { 
                                        login(data.email, data.name, role || 'patient'); 
                                        navigate('/'); 
                                    })} className="space-y-4">
                                        <FormField
                                            control={registerForm.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1">Full Name</FormLabel>
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

                                        <FormField
                                            control={registerForm.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1">Email Address</FormLabel>
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

                                        <FormField
                                            control={registerForm.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1">Create Password</FormLabel>
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
                                                    <FormLabel className="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1">Confirm Password</FormLabel>
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
                                                    type="submit" 
                                                    className="w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 active:scale-[0.99] transition-all shadow-lg shadow-green-200 mt-2"
                                                >
                                                    Create Clinical Account
                                                </button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Join Tanish Physio and start your recovery journey</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </form>
                                </Form>
                            )}

                            {mode === "forgot" && (
                                <Form {...forgotForm}>
                                    <form onSubmit={forgotForm.handleSubmit((data) => { console.log(data); setMode("login"); })} className="space-y-6">
                                        <FormField
                                            control={forgotForm.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1">Email Address</FormLabel>
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

                                        <div className="space-y-3">
                                            <button 
                                                type="submit" 
                                                className="w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 active:scale-[0.99] transition-all shadow-lg shadow-green-200"
                                            >
                                                Send Recovery Link
                                            </button>
                                            <button 
                                                type="button" 
                                                onClick={() => setMode("login")}
                                                className="w-full bg-slate-50 text-slate-600 font-bold py-4 rounded-xl hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                                            >
                                                <ArrowLeft className="h-4 w-4" />
                                                Back to Sign In
                                            </button>
                                        </div>
                                    </form>
                                </Form>
                            )}
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

export default Login;