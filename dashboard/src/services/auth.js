import { supabase } from "../lib/supabase";

/**
 * Sign in with email + password using Supabase Auth.
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<import("@supabase/supabase-js").AuthResponse>}
 */
export async function login({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

/**
 * Register a new user with Supabase Auth.
 * Supports two scenarios:
 * 1. Owner: Creates new tenant with company_name
 * 2. Member: Joins existing tenant via invite_code
 *
 * Profile is auto-created via the `handle_new_user()` database trigger.
 *
 * @param {{
 *   email: string,
 *   password: string,
 *   name: string,
 *   company_name?: string,
 *   invite_code?: string
 * }} params
 */
export async function signUp({
  email,
  password,
  name,
  company_name,
  invite_code,
}) {
  // Build user metadata based on scenario
  const userMetadata = {
    name: name || email.split("@")[0],
    username: email.split("@")[0],
  };

  // Scenario 1: Owner creating new company
  if (company_name) {
    userMetadata.company_name = company_name;
  }

  // Scenario 2: Member joining via invite code
  if (invite_code) {
    userMetadata.invite_code = invite_code;
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userMetadata,
    },
  });

  if (error) throw error;
  return data;
}

/**
 * Sign out — clears Supabase session.
 */
export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Send password reset email.
 * @param {string} email
 */
export async function resetPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
}

/**
 * Get the current authenticated user from Supabase session.
 * @returns {Promise<import("@supabase/supabase-js").User|null>}
 */
export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Fetch the profile (role, name, tenant_id, etc.) from the `profiles` table.
 * @param {string} userId
 */
export async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
}
