import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';
import { FAQ_DATA, FAQItem } from '@/data/faqs';

export const FAQAccordion: React.FC = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Frequently Asked Questions</Text>
      <View style={styles.list}>
        {FAQ_DATA.map((item, idx) => {
          const isOpen = expandedIndex === idx;
          return (
            <View key={idx} style={[styles.faqCard, isOpen && styles.faqCardOpen]}>
              <TouchableOpacity
                style={styles.headerRow}
                activeOpacity={0.7}
                onPress={() => toggle(idx)}>
                <Text style={[styles.questionText, isOpen && { color: Colors.primary }]}>
                  {item.question}
                </Text>
                <Ionicons
                  name={isOpen ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={isOpen ? Colors.primary : Colors.textSecondary}
                />
              </TouchableOpacity>

              {isOpen && (
                <View style={styles.answerBox}>
                  <Text style={styles.answerText}>{item.answer}</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
  },
  heading: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: Layout.spacing.md,
  },
  list: {
    gap: 8,
  },
  faqCard: {
    backgroundColor: Colors.card,
    borderRadius: Layout.radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  faqCardOpen: {
    borderColor: Colors.primaryLight,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Layout.spacing.md,
    gap: 10,
  },
  questionText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
  },
  answerBox: {
    paddingHorizontal: Layout.spacing.md,
    paddingBottom: Layout.spacing.md,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 10,
  },
  answerText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
