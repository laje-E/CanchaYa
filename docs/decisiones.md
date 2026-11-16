# decisiones.md

| Tema | Pregunta | Decisión |
|---|---|---|
| Stack | ¿Qué tecnologías usar? | React + TypeScript, Express + TypeScript y PostgreSQL, como recomienda la consigna. |
| Duraciones | ¿Cuánto dura un turno? | 60, 90 o 120 minutos. |
| Anticipación | ¿Con cuánta anticipación reservar? | Mínimo 2 horas. |
| Cancelación | ¿Hasta cuándo cancelar? | Hasta 6 horas antes del inicio. |
| Límite | ¿Cuántas reservas futuras activas puede tener una persona? | Máximo 3. |
| Precio | ¿Cómo se calcula? | Precio por hora proporcional a la duración; 20% adicional desde las 18:00. |
| Solapamiento | ¿Cómo impedir dobles reservas incluso en simultáneo? | Restricción de exclusión GiST en PostgreSQL sobre rangos horarios activos. |
| Estados | ¿Qué estados existen? | PENDING, CONFIRMED, CANCELLED y COMPLETED. El MVP crea CONFIRMED. |
| Seguridad | ¿Cómo autenticar? | Contraseña con hash bcrypt y token JWT. |
| Publicación | ¿Dónde desplegar? | Netlify, Render y Neon, sujetos a configuración de cuentas. |
