/**
 * Taxonomie partagée entre l'onboarding, le scoring SQL et l'affichage.
 * Les libellés de ROLES et INTENSITIES doivent rester alignés avec les
 * contraintes CHECK de supabase/migrations/0001_init.sql.
 */

export const CATEGORIES = [
  { emoji: "👥", label: "Multi-partenaires", hint: "Trio · Groupe · Orgie" },
  { emoji: "⛓", label: "Pouvoir & Rough", hint: "BDSM · Dom/Sub · Rough" },
  { emoji: "✨", label: "Nouveauté & Aventure", hint: "One-shot · Inconnu·e · Surprise" },
  { emoji: "🎭", label: "Tabou & Fetish", hint: "Roleplay · Fétiche · Interdit" },
  { emoji: "🌹", label: "Romance & Passion", hint: "Tendre · Intense · Connexion" },
  { emoji: "🔄", label: "Non-monogamie", hint: "Open · Swing · Polyamour" },
  { emoji: "🌊", label: "Flexibilité érotique", hint: "Gender-bending · Fluide" },
] as const;

export const INTENSITIES = [
  { emoji: "🌱", label: "Curieuse", hint: "Je veux explorer doucement, sans pression" },
  { emoji: "🔥", label: "Ouverte", hint: "J'ai des envies précises à concrétiser" },
  { emoji: "⚡", label: "Assumée", hint: "Je sais ce que je veux et je le cherche" },
  { emoji: "🌑", label: "Experte", hint: "Je cherche quelqu'un vraiment à mon niveau" },
] as const;

export const ROLES = [
  "Dominante",
  "Soumise",
  "Switch",
  "Égalitaire",
  "Sans rôle défini",
] as const;

export const SEEKING = [
  "Une femme",
  "Un homme",
  "Peu importe",
  "Un couple",
  "Un groupe",
] as const;

export const HARD_LIMITS = [
  "Pénétration",
  "Fluides corporels",
  "Douleur physique",
  "Humiliation",
  "Vidéo/Photo",
  "Nuits entières",
  "Contacts post-rencontre",
  "Âge gap",
] as const;

export const AVATAR_COLORS = [
  "#C4427E",
  "#7F77DD",
  "#378ADD",
  "#5DB87A",
  "#D4884A",
  "#B090D4",
] as const;

export const CATEGORY_LABELS: readonly string[] = CATEGORIES.map((c) => c.label);
export const INTENSITY_LABELS: readonly string[] = INTENSITIES.map((i) => i.label);
