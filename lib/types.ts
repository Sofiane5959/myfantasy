/**
 * Forme retournée par la fonction SQL `discovery_feed()`.
 *
 * Noter l'absence de `display_name` : avant match mutuel, le nom ne quitte
 * jamais la base. Le floutage n'est plus une décoration CSS.
 */
export type DiscoveryProfile = {
  id: string;
  age: number;
  role: string;
  intensity: string;
  categories: string[];
  shared_categories: string[];
  note: string | null;
  avatar_color: string;
  verified: boolean;
  online: boolean;
  score: number;
  score_intensity: number;
  score_role: number;
  score_categories: number;
};

/** Un match mutuel, donc un profil dont on a le droit de connaître le nom. */
export type Conversation = {
  matchId: string;
  safeWord: string;
  peer: {
    id: string;
    displayName: string;
    age: number;
    avatarColor: string;
    verified: boolean;
    online: boolean;
  };
  lastMessage: { body: string; createdAt: string } | null;
};

export type ChatMessage = {
  id: string;
  match_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export type MyProfile = {
  id: string;
  display_name: string;
  birthdate: string;
  role: string;
  intensity: string;
  categories: string[];
  seeking: string[];
  note: string | null;
  is_visible: boolean;
  verified: boolean;
};
