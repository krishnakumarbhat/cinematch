export interface HeroMovie {
  id: string;
  title: string;
  tagline: string;
  posterUrl: string;
  year: number;
  rating: number;
  genres: string[];
}

export const HERO_MOVIES: HeroMovie[] = [
  {
    id: 'hero-1',
    title: 'The Dream Architect',
    tagline: 'Where everything is in the mind\'s eye.',
    posterUrl: 'https://static.prod-images.emergentagent.com/jobs/a4d2ae3f-92d0-45bf-a6a7-1504652fa625/images/2d25d05159be25967e356d1220d4f2476336c2f15f60949e915d50b79cc94a69.png',
    year: 2024,
    rating: 8.8,
    genres: ['Sci-Fi', 'Thriller', 'Mind-Bending'],
  },
  {
    id: 'hero-2',
    title: 'Nightfall Protocol',
    tagline: 'A city that never sleeps. A truth that never dies.',
    posterUrl: 'https://static.prod-images.emergentagent.com/jobs/a4d2ae3f-92d0-45bf-a6a7-1504652fa625/images/a194cf31a7e8ee250ff9b27d5bc32f7d2082d94e8f6f239f837a341068f2721d.png',
    year: 2025,
    rating: 9.1,
    genres: ['Noir', 'Cyberpunk', 'Mystery'],
  },
  {
    id: 'hero-3',
    title: 'Urban Inferno',
    tagline: 'The city will burn.',
    posterUrl: 'https://static.prod-images.emergentagent.com/jobs/a4d2ae3f-92d0-45bf-a6a7-1504652fa625/images/fea67464c919e6c4290d4db6912e6916ee73047521eb1484178813b3c16e9254.png',
    year: 2025,
    rating: 8.5,
    genres: ['Action', 'Thriller', 'Drama'],
  },
];
