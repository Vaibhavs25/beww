import React from 'react';
import { Pressable, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { ArrowRight, Camera, Heart, PenLine, Phone, LockKeyhole, Flame, Zap } from 'lucide-react-native';
import { usePeople, useSpace } from '../../store';
import { coupleMoodTimeline, moodFor, relativeTime, sharedDay } from '../../domain';
import { Avatar, Bloom, Button, C, Card, CoupleAvatars, F, Page, S, SectionTitle, T } from '../../components/ui';
import { MomentCard } from '../../components/moment-card';
import { MemoryLane } from '../../components/memory-lane';
import { DailyQuestion } from '../../components/daily-question';
import { DateNightPlanner } from '../../components/date-night-planner';
import { FutureAdventures } from '../../components/future-adventures';
import { SharedJournal } from '../../components/shared-journal';
import { RelationshipQuiz } from '../../components/relationship-quiz';
import { QuickNotes, pickAndPrepareInstantPhoto } from '../../components/quick-notes';
import { DailyErrands } from '../../components/daily-errands';
import { RelationshipClockCard } from '../../components/relationship-clock';
import { PartnerNotificationCenterCard } from '../../components/partner-notifications';
import { hapticInstantPic, hapticTap } from '../../haptics';
import { useNow } from '../../use-now';

export default function Today() {
  const { space, userId, run, addQuickNote } = useSpace();
  const { me, partner } = usePeople();
  const { width } = useWindowDimensions();
  const wide = width > 1120;
  const now = useNow();
  const todayKey = sharedDay(space.timeZone, new Date(now));
  const recentMood = partner && now - Date.parse(partner.moodAt) < 86400000;
  const mood = moodFor(recentMood ? partner.mood : 'calm');
  const quiet = recentMood && (partner?.need === 'Quiet time' || partner?.mood === 'space');
  const todayLabel = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
  const timeline = coupleMoodTimeline(space.moodLogs, space.profiles, space.timeZone, todayKey, userId);
  const partnerDisplay = partner?.nickname || space.originStory?.partnerNickname || partner?.name || '?';

  return (
    <Page
      title={`A little closer, ${me.name}.`}
      subtitle="It’s the little things that make a life together."
      eyebrow={todayLabel.toUpperCase()}
      action={width > 700 ? <CoupleAvatars names={[me.name, partnerDisplay]} avatars={[me.avatar, partner?.avatar]} size={49} /> : undefined}
    >
      <View style={{ flexDirection: wide ? 'row' : 'column', gap: 24, alignItems: 'stretch' }}>
        <View style={{ flex: wide ? 1.65 : undefined, gap: 24 }}>
          <View
            style={{
              backgroundColor: mood.background,
              borderRadius: 22,
              borderWidth: 1,
              borderColor: C.line,
              padding: width < 480 ? 22 : 30,
              overflow: 'hidden',
              minHeight: 290,
            }}
          >
            <View style={[S.between, { flexWrap: 'wrap' }]}>
              <T numberOfLines={2} kind="label" style={{ color: mood.color, flexShrink: 1 }}>
                {partner ? `IN ${partnerDisplay.toUpperCase()}’S WORLD` : 'YOUR LITTLE WORLD'}
              </T>
              <T kind="small" style={{ color: mood.color, fontFamily: F.medium }}>
                {recentMood ? `${mood.emoji} ${mood.label}` : 'A quiet check-in'}
              </T>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 22 }}>
              <View style={{ flex: 1, zIndex: 1 }}>
                <T
                  kind="title"
                  style={{
                    color: mood.color,
                    fontSize: width < 480 ? 29 : 36,
                    lineHeight: width < 480 ? 38 : 46,
                  }}
                >
                  {quiet ? 'A little room\nto breathe.' : mood.title}
                </T>
                <T style={{ color: mood.color, fontSize: 14, lineHeight: 22, marginTop: 12, maxWidth: 310 }}>
                  {recentMood
                    ? partner.moodNote || mood.subtitle
                    : 'Share a little of your day with your favorite person.'}
                </T>
              </View>
              <View style={{ marginLeft: -18, marginRight: -28, opacity: 0.95 }}>
                <Bloom
                  size={width < 480 ? 136 : 190}
                  calm={quiet || mood.id === 'low'}
                  color={['low', 'stressed', 'missing'].includes(mood.id) ? '#8C7A6B' : mood.id === 'loved' ? '#B55B52' : '#C47A6A'}
                />
              </View>
            </View>
            <View style={[S.between, { marginTop: 24, flexWrap: 'wrap', gap: 10 }]}>
              <Button
                compact
                title={quiet ? 'Leave a gentle note' : 'Send a little love'}
                icon={Heart}
                secondary
                onPress={() =>
                  router.push({
                    pathname: '/compose',
                    params: {
                      kind: 'note',
                      text: quiet ? 'Take the time you need. No reply needed. I’m here.' : mood.note,
                    },
                  })
                }
              />
              {recentMood && (
                <T kind="small" style={{ color: mood.color }}>
                  {partner.need || 'Shared a feeling'} · {relativeTime(partner.moodAt)}
                </T>
              )}
            </View>
          </View>

          <Card style={{ gap: 18 }}>
            <SectionTitle title="And how are you, really?" link="Check in" onPress={() => router.push('/mood')} />
            <View style={S.between}>
              <View style={[S.row, { flex: 1, minWidth: 0 }]}>
                <Avatar name={me.name} uri={me.avatar} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <T numberOfLines={1} style={{ fontFamily: F.medium }}>
                    {moodFor(me.mood).emoji} Feeling {moodFor(me.mood).label.toLowerCase()}
                  </T>
                  <T kind="small">
                    {me.need ? `Would love: ${me.need.toLowerCase()}` : 'A little honesty brings you closer.'}
                  </T>
                </View>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Update your mood"
                onPress={() => {
                  hapticTap();
                  router.push('/mood');
                }}
                style={{ backgroundColor: C.bg, borderRadius: 20, padding: 12, borderWidth: 1, borderColor: C.line }}
              >
                <ArrowRight size={18} color={C.green} />
              </Pressable>
            </View>

            <View style={{ height: 1, backgroundColor: C.line }} />

            <View style={{ gap: 12 }}>
              <View style={[S.between, { flexWrap: 'wrap', gap: 6 }]}>
                <View style={[S.row, { gap: 6 }]}>
                  <Flame size={15} color={C.green} />
                  <T kind="small" style={{ color: C.ink, fontFamily: F.medium }}>
                    {timeline.combinedStreak}-day check-in streak
                  </T>
                </View>
                <T kind="small">
                  {me.name.slice(0, 12)} {timeline.myStreak}d · {partnerDisplay.slice(0, 12)} {timeline.partnerStreak}d
                </T>
              </View>

              <View style={{ flexDirection: 'row', gap: 5 }}>
                {timeline.days.map(slot => {
                  const myMood = slot.mine ? moodFor(slot.mine.mood) : null;
                  const theirMood = slot.theirs ? moodFor(slot.theirs.mood) : null;
                  return (
                    <View
                      key={slot.day}
                      accessible
                      accessibilityLabel={`${slot.weekday} ${slot.dayNum}: ${myMood ? `${me.name} ${myMood.label}` : `${me.name} not logged`}, ${theirMood ? `${partnerDisplay} ${theirMood.label}` : 'partner not logged'}`}
                      style={{
                        flex: 1,
                        alignItems: 'center',
                        paddingVertical: 8,
                        paddingHorizontal: 2,
                        borderRadius: 12,
                        backgroundColor: slot.isToday ? C.pale : C.bg,
                        borderWidth: 1,
                        borderColor: slot.isToday ? C.green : C.line,
                        gap: 5,
                      }}
                    >
                      <T kind="small" style={{ fontSize: 10, fontFamily: slot.isToday ? F.bold : F.medium, color: slot.isToday ? C.green : C.muted }}>
                        {slot.weekday}
                      </T>
                      <View
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 13,
                          backgroundColor: myMood ? myMood.background : C.paper,
                          borderWidth: 1,
                          borderColor: myMood ? myMood.color : C.line,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <T style={{ fontSize: 12 }}>{myMood ? myMood.emoji : '·'}</T>
                      </View>
                      <View
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 13,
                          backgroundColor: theirMood ? theirMood.background : C.paper,
                          borderWidth: 1,
                          borderColor: theirMood ? theirMood.color : C.line,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <T style={{ fontSize: 12 }}>{theirMood ? theirMood.emoji : '·'}</T>
                      </View>
                      <T kind="small" style={{ fontSize: 9, color: C.muted }}>
                        {slot.dayNum}
                      </T>
                    </View>
                  );
                })}
              </View>
              <T kind="small" style={{ fontSize: 11 }}>
                Top row is {me.name} · bottom row is {partnerDisplay}
              </T>
            </View>
          </Card>

          <QuickNotes />

          <MemoryLane />

          <View>
            <SectionTitle title="A moment from your world" link="See your story" onPress={() => router.push('/story')} />
            {space.moments[0] ? (
              <MomentCard moment={space.moments[0]} />
            ) : (
              <Card>
                <T>Your story starts with something small.</T>
                <Button title="Send your first moment" icon={Camera} onPress={() => router.push('/compose')} style={{ marginTop: 15 }} />
              </Card>
            )}
          </View>

          <DailyQuestion day={todayKey} />

          <SharedJournal maxItems={3} />
        </View>

        <View style={{ flex: wide ? 1 : undefined, gap: 23 }}>
          <RelationshipClockCard
            startedAt={space.originStory?.relationshipStartedAt || space.startedOn}
            mode={space.mode}
            myName={me.name}
            partnerName={partner?.name ?? 'Partner'}
            partnerNickname={partnerDisplay}
            myAvatar={me.avatar}
            partnerAvatar={partner?.avatar}
          />

          <PartnerNotificationCenterCard compact />

          <View>
            <SectionTitle title="Leave something on their desk" />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {[
                {
                  title: 'Instant Pic',
                  icon: Zap,
                  color: C.yellow,
                  onPress: () => {
                    hapticInstantPic();
                    void run(async () => {
                      const uri = await pickAndPrepareInstantPhoto(false);
                      if (uri) await addQuickNote('', 'butter', uri);
                    });
                  },
                },
                { title: 'Photo', icon: Camera, color: '#F6E8D5', onPress: () => { hapticTap(); router.push('/compose?kind=photo'); } },
                { title: 'Doodle', icon: PenLine, color: C.rose, onPress: () => { hapticTap(); router.push('/draw'); } },
                { title: 'Call', icon: Phone, color: C.pale, onPress: () => { hapticTap(); router.push('/call'); } },
              ].map(({ title, icon: Icon, color, onPress }) => (
                <Pressable
                  key={title}
                  accessibilityRole="button"
                  accessibilityLabel={title === 'Call' ? 'Call your partner' : `Send ${title.toLowerCase()}`}
                  onPress={onPress}
                  style={({ pressed }) => ({
                    flex: 1,
                    alignItems: 'center',
                    gap: 12,
                    paddingVertical: 19,
                    borderRadius: 16,
                    backgroundColor: color,
                    borderWidth: 1,
                    borderColor: C.line,
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <Icon size={23} color={C.ink} strokeWidth={1.5} />
                  <T style={{ fontSize: 12, fontFamily: F.medium }}>{title}</T>
                </Pressable>
              ))}
            </View>
          </View>

          <DateNightPlanner />

          <DailyErrands />

          <RelationshipQuiz maxItems={2} />

          <FutureAdventures maxItems={3} />

          <View style={{ alignItems: 'center', padding: 10, gap: 8 }}>
            <Heart size={20} color={C.green} strokeWidth={1.4} />
            <T kind="small" style={{ textAlign: 'center', fontFamily: F.italic }}>
              No perfect days required.{'\n'}Just little ways of being there.
            </T>
          </View>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 7, justifyContent: 'center', alignItems: 'center' }}>
        <LockKeyhole size={12} color={C.muted} />
        <T kind="small" style={{ fontSize: 10 }}>
          Your shared space · Just the two of you.
        </T>
      </View>
    </Page>
  );
}
