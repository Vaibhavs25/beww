import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { CalendarPlus } from 'lucide-react-native';
import { BackLink, Button, Page } from '../components/ui';
import {
  MilestoneCalendarCard,
  OriginStoryCard,
  RelationshipClockCard,
} from '../components/relationship-clock';
import { usePeople, useSpace } from '../store';

export default function MilestonesScreen() {
  const { space } = useSpace();
  const { me, partner } = usePeople();
  const { width } = useWindowDimensions();
  const wide = width > 1080;
  const partnerDisplay =
    partner?.nickname || space.originStory?.partnerNickname || partner?.name || 'Partner';

  return (
    <Page
      title="Our Milestone Calendar."
      subtitle="Every chapter from onboarding, every anniversary countdown, and every second since our story began."
      eyebrow="RELATIONSHIP TIMELINE & COUNTDOWNS"
    >
      <BackLink />
      <View
        style={{
          flexDirection: wide ? 'row' : 'column',
          gap: 24,
          alignItems: 'flex-start',
        }}
      >
        <View style={{ flex: wide ? 1.55 : undefined, width: '100%', gap: 24 }}>
          <MilestoneCalendarCard expanded />
        </View>
        <View style={{ flex: wide ? 1 : undefined, width: '100%', gap: 24 }}>
          <RelationshipClockCard
            startedAt={space.originStory?.relationshipStartedAt || space.startedOn}
            mode={space.mode}
            myName={me.name}
            partnerName={partner?.name ?? 'Partner'}
            partnerNickname={partnerDisplay}
            myAvatar={me.avatar}
            partnerAvatar={partner?.avatar}
            showCalendarLink={false}
            showAnniversaryBanner={false}
          />
          <OriginStoryCard />
          <Button
            title="Plan a special date on our calendar"
            secondary
            icon={CalendarPlus}
            onPress={() => router.push('/plans')}
          />
        </View>
      </View>
    </Page>
  );
}
