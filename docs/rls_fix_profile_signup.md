# Fix: RLS Policy Error on Profile Creation

## Problem
When users try to sign up, they get the error:
```
new row violates row-level security policy for table 'profiles'
```

## Root Cause
The RLS policy requires users to be `authenticated` to insert into profiles, but during signup, the user might not have a session yet (especially if email confirmation is enabled).

## Solution Implemented

### 1. Database Trigger (Automatic Profile Creation)
Created a trigger function `handle_new_user()` that automatically creates a profile when a user signs up in `auth.users`. This trigger:
- Uses `SECURITY DEFINER` to bypass RLS
- Reads metadata from `raw_user_meta_data`
- Creates profile with correct role and status
- Handles conflicts gracefully

### 2. Updated SignUp Flow
- Removed client-side profile insert (which was failing due to RLS)
- Now relies on the database trigger to create the profile
- Passes metadata in `signUp()` options so trigger can use it
- Profile is fetched after signup if user has a session

### 3. Fallback in SignIn
- Added fallback to create profile if it doesn't exist on login
- Ensures profile always exists after authentication

## Files Changed

1. **Database Migration:** `add_profile_creation_trigger`
   - Created `handle_new_user()` function
   - Created trigger on `auth.users`
   - Updated RLS policy

2. **AuthContext.tsx:**
   - Updated `signUp()` to pass metadata and rely on trigger
   - Updated `signIn()` with fallback profile creation

## Testing

Try signing up again. The trigger should automatically create the profile, and you should no longer see the RLS error.

If you still see issues:
1. Check Supabase Dashboard → Authentication → Settings
2. Ensure email confirmation is disabled for testing (or verify email first)
3. Check Supabase logs for trigger execution

