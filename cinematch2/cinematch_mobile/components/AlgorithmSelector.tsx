import React, { useRef, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Animated } from 'react-native';
import { CINEMATCH } from '@/constants/Colors';
import {
  ALGORITHMS,
  ALGORITHM_DESCRIPTIONS,
  useRecommendationStore,
  type Algorithm,
} from '@/store/useRecommendationStore';

function AlgorithmPill({ algo, isSelected, onPress }: {
  algo: Algorithm;
  isSelected: boolean;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.93, useNativeDriver: true, speed: 50 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50 }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={[styles.pill, isSelected && styles.pillActive]}
        data-testid={`algorithm-pill-${algo.toLowerCase().replace(/[\s()\/]/g, '-')}`}
      >
        <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
          {algo}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export default function AlgorithmSelector() {
  const { selectedAlgorithm, setAlgorithm } = useRecommendationStore();
  const scrollRef = useRef<ScrollView>(null);

  const handleSelect = useCallback((algo: Algorithm) => {
    setAlgorithm(algo);
  }, [setAlgorithm]);

  return (
    <View style={styles.container} data-testid="algorithm-selector">
      <View style={styles.header}>
        <Text style={styles.sectionLabel}>RECOMMENDATION ENGINE</Text>
        <View style={styles.liveDot} />
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        data-testid="algorithm-pills-scroll"
      >
        {ALGORITHMS.map((algo) => (
          <AlgorithmPill
            key={algo}
            algo={algo}
            isSelected={selectedAlgorithm === algo}
            onPress={() => handleSelect(algo)}
          />
        ))}
      </ScrollView>

      <View style={styles.descriptionBox} data-testid="algorithm-description-box">
        <View style={styles.descRow}>
          <View style={styles.descAccent} />
          <View style={styles.descContent}>
            <Text style={styles.descLabel} data-testid="current-algorithm-label">
              {selectedAlgorithm}
            </Text>
            <Text style={styles.descText} data-testid="algorithm-description-text">
              {ALGORITHM_DESCRIPTIONS[selectedAlgorithm]}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 14,
    gap: 8,
  },
  sectionLabel: {
    color: CINEMATCH.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: CINEMATCH.teal,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 4,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: CINEMATCH.surface,
    borderWidth: 1,
    borderColor: CINEMATCH.border,
  },
  pillActive: {
    backgroundColor: CINEMATCH.accentDim,
    borderColor: CINEMATCH.accent,
  },
  pillText: {
    color: CINEMATCH.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  pillTextActive: {
    color: CINEMATCH.accent,
  },
  descriptionBox: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: CINEMATCH.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: CINEMATCH.border,
  },
  descRow: {
    flexDirection: 'row',
    gap: 12,
  },
  descAccent: {
    width: 3,
    borderRadius: 2,
    backgroundColor: CINEMATCH.accent,
    alignSelf: 'stretch',
  },
  descContent: {
    flex: 1,
  },
  descLabel: {
    color: CINEMATCH.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  descText: {
    color: CINEMATCH.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
});
