import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, Navigate } from 'react-router-dom';
import { SignUpForm } from '@components/auth';
import { useAuth } from '@contexts/AuthContext';
export const SignUpPage = () => {
    const { user, loading } = useAuth();
    // Redirect if already logged in
    if (!loading && user) {
        return _jsx(Navigate, { to: "/dashboard", replace: true });
    }
    return (_jsx("div", { className: "min-h-screen bg-background py-8", children: _jsx("div", { className: "container mx-auto px-4 max-w-md", children: _jsxs("div", { className: "bg-surface rounded-lg shadow-md p-6 md:p-8", children: [_jsx("h1", { className: "text-3xl font-bold text-text mb-6 text-center", children: "Sign Up" }), _jsx(SignUpForm, {}), _jsxs("p", { className: "mt-4 text-center text-text-light", children: ["Already have an account?", ' ', _jsx(Link, { to: "/login", className: "text-primary hover:underline", children: "Login" })] })] }) }) }));
};
