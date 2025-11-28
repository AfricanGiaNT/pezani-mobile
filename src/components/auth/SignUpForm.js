import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button, Input } from '@components/common';
import { Mail, Lock, User, Phone } from 'lucide-react';
import { useAuth } from '@contexts/AuthContext';
import { signUpSchema } from '@utils/validation';
export const SignUpForm = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
        phone: '',
        role: 'tenant'
    });
    const [errors, setErrors] = useState({});
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { signUp } = useAuth();
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setErrors({});
        setIsLoading(true);
        try {
            // Validate form data
            const validationResult = signUpSchema.safeParse({
                email: formData.email,
                password: formData.password,
                full_name: formData.fullName,
                phone: formData.phone,
                role: formData.role
            });
            if (!validationResult.success) {
                const fieldErrors = {};
                validationResult.error.issues.forEach((issue) => {
                    if (issue.path[0]) {
                        fieldErrors[issue.path[0]] = issue.message;
                    }
                });
                setErrors(fieldErrors);
                setIsLoading(false);
                return;
            }
            // Sign up user
            const { data, error: signUpError } = await signUp(formData.email, formData.password, formData.fullName, formData.phone, formData.role);
            if (signUpError) {
                setError(signUpError.message || 'Failed to create account. Please try again.');
                setIsLoading(false);
                return;
            }
            if (data) {
                // Successfully signed up
                if (formData.role === 'agent') {
                    toast.success('Your agent application is under review. You will be notified once approved.');
                }
                else {
                    toast.success('Registration successful! Please check your email to verify your account.');
                }
                navigate('/login');
            }
        }
        catch (err) {
            setError(err.message || 'An unexpected error occurred');
            setIsLoading(false);
        }
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [error && (_jsx("div", { className: "bg-error/10 border border-error text-error px-4 py-3 rounded-lg text-sm", children: error })), _jsx(Input, { type: "text", label: "Full Name", placeholder: "Enter your full name", value: formData.fullName, onChange: (e) => setFormData({ ...formData, fullName: e.target.value }), leftIcon: _jsx(User, { size: 20 }), error: errors.full_name, required: true, disabled: isLoading }), _jsx(Input, { type: "email", label: "Email", placeholder: "Enter your email", value: formData.email, onChange: (e) => setFormData({ ...formData, email: e.target.value }), leftIcon: _jsx(Mail, { size: 20 }), error: errors.email, required: true, disabled: isLoading }), _jsx(Input, { type: "tel", label: "Phone", placeholder: "+265 9XXXXXXXX", value: formData.phone, onChange: (e) => setFormData({ ...formData, phone: e.target.value }), leftIcon: _jsx(Phone, { size: 20 }), error: errors.phone, required: true, disabled: isLoading }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-text mb-2", children: "Role" }), _jsxs("div", { className: "flex gap-4", children: [_jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "radio", name: "role", value: "tenant", checked: formData.role === 'tenant', onChange: (e) => setFormData({ ...formData, role: e.target.value }), className: "mr-2", disabled: isLoading }), "Tenant"] }), _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "radio", name: "role", value: "landlord", checked: formData.role === 'landlord', onChange: (e) => setFormData({ ...formData, role: e.target.value }), className: "mr-2", disabled: isLoading }), "Landlord"] }), _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "radio", name: "role", value: "agent", checked: formData.role === 'agent', onChange: (e) => setFormData({ ...formData, role: e.target.value }), className: "mr-2", disabled: isLoading }), "Agent"] })] }), errors.role && _jsx("p", { className: "mt-1 text-sm text-error", children: errors.role })] }), _jsx(Input, { type: "password", label: "Password", placeholder: "Enter your password (min 8 characters)", value: formData.password, onChange: (e) => setFormData({ ...formData, password: e.target.value }), leftIcon: _jsx(Lock, { size: 20 }), error: errors.password, required: true, disabled: isLoading }), _jsx(Button, { type: "submit", className: "w-full", isLoading: isLoading, disabled: isLoading, children: "Sign Up" })] }));
};
