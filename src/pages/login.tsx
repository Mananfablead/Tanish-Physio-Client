import React, { useState } from "react";
import logo from '../assets/logo.webp';
import { Mail, Lock, User } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Link, useNavigate } from 'react-router-dom';
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
    const [mode, setMode] = useState("login"); // login | register | forgot
    const navigate = useNavigate();

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

    return (
        <div className="min-h-screen flex items-center justify-center ">
            <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-8">
                <div className="flex justify-center mb-6">
                    <Link to="/">
                        <img
                            src={logo}
                            alt="Logo"
                            className="h-20 w-auto object-contain cursor-pointer"
                        />
                    </Link>
                </div>

                {/* Tabs (Hide on Forgot Password) */}
                {mode !== "forgot" && (
                    <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setMode("login")}
                            className={`w-1/2 py-2 rounded-lg text-sm font-medium transition ${mode === "login"
                                    ? "bg-white shadow text-indigo-600"
                                    : "text-gray-500"
                                }`}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => setMode("register")}
                            className={`w-1/2 py-2 rounded-lg text-sm font-medium transition ${mode === "register"
                                    ? "bg-white shadow text-indigo-600"
                                    : "text-gray-500"
                                }`}
                        >
                            Sign Up
                        </button>
                    </div>
                )}

                {/* LOGIN */}
                {mode === "login" && (
                    <Form {...loginForm}>
                        <form onSubmit={loginForm.handleSubmit((data) => { console.log(data); navigate('/'); })}>
                            {/* Social Login */}
                            {/* <button className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2 mb-3 hover:bg-gray-100">
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                  className="w-5 h-5"
                />
                Continue with Google
              </button>

              <button className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2 mb-3 hover:bg-gray-100">
                <img
                  src="https://www.svgrepo.com/show/475647/facebook-color.svg"
                  alt="Facebook"
                  className="w-5 h-5"
                />
                Continue with Facebook
              </button>

              <div className="text-center text-gray-400 text-sm mb-4">OR</div> */}

                            <FormField
                                control={loginForm.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="mb-3">
                                        <FormControl>
                                            <div className="relative">
                                                <input
                                                    {...field}
                                                    type="email"
                                                    placeholder="Email"
                                                    className="w-full border rounded-lg px-4 py-2 pl-10 focus:ring-2 focus:ring-indigo-500"
                                                />
                                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={loginForm.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem className="mb-4">
                                        <FormControl>
                                            <div className="relative">
                                                <input
                                                    {...field}
                                                    type="password"
                                                    placeholder="Password"
                                                    className="w-full border rounded-lg px-4 py-2 pl-10 focus:ring-2 focus:ring-indigo-500"
                                                />
                                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}


                            />
                            <FormField
                                control={loginForm.control}
                                name="rememberMe"
                                render={({ field }) => (
                                    <FormItem className="mb-4 flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={field.value}
                                                onChange={field.onChange}
                                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <label className="text-sm text-gray-600">
                                                Remember me
                                            </label>
                                        </div>
                                    </FormItem>
                                )}
                            />


                            <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
                                Sign In
                            </button>

                            <div className="text-center mt-4 text-sm">
                                <span
                                    className="text-indigo-600 cursor-pointer"
                                    onClick={() => setMode("forgot")}
                                >
                                    Forgot Password?
                                </span>
                            </div>
                        </form>
                    </Form>
                )}

                {/* REGISTER */}
                {mode === "register" && (
                    <Form {...registerForm}>
                        <form onSubmit={registerForm.handleSubmit((data) => { console.log(data); navigate('/'); })}>
                            {/* Social Signup */}
                            {/* <button className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2 mb-3 hover:bg-gray-100">
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                  className="w-5 h-5"
                />
                Sign up with Google
              </button>

              <button className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2 mb-3 hover:bg-gray-100">
                <img
                  src="https://www.svgrepo.com/show/475647/facebook-color.svg"
                  alt="Facebook"
                  className="w-5 h-5"
                />
                Sign up with Facebook
              </button> */}

                            {/* <div className="text-center text-gray-400 text-sm mb-4">OR</div> */}

                            <FormField
                                control={registerForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="mb-3">
                                        <FormControl>
                                            <div className="relative">
                                                <input
                                                    {...field}
                                                    type="text"
                                                    placeholder="Full Name"
                                                    className="w-full border rounded-lg px-4 py-2 pl-10"
                                                />
                                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={registerForm.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="mb-3">
                                        <FormControl>
                                            <div className="relative">
                                                <input
                                                    {...field}
                                                    type="email"
                                                    placeholder="Email"
                                                    className="w-full border rounded-lg px-4 py-2 pl-10"
                                                />
                                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={registerForm.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem className="mb-4">
                                        <FormControl>
                                            <div className="relative">
                                                <input
                                                    {...field}
                                                    type="password"
                                                    placeholder="Password"
                                                    className="w-full border rounded-lg px-4 py-2 pl-10"
                                                />
                                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={registerForm.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem className="mb-4">
                                        <FormControl>
                                            <div className="relative">
                                                <input
                                                    {...field}
                                                    type="password"
                                                    placeholder="Confirm Password"
                                                    className="w-full border rounded-lg px-4 py-2 pl-10"
                                                />
                                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
                                Create Account
                            </button>

                            <div className="text-center mt-4 text-sm">
                                <span
                                    className="text-indigo-600 cursor-pointer"
                                    onClick={() => setMode("forgot")}
                                >
                                    Forgot Password?
                                </span>
                            </div>
                        </form>
                    </Form>
                )}

                {/* FORGOT PASSWORD */}
                {mode === "forgot" && (
                    <Form {...forgotForm}>
                        <form onSubmit={forgotForm.handleSubmit((data) => { console.log(data); navigate('/'); })}>
                            <h2 className="text-2xl font-bold text-center mb-6">
                                Forgot Password
                            </h2>

                            <FormField
                                control={forgotForm.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="mb-4">
                                        <FormControl>
                                            <div className="relative">
                                                <input
                                                    {...field}
                                                    type="email"
                                                    placeholder="Enter your email"
                                                    className="w-full border rounded-lg px-4 py-2 pl-10"
                                                />
                                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
                                Reset Password
                            </button>

                            <div className="text-center mt-4 text-sm">
                                <span
                                    className="text-indigo-600 cursor-pointer"
                                    onClick={() => setMode("login")}
                                >
                                    Back to Login
                                </span>
                            </div>
                        </form>
                    </Form>
                )}

            </div>
        </div>
    );
};

export default Login;
