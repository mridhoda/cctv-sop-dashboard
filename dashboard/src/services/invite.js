/**
 * Invite Code Service
 * Handles validation and management of invite codes for multi-tenant signup
 */

import { supabase } from "../lib/supabase";

/**
 * Validate an invite code (can be called by anonymous users)
 * @param {string} code - The invite code to validate
 * @returns {Promise<{valid: boolean, tenant?: {id: string, name: string}, role?: string, role_label?: string, error_message?: string}>}
 */
export async function validateInviteCode(code) {
  const { data, error } = await supabase.rpc("validate_invite_code", {
    p_code: code,
  });

  if (error) {
    console.error("[Invite] Error validating code:", error);
    throw error;
  }

  // RPC returns a table, so data is an array
  const result = data?.[0];

  if (!result) {
    return { valid: false, error_message: "Kode undangan tidak ditemukan" };
  }

  return {
    valid: result.valid,
    tenant: result.tenant_id
      ? {
          id: result.tenant_id,
          name: result.tenant_name,
        }
      : undefined,
    role: result.role,
    role_label: result.role_label,
    error_message: result.error_message,
  };
}

/**
 * Create a new invite code (admin only)
 * @param {Object} params
 * @param {string} params.role - Role to assign (viewer, operator, admin)
 * @param {string} params.role_label - Human-readable role label
 * @param {number} [params.max_uses=1] - Maximum number of uses (null for unlimited)
 * @param {string} [params.expires_at] - ISO date string for expiration
 * @returns {Promise<{code: string, expires_at?: string, max_uses: number}>}
 */
export async function createInviteCode({
  role = "viewer",
  role_label = "Viewer",
  max_uses = 1,
  expires_at = null,
}) {
  // Generate a random code
  const code = generateRandomCode();

  const { data, error } = await supabase
    .from("invite_codes")
    .insert({
      code,
      role,
      role_label,
      max_uses,
      expires_at,
    })
    .select("code, expires_at, max_uses")
    .single();

  if (error) {
    console.error("[Invite] Error creating code:", error);
    throw error;
  }

  return data;
}

/**
 * List all invite codes for the current user's tenant
 * @returns {Promise<Array>}
 */
export async function listInviteCodes() {
  const { data, error } = await supabase
    .from("invite_codes")
    .select(
      `
      *,
      created_by:profiles(name)
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Invite] Error listing codes:", error);
    throw error;
  }

  return data || [];
}

/**
 * Delete an invite code (admin only)
 * @param {string} codeId - The invite code ID to delete
 * @returns {Promise<void>}
 */
export async function deleteInviteCode(codeId) {
  const { error } = await supabase
    .from("invite_codes")
    .delete()
    .eq("id", codeId);

  if (error) {
    console.error("[Invite] Error deleting code:", error);
    throw error;
  }
}

/**
 * Toggle invite code active status
 * @param {string} codeId - The invite code ID
 * @param {boolean} isActive - New active status
 * @returns {Promise<void>}
 */
export async function toggleInviteCodeStatus(codeId, isActive) {
  const { error } = await supabase
    .from("invite_codes")
    .update({ is_active: isActive })
    .eq("id", codeId);

  if (error) {
    console.error("[Invite] Error toggling code status:", error);
    throw error;
  }
}

/**
 * Generate a random invite code
 * Format: XXXX-YYYY-ZZZZZZ (prefix-year-random)
 * @returns {string}
 */
function generateRandomCode() {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `INV-${year}-${random}`;
}
