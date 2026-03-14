import { supabase } from "../lib/supabase";

/**
 * Fetch config settings grouped by category.
 * @returns {Promise<Record<string, Array>>} Config settings grouped by category name
 */
export async function fetchConfig() {
  const { data, error } = await supabase
    .from("config_settings")
    .select(
      `
      id, key, value, data_type, display_name, description,
      is_sensitive, is_readonly, sort_order, default_value,
      validation_rules,
      config_categories(name, display_name, icon, sort_order)
    `,
    )
    .order("sort_order", { ascending: true });

  if (error) throw error;

  // Group settings by category name
  const grouped = (data || []).reduce((acc, item) => {
    const category = item.config_categories?.name || "general";
    if (!acc[category]) {
      acc[category] = {
        name: category,
        display_name: item.config_categories?.display_name || category,
        icon: item.config_categories?.icon,
        sort_order: item.config_categories?.sort_order || 0,
        settings: [],
      };
    }
    acc[category].settings.push(item);
    return acc;
  }, {});

  return grouped;
}

/**
 * Update a single config setting by ID.
 * @param {string} id - Setting UUID
 * @param {string} value - New value (stored as string in DB)
 */
export async function updateConfigSetting(id, value) {
  const { error } = await supabase
    .from("config_settings")
    .update({
      value: String(value),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;
}

/**
 * Legacy compat: update config by key-value object.
 * @param {object} configData - { key: value, ... }
 */
export async function updateConfig(configData) {
  // For backward compatibility — updates multiple settings at once
  const updates = Object.entries(configData).map(([key, value]) =>
    supabase
      .from("config_settings")
      .update({
        value: String(value),
        updated_at: new Date().toISOString(),
      })
      .eq("key", key),
  );

  const results = await Promise.all(updates);
  const errors = results.filter((r) => r.error);
  if (errors.length > 0) throw errors[0].error;
}
