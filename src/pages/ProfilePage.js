import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button, Input } from '@components/common';
import { useAuth } from '@contexts/AuthContext';
import { supabase } from '@lib/supabase';
import { profileUpdateSchema, passwordChangeSchema } from '@utils/validation';
import { User, Phone, Mail, Lock, Save, Camera } from 'lucide-react';
const ProfilePage = () => {
    const { user, profile, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);
    // Profile form state
    const [profileData, setProfileData] = useState({
        full_name: '',
        phone: '',
        payout_method: '',
        payout_provider: '',
        payout_account_number: '',
        payout_account_name: '',
    });
    // Password form state
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: '',
    });
    const [passwordErrors, setPasswordErrors] = useState({});
    // Initialize form with profile data
    useEffect(() => {
        if (profile) {
            // Determine payout method from existing data
            let payoutMethod = '';
            let payoutProvider = '';
            let payoutAccountNumber = '';
            if (profile.payout_mobile_money_number) {
                payoutMethod = 'mobile_money';
                payoutProvider = profile.payout_bank_name || ''; // Provider stored in payout_bank_name for mobile money
                payoutAccountNumber = profile.payout_mobile_money_number;
            }
            else if (profile.payout_bank_name && profile.payout_account_number) {
                payoutMethod = 'bank';
                payoutProvider = profile.payout_bank_name;
                payoutAccountNumber = profile.payout_account_number;
            }
            setProfileData({
                full_name: profile.full_name || '',
                phone: profile.phone || '',
                payout_method: payoutMethod,
                payout_provider: payoutProvider,
                payout_account_number: payoutAccountNumber,
                payout_account_name: profile.payout_account_name || '',
            });
        }
    }, [profile]);
    // Redirect if not logged in
    useEffect(() => {
        if (!user && !profile) {
            navigate('/login');
        }
    }, [user, profile, navigate]);
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // Validate form data
            const validationResult = profileUpdateSchema.safeParse(profileData);
            if (!validationResult.success) {
                const fieldErrors = {};
                validationResult.error.issues.forEach((issue) => {
                    if (issue.path[0]) {
                        fieldErrors[issue.path[0]] = issue.message;
                    }
                });
                Object.values(fieldErrors).forEach((error) => {
                    toast.error(error);
                });
                setIsLoading(false);
                return;
            }
            if (!user) {
                toast.error('You must be logged in to update your profile');
                setIsLoading(false);
                return;
            }
            // Prepare update data
            const updateData = {
                full_name: profileData.full_name,
                phone: profileData.phone,
            };
            // Only update payout fields if user is landlord or agent
            if (profile?.role === 'landlord' || profile?.role === 'agent') {
                if (profileData.payout_method === 'mobile_money') {
                    updateData.payout_mobile_money_number = profileData.payout_account_number;
                    // Store provider in payout_bank_name as a workaround (schema doesn't have separate provider field)
                    updateData.payout_bank_name = profileData.payout_provider;
                    updateData.payout_account_name = profileData.payout_account_name;
                    // Clear bank account number
                    updateData.payout_account_number = null;
                }
                else if (profileData.payout_method === 'bank') {
                    updateData.payout_bank_name = profileData.payout_provider;
                    updateData.payout_account_number = profileData.payout_account_number;
                    updateData.payout_account_name = profileData.payout_account_name;
                    // Clear mobile money fields
                    updateData.payout_mobile_money_number = null;
                }
            }
            // Update profile
            const { error } = await supabase
                .from('profiles')
                .update(updateData)
                .eq('id', user.id);
            if (error) {
                toast.error(error.message || 'Failed to update profile');
                setIsLoading(false);
                return;
            }
            toast.success('Profile updated successfully');
            await refreshProfile();
            setIsLoading(false);
        }
        catch (err) {
            toast.error(err.message || 'An unexpected error occurred');
            setIsLoading(false);
        }
    };
    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPasswordErrors({});
        setIsPasswordLoading(true);
        try {
            // Validate password data
            const validationResult = passwordChangeSchema.safeParse(passwordData);
            if (!validationResult.success) {
                const fieldErrors = {};
                validationResult.error.issues.forEach((issue) => {
                    if (issue.path[0]) {
                        fieldErrors[issue.path[0]] = issue.message;
                    }
                });
                setPasswordErrors(fieldErrors);
                setIsPasswordLoading(false);
                return;
            }
            // Update password using Supabase auth
            const { error } = await supabase.auth.updateUser({
                password: passwordData.new_password
            });
            if (error) {
                toast.error(error.message || 'Failed to update password');
                setIsPasswordLoading(false);
                return;
            }
            toast.success('Password updated successfully');
            setPasswordData({
                current_password: '',
                new_password: '',
                confirm_password: '',
            });
            setIsPasswordLoading(false);
        }
        catch (err) {
            toast.error(err.message || 'An unexpected error occurred');
            setIsPasswordLoading(false);
        }
    };
    if (!user || !profile) {
        return (_jsx("div", { className: "container mx-auto px-4 py-8", children: _jsx("div", { className: "text-center", children: "Loading..." }) }));
    }
    const isLandlordOrAgent = profile.role === 'landlord' || profile.role === 'agent';
    return (_jsxs("div", { className: "container mx-auto px-4 py-8 max-w-2xl", children: [_jsx("h1", { className: "text-3xl font-bold text-text mb-6", children: "Profile" }), _jsxs("div", { className: "bg-surface rounded-lg shadow-md p-6 md:p-8 mb-6", children: [_jsx("h2", { className: "text-xl font-semibold text-text mb-4", children: "Profile Information" }), _jsxs("form", { onSubmit: handleProfileUpdate, className: "space-y-4", children: [_jsxs("div", { className: "flex items-center gap-4 mb-6", children: [_jsx("div", { className: "w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center", children: profile.avatar_url ? (_jsx("img", { src: profile.avatar_url, alt: "Profile", className: "w-20 h-20 rounded-full object-cover" })) : (_jsx(User, { size: 40, className: "text-text-light" })) }), _jsxs("div", { children: [_jsx(Button, { type: "button", variant: "outline", size: "sm", disabled: true, leftIcon: _jsx(Camera, { size: 16 }), children: "Upload Photo" }), _jsx("p", { className: "text-sm text-text-light mt-1", children: "Avatar upload coming soon" })] })] }), _jsx(Input, { type: "text", label: "Full Name", placeholder: "Enter your full name", value: profileData.full_name, onChange: (e) => setProfileData({ ...profileData, full_name: e.target.value }), leftIcon: _jsx(User, { size: 20 }), required: true, disabled: isLoading }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-text mb-1.5", children: "Email" }), _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-text-light", children: _jsx(Mail, { size: 20 }) }), _jsx("input", { type: "email", value: user.email || '', disabled: true, className: "block w-full rounded-lg border border-gray-300 bg-gray-100 px-4 pl-10 py-2.5 text-base text-text-light cursor-not-allowed" })] }), _jsx("p", { className: "mt-1.5 text-sm text-text-light", children: "Email cannot be changed" })] }), _jsx(Input, { type: "tel", label: "Phone", placeholder: "+265 9XXXXXXXX", value: profileData.phone, onChange: (e) => setProfileData({ ...profileData, phone: e.target.value }), leftIcon: _jsx(Phone, { size: 20 }), required: true, disabled: isLoading }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-text mb-1.5", children: "Role" }), _jsx("div", { className: "relative", children: _jsx("input", { type: "text", value: profile.role.charAt(0).toUpperCase() + profile.role.slice(1), disabled: true, className: "block w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-2.5 text-base text-text-light cursor-not-allowed capitalize" }) }), _jsx("p", { className: "mt-1.5 text-sm text-text-light", children: "Role cannot be changed" })] }), isLandlordOrAgent && (_jsxs("div", { className: "border-t border-gray-200 pt-6 mt-6", children: [_jsx("h3", { className: "text-lg font-semibold text-text mb-4", children: "Payout Settings" }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block text-sm font-medium text-text mb-2", children: "Payout Method" }), _jsxs("select", { value: profileData.payout_method, onChange: (e) => setProfileData({
                                                    ...profileData,
                                                    payout_method: e.target.value,
                                                    payout_provider: '', // Reset provider when method changes
                                                }), className: "block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-base text-text bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary", disabled: isLoading, children: [_jsx("option", { value: "", children: "Select payout method" }), _jsx("option", { value: "mobile_money", children: "Mobile Money" }), _jsx("option", { value: "bank", children: "Bank Account" })] })] }), profileData.payout_method === 'mobile_money' && (_jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block text-sm font-medium text-text mb-2", children: "Provider" }), _jsxs("select", { value: profileData.payout_provider, onChange: (e) => setProfileData({ ...profileData, payout_provider: e.target.value }), className: "block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-base text-text bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary", disabled: isLoading, children: [_jsx("option", { value: "", children: "Select provider" }), _jsx("option", { value: "Airtel", children: "Airtel" }), _jsx("option", { value: "TNM", children: "TNM" })] })] })), profileData.payout_method === 'bank' && (_jsx(Input, { type: "text", label: "Bank Name", placeholder: "e.g., National Bank of Malawi", value: profileData.payout_provider, onChange: (e) => setProfileData({ ...profileData, payout_provider: e.target.value }), disabled: isLoading })), profileData.payout_method && (_jsxs(_Fragment, { children: [_jsx(Input, { type: "text", label: "Account Number", placeholder: profileData.payout_method === 'mobile_money'
                                                    ? 'e.g., 0888123456'
                                                    : 'Bank account number', value: profileData.payout_account_number, onChange: (e) => setProfileData({
                                                    ...profileData,
                                                    payout_account_number: e.target.value,
                                                }), disabled: isLoading }), _jsx(Input, { type: "text", label: "Account Name", placeholder: "Name on account", value: profileData.payout_account_name, onChange: (e) => setProfileData({ ...profileData, payout_account_name: e.target.value }), disabled: isLoading })] }))] })), _jsx(Button, { type: "submit", className: "w-full", isLoading: isLoading, disabled: isLoading, leftIcon: _jsx(Save, { size: 20 }), children: "Save Changes" })] })] }), _jsxs("div", { className: "bg-surface rounded-lg shadow-md p-6 md:p-8", children: [_jsx("h2", { className: "text-xl font-semibold text-text mb-4", children: "Change Password" }), _jsxs("form", { onSubmit: handlePasswordChange, className: "space-y-4", children: [_jsx(Input, { type: "password", label: "Current Password", placeholder: "Enter your current password", value: passwordData.current_password, onChange: (e) => setPasswordData({ ...passwordData, current_password: e.target.value }), leftIcon: _jsx(Lock, { size: 20 }), error: passwordErrors.current_password, required: true, disabled: isPasswordLoading }), _jsx(Input, { type: "password", label: "New Password", placeholder: "Enter your new password (min 8 characters)", value: passwordData.new_password, onChange: (e) => setPasswordData({ ...passwordData, new_password: e.target.value }), leftIcon: _jsx(Lock, { size: 20 }), error: passwordErrors.new_password, required: true, disabled: isPasswordLoading }), _jsx(Input, { type: "password", label: "Confirm New Password", placeholder: "Confirm your new password", value: passwordData.confirm_password, onChange: (e) => setPasswordData({ ...passwordData, confirm_password: e.target.value }), leftIcon: _jsx(Lock, { size: 20 }), error: passwordErrors.confirm_password, required: true, disabled: isPasswordLoading }), _jsx(Button, { type: "submit", variant: "secondary", className: "w-full", isLoading: isPasswordLoading, disabled: isPasswordLoading, leftIcon: _jsx(Lock, { size: 20 }), children: "Update Password" })] })] })] }));
};
export default ProfilePage;
