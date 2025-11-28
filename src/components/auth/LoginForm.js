import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Input } from '@components/common';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '@contexts/AuthContext';
export const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { signIn } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/dashboard';
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            const { data, error: signInError } = await signIn(email, password);
            if (signInError) {
                setError(signInError.message || 'Failed to login. Please check your credentials.');
                setIsLoading(false);
                return;
            }
            if (data) {
                // Successfully logged in
                navigate(from, { replace: true });
            }
        }
        catch (err) {
            setError(err.message || 'An unexpected error occurred');
            setIsLoading(false);
        }
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [error && (_jsx("div", { className: "bg-error/10 border border-error text-error px-4 py-3 rounded-lg text-sm", children: error })), _jsx(Input, { type: "email", label: "Email", placeholder: "Enter your email", value: email, onChange: (e) => setEmail(e.target.value), leftIcon: _jsx(Mail, { size: 20 }), required: true, disabled: isLoading }), _jsx(Input, { type: "password", label: "Password", placeholder: "Enter your password", value: password, onChange: (e) => setPassword(e.target.value), leftIcon: _jsx(Lock, { size: 20 }), required: true, disabled: isLoading }), _jsx(Button, { type: "submit", className: "w-full", isLoading: isLoading, disabled: isLoading, children: "Login" })] }));
};
