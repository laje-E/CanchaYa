import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CalendarDays, Check, ChevronDown, Clock3, MapPin, Menu, Search, ShieldCheck, Trophy, Users, X, Zap } from "lucide-react";
import { Booking, Court, request } from "./api";

const fallbackCourts: Court[] = [
  { id: 1, name: "Arena Fútbol Club", sport: "Fútbol 5", location: "Palermo, CABA", pricePerHour: 18000, imageUrl: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=85", description: "Césped sintético, iluminación LED y vestuarios.", capacity: 10 },
  { id: 2, name: "Punto Pádel", sport: "Pádel", location: "Villa Crespo, CABA", pricePerHour: 14000, imageUrl: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=1200&q=85", description: "Cancha panorámica con blindex e iluminación.", capacity: 4 },
  { id: 3, name: "Club Norte", sport: "Básquet", location: "Belgrano, CABA", pricePerHour: 22000, imageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=85", description: "Piso deportivo, tableros profesionales y tribunas.", capacity: 10 },
  { id: 4, name: "Tenis Parque", sport: "Tenis", location: "Caballito, CABA", pricePerHour: 16000, imageUrl: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=1200&q=85", description: "Polvo de ladrillo y entorno arbolado.", capacity: 4 },
  { id: 5, name: "Golazo Sports", sport: "Fútbol 7", location: "Núñez, CABA", pricePerHour: 26000, imageUrl: "https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=1200&q=85", description: "Cancha amplia con redes perimetrales.", capacity: 14 },
  { id: 6, name: "Urban Pádel", sport: "Pádel", location: "Almagro, CABA", pricePerHour: 15000, imageUrl: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1200&q=85", description: "Espacio moderno, alquiler de paletas disponible.", capacity: 4 }
];
const money = (n: number) => n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
const today = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

export default function App() {
  const [courts, setCourts] = useState<Court[]>(fallbackCourts);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [sport, setSport] = useState("Todos");
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<Court | null>(null);
  const [date, setDate] = useState(today());
  const [time, setTime] = useState("18:00");
  const [duration, setDuration] = useState(60);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState(localStorage.getItem("canchaya_user") || "");
  const [showAuth, setShowAuth] = useState(false);
  const [showBookings, setShowBookings] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("register");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");

  useEffect(() => {
    request<{ courts: Court[] }>("/courts").then(d => { if (d.courts.length) setCourts(d.courts); }).catch(() => {});
  }, []);
  useEffect(() => {
    if (user) request<{ bookings: Booking[] }>("/bookings/mine").then(d => setBookings(d.bookings)).catch(() => setBookings([]));
  }, [user]);

  const filtered = useMemo(() => courts.filter(c =>
    (sport === "Todos" || c.sport === sport) &&
    `${c.name} ${c.location} ${c.sport}`.toLowerCase().includes(search.toLowerCase())
  ), [courts, sport, search]);

  async function authenticate(e: React.FormEvent) {
    e.preventDefault(); setError("");
    try {
      const path = authMode === "register" ? "/auth/register" : "/auth/login";
      const result = await request<{ token: string; user: { name: string; email: string } }>(path, {
        method: "POST", body: JSON.stringify({ name: authName, email: authEmail, password: authPassword })
      });
      localStorage.setItem("canchaya_token", result.token);
      localStorage.setItem("canchaya_user", result.user.name);
      setUser(result.user.name); setShowAuth(false); setNotice(`¡Hola, ${result.user.name}! Ya podés reservar.`);
    } catch (e) { setError(e instanceof Error ? e.message : "No se pudo iniciar sesión."); }
  }
  async function reserve(e: React.FormEvent) {
    e.preventDefault(); if (!active) return;
    setError(""); setNotice("");
    if (!user) { setShowAuth(true); setError("Iniciá sesión o creá una cuenta para confirmar tu reserva."); return; }
    try {
      const result = await request<{ booking: Booking }>("/bookings", {
        method: "POST", body: JSON.stringify({ courtId: active.id, date, time, durationMinutes: duration })
      });
      setNotice(`¡Reserva confirmada! Código #${result.booking.id}. Total: ${money(result.booking.totalPrice)}.`);
      const refreshed = await request<{ bookings: Booking[] }>("/bookings/mine");
      setBookings(refreshed.bookings); setActive(null);
    } catch (e) { setError(e instanceof Error ? e.message : "No se pudo reservar."); }
  }
  async function cancelBooking(id: number) {
    try {
      await request(`/bookings/${id}/cancel`, { method: "PATCH" });
      setBookings(await request< { bookings: Booking[] }>("/bookings/mine").then(x => x.bookings));
      setNotice("La reserva fue cancelada."); setError("");
    } catch (e) { setError(e instanceof Error ? e.message : "No se pudo cancelar."); }
  }
  function logout() {
    localStorage.removeItem("canchaya_token"); localStorage.removeItem("canchaya_user");
    setUser(""); setBookings([]); setNotice("Cerraste sesión correctamente.");
  }

  return <div className="app">
    <header className="navbar">
      <a className="brand" href="#"><span className="brand-mark"><Zap size={21} fill="currentColor"/></span>cancha<span>ya.</span></a>
      <nav className={mobileMenu ? "nav-links open" : "nav-links"}>
        <a href="#canchas" onClick={() => setMobileMenu(false)}>Explorar canchas</a>
        <a href="#como-funciona" onClick={() => setMobileMenu(false)}>Cómo funciona</a>
        {user && <button className="nav-link-button" onClick={() => { setShowBookings(true); setMobileMenu(false); }}>Mis reservas</button>}
      </nav>
      <div className="nav-actions">
        {user ? <><span className="user-greeting">Hola, {user.split(" ")[0]}</span><button className="btn btn-outline btn-small" onClick={logout}>Salir</button></> :
          <button className="btn btn-outline btn-small" onClick={() => { setAuthMode("login"); setShowAuth(true); }}>Ingresar</button>}
        <a className="btn btn-primary btn-small nav-cta" href="#canchas">Reservar <ArrowRight size={15}/></a>
      </div>
      <button className="mobile-toggle" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Abrir menú">{mobileMenu ? <X/> : <Menu/>}</button>
    </header>

    {notice && <div className="toast success"><Check size={17}/>{notice}<button onClick={() => setNotice("")}><X size={16}/></button></div>}
    {error && <div className="toast error">{error}<button onClick={() => setError("")}><X size={16}/></button></div>}

    <main>
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-content">
          <div className="eyebrow"><span></span> TU PRÓXIMO PARTIDO EMPIEZA ACÁ</div>
          <h1>La cancha que<br/>buscás. <em>El partido</em><br/>que esperabas.</h1>
          <p>Encontrá, compará y reservá espacios deportivos cerca tuyo. Menos vueltas, más juego.</p>
          <div className="hero-buttons"><a className="btn btn-primary" href="#canchas">Encontrar una cancha <ArrowRight size={17}/></a><a className="text-link" href="#como-funciona">Cómo funciona <ArrowRight size={15}/></a></div>
          <div className="hero-stats"><div><strong>+120</strong><span>espacios deportivos</span></div><i></i><div><strong>4 deportes</strong><span>para elegir</span></div><i></i><div><strong>100%</strong><span>online y simple</span></div></div>
        </div>
        <div className="hero-tag"><Trophy size={16}/> EL DEPORTE TE ESTÁ LLAMANDO</div>
        <div className="hero-scroll">SCROLL PARA EXPLORAR <span></span></div>
      </section>

      <section className="quick-search">
        <div className="search-intro"><span className="section-kicker">ENCONTRÁ TU LUGAR</span><h2>¿Dónde jugamos?</h2></div>
        <div className="search-field"><Search size={18}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscá por cancha o barrio..."/></div>
        <div className="search-field sport-select"><Trophy size={18}/><select value={sport} onChange={e => setSport(e.target.value)}><option>Todos</option><option>Fútbol 5</option><option>Fútbol 7</option><option>Pádel</option><option>Básquet</option><option>Tenis</option></select><ChevronDown size={16}/></div>
        <a href="#canchas" className="btn btn-primary search-btn">Buscar <ArrowRight size={16}/></a>
      </section>

      <section className="sports-strip">
        {["Fútbol 5","Pádel","Básquet","Tenis"].map((s, i) => <button key={s} onClick={() => {setSport(s); document.getElementById("canchas")?.scrollIntoView({behavior:"smooth"});}} className={sport === s ? "sport-chip selected" : "sport-chip"}><span>{["⚽","🎾","🏀","🎾"][i]}</span>{s}<ArrowRight size={14}/></button>)}
      </section>

      <section className="section courts-section" id="canchas">
        <div className="section-heading"><div><span className="section-kicker">ELEGÍ TU PRÓXIMO DESTINO</span><h2>Canchas para <em>cada juego.</em></h2><p>Espacios seleccionados para que solo te preocupes por jugar.</p></div><span className="result-count">{filtered.length} ESPACIOS</span></div>
        <div className="court-grid">
          {filtered.map(c => <article className="court-card" key={c.id}>
            <div className="court-image"><img src={c.imageUrl} alt={c.name}/><span className="sport-label">{c.sport}</span><span className="image-price">{money(c.pricePerHour)} <small>/ hora</small></span></div>
            <div className="court-info"><div className="court-title-row"><h3>{c.name}</h3><span className="rating">★ 4.8</span></div><div className="location"><MapPin size={14}/>{c.location}</div><p>{c.description}</p><div className="court-bottom"><span><Users size={15}/> Hasta {c.capacity} personas</span><button className="btn btn-dark" onClick={() => {setActive(c);setDate(today());setError("");setNotice("");}}>Ver horarios <ArrowRight size={15}/></button></div></div>
          </article>)}
          {!filtered.length && <div className="empty-state">No encontramos canchas con esos filtros. Probá con otro deporte o barrio.</div>}
        </div>
      </section>

      <section className="feature-band" id="como-funciona"><div className="feature-copy"><span className="section-kicker">ASÍ DE FÁCIL</span><h2>Tu partido,<br/><em>a un par de clics.</em></h2><p>Organizar un partido nunca fue tan simple. Elegí el lugar, encontrá el horario y reservá en minutos.</p><a href="#canchas" className="btn btn-primary">Empezar ahora <ArrowRight size={16}/></a></div>
        <div className="steps"><div className="step"><span className="step-number">01</span><div><h3>Elegí tu cancha</h3><p>Explorá espacios por deporte, ubicación y precio.</p></div><Search/></div><div className="step"><span className="step-number">02</span><div><h3>Seleccioná un horario</h3><p>Consultá la disponibilidad y elegí cuánto querés jugar.</p></div><CalendarDays/></div><div className="step"><span className="step-number">03</span><div><h3>Confirmá y disfrutá</h3><p>Reservá online y recibí la confirmación al instante.</p></div><Check/></div></div>
      </section>

      <section className="trust-row"><div><ShieldCheck/><span><strong>Reservas seguras</strong><small>Tu horario queda protegido</small></span></div><div><Clock3/><span><strong>Disponibilidad clara</strong><small>Sin dobles reservas</small></span></div><div><Zap/><span><strong>Todo más simple</strong><small>Reservá en pocos pasos</small></span></div></section>
    </main>
    <footer><a className="brand" href="#"><span className="brand-mark"><Zap size={19} fill="currentColor"/></span>cancha<span>ya.</span></a><p>Encontrá tu juego. Reservá tu cancha. Viví el deporte.</p><small>© 2026 CanchaYa · Proyecto académico</small></footer>

    {active && <div className="modal-backdrop" onMouseDown={e => {if(e.target === e.currentTarget) setActive(null);}}><div className="modal">
      <button className="modal-close" onClick={() => setActive(null)}><X/></button><div className="modal-image"><img src={active.imageUrl} alt={active.name}/></div>
      <div className="modal-body"><span className="section-kicker">RESERVÁ TU LUGAR</span><h2>{active.name}</h2><div className="location"><MapPin size={14}/>{active.location} · {active.sport}</div><form onSubmit={reserve} className="booking-form">
        <label>Fecha<input type="date" min={today()} value={date} onChange={e => setDate(e.target.value)} required/></label>
        <label>Horario<select value={time} onChange={e => setTime(e.target.value)}>{Array.from({length:15},(_,i)=>`${String(i+8).padStart(2,"0")}:00`).map(t=><option key={t}>{t}</option>)}</select></label>
        <label className="full">Duración<select value={duration} onChange={e => setDuration(Number(e.target.value))}><option value={60}>60 minutos</option><option value={90}>90 minutos</option><option value={120}>120 minutos</option></select></label>
        <div className="price-summary"><span>Precio estimado</span><strong>{money(active.pricePerHour * duration / 60 * (Number(time.slice(0,2)) >= 18 ? 1.2 : 1))}</strong><small>La tarifa puede variar según la franja horaria.</small></div>
        <button className="btn btn-primary submit-booking" type="submit">Confirmar reserva <ArrowRight size={17}/></button>
      </form></div>
    </div></div>}

    {showAuth && <div className="modal-backdrop" onMouseDown={e => {if(e.target === e.currentTarget) setShowAuth(false);}}><div className="auth-modal"><button className="modal-close" onClick={() => setShowAuth(false)}><X/></button><span className="section-kicker">TU CUENTA CANCHAYA</span><h2>{authMode === "register" ? "Creá tu cuenta." : "Qué bueno verte."}</h2><p>Ingresá para gestionar tus reservas y organizar tu próximo partido.</p><form onSubmit={authenticate} className="auth-form">
      {authMode === "register" && <label>Nombre completo<input value={authName} onChange={e=>setAuthName(e.target.value)} required minLength={2} placeholder="Tu nombre"/></label>}
      <label>Email<input type="email" value={authEmail} onChange={e=>setAuthEmail(e.target.value)} required placeholder="nombre@email.com"/></label>
      <label>Contraseña<input type="password" value={authPassword} onChange={e=>setAuthPassword(e.target.value)} required minLength={8} placeholder="Mínimo 8 caracteres"/></label>
      <button className="btn btn-primary submit-booking">{authMode === "register" ? "Crear cuenta" : "Ingresar"} <ArrowRight size={16}/></button></form>
      <button className="switch-auth" onClick={()=>setAuthMode(authMode==="register"?"login":"register")}>{authMode==="register"?"¿Ya tenés cuenta? Ingresá":"¿Todavía no tenés cuenta? Registrate"}</button>
    </div></div>}

    {showBookings && <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setShowBookings(false);}}><div className="bookings-modal"><button className="modal-close" onClick={()=>setShowBookings(false)}><X/></button><span className="section-kicker">TU ACTIVIDAD</span><h2>Mis reservas.</h2>{bookings.length===0?<p className="no-bookings">Todavía no tenés reservas. ¡Encontrá tu próxima cancha!</p>:<div className="booking-list">{bookings.map(b=><div className="booking-item" key={b.id}><div><strong>{b.courtName}</strong><span>{b.sport} · {new Date(b.startAt).toLocaleString("es-AR",{dateStyle:"medium",timeStyle:"short"})}</span><small>{b.durationMinutes} min · {money(b.totalPrice)} · {b.status}</small></div>{b.status!=="CANCELLED"&&b.status!=="COMPLETED"&&<button className="cancel-btn" onClick={()=>cancelBooking(b.id)}>Cancelar</button>}</div>)}</div>}</div></div>}
  </div>;
}
