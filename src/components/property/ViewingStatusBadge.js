import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Clock, CheckCircle, XCircle, AlertTriangle, Calendar, Ban, UserX, AlertCircle } from 'lucide-react';
export const ViewingStatusBadge = ({ status, tenantConfirmed, landlordConfirmed, disputeDeadline, className = '', }) => {
    const getBadgeConfig = () => {
        switch (status) {
            case 'pending':
                return {
                    icon: Clock,
                    text: 'Pending Response',
                    bg: 'bg-yellow-100',
                    textColor: 'text-yellow-800',
                    iconColor: 'text-yellow-600',
                };
            case 'scheduled':
                if (tenantConfirmed && landlordConfirmed) {
                    return {
                        icon: CheckCircle,
                        text: 'Both Confirmed',
                        bg: 'bg-green-100',
                        textColor: 'text-green-800',
                        iconColor: 'text-green-600',
                    };
                }
                else if (tenantConfirmed || landlordConfirmed) {
                    const confirmedBy = tenantConfirmed ? 'Tenant' : 'Landlord';
                    const waitingFor = tenantConfirmed ? 'Landlord' : 'Tenant';
                    return {
                        icon: Clock,
                        text: `${confirmedBy} ✓, Waiting for ${waitingFor}`,
                        bg: 'bg-blue-100',
                        textColor: 'text-blue-800',
                        iconColor: 'text-blue-600',
                    };
                }
                else {
                    return {
                        icon: Calendar,
                        text: 'Scheduled',
                        bg: 'bg-gray-100',
                        textColor: 'text-gray-800',
                        iconColor: 'text-gray-600',
                    };
                }
            case 'completed':
                return {
                    icon: CheckCircle,
                    text: 'Completed',
                    bg: 'bg-green-100',
                    textColor: 'text-green-800',
                    iconColor: 'text-green-600',
                };
            case 'cancelled_by_landlord':
                return {
                    icon: XCircle,
                    text: 'Cancelled by Landlord',
                    bg: 'bg-orange-100',
                    textColor: 'text-orange-800',
                    iconColor: 'text-orange-600',
                };
            case 'cancelled_by_tenant':
                return {
                    icon: Ban,
                    text: 'Cancelled by Tenant',
                    bg: 'bg-orange-100',
                    textColor: 'text-orange-800',
                    iconColor: 'text-orange-600',
                };
            case 'tenant_no_show':
                const hoursLeft = disputeDeadline
                    ? Math.max(0, (new Date(disputeDeadline).getTime() - new Date().getTime()) / (1000 * 60 * 60))
                    : 0;
                if (hoursLeft > 0) {
                    return {
                        icon: UserX,
                        text: `No-Show (${Math.floor(hoursLeft)}h to dispute)`,
                        bg: 'bg-red-100',
                        textColor: 'text-red-800',
                        iconColor: 'text-red-600',
                    };
                }
                else {
                    return {
                        icon: UserX,
                        text: 'No-Show (Confirmed)',
                        bg: 'bg-red-100',
                        textColor: 'text-red-800',
                        iconColor: 'text-red-600',
                    };
                }
            case 'disputed':
                return {
                    icon: AlertTriangle,
                    text: 'Under Review',
                    bg: 'bg-purple-100',
                    textColor: 'text-purple-800',
                    iconColor: 'text-purple-600',
                };
            case 'expired':
                return {
                    icon: AlertCircle,
                    text: 'Expired',
                    bg: 'bg-gray-100',
                    textColor: 'text-gray-800',
                    iconColor: 'text-gray-600',
                };
            default:
                return {
                    icon: Clock,
                    text: status,
                    bg: 'bg-gray-100',
                    textColor: 'text-gray-800',
                    iconColor: 'text-gray-600',
                };
        }
    };
    const config = getBadgeConfig();
    const Icon = config.icon;
    return (_jsxs("div", { className: `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${config.bg} ${config.textColor} ${className}`, children: [_jsx(Icon, { size: 16, className: config.iconColor }), _jsx("span", { children: config.text })] }));
};
