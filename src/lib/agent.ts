const AGENT_URL = process.env.NEXT_PUBLIC_AGENT_URL || "http://localhost:8000";

export interface GenerateRequest {
  subject: string;
  topic: string;
  cbse_class: string; // "9" | "10" | "11" | "12"
  total_marks: number;
  duration_minutes: number;
  mcq_count: number;
  assertion_reason_count: number;
  very_short_answer_count: number;
  short_answer_count: number; // SA-I (2 marks)
  short_answer_ii_count: number; // SA-II (3 marks)
  long_answer_count: number; // LA (5 marks)
  case_based_count: number; // Case/Passage based (4 marks)
  easy_percent: number;
  medium_percent: number;
  hard_percent: number;
  document_urls: string[];
  special_instructions: string;
}

export interface GenerateResponse {
  run_id: string;
  status: string;
}

export interface Question {
  question_id: string;
  question_type: "mcq" | "assertion_reason" | "very_short_answer" | "short_answer" | "long_answer" | "case_based";
  question_text: string;
  marks: number;
  difficulty: "easy" | "medium" | "hard";
  options: string[] | null;
  correct_answer: string | null;
  model_answer: string | null;
  topic_tag: string;
  blooms_level?: string;
}

export interface Section {
  name: string;
  section_id?: string;
  description: string;
  total_marks: number;
  question_ids: string[];
}

export interface ExamPaper {
  paper_id: string;
  title: string;
  subject: string;
  topic: string;
  cbse_class: string;
  total_marks: number;
  duration_minutes: number;
  sections: Section[];
  questions: Question[];
  created_at: string;
  general_instructions?: string[];
}

export interface PaperRecord {
  run_id: string;
  exam_config: GenerateRequest;
  created_at: string;
  status: string;
  paper?: {
    title: string;
    total_marks: number;
  };
}

export async function startGeneration(req: GenerateRequest): Promise<GenerateResponse> {
  const res = await fetch(`${AGENT_URL}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Failed to start generation");
  }
  return res.json();
}

export async function fetchPaper(runId: string): Promise<{ paper: ExamPaper }> {
  const res = await fetch(`/api/papers/${runId}`);
  if (!res.ok) throw new Error("Paper not found");
  return res.json();
}

export async function fetchPapers(limit = 20): Promise<{ papers: PaperRecord[] }> {
  const res = await fetch(`${AGENT_URL}/papers?limit=${limit}`);
  if (!res.ok) throw new Error("Failed to fetch papers");
  return res.json();
}

export function createSSEStream(
  runId: string,
  onStatus: (data: { status: string; progress: number; message: string }) => void,
  onComplete: (data: { paper: ExamPaper }) => void,
  onError: (msg: string) => void
) {
  const evtSource = new EventSource(`/api/papers/${runId}/stream`);

  evtSource.addEventListener("status", (e) => {
    try {
      const data = JSON.parse(e.data);
      onStatus(data);
    } catch {}
  });

  evtSource.addEventListener("complete", (e) => {
    try {
      const data = JSON.parse(e.data);
      onComplete(data);
    } catch {}
    evtSource.close();
  });

  evtSource.addEventListener("error", (e: MessageEvent) => {
    try {
      const data = JSON.parse(e.data);
      onError(data.message || "Unknown error");
    } catch {
      onError("Connection error");
    }
    evtSource.close();
  });

  evtSource.onerror = () => {
    onError("SSE connection failed");
    evtSource.close();
  };

  return () => evtSource.close();
}
