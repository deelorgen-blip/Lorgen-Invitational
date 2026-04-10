export interface Tournament {
  id: string
  name: string
  date: string | null
  course: string | null
  format: string | null
  holes: number
  status: 'upcoming' | 'active' | 'completed'
  handicap_pct: number
  coin_back_image_url: string | null
  created_at: string
}

export interface HoleConfig {
  id: string
  tournament_id: string
  hole: number
  par: number
  stroke_index: number | null
  requires_photo: boolean
  is_longest_drive: boolean
  is_nearest_flag: boolean
}

export interface Team {
  id: string
  tournament_id: string
  name: string
  pin: string
  player1: string | null
  player2: string | null
  handicap: number
  created_at: string
}

export interface Score {
  id: string
  team_id: string
  hole: number
  strokes: number | null
  points: number | null
  submitted_at: string
}

export interface SpecialAward {
  id: string
  tournament_id: string
  type: 'longest_drive' | 'closest_to_pin'
  hole: number | null
  team_id: string | null
  value: string | null
  photo_url: string | null
  created_at: string
  teams?: Team
}

export interface Photo {
  id: string
  tournament_id: string
  team_id: string | null
  storage_path: string
  hole: number | null
  caption: string | null
  votes: number
  created_at: string
  teams?: Team
}

export interface Sponsor {
  id: string
  name: string
  logo_url: string | null
  website_url: string | null
  visible: boolean
  sort_order: number
}

export interface HallOfFameEntry {
  id: string
  year: number
  team_name: string
  player1: string | null
  player2: string | null
  format: string | null
  score: string | null
  notes: string | null
}

export interface ChatMessage {
  id: string
  tournament_id: string
  team_id: string | null
  team_name: string | null
  message: string
  type: 'message' | 'birdie_shoutout'
  created_at: string
}

export interface LeaderboardEntry {
  team: Team
  grossStrokes: number
  netStrokes: number
  vsPar: number
  holesPlayed: number
  scores: Score[]
}
