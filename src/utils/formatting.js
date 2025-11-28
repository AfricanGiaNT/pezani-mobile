/**
 * Format currency in MWK (Malawian Kwacha)
 */
export const formatCurrency = (amount) => {
    return `MWK ${amount.toLocaleString('en-US')}`;
};
/**
 * Format price (alias for formatCurrency for consistency)
 */
export const formatPrice = (amount) => {
    return formatCurrency(amount);
};
/**
 * Format currency with /month suffix
 */
export const formatMonthlyRent = (amount) => {
    return `${formatCurrency(amount)}/month`;
};
/**
 * Format phone number for display
 */
export const formatPhone = (phone) => {
    // Format: +265 9XX XXX XXX
    if (phone.startsWith('+265')) {
        const number = phone.slice(4);
        return `+265 ${number.slice(0, 2)} ${number.slice(2, 5)} ${number.slice(5)}`;
    }
    return phone;
};
/**
 * Format date for display
 */
export const formatDate = (date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};
/**
 * Format date and time for display
 */
export const formatDateTime = (date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
};
/**
 * Truncate text with ellipsis
 */
export const truncate = (text, maxLength) => {
    if (text.length <= maxLength)
        return text;
    return text.slice(0, maxLength) + '...';
};
