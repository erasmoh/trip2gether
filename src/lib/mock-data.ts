import type { Activity, Comment, Trip, TripMember, User } from "./types";

// ---------------------------------------------------------------------------
// Mock data. Structured exactly like the future Supabase tables so the store
// can be swapped for real queries later without touching the UI.
// ---------------------------------------------------------------------------

// Trip ids are UUIDs, matching the Supabase `trips.id` column
// (gen_random_uuid()). They are what shows in the URL unless the trip has a
// custom slug.
const T_JAPAN = "3f9a2c4e-7b1d-4e6a-9c2f-5d8e1a7b3c90";
const T_PATAGONIA = "b7e3d1f5-2a8c-4f0b-8e6d-1c9a4b2f7e35";
const T_LISBON = "6d2f8b1a-9e4c-4a7d-b3f0-8a5c2e9d1b46";

export const users: User[] = [
  {
    id: "u_ana",
    fullName: "Ana Torres",
    email: "ana@example.com",
    avatarColor: "#f97316",
    registered: true,
    // Cuenta de pago: puede reclamar URLs cortas personalizadas.
    plan: "paid",
  },
  {
    id: "u_bruno",
    fullName: "Bruno Díaz",
    email: "bruno@example.com",
    avatarColor: "#3b82f6",
    registered: true,
    plan: "free",
  },
  {
    id: "u_carla",
    fullName: "Carla Méndez",
    email: "carla@example.com",
    avatarColor: "#10b981",
    // Invitada pero aún no completa su registro (para probar el alta por OTP).
    registered: false,
    plan: "paid",
  },
  {
    id: "u_diego",
    fullName: "Diego Rojas",
    email: "diego@example.com",
    avatarColor: "#a855f7",
    registered: true,
    plan: "free",
  },
  {
    id: "u_elena",
    fullName: "Elena Vidal",
    email: "elena@example.com",
    avatarColor: "#ec4899",
    registered: false,
    plan: "free",
  },
];

export const trips: Trip[] = [
  {
    id: T_JAPAN,
    name: "Aventura en Japón",
    destination: "Tokio & Kioto, Japón",
    description:
      "Viaje de primavera para ver los cerezos en flor, templos y la mejor comida callejera.",
    startDate: "2026-04-03",
    endDate: "2026-04-06",
    coverColor: "#ef4444",
    createdBy: "u_ana",
  },
  {
    id: T_PATAGONIA,
    name: "Trekking en Patagonia",
    destination: "El Chaltén, Argentina",
    description:
      "Escapada de montaña con senderismo, glaciares y noches de asado bajo las estrellas.",
    startDate: "2026-11-14",
    endDate: "2026-11-16",
    coverColor: "#0ea5e9",
    createdBy: "u_bruno",
  },
  {
    id: T_LISBON,
    // URL corta reclamada por Carla (cuenta de pago). Sirve para probar la
    // resolución por slug y los errores de "ya está en uso".
    slug: "lisboa-finde",
    name: "Fin de semana en Lisboa",
    destination: "Lisboa, Portugal",
    description:
      "City break con miradores, tranvías, pastéis de nata y fado en la Alfama.",
    startDate: "2026-06-19",
    endDate: "2026-06-21",
    coverColor: "#22c55e",
    createdBy: "u_carla",
  },
];

export const tripMembers: TripMember[] = [
  // Japón: Ana (org), Bruno, Carla
  { id: "m_1", tripId: T_JAPAN, userId: "u_ana", role: "organizer", status: "accepted", canEdit: true },
  { id: "m_2", tripId: T_JAPAN, userId: "u_bruno", role: "traveler", status: "accepted", canEdit: true },
  { id: "m_3", tripId: T_JAPAN, userId: "u_carla", role: "traveler", status: "pending", canEdit: false },
  // Patagonia: Bruno (org), Diego, Ana
  { id: "m_4", tripId: T_PATAGONIA, userId: "u_bruno", role: "organizer", status: "accepted", canEdit: true },
  { id: "m_5", tripId: T_PATAGONIA, userId: "u_diego", role: "traveler", status: "accepted", canEdit: true },
  { id: "m_6", tripId: T_PATAGONIA, userId: "u_ana", role: "traveler", status: "accepted", canEdit: false },
  // Lisboa: Carla (org), Elena
  { id: "m_7", tripId: T_LISBON, userId: "u_carla", role: "organizer", status: "accepted", canEdit: true },
  { id: "m_8", tripId: T_LISBON, userId: "u_elena", role: "traveler", status: "accepted", canEdit: false },
];

export const activities: Activity[] = [
  // --- Japón day 1 ---
  {
    id: "a_1",
    tripId: T_JAPAN,
    dayDate: "2026-04-03",
    startTime: "09:00",
    endTime: "11:00",
    title: "Mercado de Tsukiji",
    location: "Tsukiji Outer Market",
    description: "Desayuno de sushi y street food. Llegar temprano para evitar filas.",
    createdBy: "u_ana",
    sortOrder: 0,
  },
  {
    id: "a_2",
    tripId: T_JAPAN,
    dayDate: "2026-04-03",
    startTime: "14:00",
    endTime: "17:00",
    title: "Templo Senso-ji",
    location: "Asakusa",
    description: "Paseo por Nakamise y el templo. Comprar amuletos omamori.",
    createdBy: "u_bruno",
    sortOrder: 1,
  },
  // --- Japón day 2 ---
  {
    id: "a_3",
    tripId: T_JAPAN,
    dayDate: "2026-04-04",
    startTime: "08:30",
    endTime: "12:00",
    title: "Tren bala a Kioto",
    location: "Estación de Tokio",
    description: "Reservar asientos lado monte Fuji. Comprar bento para el viaje.",
    createdBy: "u_ana",
    sortOrder: 0,
  },
  {
    id: "a_4",
    tripId: T_JAPAN,
    dayDate: "2026-04-04",
    startTime: "15:00",
    title: "Fushimi Inari",
    location: "Kioto",
    description: "Caminata entre los mil toriis al atardecer.",
    createdBy: "u_ana",
    sortOrder: 1,
  },
  // --- Patagonia day 1 ---
  {
    id: "a_5",
    tripId: T_PATAGONIA,
    dayDate: "2026-11-14",
    startTime: "07:00",
    endTime: "16:00",
    title: "Laguna de los Tres",
    location: "Sendero Fitz Roy",
    description: "Trekking exigente de 8h. Llevar 2L de agua y snacks.",
    createdBy: "u_bruno",
    sortOrder: 0,
  },
  {
    id: "a_6",
    tripId: T_PATAGONIA,
    dayDate: "2026-11-15",
    startTime: "10:00",
    endTime: "13:00",
    title: "Navegación glaciar Viedma",
    location: "Bahía Túnel",
    description: "Excursión en barco al glaciar. Reservar con anticipación.",
    createdBy: "u_diego",
    sortOrder: 0,
  },
  // --- Lisboa day 1 ---
  {
    id: "a_7",
    tripId: T_LISBON,
    dayDate: "2026-06-19",
    startTime: "10:00",
    endTime: "12:30",
    title: "Tranvía 28 + Alfama",
    location: "Martim Moniz",
    description: "Recorrido clásico y paseo por los callejones de la Alfama.",
    createdBy: "u_carla",
    sortOrder: 0,
  },
  {
    id: "a_8",
    tripId: T_LISBON,
    dayDate: "2026-06-19",
    startTime: "20:00",
    title: "Cena con fado",
    location: "Alfama",
    description: "Reservar mesa en casa de fado. Probar bacalao à brás.",
    createdBy: "u_elena",
    sortOrder: 1,
  },
];

export const comments: Comment[] = [
  {
    id: "c_1",
    activityId: "a_1",
    userId: "u_bruno",
    body: "¿Vamos en metro o caminando desde el hotel?",
    createdAt: "2026-03-01T10:15:00Z",
  },
  {
    id: "c_2",
    activityId: "a_1",
    userId: "u_ana",
    body: "En metro, son 15 min. Salimos 8:15 del lobby.",
    createdAt: "2026-03-01T11:02:00Z",
  },
  {
    id: "c_3",
    activityId: "a_4",
    userId: "u_bruno",
    body: "El atardecer suena perfecto para las fotos 📸",
    createdAt: "2026-03-02T09:30:00Z",
  },
  {
    id: "c_4",
    activityId: "a_5",
    userId: "u_diego",
    body: "¿Alguien tiene bastones de trekking extra?",
    createdAt: "2026-10-20T18:45:00Z",
  },
  {
    id: "c_5",
    activityId: "a_7",
    userId: "u_elena",
    body: "Compremos el billete de tranvía por adelantado para no hacer fila.",
    createdAt: "2026-05-15T14:20:00Z",
  },
];

// Bundled snapshot used to seed the client store.
export const seedData = {
  users,
  trips,
  tripMembers,
  activities,
  comments,
};
