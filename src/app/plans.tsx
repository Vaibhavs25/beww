import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { ArrowLeftRight, CalendarDays, Check, CheckCheck, Circle, Clock, Heart, MapPin, Pencil, Sparkles, Video } from 'lucide-react-native';
import { BackLink, Button, C, Card, Chip, Empty, F, Field, Page, S, T } from '../components/ui';
import { FeatureNotice } from '../components/feature-notice';
import { PetPortrait } from '../components/pet-portrait';
import { planVoteCount, sharedDay, type Plan } from '../domain';
import { DATE_IDEAS, type PlanDraft } from '../shared-features';
import { usePeople, useSpace } from '../store';

export default function Plans() {
  const { userId } = useSpace();
  return <DatePlanner key={userId} />;
}

function DatePlanner() {
  const { space, savePlan, togglePlan, respondPlan, run, busy, userId, demo, switchPartner } = useSpace();
  const { partner } = usePeople();
  const empty = (): PlanDraft => ({
    title: '',
    date: sharedDay(space.timeZone),
    kind: 'date',
    time: '',
    place: '',
    notes: '',
    format: space.mode === 'distance' ? 'virtual' : 'in-person',
  });
  const [draft, setDraft] = useState<PlanDraft>(empty);
  const [editing, setEditing] = useState<Plan>();
  const [filter, setFilter] = useState<'upcoming' | 'wish' | 'done'>('upcoming');
  const [sortByVotes, setSortByVotes] = useState(false);

  const set = <K extends keyof PlanDraft>(key: K, value: PlanDraft[K]) =>
    setDraft(previous => ({ ...previous, [key]: value }));

  const plans = space.plans
    .filter(p => (filter === 'done' ? p.done : !p.done && (filter === 'wish' ? p.kind === 'wish' : p.kind === 'date')))
    .sort((a, b) => {
      if (sortByVotes && filter !== 'done') {
        const diff = planVoteCount(b) - planVoteCount(a);
        if (diff !== 0) return diff;
      }
      return (a.date || '9999').localeCompare(b.date || '9999') || (a.time ?? '').localeCompare(b.time ?? '');
    });

  const edit = (plan: Plan) => {
    setEditing(plan);
    setDraft({
      title: plan.title,
      date: plan.date || sharedDay(space.timeZone),
      kind: plan.kind,
      time: plan.time ?? '',
      place: plan.place ?? '',
      notes: plan.notes ?? '',
      format: plan.format ?? 'in-person',
    });
  };

  const submit = async () => {
    if (await run(() => savePlan(draft, editing))) {
      setFilter(draft.kind === 'wish' ? 'wish' : 'upcoming');
      setDraft(empty());
      setEditing(undefined);
    }
  };

  return (
    <Page
      key={editing?.id ?? 'new'}
      title={editing ? 'Make room for a new plan.' : 'Our next “just us.”'}
      subtitle="Find a little time. Make it something to look forward to."
      eyebrow="DATE NIGHT PLANNER"
    >
      <BackLink />
      <FeatureNotice />
      <View style={{ width: '100%', maxWidth: 760, alignSelf: 'center', gap: 22 }}>
        {demo && (
          <Button
            title={`Plan as ${partner?.name ?? 'your partner'}`}
            secondary
            compact
            icon={ArrowLeftRight}
            onPress={switchPartner}
          />
        )}
        {!editing && (
          <Card style={{ backgroundColor: C.purple, gap: 14 }}>
            <View style={S.row}>
              <PetPortrait kind="bear" size={45} />
              <T kind="sub">Need a tiny spark?</T>
            </View>
            <View style={S.wrap}>
              <Chip title="Nearby ideas" selected={draft.format === 'in-person'} onPress={() => set('format', 'in-person')} />
              <Chip title="Long-distance ideas" selected={draft.format === 'virtual'} onPress={() => set('format', 'virtual')} />
            </View>
            {DATE_IDEAS[draft.format].map(idea => (
              <Pressable
                key={idea.title}
                accessibilityRole="button"
                accessibilityLabel={`Plan ${idea.title}`}
                onPress={() => setDraft(previous => ({ ...previous, ...idea, kind: 'date' }))}
                style={[S.between, { paddingVertical: 9 }]}
              >
                <T style={{ flex: 1 }}>{idea.title}</T>
                <CalendarDays size={17} color={C.green} />
              </Pressable>
            ))}
          </Card>
        )}
        <Card style={{ gap: 17 }}>
          <T kind="serif">{editing ? 'A little change of plans' : 'Let’s make a plan.'}</T>
          <View style={S.wrap}>
            <Chip title="A date together" icon={CalendarDays} selected={draft.kind === 'date'} onPress={() => set('kind', 'date')} />
            <Chip title="Someday list" icon={Sparkles} selected={draft.kind === 'wish'} onPress={() => set('kind', 'wish')} />
          </View>
          <Field
            label={draft.kind === 'date' ? 'What shall we do?' : 'One day, let’s…'}
            value={draft.title}
            onChangeText={value => set('title', value)}
            maxLength={120}
            placeholder="A cozy evening, just us"
          />
          {draft.kind === 'date' && (
            <>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1.25 }}>
                  <Field
                    label="Date · YYYY-MM-DD"
                    value={draft.date}
                    onChangeText={value => set('date', value)}
                    maxLength={10}
                    placeholder="2026-12-20"
                    keyboardType="numbers-and-punctuation"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Field
                    label="Time · HH:MM"
                    value={draft.time}
                    onChangeText={value => set('time', value)}
                    maxLength={5}
                    placeholder="19:30"
                    keyboardType="numbers-and-punctuation"
                  />
                </View>
              </View>
              <T kind="small">Time is optional. Both of you see the time in {space.timeZone.replace(/_/g, ' ')}.</T>
              <View style={S.wrap}>
                <Chip title="In person" icon={MapPin} selected={draft.format === 'in-person'} onPress={() => set('format', 'in-person')} />
                <Chip title="On a call" icon={Video} selected={draft.format === 'virtual'} onPress={() => set('format', 'virtual')} />
              </View>
              <Field
                label={draft.format === 'virtual' ? 'Call link or where we’ll meet' : 'Place'}
                value={draft.place}
                onChangeText={value => set('place', value)}
                maxLength={180}
                placeholder={draft.format === 'virtual' ? 'Our Closer call, or paste a link' : 'That little café on the corner'}
              />
            </>
          )}
          <Field
            label="Little details (optional)"
            value={draft.notes}
            onChangeText={value => set('notes', value)}
            maxLength={500}
            multiline
            placeholder="What to bring, what to watch, or a little surprise…"
          />
          {editing && <T kind="small">Saving changes asks your partner to confirm the updated plan again.</T>}
          <Button
            title={editing ? 'Save our changes' : draft.kind === 'date' ? 'Put it on our calendar' : 'Add a little dream'}
            icon={CalendarDays}
            loading={busy}
            disabled={!draft.title.trim() || !space.featuresReady}
            onPress={() => {
              void submit();
            }}
          />
          {editing && (
            <Button
              title="Cancel editing"
              secondary
              onPress={() => {
                setEditing(undefined);
                setDraft(empty());
              }}
            />
          )}
        </Card>
        {!editing && (
          <>
            <View style={[S.between, { flexWrap: 'wrap', gap: 10 }]}>
              <View style={S.wrap}>
                <Chip title="Our dates" selected={filter === 'upcoming'} onPress={() => setFilter('upcoming')} />
                <Chip title="Someday" selected={filter === 'wish'} onPress={() => setFilter('wish')} />
                <Chip title="Memories made" selected={filter === 'done'} onPress={() => setFilter('done')} />
              </View>
              {filter !== 'done' && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={sortByVotes ? 'Sort date ideas by date' : 'Sort date ideas by votes'}
                  onPress={() => setSortByVotes(prev => !prev)}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 10,
                    backgroundColor: sortByVotes ? C.pale : C.paper,
                    borderWidth: 1,
                    borderColor: sortByVotes ? C.green : C.line,
                    opacity: pressed ? 0.75 : 1,
                  })}
                >
                  <Heart size={13} color={sortByVotes ? C.green : C.muted} />
                  <T style={{ fontSize: 12, fontFamily: F.medium, color: sortByVotes ? C.green : C.ink }}>
                    {sortByVotes ? 'Sorted by votes' : 'Sort by votes'}
                  </T>
                </Pressable>
              )}
            </View>

            <View style={{ gap: 16 }}>
              {plans.length ? (
                plans.map(plan => {
                  const votes = planVoteCount(plan);
                  const confirmed = votes === 2;
                  const mine = (plan.acceptedBy ?? []).includes(userId);
                  return (
                    <Card key={plan.id} style={{ gap: 13 }}>
                      <View style={S.between}>
                        <T kind="label" style={{ color: C.green }}>
                          {plan.done
                            ? 'A MEMORY MADE'
                            : plan.kind === 'wish'
                              ? confirmed
                                ? 'BOTH VOTED FOR THIS DREAM ♡'
                                : `SOMEDAY, WITH YOU · ${votes}/2 VOTES`
                              : confirmed
                                ? 'IT’S A DATE ♡ · 2/2 VOTES'
                                : `A LITTLE INVITATION · ${votes}/2 VOTES`}
                        </T>
                        {confirmed && !plan.done && <CheckCheck color={C.green} size={20} />}
                      </View>
                      <T kind="serif" style={{ fontSize: 23 }}>
                        {plan.title}
                      </T>
                      {plan.kind === 'date' && (
                        <View style={[S.row, { flexWrap: 'wrap' }]}>
                          <CalendarDays color={C.muted} size={16} />
                          <T kind="small">
                            {new Date(`${plan.date}T12:00:00`).toLocaleDateString(undefined, {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </T>
                          {!!plan.time && (
                            <>
                              <Clock size={15} color={C.muted} />
                              <T kind="small">{plan.time}</T>
                            </>
                          )}
                        </View>
                      )}
                      {!!plan.place && (
                        <View style={S.row}>
                          {plan.format === 'virtual' ? <Video size={16} color={C.muted} /> : <MapPin size={16} color={C.muted} />}
                          <T selectable style={{ flex: 1, fontSize: 13 }}>
                            {plan.place}
                          </T>
                        </View>
                      )}
                      {!!plan.notes && <T style={{ fontSize: 13, color: C.muted }}>{plan.notes}</T>}
                      {!plan.done && (
                        <>
                          <View style={S.wrap}>
                            {space.profiles.map(p => (
                              <T key={p.id} kind="small">
                                {(plan.acceptedBy ?? []).includes(p.id) ? '✓' : '○'} {p.name}
                                {(plan.acceptedBy ?? []).includes(p.id)
                                  ? plan.kind === 'wish'
                                    ? ' voted for this'
                                    : ' is in'
                                  : ' · not confirmed yet'}
                              </T>
                            ))}
                          </View>
                          <Button
                            title={
                              plan.kind === 'wish'
                                ? mine
                                  ? 'Voted ♡'
                                  : 'Vote for this idea'
                                : mine
                                  ? 'Change my response'
                                  : 'I’m in'
                            }
                            compact
                            secondary
                            disabled={busy || !space.featuresReady}
                            onPress={() => {
                              void run(() => respondPlan(plan, !mine));
                            }}
                          />
                        </>
                      )}
                      <View style={[S.between, { flexWrap: 'wrap' }]}>
                        <Pressable
                          accessibilityRole="checkbox"
                          accessibilityState={{ checked: plan.done }}
                          accessibilityLabel={`${plan.title}, ${plan.done ? 'completed' : 'mark complete'}`}
                          disabled={busy}
                          onPress={() => {
                            void run(() => togglePlan(plan.id));
                          }}
                          style={[S.row, { minHeight: 44 }]}
                        >
                          {plan.done ? <Check size={19} color={C.green} /> : <Circle size={19} color={C.muted} />}
                          <T kind="small">{plan.done ? 'We did this' : 'Mark as a memory made'}</T>
                        </Pressable>
                        <Button
                          title="Edit plan"
                          icon={Pencil}
                          secondary
                          compact
                          disabled={busy || !space.featuresReady}
                          onPress={() => edit(plan)}
                        />
                      </View>
                    </Card>
                  );
                })
              ) : (
                <Empty
                  title={filter === 'done' ? 'Good memories are on their way.' : 'Room for a little adventure.'}
                  text="Start with an idea above, or make something entirely your own."
                  icon={CalendarDays}
                />
              )}
            </View>
          </>
        )}
      </View>
    </Page>
  );
}
