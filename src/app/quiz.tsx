import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { ArrowLeftRight, Heart, Check } from 'lucide-react-native';
import { BackLink, Button, C, Card, F, Page, T } from '../components/ui';
import { QUIZ, quizMatch, sharedDay } from '../domain';
import { usePeople, useSpace } from '../store';
import { useNow } from '../use-now';

export default function QuizScreen() {
  const { space, userId } = useSpace(); const day = sharedDay(space.timeZone, new Date(useNow()));
  return <DailyQuiz key={`${userId}:${day}`} day={day} />;
}
function DailyQuiz({ day }: { day: string }) {
  const { space, userId, run, busy, submitQuiz, demo, switchPartner } = useSpace(); const { me, partner } = usePeople(); const [choices, setChoices] = useState<number[]>(Array(5).fill(-1));
  const mine = space.quizzes.find(q => q.authorId === userId && q.day === day); const theirs = space.quizzes.find(q => q.authorId !== userId && q.day === day); const match = mine && theirs ? quizMatch(mine.choices, theirs.choices) : null;
  return <Page title="A little this. A little that." subtitle="Five playful choices. Find your little similarities." eyebrow="OUR DAILY MATCH"><BackLink /><View style={{ maxWidth: 650, width: '100%', alignSelf: 'center', gap: 18 }}>{mine && <Card style={{ backgroundColor: C.yellow, alignItems: 'center', gap: 12 }}><Heart size={30} color="#9D7B60" strokeWidth={1.4} /><T kind="title">{match !== null ? `${match}% in sync` : 'Your choices are tucked away.'}</T><T style={{ textAlign: 'center' }}>{match !== null ? `You matched on ${match / 20} of 5 choices. Differences make good conversation, too.` : `Waiting for ${partner?.name ?? 'your partner'} to answer.`}</T><T kind="small" style={{ textAlign: 'center' }}>This percentage describes this quiz. It doesn’t measure love or relationship quality.</T>{demo && !theirs && <Button title={`Answer as ${partner?.name}`} icon={ArrowLeftRight} compact secondary onPress={() => { switchPartner(); setChoices(Array(5).fill(-1)); }} />}</Card>}{QUIZ.map((q, index) => <Card key={q.prompt} style={{ gap: 14 }}><T kind="label" style={{ color: C.muted }}>0{index + 1} / 05</T><T kind="serif" style={{ fontSize: 22 }}>{q.prompt}</T>{q.options.map((option, value) => { const selected = (mine?.choices ?? choices)[index] === value; const otherPicked = !!mine && theirs?.choices[index] === value; return <Pressable accessibilityRole="radio" accessibilityState={{ checked: selected, disabled: !!mine }} disabled={!!mine} key={option} onPress={() => setChoices(prev => prev.map((x, i) => i === index ? value : x))} style={{ borderWidth: 1, borderColor: selected ? C.green : C.line, backgroundColor: selected ? C.pale : C.paper, padding: 17, borderRadius: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}><View style={{ flex: 1 }}><T style={{ fontSize: 14 }}>{option}</T>{mine && <T kind="small">{[selected ? me.name : '', otherPicked ? partner?.name : ''].filter(Boolean).join(' + ')}</T>}</View>{selected && <Check size={17} color={C.green} />}</Pressable>; })}</Card>)}{!mine && <Button title="Save my choices" icon={Heart} disabled={choices.some(x => x < 0)} loading={busy} onPress={() => { void run(() => submitQuiz(choices)); }} />}<T kind="small" style={{ textAlign: 'center', fontFamily: F.italic }}>No right answers. Just a little more you.</T></View></Page>;
}
