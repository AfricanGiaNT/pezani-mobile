import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button, Input } from '@components/common';
import { propertySchema, malawiLocations, propertyTypes, availableAmenities, } from '@utils/validation';
import { supabase } from '@lib/supabase';
import { useAuth } from '@contexts/AuthContext';
const EditPropertyPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedAmenities, setSelectedAmenities] = useState([]);
    const { register, handleSubmit, formState: { errors }, reset, getValues, setValue, } = useForm({
        resolver: zodResolver(propertySchema),
        mode: 'onBlur',
    });
    // Fetch property and pre-fill form
    useEffect(() => {
        if (!id || !user)
            return;
        const fetchProperty = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('properties')
                    .select('*')
                    .eq('id', id)
                    .single();
                if (error || !data) {
                    toast.error('Property not found');
                    navigate('/dashboard');
                    return;
                }
                // Check ownership
                if (data.owner_id !== user.id) {
                    toast.error('You do not have permission to edit this property');
                    navigate('/dashboard');
                    return;
                }
                // Pre-fill form with existing data
                reset({
                    title: data.title,
                    description: data.description,
                    location: data.location,
                    price: data.price,
                    viewing_fee: data.viewing_fee,
                    bedrooms: data.bedrooms,
                    bathrooms: data.bathrooms,
                    property_type: data.property_type,
                    amenities: data.amenities || [],
                });
                // Set selected amenities for checkbox state
                setSelectedAmenities(data.amenities || []);
            }
            catch (error) {
                console.error('Error fetching property:', error);
                toast.error('Failed to load property');
                navigate('/dashboard');
            }
            finally {
                setLoading(false);
            }
        };
        fetchProperty();
    }, [id, user, navigate, reset]);
    const toggleAmenity = (amenity) => {
        setSelectedAmenities((prev) => {
            const updated = prev.includes(amenity)
                ? prev.filter((a) => a !== amenity)
                : [...prev, amenity];
            setValue('amenities', updated);
            return updated;
        });
    };
    const onSubmit = async (data) => {
        if (!user || !id)
            return;
        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from('properties')
                .update({
                title: data.title,
                description: data.description,
                location: data.location,
                price: data.price,
                viewing_fee: data.viewing_fee,
                bedrooms: data.bedrooms,
                bathrooms: data.bathrooms,
                property_type: data.property_type,
                amenities: data.amenities || [],
            })
                .eq('id', id)
                .eq('owner_id', user.id);
            if (error)
                throw error;
            toast.success('Property updated successfully');
            navigate('/dashboard');
        }
        catch (error) {
            console.error('Error updating property:', error);
            toast.error(error.message || 'Failed to update property. Please try again.');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    if (loading) {
        return (_jsx("div", { className: "min-h-screen bg-background py-8", children: _jsx("div", { className: "container-custom max-w-3xl", children: _jsx("div", { className: "flex items-center justify-center py-20", children: _jsx(Loader2, { size: 48, className: "animate-spin text-primary" }) }) }) }));
    }
    return (_jsx("div", { className: "min-h-screen bg-background py-8", children: _jsxs("div", { className: "container-custom max-w-3xl", children: [_jsxs("div", { className: "mb-8", children: [_jsx(Button, { variant: "ghost", onClick: () => navigate('/dashboard'), leftIcon: _jsx(ArrowLeft, { size: 18 }), className: "mb-4", children: "Back to Dashboard" }), _jsx("h1", { className: "text-3xl font-bold text-text mb-2", children: "Edit Property" }), _jsx("p", { className: "text-text-light", children: "Update your property listing details" })] }), _jsxs("form", { onSubmit: handleSubmit(onSubmit), children: [_jsxs("div", { className: "bg-surface rounded-lg shadow-md p-6 md:p-8 space-y-6", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-xl font-semibold text-text mb-4", children: "Basic Details" }), _jsxs("div", { className: "space-y-4", children: [_jsx(Input, { label: "Property Title *", placeholder: "e.g., Modern 3 Bedroom House", ...register('title'), error: errors.title?.message, fullWidth: true }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-text mb-1.5", children: "Description *" }), _jsx("textarea", { ...register('description'), placeholder: "Describe your property in detail...", rows: 5, className: `block w-full rounded-lg border transition-all focus:outline-none focus:ring-2 px-4 py-2.5 text-base bg-surface text-text ${errors.description
                                                                ? 'border-error focus:border-error focus:ring-error'
                                                                : 'border-gray-300 focus:border-primary focus:ring-primary'}` }), errors.description && (_jsx("p", { className: "mt-1.5 text-sm text-error", children: errors.description.message })), _jsxs("p", { className: "mt-1.5 text-sm text-text-light", children: [getValues('description')?.length || 0, " / 1500 characters"] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-text mb-1.5", children: "Location *" }), _jsxs("select", { ...register('location'), className: `block w-full rounded-lg border transition-all focus:outline-none focus:ring-2 px-4 py-2.5 text-base bg-surface text-text ${errors.location
                                                                ? 'border-error focus:border-error focus:ring-error'
                                                                : 'border-gray-300 focus:border-primary focus:ring-primary'}`, children: [_jsx("option", { value: "", children: "Select location..." }), malawiLocations.map((location) => (_jsx("option", { value: location, children: location }, location)))] }), errors.location && (_jsx("p", { className: "mt-1.5 text-sm text-error", children: errors.location.message }))] })] })] }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-semibold text-text mb-4", children: "Pricing" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-text mb-1.5", children: "Monthly Rent (MWK) *" }), _jsx("input", { type: "number", ...register('price', { valueAsNumber: true }), placeholder: "150000", className: `block w-full rounded-lg border transition-all focus:outline-none focus:ring-2 px-4 py-2.5 text-base bg-surface text-text ${errors.price
                                                                ? 'border-error focus:border-error focus:ring-error'
                                                                : 'border-gray-300 focus:border-primary focus:ring-primary'}` }), errors.price && (_jsx("p", { className: "mt-1.5 text-sm text-error", children: errors.price.message })), _jsx("p", { className: "mt-1.5 text-sm text-text-light", children: "Minimum: MWK 5,000" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-text mb-1.5", children: "Viewing Fee (MWK) *" }), _jsx("input", { type: "number", ...register('viewing_fee', { valueAsNumber: true }), placeholder: "5000", className: `block w-full rounded-lg border transition-all focus:outline-none focus:ring-2 px-4 py-2.5 text-base bg-surface text-text ${errors.viewing_fee
                                                                ? 'border-error focus:border-error focus:ring-error'
                                                                : 'border-gray-300 focus:border-primary focus:ring-primary'}` }), errors.viewing_fee && (_jsx("p", { className: "mt-1.5 text-sm text-error", children: errors.viewing_fee.message })), _jsx("p", { className: "mt-1.5 text-sm text-text-light", children: "Fee charged to tenants for property viewing (can be 0)" })] })] })] }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-semibold text-text mb-4", children: "Property Details" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-text mb-1.5", children: "Bedrooms *" }), _jsx("input", { type: "number", ...register('bedrooms', { valueAsNumber: true }), placeholder: "3", min: "0", className: `block w-full rounded-lg border transition-all focus:outline-none focus:ring-2 px-4 py-2.5 text-base bg-surface text-text ${errors.bedrooms
                                                                        ? 'border-error focus:border-error focus:ring-error'
                                                                        : 'border-gray-300 focus:border-primary focus:ring-primary'}` }), errors.bedrooms && (_jsx("p", { className: "mt-1.5 text-sm text-error", children: errors.bedrooms.message }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-text mb-1.5", children: "Bathrooms *" }), _jsx("input", { type: "number", ...register('bathrooms', { valueAsNumber: true }), placeholder: "2", min: "0", className: `block w-full rounded-lg border transition-all focus:outline-none focus:ring-2 px-4 py-2.5 text-base bg-surface text-text ${errors.bathrooms
                                                                        ? 'border-error focus:border-error focus:ring-error'
                                                                        : 'border-gray-300 focus:border-primary focus:ring-primary'}` }), errors.bathrooms && (_jsx("p", { className: "mt-1.5 text-sm text-error", children: errors.bathrooms.message }))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-text mb-1.5", children: "Property Type *" }), _jsxs("select", { ...register('property_type'), className: `block w-full rounded-lg border transition-all focus:outline-none focus:ring-2 px-4 py-2.5 text-base bg-surface text-text ${errors.property_type
                                                                ? 'border-error focus:border-error focus:ring-error'
                                                                : 'border-gray-300 focus:border-primary focus:ring-primary'}`, children: [_jsx("option", { value: "", children: "Select property type..." }), propertyTypes.map((type) => (_jsx("option", { value: type.value, children: type.label }, type.value)))] }), errors.property_type && (_jsx("p", { className: "mt-1.5 text-sm text-error", children: errors.property_type.message }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-text mb-3", children: "Amenities" }), _jsx("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-3", children: availableAmenities.map((amenity) => (_jsxs("label", { className: "flex items-center space-x-2 cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: selectedAmenities.includes(amenity), onChange: () => toggleAmenity(amenity), className: "w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary" }), _jsx("span", { className: "text-sm text-text", children: amenity })] }, amenity))) })] })] })] }), _jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4", children: _jsxs("p", { className: "text-sm text-blue-800", children: [_jsx("strong", { children: "Note:" }), " Images cannot be edited in this version. To add more images, please contact support or use the property detail page."] }) })] }), _jsxs("div", { className: "flex items-center justify-between mt-8", children: [_jsx(Button, { type: "button", variant: "ghost", onClick: () => navigate('/dashboard'), children: "Cancel" }), _jsx(Button, { type: "submit", disabled: isSubmitting, leftIcon: _jsx(Save, { size: 18 }), children: isSubmitting ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { size: 18, className: "mr-2 animate-spin" }), "Saving..."] })) : ('Save Changes') })] })] })] }) }));
};
export default EditPropertyPage;
