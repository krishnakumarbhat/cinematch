import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { CINEMATCH } from '@/constants/Colors';
import { useRecommendationStore } from '@/store/useRecommendationStore';

export default function LoadingSkeleton() {
  const { isLoading } = useRecommendationStore();

  if (!isLoading) return null;

  return (
    <View style={styles.container} data-testid="loading-skeleton">
      <View style={styles.skeletonRow}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.skeletonCard}>
            <View style={styles.skeletonPoster} />
            <View style={styles.skeletonTitle} />
          </View>
        ))}
      </View>
      <Text style={styles.loadingText}>Recalculating recommendations...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  skeletonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  skeletonCard: {
    width: 110,
  },
  skeletonPoster: {
    width: 110,
    height: 160,
    borderRadius: 8,
    backgroundColor: CINEMATCH.skeleton,
  },
  skeletonTitle: {
    width: 80,
    height: 10,
    borderRadius: 4,
    backgroundColor: CINEMATCH.skeleton,
    marginTop: 8,
  },
  loadingText: {
    color: CINEMATCH.textDim,
    fontSize: 12,
    marginTop: 16,
    fontStyle: 'italic',
  },
});
