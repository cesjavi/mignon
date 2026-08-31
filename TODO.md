# 📋 Mignon - Próximas Tareas (Roadmap)

## ⏳ Tarea Prioritaria: Prevención de Peticiones Seguidas & Cuota Límite

### 🎯 Objetivo
1. **Evitar spam / clics seguidos:** Bloquear peticiones consecutivas inmediatas mediante cooldown / debounce.
2. **Establecer límite de uso (Cuotas):** Limitar la cantidad máxima de consultas permitidas por usuario, IP, sesión o API Key (ej. máximo 5 o 10 consultas por sesión/día).

---

### 🛠️ Especificación Técnica Planificada

#### 1. Cooldown & Debounce Anti-Spam (Tiempo entre peticiones)
* **Widget / Frontend:**
  - Deshabilitar el botón de ejecución inmediatamente al hacer clic.
  - Temporizador de enfriamiento visual (*cooldown de 3 a 5 segundos*) antes de permitir otra ejecución.
  - Cancelación de peticiones redundantes en vuelo.
* **Backend:**
  - Bloqueo de ráfagas: mínimo 2 segundos entre consultas de la misma IP / `sessionId`.

#### 2. Límite de Cuota por Sesión / IP / Mini-App (Usage Quota Limit)
* **Límite de Consultas Gratuitas:**
  - Contador de ejecuciones por `sessionId` o IP (ejemplo: **máximo 5 a 10 consultas gratis**).
  - Al alcanzar el cupo máximo, mostrar un mensaje claro en el widget:
    > *"Has alcanzado el límite gratuito de consultas para esta sesión. Vuelve más tarde o contacta al administrador."*
* **Configuración en el Editor de Mini-Apps:**
  - `maxRequestsPerSession: 10` (campo configurable por el creador).
  - `cooldownSeconds: 3`
* **Protección a Nivel de API Gateway:**
  - Control de cuotas por API Key (ej. 100 req/día para tier Free, 10.000 req/día para Enterprise).
  - Headers HTTP estándar: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`.

---

*Anotado el 2026-08-31 • Listo para retomar e implementar al despertar.* ☕
