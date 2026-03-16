import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CINEMATCH } from '@/constants/Colors';
import { HERO_MOVIES } from '@/data/heroMovies';

const HERO_HEIGHT = 520;

function WebImage({ uri, style }: { uri: string; style: any }) {
  if (Platform.OS === 'web') {
    return (
      <img
        src={uri}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          position: 'absolute',
          top: 0,
          left: 0,
          ...(style || {}),
        }}
        alt=""
      />
    );
  }
  const { Image } = require('react-native');
  return <Image source={{ uri }} style={style} resizeMode="cover" />;
}

export default function HeroSection() {
  const movie = HERO_MOVIES[0];

  return (
    <View style={styles.container} data-testid="hero-section">
      <WebImage uri={movie.posterUrl} style={null} />
      <LinearGradient
        colors={['transparent', 'rgba(11,11,15,0.6)', CINEMATCH.bg]}
        locations={[0.3, 0.65, 1]}
        style={styles.gradient}
      />
      <View style={styles.content}>
        <View style={styles.genreRow}>
          {movie.genres.map((g, i) => (
            <React.Fragment key={g}>
              {i > 0 && <View style={styles.genreDot} />}
              <Text style={styles.genreText}>{g}</Text>
            </React.Fragment>
          ))}
        </View>
        <Text style={styles.title} data-testid="hero-title">{movie.title}</Text>
        <Text style={styles.tagline}>{movie.tagline}</Text>
        <View style={styles.buttonRow}>
          <Pressable style={styles.playBtn} data-testid="hero-play-button">
            <Text style={styles.playText}>▶  Play</Text>
          </Pressable>
          <Pressable style={styles.infoBtn} data-testid="hero-more-info-button">
            <Text style={styles.infoText}>ⓘ  More Info</Text>
          </Pressable>
        </View>
        <View style={styles.metaRow}>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>★ {movie.rating}</Text>
          </View>
          <Text style={styles.yearText}>{movie.year}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%' as any,
    height: HERO_HEIGHT,
    overflow: 'hidden' as any,
    position: 'relative' as any,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: HERO_HEIGHT * 0.7,
    zIndex: 1,
  },
  content: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    zIndex: 2,
  },
  genreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  genreDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: CINEMATCH.accent,
    marginHorizontal: 8,
  },
  genreText: {
    color: CINEMATCH.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  title: {
    color: CINEMATCH.text,
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  tagline: {
    color: CINEMATCH.textMuted,
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CINEMATCH.text,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 6,
  },
  playText: {
    color: CINEMATCH.bg,
    fontSize: 15,
    fontWeight: '700',
  },
  infoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
  },
  infoText: {
    color: CINEMATCH.text,
    fontSize: 15,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ratingBadge: {
    backgroundColor: CINEMATCH.accentDim,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(230, 57, 70, 0.3)',
  },
  ratingText: {
    color: CINEMATCH.accent,
    fontSize: 13,
    fontWeight: '700',
  },
  yearText: {
    color: CINEMATCH.textDim,
    fontSize: 13,
    fontWeight: '500',
  },
});
