import React from 'react';
import { View } from 'react-native';
import { ArrowLeftRight } from 'lucide-react-native';
import { BackLink, Button, Page } from '../components/ui';
import { FutureAdventures } from '../components/future-adventures';
import { usePeople, useSpace } from '../store';

export default function AdventuresScreen() {
  const { demo, switchPartner } = useSpace();
  const { partner } = usePeople();

  return (
    <Page
      title="Our future adventures."
      subtitle="Travel escapes, hobbies to learn, shared fantasies & intimate goals—all in one private place."
      eyebrow="COUPLE’S BUCKET LIST"
    >
      <BackLink />
      <View style={{ width: '100%', maxWidth: 760, alignSelf: 'center', gap: 22 }}>
        {demo && (
          <Button
            title={`View bucket list as ${partner?.name ?? 'your partner'}`}
            secondary
            compact
            icon={ArrowLeftRight}
            onPress={switchPartner}
          />
        )}
        <FutureAdventures showFullLink={false} />
      </View>
    </Page>
  );
}
