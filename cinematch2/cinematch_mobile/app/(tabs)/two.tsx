import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { CINEMATCH } from '@/constants/Colors';
import { ALGORITHMS, ALGORITHM_DESCRIPTIONS } from '@/store/useRecommendationStore';

export default function ExploreScreen() {
  return (
    <View style={styles.root} data-testid="explore-screen">
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Algorithm Library</Text>
          <Text style={styles.subtitle}>
            Explore the 10 recommendation engines powering CineMatch
          </Text>
        </View>
        {ALGORITHMS.map((algo, index) => (
          <View key={algo} style={styles.card} data-testid={`explore-card-${index}`}>
            <View style={styles.cardHeader}>
              <View style={styles.numberBadge}>
                <Text style={styles.numberText}>{String(index + 1).padStart(2, '0')}</Text>
              </View>
              <Text style={styles.algoName}>{algo}</Text>
            </View>
            <Text style={styles.algoDesc}>
              {ALGORITHM_DESCRIPTIONS[algo]}
            </Text>
          </View>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: CINEMATCH.bg,
  },
  scroll: {
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 20,
    marginBottom: 28,
  },
  title: {
    color: CINEMATCH.text,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    color: CINEMATCH.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    backgroundColor: CINEMATCH.surface,
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: CINEMATCH.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  numberBadge: {
    backgroundColor: CINEMATCH.accentDim,
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    color: CINEMATCH.accent,
    fontSize: 13,
    fontWeight: '800',
  },
  algoName: {
    color: CINEMATCH.text,
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  algoDesc: {
    color: CINEMATCH.textMuted,
    fontSize: 13,
    lineHeight: 19,
    paddingLeft: 44,
  },
});
