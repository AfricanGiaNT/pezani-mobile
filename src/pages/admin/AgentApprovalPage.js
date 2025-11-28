import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Mail, Phone, Calendar, Loader2 } from 'lucide-react';
import { Button, Modal } from '@components/common';
import { supabase } from '@lib/supabase';
import { useAuth } from '@contexts/AuthContext';
import { formatDate, formatPhone } from '@utils/formatting';
const AgentApprovalPage = () => {
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [pendingAgents, setPendingAgents] = useState([]);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [agentToReject, setAgentToReject] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    // Check if user is admin
    useEffect(() => {
        if (profile) {
            if (profile.role !== 'admin') {
                toast.error('Access denied. Admin only.');
                navigate('/dashboard');
            }
        }
    }, [profile, navigate]);
    // Fetch pending agents
    useEffect(() => {
        if (user && profile?.role === 'admin') {
            fetchPendingAgents();
        }
    }, [user, profile]);
    const fetchPendingAgents = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'agent')
                .eq('status', 'pending')
                .order('created_at', { ascending: true });
            if (error)
                throw error;
            setPendingAgents((data || []));
        }
        catch (error) {
            console.error('Error fetching pending agents:', error);
            toast.error('Failed to load pending agents');
        }
        finally {
            setLoading(false);
        }
    };
    const handleApprove = async (agentId) => {
        if (!user)
            return;
        setIsProcessing(true);
        try {
            // 1. Update status to active
            const { error } = await supabase
                .from('profiles')
                .update({ status: 'active' })
                .eq('id', agentId)
                .eq('role', 'agent');
            if (error)
                throw error;
            // 2. Send welcome email via Edge Function
            try {
                const { error: emailError } = await supabase.functions.invoke('send-agent-email', {
                    body: { agentId, approved: true }
                });
                if (emailError) {
                    console.error('Failed to send approval email:', emailError);
                    // Don't fail the approval if email fails
                }
            }
            catch (emailErr) {
                console.error('Error sending approval email:', emailErr);
                // Don't fail the approval if email fails
            }
            toast.success('Agent approved successfully');
            // Refresh list
            await fetchPendingAgents();
        }
        catch (error) {
            console.error('Error approving agent:', error);
            toast.error('Failed to approve agent');
        }
        finally {
            setIsProcessing(false);
        }
    };
    const handleRejectClick = (agentId) => {
        setAgentToReject(agentId);
        setRejectModalOpen(true);
    };
    const handleRejectConfirm = async () => {
        if (!user || !agentToReject || !rejectionReason.trim()) {
            toast.error('Please provide a rejection reason');
            return;
        }
        setIsProcessing(true);
        try {
            // 1. Update status to rejected
            const { error } = await supabase
                .from('profiles')
                .update({
                status: 'rejected',
            })
                .eq('id', agentToReject)
                .eq('role', 'agent');
            if (error)
                throw error;
            // 2. Send rejection email via Edge Function
            try {
                const { error: emailError } = await supabase.functions.invoke('send-agent-email', {
                    body: {
                        agentId: agentToReject,
                        approved: false,
                        rejectionReason: rejectionReason
                    }
                });
                if (emailError) {
                    console.error('Failed to send rejection email:', emailError);
                    // Don't fail the rejection if email fails
                }
            }
            catch (emailErr) {
                console.error('Error sending rejection email:', emailErr);
                // Don't fail the rejection if email fails
            }
            toast.success('Agent application rejected');
            // Close modal and refresh list
            setRejectModalOpen(false);
            setAgentToReject(null);
            setRejectionReason('');
            await fetchPendingAgents();
        }
        catch (error) {
            console.error('Error rejecting agent:', error);
            toast.error('Failed to reject agent application');
        }
        finally {
            setIsProcessing(false);
        }
    };
    const handleRejectCancel = () => {
        setRejectModalOpen(false);
        setAgentToReject(null);
        setRejectionReason('');
    };
    if (!user || profile?.role !== 'admin') {
        return (_jsx("div", { className: "container mx-auto px-4 py-8", children: _jsx("div", { className: "text-center", children: "Loading..." }) }));
    }
    return (_jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsxs("div", { className: "mb-6", children: [_jsx("h1", { className: "text-3xl font-bold text-text mb-2", children: "Pending Agent Applications" }), _jsx("p", { className: "text-text-light", children: "Review and approve or reject agent applications" })] }), loading ? (_jsx("div", { className: "flex items-center justify-center py-12", children: _jsx(Loader2, { size: 32, className: "animate-spin text-primary" }) })) : pendingAgents.length === 0 ? (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "bg-surface rounded-lg shadow-md p-12 text-center border border-gray-200", children: [_jsx("div", { className: "w-24 h-24 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center", children: _jsx(CheckCircle2, { size: 48, className: "text-green-600" }) }), _jsx("h3", { className: "text-xl font-semibold text-text mb-2", children: "No Pending Applications" }), _jsx("p", { className: "text-text-light", children: "All agent applications have been reviewed." })] })) : (_jsx("div", { className: "space-y-4", children: pendingAgents.map((agent) => (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "bg-surface rounded-lg shadow-md p-6 border border-gray-200", children: _jsxs("div", { className: "flex flex-col md:flex-row md:items-center md:justify-between gap-4", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "text-xl font-semibold text-text mb-2", children: agent.full_name || 'No name provided' }), _jsxs("div", { className: "space-y-1 text-sm text-text-light", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Mail, { size: 16 }), _jsx("span", { children: agent.email })] }), agent.phone && (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Phone, { size: 16 }), _jsx("span", { children: formatPhone(agent.phone) })] })), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Calendar, { size: 16 }), _jsxs("span", { children: ["Applied: ", formatDate(agent.created_at)] })] })] })] }), _jsxs("div", { className: "flex gap-3", children: [_jsx(Button, { variant: "primary", onClick: () => handleApprove(agent.id), disabled: isProcessing, isLoading: isProcessing, leftIcon: _jsx(CheckCircle2, { size: 18 }), children: "Approve" }), _jsx(Button, { variant: "danger", onClick: () => handleRejectClick(agent.id), disabled: isProcessing, leftIcon: _jsx(XCircle, { size: 18 }), children: "Reject" })] })] }) }, agent.id))) })), _jsx(Modal, { isOpen: rejectModalOpen, onClose: handleRejectCancel, title: "Reject Agent Application", size: "md", children: _jsxs("div", { className: "space-y-4", children: [_jsx("p", { className: "text-text", children: "Please provide a reason for rejecting this agent application. This reason will be sent to the applicant via email." }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-text mb-1.5", children: "Rejection Reason *" }), _jsx("textarea", { value: rejectionReason, onChange: (e) => setRejectionReason(e.target.value), placeholder: "e.g., Insufficient documentation, does not meet requirements...", rows: 4, className: "block w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary px-4 py-2.5 text-base bg-surface text-text" })] }), _jsxs("div", { className: "flex gap-3 justify-end pt-4", children: [_jsx(Button, { variant: "ghost", onClick: handleRejectCancel, disabled: isProcessing, children: "Cancel" }), _jsx(Button, { variant: "danger", onClick: handleRejectConfirm, disabled: isProcessing || !rejectionReason.trim(), isLoading: isProcessing, leftIcon: _jsx(XCircle, { size: 18 }), children: isProcessing ? 'Rejecting...' : 'Reject Application' })] })] }) })] }));
};
export default AgentApprovalPage;
