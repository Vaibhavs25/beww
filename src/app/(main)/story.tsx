import React, { useState } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { Plus, BookHeart } from 'lucide-react-native';
import { Button, Chip, Empty, Page, S, T } from '../../components/ui';
import { useSpace } from '../../store';
import { MomentCard } from '../../components/moment-card';
import { SharedJournal } from '../../components/shared-journal';

export default function Story() {
  const { space } = useSpace();
  const [filter, setFilter] = useState('All');
  const { width } = useWindowDimensions();
  const columns = width > 1050 ? 2 : 1;
  const moments = space.moments.filter(
    m =>
      filter === 'All' ||
      (filter === 'Photos' && m.kind === 'photo') ||
      (filter === 'Drawings' && m.kind === 'drawing') ||
      (filter === 'Notes' && ['note', 'hug'].includes(m.kind))
  );

  return (
    <Page
      title="The story of us."
      subtitle="Ordinary moments. Extraordinary because they’re ours."
      eyebrow="KEEP THE LITTLE THINGS"
      action={<Button title="Add" compact icon={Plus} onPress={() => router.push('/compose')} />}
    >
      <View style={S.wrap}>
        {['All', 'Photos', 'Notes', 'Drawings'].map(f => (
          <Chip key={f} title={f} selected={f === filter} onPress={() => setFilter(f)} />
        ))}
      </View>
      {!moments.length ? (
        <Empty
          icon={BookHeart}
          title="Room for your next memory"
          text="A photo, a note, a not-so-perfect doodle. The little things belong here."
        />
      ) : (
        <View style={{ flexDirection: 'row', gap: 20 }}>
          {Array.from({ length: columns }, (_, column) => (
            <View key={column} style={{ flex: 1, minWidth: 0, gap: 20 }}>
              {moments
                .filter((_, i) => i % columns === column)
                .map(moment => (
                  <MomentCard key={moment.id} moment={moment} />
                ))}
            </View>
          ))}
        </View>
      )}
      <SharedJournal />
      <T kind="small" style={{ textAlign: 'center' }}>
        Made by the two of you, one moment at a time.
      </T>
    </Page>
  );
}
