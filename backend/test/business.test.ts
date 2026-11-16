import test from "node:test";
import assert from "node:assert/strict";
import { calculateBooking, canCancel } from "../src/business.ts";

const now = new Date("2026-11-16T10:00:00");
const base = { date:"2026-11-16", time:"14:00", durationMinutes:60, openingHour:8, closingHour:23, pricePerHour:10000 };

test("calcula precio normal para una hora fuera de hora pico", () => {
  assert.equal(calculateBooking(base, now).totalPrice, 10000);
});
test("aplica recargo del 20% desde las 18", () => {
  assert.equal(calculateBooking({...base,time:"18:00"}, now).totalPrice, 12000);
});
test("rechaza duraciones no permitidas", () => {
  assert.throws(() => calculateBooking({...base,durationMinutes:45}, now), /duración/);
});
test("rechaza reservas con menos de dos horas de anticipación", () => {
  assert.throws(() => calculateBooking({...base,time:"11:00"}, now), /2 horas/);
});
test("rechaza turnos que terminan después del cierre", () => {
  assert.throws(() => calculateBooking({...base,time:"22:00",durationMinutes:120}, now), /horario/);
});
test("permite cancelar con seis horas o más", () => {
  assert.equal(canCancel(new Date("2026-11-16T16:00:00"), now), true);
});
test("no permite cancelar con menos de seis horas", () => {
  assert.equal(canCancel(new Date("2026-11-16T15:59:00"), now), false);
});
