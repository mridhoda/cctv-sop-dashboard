export const DASHBOARD_PATHS = {
  home: "/dashboard",
  monitoring: "/dashboard/monitoring",
  history: "/dashboard/history",
  identities: "/dashboard/identities",
  reports: "/dashboard/reports",
  cameras: "/dashboard/cameras",
  settings: "/dashboard/settings",
  profile: "/dashboard/profile",
};

export function getDashboardPath(tab) {
  return DASHBOARD_PATHS[tab] ?? DASHBOARD_PATHS.home;
}

export function getDefaultDashboardPath(allowedTabs = []) {
  if (!Array.isArray(allowedTabs) || allowedTabs.length === 0) {
    return DASHBOARD_PATHS.home;
  }

  return getDashboardPath(allowedTabs[0]);
}
