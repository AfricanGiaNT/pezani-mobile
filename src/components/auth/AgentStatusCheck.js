import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
/**
 * Component that redirects pending agents to the pending page
 * Use this to wrap features that require active agent status
 */
export const AgentStatusCheck = ({ children }) => {
    const { profile } = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
        if (profile?.role === 'agent' && profile?.status === 'pending') {
            navigate('/agent-pending');
        }
    }, [profile, navigate]);
    // If pending agent, don't render children (will redirect)
    if (profile?.role === 'agent' && profile?.status === 'pending') {
        return null;
    }
    return _jsx(_Fragment, { children: children });
};
