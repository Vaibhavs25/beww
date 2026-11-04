import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { CalendarDays, Check, Clock, Heart, MapPin, Plus, Sparkles, Video } from 'lucide-react-native';
import { planVoteCount, rankUpcomingPlans, sharedDay, shiftDay, type Plan } from '../domain';
import { DATE_IDEAS } from '../shared-features';
import { useSpace } from '../store';
import { useNow } from '../use-now';
import { Button, C, Card, F, Field, Postcard, S, T } from './ui';

export function DateNightPlanner() {
  const { space, userId, savePlan, respondPlan, run, busy } = useSpace();
  const now = useNow();
  const todayKey = sharedDay(space.timeZone, new Date(now));

  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => shiftDay(todayKey, 4));
  const [kind, setKind] = useState<Plan['kind']>('date');

  const ranked = rankUpcomingPlans(space.plans, todayKey);
  const mutualMatches = ranked.filter(p => planVoteCount(p) >= 2).length;
  const quickSparks = DATE_IDEAS[space.mode === 'distance' ? 'virtual' : 'in-person'];

  const handleCreate = () => {
    if (!title.trim()) return;
    void run(async () => {
      await savePlan({
        title: title.trim(),
        date: kind === 'date' ? date : '',
        kind,
        time: '',
        place: '',
        notes: '',
        format: space.mode === 'distance' ? 'virtual' : 'in-person',
      });
      setTitle('');
      setAdding(false);
    });
  };

  return (
    <Card style={{ padding: 14, gap: 14 }}>
      <View style={{ borderRadius: 12, overflow: 'hidden' }}>
        <Postcard width="100%" height={138} />
      </View>

      <View style={{ paddingHorizontal: 4, gap: 14 }}>
        <View style={[S.between, { flexWrap: 'wrap', gap: 8 }]}>
          <View style={[S.row, { gap: 7 }]}>
            <CalendarDays size={15} color={C.green} />
            <T kind="label" style={{ color: C.green }}>
              DATE NIGHT PLANNER
            </T>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={adding ? 'Close date idea form' : 'Propose a new date idea'}
            onPress={() => setAdding(prev => !prev)}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 10,
              backgroundColor: adding ? C.pale : C.bg,
              borderWidth: 1,
              borderColor: adding ? C.green : C.line,
              opacity: pressed ? 0.72 : 1,
            })}
          >
            <Plus size={13} color={adding ? C.green : C.ink} strokeWidth={1.8} />
            <T style={{ fontSize: 12, fontFamily: F.medium, color: adding ? C.green : C.ink }}>
              {adding ? 'Close' : 'New idea'}
            </T>
          </Pressable>
        </View>

        <View style={{ gap: 4 }}>
          <T kind="serif" style={{ fontSize: 21, lineHeight: 28 }}>
            {mutualMatches > 0
              ? `${mutualMatches} ${mutualMatches === 1 ? 'date idea' : 'date ideas'} you both voted for`
              : 'Pick your next night out together.'}
          </T>
          <T kind="small">
            Propose ideas and vote together—when both of you vote, it moves to the top.
          </T>
        </View>

        {adding && (
          <View
            style={{
              backgroundColor: C.bg,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: C.line,
              padding: 13,
              gap: 11,
            }}
          >
            <T kind="label" style={{ color: C.muted }}>
              PROPOSE AN UPCOMING IDEA
            </T>
            <View style={[S.wrap, { gap: 7 }]}>
              {(['date', 'wish'] as const).map(option => {
                const active = kind === option;
                return (
                  <Pressable
                    key={option}
                    accessibilityRole="button"
                    accessibilityLabel={option === 'date' ? 'Scheduled date idea' : 'Someday wish idea'}
                    onPress={() => setKind(option)}
                    style={{
                      paddingHorizontal: 11,
                      paddingVertical: 6,
                      borderRadius: 9,
                      backgroundColor: active ? C.pale : C.paper,
                      borderWidth: 1,
                      borderColor: active ? C.green : C.line,
                    }}
                  >
                    <T style={{ fontSize: 12, fontFamily: active ? F.bold : F.medium, color: active ? C.green : C.ink }}>
                      {option === 'date' ? 'With a date' : 'Idea pool'}
                    </T>
                  </Pressable>
                );
              })}
            </View>

            <Field
              label="Date idea"
              value={title}
              onChangeText={setTitle}
              maxLength={120}
              placeholder="Sunset picnic, bookstore walk, pasta night…"
            />

            {kind === 'date' && (
              <Field
                label="Target date · YYYY-MM-DD"
                value={date}
                onChangeText={setDate}
                maxLength={10}
                placeholder={shiftDay(todayKey, 4)}
                keyboardType="numbers-and-punctuation"
              />
            )}

            <View style={{ gap: 6 }}>
              <T kind="small" style={{ fontSize: 11 }}>
                Or tap a quick spark:
              </T>
              <View style={[S.wrap, { gap: 6 }]}>
                {quickSparks.map(spark => (
                  <Pressable
                    key={spark.title}
                    accessibilityRole="button"
                    accessibilityLabel={`Use idea ${spark.title}`}
                    onPress={() => setTitle(spark.title)}
                    style={({ pressed }) => ({
                      paddingHorizontal: 9,
                      paddingVertical: 5,
                      borderRadius: 8,
                      backgroundColor: C.paper,
                      borderWidth: 1,
                      borderColor: C.line,
                      opacity: pressed ? 0.72 : 1,
                    })}
                  >
                    <T style={{ fontSize: 11, color: C.ink }}>{spark.title}</T>
                  </Pressable>
                ))}
              </View>
            </View>

            <Button
              title="Add & vote for idea"
              compact
              icon={Heart}
              disabled={!title.trim() || !space.featuresReady}
              loading={busy}
              onPress={handleCreate}
            />
          </View>
        )}

        <View style={{ gap: 10 }}>
          {ranked.slice(0, 3).map(plan => {
            const votes = planVoteCount(plan);
            const mine = (plan.acceptedBy ?? []).includes(userId);
            const matched = votes >= 2;
            return (
              <View
                key={plan.id}
                style={{
                  backgroundColor: matched ? C.yellow : C.bg,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: matched ? C.green : C.line,
                  padding: 13,
                  gap: 9,
                }}
              >
                <View style={[S.between, { flexWrap: 'wrap', gap: 6 }]}>
                  <View style={[S.row, { gap: 6 }]}>
                    {plan.kind === 'wish' ? (
                      <Sparkles size={13} color={C.green} />
                    ) : (
                      <CalendarDays size={13} color={C.green} />
                    )}
                    <T kind="label" style={{ color: C.green, fontSize: 10 }}>
                      {matched ? '2/2 MATCH ♡' : `${votes}/2 VOTES`}
                    </T>
                  </View>
                  {plan.kind === 'date' && !!plan.date && (
                    <View style={[S.row, { gap: 4 }]}>
                      <Clock size={12} color={C.muted} />
                      <T kind="small" style={{ fontSize: 11 }}>
                        {new Date(`${plan.date}T12:00:00`).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                        {plan.time ? ` · ${plan.time}` : ''}
                      </T>
                    </View>
                  )}
                </View>

                <T style={{ fontFamily: F.serif, fontSize: 17, lineHeight: 23, color: C.ink }}>
                  {plan.title}
                </T>

                {!!plan.place && (
                  <View style={[S.row, { gap: 5 }]}>
                    {plan.format === 'virtual' ? (
                      <Video size={13} color={C.muted} />
                    ) : (
                      <MapPin size={13} color={C.muted} />
                    )}
                    <T kind="small" numberOfLines={1} style={{ flex: 1, fontSize: 12 }}>
                      {plan.place}
                    </T>
                  </View>
                )}

                <View style={[S.between, { flexWrap: 'wrap', gap: 8, marginTop: 2 }]}>
                  <View style={[S.wrap, { gap: 6 }]}>
                    {space.profiles.map(p => {
                      const voted = (plan.acceptedBy ?? []).includes(p.id);
                      return (
                        <View
                          key={p.id}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 4,
                            paddingHorizontal: 8,
                            paddingVertical: 3,
                            borderRadius: 8,
                            backgroundColor: voted ? C.paper : 'transparent',
                            borderWidth: 1,
                            borderColor: voted ? C.line : 'transparent',
                          }}
                        >
                          <T style={{ fontSize: 11, fontFamily: voted ? F.bold : F.body, color: voted ? C.green : C.muted }}>
                            {voted ? '✓' : '○'} {p.name}
                          </T>
                        </View>
                      );
                    })}
                  </View>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={mine ? `Remove vote for ${plan.title}` : `Vote for ${plan.title}`}
                    disabled={busy || !space.featuresReady}
                    onPress={() => {
                      void run(() => respondPlan(plan, !mine));
                    }}
                    style={({ pressed }) => ({
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 5,
                      paddingHorizontal: 11,
                      paddingVertical: 7,
                      borderRadius: 10,
                      backgroundColor: mine ? C.green : C.paper,
                      borderWidth: 1,
                      borderColor: mine ? C.green : C.line,
                      opacity: pressed ? 0.75 : 1,
                    })}
                  >
                    {mine ? (
                      <Check size={13} color="#FFFDF9" strokeWidth={2} />
                    ) : (
                      <Heart size={13} color={C.green} strokeWidth={1.7} />
                    )}
                    <T style={{ fontSize: 12, fontFamily: F.bold, color: mine ? '#FFFDF9' : C.ink }}>
                      {mine ? 'Voted' : 'Vote'}
                    </T>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>

        <Button
          title={ranked.length ? 'View our plans' : 'Plan something'}
          secondary
          compact
          onPress={() => router.push('/plans')}
        />
      </View>
    </Card>
  );
}
