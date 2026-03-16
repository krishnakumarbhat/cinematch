export enum ContentType {
  Movie = 'Movie',
  Series = 'Series',
  Anime = 'Anime',
  Unknown = 'Unknown'
}

export interface WatchedItem {
  id: string;
  title: string;
}

export interface Recommendation {
  title: string;
  type: ContentType;
  score: number;
  reason: string;
  description: string;
  year?: number;
  source_algorithm: string;
}

export interface ClassificationResult {
  input: string;
  matched_title: string | null;
  type: ContentType | 'Unknown';
  confidence: number;
}

export interface AlgorithmResults {
  content_based: Recommendation[];
  collaborative: Recommendation[];
  hybrid: Recommendation[];
  sequential: Recommendation[];
}

export interface RecommendResponse {
  user: {
    id: number;
    username: string;
  };
  watched_titles: string[];
  classification: ClassificationResult[];
  algorithms: AlgorithmResults;
  retrieval_context: Array<{
    source: string;
    text: string;
  }>;
  summary: {
    known_inputs: number;
    unknown_inputs: string[];
    algorithms: Record<string, number>;
    retrieval: Array<{ source: string; text: string }>;
  };
}

export interface AuthUser {
  id: number;
  username: string;
}

export interface AuthLoginResponse {
  token: string;
  user: AuthUser;
}
