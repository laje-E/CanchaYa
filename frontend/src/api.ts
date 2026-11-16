// Normaliza la URL de la API: quita barras finales y agrega "/api" si falta,
// porque el backend expone todas sus rutas bajo /api.
function buildApiUrl(raw?: string): string {
  const base = (raw || "http://localhost:3000").trim().replace(/\/+$/, "");
  return base.endsWith("/api") ? base : `${base}/api`;
}
const API = buildApiUrl(import.meta.env.VITE_API_URL);
export type Court = {
  id: number; name: string; sport: string; location: string; pricePerHour: number;
  imageUrl: string; description: string; capacity: number;
};
export type Booking = {
  id: number; courtId: number; courtName: string; sport: string; startAt: string;
  durationMinutes: number; totalPrice: number; status: string;
};
export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("canchaya_token");
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "No se pudo completar la operación.");
  return data as T;
}