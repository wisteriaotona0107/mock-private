import type { FeedbackRequest, RecommendRequest, RecommendResponse } from "./types";

const API_BASE = "http://localhost:8000";

export async function recommend(payload: RecommendRequest): Promise<RecommendResponse> {
  const response = await fetch(`${API_BASE}/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Recommendation failed");
  }
  return response.json();
}

export async function sendFeedback(payload: FeedbackRequest): Promise<void> {
  const response = await fetch(`${API_BASE}/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Feedback failed");
  }
}
