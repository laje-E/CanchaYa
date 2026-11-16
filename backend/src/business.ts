export type BookingInput = { date: string; time: string; durationMinutes: number; openingHour: number; closingHour: number; pricePerHour: number };
export function calculateBooking(input: BookingInput, now = new Date()) {
  const { date, time, durationMinutes, openingHour, closingHour, pricePerHour } = input;
  if (![60, 90, 120].includes(durationMinutes)) throw new Error("La duración debe ser de 60, 90 o 120 minutos.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new Error("La fecha o el horario no son válidos.");
  const start = new Date(`${date}T${time}:00`);
  if (Number.isNaN(start.getTime())) throw new Error("La fecha no es válida.");
  const minAdvance = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  if (start < minAdvance) throw new Error("Las reservas deben realizarse con al menos 2 horas de anticipación.");
  const end = new Date(start.getTime() + durationMinutes * 60000);
  const opening = new Date(start); opening.setHours(openingHour, 0, 0, 0);
  const closing = new Date(start); closing.setHours(closingHour, 0, 0, 0);
  if (start < opening || end > closing) throw new Error("El turno queda fuera del horario de atención.");
  const peak = start.getHours() >= 18 ? 1.2 : 1;
  const totalPrice = Math.round(pricePerHour * durationMinutes / 60 * peak * 100) / 100;
  return { start, end, totalPrice };
}
export function canCancel(startAt: Date, now = new Date()) {
  return startAt.getTime() - now.getTime() >= 6 * 60 * 60 * 1000;
}
