import React, { useState } from 'react';
import { View } from 'react-native';
import { MessageCircle, ArrowLeftRight } from 'lucide-react-native';
import { Avatar, BackLink, Button, C, Card, F, Field, Page, S, T } from '../components/ui';
import { dailyQuestionItemFor, sharedDay, visibleAnswers } from '../domain';
import { usePeople, useSpace } from '../store';
import { useNow } from '../use-now';

export default function QuestionScreen() {
  const { space, userId } = useSpace();
  const day = sharedDay(space.timeZone, new Date(useNow()));
  return <DailyQuestionView key={`${userId}:${day}`} day={day} />;
}

function DailyQuestionView({ day }: { day: string }) {
  const { space, userId, demo, switchPartner, run, answer, busy } = useSpace();
  const { partner } = usePeople();
  const [text, setText] = useState('');
  const item = dailyQuestionItemFor(day);
  const mine = space.answers.find(a => a.authorId === userId && a.day === day);
  const visible = visibleAnswers(space.answers, day, userId);

  return (
    <Page title="A little more understood." subtitle="One question. Room for both of you." eyebrow="TODAY’S CONVERSATION">
      <BackLink />
      <View style={{ width: '100%', maxWidth: 650, alignSelf: 'center', gap: 22 }}>
        <Card style={{ backgroundColor: C.yellow, gap: 18, padding: 28 }}>
          <View style={[S.between, { flexWrap: 'wrap', gap: 10 }]}>
            <View style={[S.row, { gap: 8 }]}>
              <MessageCircle color={C.green} size={22} strokeWidth={1.5} />
              <T kind="label" style={{ color: C.green }}>
                {item.tag} · {item.index + 1}/{item.total}
              </T>
            </View>
          </View>
          <T kind="serif">“{item.prompt}”</T>
          <T kind="small" style={{ fontFamily: F.italic }}>
            {item.hint}
          </T>
          <T kind="small">Your partner’s answer appears after you share yours.</T>
        </Card>
        {mine ? (
          <>
            {visible.map(a => (
              <Card key={a.id} style={{ gap: 15 }}>
                <View style={S.row}>
                  <Avatar name={space.profiles.find(p => p.id === a.authorId)?.name ?? '?'} size={34} />
                  <T>{space.profiles.find(p => p.id === a.authorId)?.name}</T>
                </View>
                <T>{a.text}</T>
              </Card>
            ))}
            {visible.length < 2 && (
              <T kind="small" style={{ textAlign: 'center' }}>
                Your answer is saved. There’s room for {partner?.name} whenever they’re ready.
              </T>
            )}
          </>
        ) : (
          <>
            <Field
              label="Your answer"
              multiline
              value={text}
              onChangeText={setText}
              placeholder="The little things that come to mind…"
              maxLength={500}
            />
            <Button
              title="Share my answer"
              icon={MessageCircle}
              disabled={!text.trim()}
              loading={busy}
              onPress={() => {
                void run(() => answer(text, day));
              }}
            />
          </>
        )}
        {demo && (
          <Button
            title="See the other side"
            secondary
            icon={ArrowLeftRight}
            onPress={() => {
              switchPartner();
              setText('');
            }}
          />
        )}
      </View>
    </Page>
  );
}
