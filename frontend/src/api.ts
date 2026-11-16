const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
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
