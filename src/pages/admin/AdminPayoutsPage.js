import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/common';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
export default function AdminPayoutsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [payouts, setPayouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');
    const [processingId, setProcessingId] = useState(null);
    // Verify admin access
    useEffect(() => {
        const checkAdmin = async () => {
            if (!user)
                return;
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();
            if (profile?.role !== 'admin') {
                toast.error('Access denied. Admin only.');
                navigate('/');
            }
        };
        checkAdmin();
    }, [user, navigate]);
    // Fetch payouts
    const fetchPayouts = async () => {
        try {
            setLoading(true);
            let query = supabase
                .from('payouts')
                .select(`
          *,
          profiles:landlord_id (full_name, email, phone),
          transactions (
            viewing_request_id,
            paychangu_reference,
            viewing_requests (
              property_id,
              properties (
                title,
                location
              )
            )
          )
        `)
                .order('created_at', { ascending: false });
            if (filter !== 'all') {
                query = query.eq('status', filter);
            }
            const { data, error } = await query;
            if (error)
                throw error;
            setPayouts(data || []);
        }
        catch (error) {
            console.error('Error fetching payouts:', error);
            toast.error('Failed to load payouts');
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchPayouts();
    }, [filter]);
    // Mark payout as processed
    const handleMarkProcessed = async (payoutId) => {
        const referenceNumber = prompt('Enter payout reference number (e.g., transaction ID):');
        if (!referenceNumber) {
            toast.error('Reference number is required');
            return;
        }
        const notes = prompt('Add any notes (optional):');
        try {
            setProcessingId(payoutId);
            const { error } = await supabase
                .from('payouts')
                .update({
                status: 'completed',
                reference_number: referenceNumber,
                notes: notes || null,
                processed_by: user?.id,
                processed_at: new Date().toISOString(),
            })
                .eq('id', payoutId);
            if (error)
                throw error;
            toast.success('Payout marked as processed');
            fetchPayouts();
        }
        catch (error) {
            console.error('Error processing payout:', error);
            toast.error('Failed to process payout');
        }
        finally {
            setProcessingId(null);
        }
    };
    // Export to CSV
    const handleExportCSV = () => {
        try {
            const csvData = payouts.map((payout) => ({
                'Payout ID': payout.id,
                'Landlord Name': payout.profiles.full_name,
                'Landlord Email': payout.profiles.email,
                'Landlord Phone': payout.profiles.phone,
                'Amount (MWK)': payout.amount,
                'Payout Method': payout.payout_method,
                'Provider': payout.payout_provider,
                'Account Number': payout.payout_account,
                'Property': payout.transactions.viewing_requests.properties.title,
                'Location': payout.transactions.viewing_requests.properties.location,
                'Status': payout.status,
                'Reference Number': payout.reference_number || 'N/A',
                'Created At': new Date(payout.created_at).toLocaleString(),
                'Processed At': payout.processed_at ? new Date(payout.processed_at).toLocaleString() : 'N/A',
                'Notes': payout.notes || 'N/A',
            }));
            // Convert to CSV string
            const headers = Object.keys(csvData[0]);
            const csvContent = [
                headers.join(','),
                ...csvData.map((row) => headers.map((header) => JSON.stringify(row[header])).join(',')),
            ].join('\n');
            // Download CSV
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `payouts_${filter}_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success('CSV exported successfully');
        }
        catch (error) {
            console.error('Error exporting CSV:', error);
            toast.error('Failed to export CSV');
        }
    };
    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-MW', {
            style: 'currency',
            currency: 'MWK',
            minimumFractionDigits: 0,
        }).format(amount);
    };
    return (_jsxs("div", { className: "container mx-auto px-4 py-8", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900 mb-2", children: "Payout Management" }), _jsx("p", { className: "text-gray-600", children: "Manage and process payouts to landlords and agents" })] }), _jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6", children: [_jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: filter === 'pending' ? 'primary' : 'outline', onClick: () => setFilter('pending'), children: "Pending" }), _jsx(Button, { variant: filter === 'completed' ? 'primary' : 'outline', onClick: () => setFilter('completed'), children: "Completed" }), _jsx(Button, { variant: filter === 'all' ? 'primary' : 'outline', onClick: () => setFilter('all'), children: "All" })] }), _jsx(Button, { variant: "outline", onClick: handleExportCSV, disabled: payouts.length === 0, children: "\uD83D\uDCCA Export CSV" })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8", children: [_jsxs("div", { className: "bg-yellow-50 border border-yellow-200 rounded-lg p-4", children: [_jsx("p", { className: "text-sm text-yellow-600 font-medium mb-1", children: "Pending Payouts" }), _jsx("p", { className: "text-2xl font-bold text-yellow-900", children: payouts.filter((p) => p.status === 'pending').length })] }), _jsxs("div", { className: "bg-green-50 border border-green-200 rounded-lg p-4", children: [_jsx("p", { className: "text-sm text-green-600 font-medium mb-1", children: "Completed Payouts" }), _jsx("p", { className: "text-2xl font-bold text-green-900", children: payouts.filter((p) => p.status === 'completed').length })] }), _jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4", children: [_jsx("p", { className: "text-sm text-blue-600 font-medium mb-1", children: "Total Amount (Pending)" }), _jsx("p", { className: "text-2xl font-bold text-blue-900", children: formatCurrency(payouts
                                    .filter((p) => p.status === 'pending')
                                    .reduce((sum, p) => sum + p.amount, 0)) })] })] }), loading ? (_jsxs("div", { className: "text-center py-12", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" }), _jsx("p", { className: "mt-4 text-gray-600", children: "Loading payouts..." })] })) : payouts.length === 0 ? (_jsx("div", { className: "text-center py-12 bg-gray-50 rounded-lg", children: _jsxs("p", { className: "text-gray-600", children: ["No ", filter !== 'all' ? filter : '', " payouts found"] }) })) : (_jsx("div", { className: "space-y-4", children: payouts.map((payout) => (_jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500 mb-1", children: "Landlord" }), _jsx("p", { className: "font-semibold text-gray-900", children: payout.profiles.full_name }), _jsx("p", { className: "text-sm text-gray-600", children: payout.profiles.email }), _jsx("p", { className: "text-sm text-gray-600", children: payout.profiles.phone })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500 mb-1", children: "Property" }), _jsx("p", { className: "font-semibold text-gray-900", children: payout.transactions.viewing_requests.properties.title }), _jsx("p", { className: "text-sm text-gray-600", children: payout.transactions.viewing_requests.properties.location })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500 mb-1", children: "Payout Details" }), _jsx("p", { className: "font-bold text-lg text-primary", children: formatCurrency(payout.amount) }), _jsxs("p", { className: "text-sm text-gray-600", children: [payout.payout_method === 'mobile_money' ? '📱' : '🏦', ' ', payout.payout_provider] }), _jsx("p", { className: "text-sm text-gray-600 font-mono", children: payout.payout_account }), payout.reference_number && (_jsxs("p", { className: "text-xs text-gray-500 mt-1", children: ["Ref: ", payout.reference_number] }))] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500 mb-2", children: "Status" }), _jsxs("div", { className: "mb-3", children: [payout.status === 'pending' && (_jsx("span", { className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800", children: "\u23F3 Pending" })), payout.status === 'completed' && (_jsx("span", { className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800", children: "\u2705 Completed" })), payout.status === 'failed' && (_jsx("span", { className: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800", children: "\u274C Failed" }))] }), payout.status === 'pending' && (_jsx(Button, { size: "sm", onClick: () => handleMarkProcessed(payout.id), disabled: processingId === payout.id, children: processingId === payout.id ? 'Processing...' : 'Mark as Processed' })), payout.processed_at && (_jsxs("p", { className: "text-xs text-gray-500 mt-2", children: ["Processed: ", new Date(payout.processed_at).toLocaleDateString()] }))] })] }), payout.notes && (_jsxs("div", { className: "mt-4 pt-4 border-t border-gray-100", children: [_jsx("p", { className: "text-sm text-gray-500", children: "Notes:" }), _jsx("p", { className: "text-sm text-gray-700", children: payout.notes })] })), _jsx("div", { className: "mt-2 pt-2 border-t border-gray-100", children: _jsxs("p", { className: "text-xs text-gray-500", children: ["Created: ", new Date(payout.created_at).toLocaleString(), " \u2022 Transaction ID:", ' ', payout.transactions.paychangu_reference] }) })] }, payout.id))) }))] }));
}
