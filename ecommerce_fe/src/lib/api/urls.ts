/**
 * Single source for backend URLs (build-time NEXT_PUBLIC_* values).
 *   NEXT_PUBLIC_API_URL  e.g. https://airbnb.kaitr.dev/api/v1   (default http://localhost:8000/api/v1)
 *   NEXT_PUBLIC_WS_URL   e.g. wss://airbnb.kaitr.dev/ws         (default ws://localhost:8080)
 * Some backend routers live outside /api/v1 (/api/sending_bid, /winlose, /winner): use API_ORIGIN.
 */
export const API_V1 = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1').replace(/\/$/, '')
export const API_ORIGIN = API_V1.replace(/\/api\/v1$/, '')
export const WS_URL = (process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080').replace(/\/$/, '')
