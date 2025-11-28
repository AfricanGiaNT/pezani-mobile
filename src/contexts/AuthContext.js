import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@lib/supabase';
const AuthContext = createContext(undefined);
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    // Fetch user profile from profiles table
    const fetchProfile = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();
            if (error) {
                console.error('Error fetching profile:', error);
                return null;
            }
            return data;
        }
        catch (error) {
            console.error('Error fetching profile:', error);
            return null;
        }
    };
    // Check active session and subscribe to auth changes
    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                const userProfile = await fetchProfile(session.user.id);
                setProfile(userProfile);
            }
            setLoading(false);
        });
        // Subscribe to auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                const userProfile = await fetchProfile(session.user.id);
                setProfile(userProfile);
            }
            else {
                setProfile(null);
            }
            setLoading(false);
        });
        return () => {
            subscription.unsubscribe();
        };
    }, []);
    const signUp = async (email, password, fullName, phone, role) => {
        try {
            // 1. Create auth user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password
            });
            if (authError) {
                return { data: null, error: authError };
            }
            if (!authData.user) {
                return { data: null, error: { message: 'Failed to create user' } };
            }
            // 2. Create profile explicitly (as per milestone requirements)
            // Set status to 'pending' for agents, 'active' for others
            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                id: authData.user.id,
                email: email,
                full_name: fullName,
                phone: phone,
                role: role,
                status: role === 'agent' ? 'pending' : 'active'
            });
            if (profileError) {
                // If profile creation fails (e.g., trigger already created it), try to fetch it
                console.warn('Profile creation error (may already exist):', profileError);
                // Continue anyway - profile might have been created by trigger
            }
            // 3. Fetch the profile if user has a session
            if (authData.session) {
                // Wait a moment for any trigger to complete
                await new Promise(resolve => setTimeout(resolve, 500));
                const userProfile = await fetchProfile(authData.user.id);
                if (userProfile) {
                    setProfile(userProfile);
                }
            }
            // If no session (email confirmation enabled), profile will be fetched on first login
            return { data: authData, error: profileError || null };
        }
        catch (error) {
            return { data: null, error };
        }
    };
    const signIn = async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            if (error) {
                return { data: null, error };
            }
            if (data.user) {
                // Fetch profile - trigger should have created it, but ensure it exists
                let userProfile = await fetchProfile(data.user.id);
                // If profile doesn't exist, create it (fallback)
                if (!userProfile) {
                    const { error: createError } = await supabase.from('profiles').insert({
                        id: data.user.id,
                        email: data.user.email || email,
                        full_name: data.user.user_metadata?.full_name || null,
                        phone: data.user.user_metadata?.phone || null,
                        role: data.user.user_metadata?.role || 'tenant',
                        status: data.user.user_metadata?.role === 'agent' ? 'pending' : 'active'
                    });
                    if (!createError) {
                        userProfile = await fetchProfile(data.user.id);
                    }
                }
                setProfile(userProfile);
            }
            return { data, error: null };
        }
        catch (error) {
            return { data: null, error };
        }
    };
    const signOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            setUser(null);
            setProfile(null);
            return { error };
        }
        catch (error) {
            return { error };
        }
    };
    const refreshProfile = async () => {
        if (user) {
            const userProfile = await fetchProfile(user.id);
            setProfile(userProfile);
        }
    };
    const value = {
        user,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        refreshProfile
    };
    return _jsx(AuthContext.Provider, { value: value, children: children });
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
