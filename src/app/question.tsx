import React, { useState } from 'react';
import { View } from 'react-native';
import { MessageCircle, ArrowLeftRight } from 'lucide-react-native';
import { Avatar, BackLink, Button, C, Card, Field, Page, S, T } from '../components/ui';
import { questionFor, sharedDay, visibleAnswers } from '../domain';
import { usePeople, useSpace } from '../store';
import { useNow } from '../use-now';

export default function QuestionScreen() {
  const { space, userId } = useSpace(); const day = sharedDay(space.timeZone, new Date(useNow()));
  return <DailyQuestion key={`${userId}:${day}`} day={day} />;
}
function DailyQuestion({ day }: { day: string }) {
  const { space, userId, demo, switchPartner, run, answer, busy } = useSpace(); const { partner } = usePeople(); const [text, setText] = useState(''); const mine = space.answers.find(a => a.authorId === userId && a.day === day); const visible = visibleAnswers(space.answers, day, userId);
  return <Page title="A little more understood." subtitle="One question. Room for both of you." eyebrow="TODAY’S CONVERSATION"><BackLink /><View style={{ width: '100%', maxWidth: 650, alignSelf: 'center', gap: 22 }}><Card style={{ backgroundColor: C.yellow, gap: 18, padding: 30 }}><MessageCircle color="#915575" size={26} strokeWidth={1.4} /><T kind="serif">{questionFor(day)}</T><T kind="small">Your partner’s answer appears after you share yours.</T></Card>{mine ? <>{visible.map(a => <Card key={a.id} style={{ gap: 15 }}><View style={S.row}><Avatar name={space.profiles.find(p => p.id === a.authorId)?.name ?? '?'} size={34} /><T>{space.profiles.find(p => p.id === a.authorId)?.name}</T></View><T>{a.text}</T></Card>)}{visible.length < 2 && <T kind="small" style={{ textAlign: 'center' }}>Your answer is saved. There’s room for {partner?.name} whenever they’re ready.</T>}</> : <><Field label="Your answer" multiline value={text} onChangeText={setText} placeholder="The little things that come to mind…" maxLength={500} /><Button title="Share my answer" icon={MessageCircle} disabled={!text.trim()} loading={busy} onPress={() => { void run(() => answer(text)); }} /></>}{demo && <Button title="See the other side" secondary icon={ArrowLeftRight} onPress={() => { switchPartner(); setText(''); }} />}</View></Page>;
}

