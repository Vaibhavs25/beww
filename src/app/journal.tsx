import React from 'react';
import { View } from 'react-native';
import { ArrowLeftRight } from 'lucide-react-native';
import { BackLink, Button, Page } from '../components/ui';
import { SharedJournal } from '../components/shared-journal';
import { usePeople, useSpace } from '../store';

export default function JournalScreen() {
  const { demo, switchPartner } = useSpace();
  const { partner } = usePeople();

  return (
    <Page
      title="Our shared journal."
      subtitle="Daily notes, quiet reflections, and love letters—kept in chronological order for the two of you."
      eyebrow="PAGES OF US"
    >
      <BackLink />
      <View style={{ width: '100%', maxWidth: 760, alignSelf: 'center', gap: 22 }}>
        {demo && (
          <Button
            title={`Write or read as ${partner?.name ?? 'your partner'}`}
            secondary
            compact
            icon={ArrowLeftRight}
            onPress={switchPartner}
          />
        )}
        <SharedJournal showFullLink={false} />
      </View>
    </Page>
  );
}
