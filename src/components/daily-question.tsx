import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { MessageCircle } from 'lucide-react-native';
import { questionFor, visibleAnswers } from '../domain';
import { usePeople, useSpace } from '../store';
import { Button, CoupleAvatars, F, S, T } from './ui';

export function DailyQuestion({ day }: { day: string }) {
  const { space, userId } = useSpace(); const { me, partner } = usePeople();
  const answers = visibleAnswers(space.answers, day, userId);
  const mine = answers.some(answer => answer.authorId === userId);
  const both = answers.length === 2;
  return <View testID="daily-question" style={{ backgroundColor: '#EBE3F2', borderRadius: 5, borderTopRightRadius: 35, padding: 25, gap: 18 }}>
    <View style={S.between}><T kind="label" style={{ color: '#6C5485' }}>DAILY QUESTION</T><MessageCircle size={21} strokeWidth={1.3} color="#6C5485" /></View>
    <T kind="serif" style={{ fontSize: 26, lineHeight: 37 }}>{questionFor(day)}</T>
    <View style={{ width: 35, height: 1, backgroundColor: '#BCA9CF' }} />
    <View style={[S.row, { gap: 10 }]}><CoupleAvatars names={[me.name, partner?.name ?? '?']} size={32} /><T kind="small" style={{ flex: 1, color: '#655471', fontFamily: F.medium }}>{both ? 'Two answers. A new conversation.' : mine ? 'Yours is saved. Room for their answer, too.' : 'A small question. A whole conversation.'}</T></View>
    <Button title={both ? 'Read our answers' : mine ? 'See today’s conversation' : 'Answer today’s question'} compact secondary onPress={() => router.push('/question')} />
    <T kind="small" style={{ fontSize: 11, color: '#655471' }}>{mine ? 'A new question arrives tomorrow.' : 'Share your answer to discover theirs. A new prompt each day.'}</T>
  </View>;
}
