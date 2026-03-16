import React from 'react';
import { View, Text, Image, StyleSheet, Pressable, ScrollView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { CINEMATCH } from '@/constants/Colors';
import { useRecommendationStore } from '@/store/useRecommendationStore';
import HeroSection from '@/components/HeroSection';
import AlgorithmSelector from '@/components/AlgorithmSelector';
import LoadingSkeleton from '@/components/LoadingSkeleton';

function MoviePoster({ uri, style }: { uri: string; style: any }) {
  if (Platform.OS === 'web') {
    return (
      <img
        src={uri}
        style={{
          width: 120,
          height: 175,
          borderRadius: 8,
          objectFit: 'cover',
          backgroundColor: CINEMATCH.surface,
        }}
        alt=""
      />
    );
  }
  return <Image source={{ uri }} style={style} resizeMode="cover" />;
}

export default function HomeScreen() {
  const { movies, isLoading, selectedAlgorithm } = useRecommendationStore();

  return (
    <View style={styles.root} data-testid="home-screen">
      <StatusBar style="light" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <HeroSection />
        <AlgorithmSelector />
        <LoadingSkeleton />

        {!isLoading && (
          <View style={styles.previewSection} data-testid="movie-preview-section">
            <Text style={styles.previewLabel}>
              TOP PICKS — {selectedAlgorithm.toUpperCase()}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.previewScroll}
              data-testid="movie-preview-scroll"
            >
              {movies.slice(0, 8).map((movie) => (
                <Pressable
                  key={movie.id}
                  style={styles.movieCard}
                  data-testid={`movie-card-${movie.id}`}
                >
                  <MoviePoster uri={movie.posterUrl} style={styles.moviePoster} />
                  <Text style={styles.movieTitle} numberOfLines={1}>
                    {movie.title}
                  </Text>
                  <View style={styles.movieMeta}>
                    <Text style={styles.movieRating}>★ {movie.rating}</Text>
                    <Text style={styles.movieYear}>{movie.year}</Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.floatingHeader} data-testid="floating-header">
        <Text style={styles.logo}>CINE<Text style={styles.logoAccent}>MATCH</Text></Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: CINEMATCH.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(11,11,15,0.85)',
    zIndex: 10,
  },
  logo: {
    color: CINEMATCH.text,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 3,
  },
  logoAccent: {
    color: CINEMATCH.accent,
  },
  previewSection: {
    paddingTop: 28,
  },
  previewLabel: {
    color: CINEMATCH.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.8,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  previewScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  movieCard: {
    width: 120,
  },
  moviePoster: {
    width: 120,
    height: 175,
    borderRadius: 8,
    backgroundColor: CINEMATCH.surface,
  },
  movieTitle: {
    color: CINEMATCH.text,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
  movieMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  movieRating: {
    color: CINEMATCH.gold,
    fontSize: 11,
    fontWeight: '600',
  },
  movieYear: {
    color: CINEMATCH.textDim,
    fontSize: 11,
  },
});
