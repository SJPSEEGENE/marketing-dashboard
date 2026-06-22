export const ADMIN_SESSION_KEY = 'marketing_dashboard_admin';

export function loginAdmin(id: string, password: string) {
  const adminId = process.env.NEXT_PUBLIC_ADMIN_ID || 'admin';
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin1234';
  if (id === adminId && password === adminPassword) {
    localStorage.setItem(ADMIN_SESSION_KEY, 'true');
    return true;
  }
  return false;
}

export function isAdminLoggedIn() {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(ADMIN_SESSION_KEY) === 'true';
}

export function logoutAdmin() {
  localStorage.removeItem(ADMIN_SESSION_KEY);
}
