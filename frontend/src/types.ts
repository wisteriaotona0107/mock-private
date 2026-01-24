export type Preference = {
  sweet: number;
  fruity: number;
  crisp: number;
  pairing?: string;
  budget_min?: number;
  budget_max?: number;
};

export type RecommendRequest = {
  user_text: string;
  prefs: Preference;
};

export type Citation = {
  doc_id: string;
  quote: string;
  source: string;
};

export type Candidate = {
  candidate_id: string;
  text: string;
  citations: Citation[];
};

export type RecommendResponse = {
  request_id: string;
  best: Candidate;
  alternates: Candidate[];
  debug?: Record<string, unknown>;
};

export type FeedbackRequest = {
  request_id: string;
  rating: "good" | "meh" | "bad";
  selected: string;
  comment?: string;
};
