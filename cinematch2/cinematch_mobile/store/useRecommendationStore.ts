import { create } from 'zustand';

export const ALGORITHMS = [
  'TF-IDF (Content-Based)',
  'KNN (Item/User)',
  'SVD (Matrix Factorization)',
  'ALS (Implicit)',
  'Apriori (Association)',
  'NCF (Deep Learning)',
  'RBM (Generative)',
  'LightGBM (Ranking)',
  'Word2Vec (Sequential)',
  'Multi-Armed Bandit (Discovery)',
] as const;

export type Algorithm = (typeof ALGORITHMS)[number];

export const ALGORITHM_DESCRIPTIONS: Record<Algorithm, string> = {
  'TF-IDF (Content-Based)':
    'Analyzing genre keywords and plot descriptions to find movies with similar DNA to your favorites.',
  'KNN (Item/User)':
    'Finding users with identical taste profiles, then surfacing what they loved that you haven\'t seen yet.',
  'SVD (Matrix Factorization)':
    'Decomposing the entire ratings matrix into hidden preference dimensions to predict your perfect score.',
  'ALS (Implicit)':
    'Learning from your watch time and browsing patterns \u2014 no ratings needed \u2014 to decode what you actually enjoy.',
  'Apriori (Association)':
    'Mining "people who watched X also watched Y" basket patterns across millions of sessions.',
  'NCF (Deep Learning)':
    'A neural network that learns non-linear user-item interactions far beyond traditional matrix math.',
  'RBM (Generative)':
    'A generative model that reconstructs your incomplete rating profile to hallucinate missing preferences.',
  'LightGBM (Ranking)':
    'Gradient-boosted trees ranking candidates by predicted engagement \u2014 optimized for what you\'ll click next.',
  'Word2Vec (Sequential)':
    'Treating your watch history as a "sentence" of movies and predicting the next word in your viewing story.',
  'Multi-Armed Bandit (Discovery)':
    'Balancing exploitation of known favorites with exploration of fresh genres to maximize long-term satisfaction.',
};

export interface Movie {
  id: string;
  title: string;
  posterUrl: string;
  year: number;
  rating: number;
}

const MOCK_MOVIES: Movie[] = [
  { id: '1', title: 'The Dream Architect', posterUrl: 'https://static.prod-images.emergentagent.com/jobs/a4d2ae3f-92d0-45bf-a6a7-1504652fa625/images/2d25d05159be25967e356d1220d4f2476336c2f15f60949e915d50b79cc94a69.png', year: 2024, rating: 8.8 },
  { id: '2', title: 'Nightfall Protocol', posterUrl: 'https://static.prod-images.emergentagent.com/jobs/a4d2ae3f-92d0-45bf-a6a7-1504652fa625/images/a194cf31a7e8ee250ff9b27d5bc32f7d2082d94e8f6f239f837a341068f2721d.png', year: 2025, rating: 9.1 },
  { id: '3', title: 'Urban Inferno', posterUrl: 'https://static.prod-images.emergentagent.com/jobs/a4d2ae3f-92d0-45bf-a6a7-1504652fa625/images/fea67464c919e6c4290d4db6912e6916ee73047521eb1484178813b3c16e9254.png', year: 2025, rating: 8.5 },
  { id: '4', title: 'Cosmic Drift', posterUrl: 'https://static.prod-images.emergentagent.com/jobs/a4d2ae3f-92d0-45bf-a6a7-1504652fa625/images/61275d9d419d8bb1b362240a9e0bd688a2eafe8b4c2b137b1f95fe93df9c091d.png', year: 2024, rating: 8.9 },
  { id: '5', title: 'The Crimson Thread', posterUrl: 'https://static.prod-images.emergentagent.com/jobs/a4d2ae3f-92d0-45bf-a6a7-1504652fa625/images/8f28c0739d656fcd3e0fdde7ea78b8349df9f7a13c694533950ad44f72037a22.png', year: 2023, rating: 8.2 },
  { id: '6', title: 'The Divide', posterUrl: 'https://static.prod-images.emergentagent.com/jobs/a4d2ae3f-92d0-45bf-a6a7-1504652fa625/images/871b752fdb815156d66d0f2f5de05b1adc0121d7d4b9a5c68254bd53176b3f7e.png', year: 2024, rating: 8.4 },
  { id: '7', title: 'The Veiled Gate', posterUrl: 'https://static.prod-images.emergentagent.com/jobs/a4d2ae3f-92d0-45bf-a6a7-1504652fa625/images/c2570652d4bcadece785cecb463e8a3b08ae4bb2654df3f2ecfc5162394f8c0a.png', year: 2025, rating: 8.7 },
  { id: '8', title: 'The Shadowed Manor', posterUrl: 'https://static.prod-images.emergentagent.com/jobs/a4d2ae3f-92d0-45bf-a6a7-1504652fa625/images/aefdc4d8097a447342af8513f090abf4db0edc7d4031f11892bf6127e061279d.png', year: 2024, rating: 8.0 },
];

interface RecommendationState {
  selectedAlgorithm: Algorithm;
  movies: Movie[];
  isLoading: boolean;
  setAlgorithm: (algo: Algorithm) => void;
  fetchMoviesForAlgorithm: (algo: Algorithm) => void;
}

export const useRecommendationStore = create<RecommendationState>((set) => ({
  selectedAlgorithm: 'SVD (Matrix Factorization)',
  movies: MOCK_MOVIES,
  isLoading: false,

  setAlgorithm: (algo: Algorithm) => {
    set({ selectedAlgorithm: algo, isLoading: true });
    setTimeout(() => {
      const shuffled = [...MOCK_MOVIES].sort(() => Math.random() - 0.5);
      set({ movies: shuffled, isLoading: false });
    }, 600);
  },

  fetchMoviesForAlgorithm: (algo: Algorithm) => {
    set({ isLoading: true });
    setTimeout(() => {
      const shuffled = [...MOCK_MOVIES].sort(() => Math.random() - 0.5);
      set({ movies: shuffled, isLoading: false, selectedAlgorithm: algo });
    }, 600);
  },
}));
