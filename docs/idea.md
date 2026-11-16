# idea.md — CanchaYa

## Problema
La búsqueda y reserva de espacios deportivos suele requerir consultas manuales por teléfono o mensajería. Esto dificulta comparar opciones y conocer si un horario está realmente disponible.

## Solución
CanchaYa es una plataforma web para descubrir canchas deportivas, consultar sus características, crear una cuenta y reservar turnos. El sistema administra las reglas de disponibilidad, anticipación, duración, cancelación, cupos de reservas y cálculo de precios.

## Usuarios
- Visitante: consulta el catálogo.
- Usuario registrado: crea y administra sus reservas.
- Administrador: administra el catálogo de canchas (rol previsto en la API).

## Alcance del MVP
Incluye catálogo, filtros, registro, inicio de sesión, reservas, consulta de reservas, cancelación, cálculo de precio y persistencia PostgreSQL.
No incluye pagos en línea, chat, reseñas verificadas, notificaciones por email ni gestión de múltiples sedes con cuentas independientes.

## Supuestos iniciales
- Moneda: pesos argentinos (ARS).
- Zona horaria operativa: la del establecimiento; el MVP usa la zona horaria del servidor/navegador y debe fijarse a `America/Argentina/Buenos_Aires` al desplegar.
- Los precios de las canchas son por hora.
- Franja pico: desde las 18:00, con recargo del 20%.
- La reserva queda confirmada al insertarse correctamente en la base de datos.
