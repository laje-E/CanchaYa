import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { pool } from "./db.js";
import { requireAuth, requireAdmin, signToken } from "./auth.js";
import { calculateBooking, canCancel } from "./business.js";

export const router = Router();

router.get("/health", (_req, res) => res.json({ status: "ok", service: "CanchaYa API" }));

router.post("/auth/register", async (req, res, next) => {
  try {
    const data = z.object({ name: z.string().trim().min(2).max(100), email: z.string().email(), password: z.string().min(8).max(100) }).parse(req.body);
    const hash = await bcrypt.hash(data.password, 12);
    const result = await pool.query("INSERT INTO users(name,email,password_hash) VALUES($1,$2,$3) RETURNING id,name,email,role", [data.name, data.email.toLowerCase(), hash]);
    const user = result.rows[0];
    res.status(201).json({ user, token: signToken(user) });
  } catch (e: any) { if (e.code === "23505") return res.status(409).json({ error: "Ya existe una cuenta con ese email." }); next(e); }
});

router.post("/auth/login", async (req, res, next) => {
  try {
    const data = z.object({ email: z.string().email(), password: z.string().min(1) }).parse(req.body);
    const result = await pool.query("SELECT id,name,email,role,password_hash FROM users WHERE email=$1", [data.email.toLowerCase()]);
    const row = result.rows[0];
    if (!row || !(await bcrypt.compare(data.password, row.password_hash))) return res.status(401).json({ error: "Email o contraseña incorrectos." });
    const user = { id: row.id, name: row.name, email: row.email, role: row.role };
    res.json({ user, token: signToken(user) });
  } catch (e) { next(e); }
});

router.get("/courts", async (req, res, next) => {
  try {
    const result = await pool.query(`SELECT id,name,sport,location,price_per_hour AS "pricePerHour",image_url AS "imageUrl",description,capacity
      FROM courts WHERE active=TRUE ORDER BY id`);
    res.json({ courts: result.rows });
  } catch (e) { next(e); }
});

router.post("/courts", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const d = z.object({ name:z.string().min(2), sport:z.string().min(2), location:z.string().min(2), pricePerHour:z.number().positive(), imageUrl:z.string().url(), description:z.string(), capacity:z.number().int().positive(), openingHour:z.number().int().min(0).max(23), closingHour:z.number().int().min(1).max(24) }).parse(req.body);
    const r = await pool.query(`INSERT INTO courts(name,sport,location,price_per_hour,image_url,description,capacity,opening_hour,closing_hour)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`, [d.name,d.sport,d.location,d.pricePerHour,d.imageUrl,d.description,d.capacity,d.openingHour,d.closingHour]);
    res.status(201).json({ id:r.rows[0].id });
  } catch (e) { next(e); }
});

router.get("/bookings/mine", requireAuth, async (req, res, next) => {
  try {
    const result = await pool.query(`SELECT b.id,b.court_id AS "courtId",c.name AS "courtName",c.sport,b.start_at AS "startAt",
      b.duration_minutes AS "durationMinutes",b.total_price AS "totalPrice",b.status
      FROM bookings b JOIN courts c ON c.id=b.court_id WHERE b.user_id=$1 ORDER BY b.start_at DESC`, [req.user!.id]);
    res.json({ bookings: result.rows });
  } catch (e) { next(e); }
});

router.post("/bookings", requireAuth, async (req, res, next) => {
  const client = await pool.connect();
  try {
    const d = z.object({ courtId:z.number().int().positive(), date:z.string(), time:z.string(), durationMinutes:z.number().int() }).parse(req.body);
    await client.query("BEGIN");
    const courtResult = await client.query("SELECT * FROM courts WHERE id=$1 AND active=TRUE FOR UPDATE", [d.courtId]);
    if (!courtResult.rowCount) { await client.query("ROLLBACK"); return res.status(404).json({ error:"La cancha no existe o no está disponible." }); }
    const court = courtResult.rows[0];
    // Serializa las creaciones de un mismo usuario, incluso si reserva canchas distintas.
    await client.query("SELECT pg_advisory_xact_lock($1::bigint)", [req.user!.id]);
    const future = await client.query("SELECT COUNT(*)::int AS count FROM bookings WHERE user_id=$1 AND status IN ('PENDING','CONFIRMED') AND start_at>NOW()", [req.user!.id]);
    if (future.rows[0].count >= 3) { await client.query("ROLLBACK"); return res.status(409).json({ error:"Ya tenés 3 reservas futuras activas. Cancelá una antes de reservar otra." }); }
    const calculated = calculateBooking({ date:d.date,time:d.time,durationMinutes:d.durationMinutes,openingHour:court.opening_hour,closingHour:court.closing_hour,pricePerHour:Number(court.price_per_hour) });
    const inserted = await client.query(`INSERT INTO bookings(user_id,court_id,start_at,end_at,duration_minutes,total_price)
      VALUES($1,$2,$3,$4,$5,$6) RETURNING id,court_id AS "courtId",start_at AS "startAt",duration_minutes AS "durationMinutes",total_price AS "totalPrice",status`,
      [req.user!.id,d.courtId,calculated.start,calculated.end,d.durationMinutes,calculated.totalPrice]);
    await client.query("COMMIT");
    res.status(201).json({ booking: { ...inserted.rows[0], courtName:court.name, sport:court.sport } });
  } catch (e: any) {
    await client.query("ROLLBACK");
    if (e.code === "23P01" || e.code === "23505") return res.status(409).json({ error:"Ese horario acaba de ser reservado. Elegí otro horario." });
    if (e instanceof Error && ["La duración debe ser de 60, 90 o 120 minutos.","La fecha o el horario no son válidos.","La fecha no es válida.","Las reservas deben realizarse con al menos 2 horas de anticipación.","El turno queda fuera del horario de atención."].includes(e.message)) return res.status(400).json({ error:e.message });
    next(e);
  } finally { client.release(); }
});

router.patch("/bookings/:id/cancel", requireAuth, async (req, res, next) => {
  try {
    const result = await pool.query("SELECT id,start_at,status FROM bookings WHERE id=$1 AND user_id=$2", [req.params.id,req.user!.id]);
    const booking = result.rows[0];
    if (!booking) return res.status(404).json({ error:"No encontramos esa reserva." });
    if (booking.status !== "CONFIRMED") return res.status(409).json({ error:"La reserva no se encuentra activa." });
    if (!canCancel(new Date(booking.start_at))) return res.status(409).json({ error:"Solo podés cancelar hasta 6 horas antes del turno." });
    await pool.query("UPDATE bookings SET status='CANCELLED' WHERE id=$1", [booking.id]);
    res.json({ message:"Reserva cancelada." });
  } catch (e) { next(e); }
});

router.use((err: any, _req: any, res: any, _next: any) => {
  if (err?.name === "ZodError") return res.status(400).json({ error:"Revisá los datos ingresados.", details:err.issues });
  console.error(err);
  res.status(500).json({ error:"Ocurrió un error interno. Intentá nuevamente." });
});
