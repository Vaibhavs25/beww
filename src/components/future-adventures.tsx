import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Archive, Check, Circle, Compass, Flame, Heart, Palette, Plus, RotateCcw } from 'lucide-react-native';
import {
  ADVENTURE_CATEGORIES,
  adventureCategoryMeta,
  adventureProgress,
  type AdventureCategory,
} from '../domain';
import { useSpace } from '../store';
import { Button, C, Card, F, Field, S, T } from './ui';

const CATEGORY_ICONS: Record<AdventureCategory, typeof Compass> = {
  travel: Compass,
  hobby: Palette,
  fantasy: Flame,
  intimacy: Heart,
};

const QUICK_SPARKS: Record<AdventureCategory, string[]> = {
  travel: ['Sleep under the stars in a cabin', 'Take an overnight scenic train for two'],
  hobby: ['Learn a partner dance together', 'Cook a 3-course regional dinner from scratch'],
  fantasy: ['Stranger-at-the-bar hotel roleplay night', 'Midnight skinny-dip on a private getaway'],
  intimacy: ['Candlelit massage & slow intimacy evening', 'Try a new bedroom adventure from our wish list'],
};

export function FutureAdventures({
  maxItems,
  showFullLink = true,
}: {
  maxItems?: number;
  showFullLink?: boolean;
}) {
  const { space, addAdventure, toggleAdventure, archiveAdventure, run, busy } = useSpace();
  const [filter, setFilter] = useState<AdventureCategory | 'all' | 'archived'>('all');
  const [adding, setAdding] = useState(false);
  const [category, setCategory] = useState<AdventureCategory>('travel');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');

  const goals = space.adventures ?? [];
  const overall = adventureProgress(goals, 'all');
  const currentMeta = adventureCategoryMeta(category);

  const visibleGoals = goals.filter(g => {
    if (filter === 'archived') return g.archived;
    if (g.archived) return false;
    return filter === 'all' || g.category === filter;
  });

  const displayedGoals = maxItems ? visibleGoals.slice(0, maxItems) : visibleGoals;

  const handleAdd = () => {
    if (!title.trim()) return;
    void run(async () => {
      await addAdventure(title, category, notes);
      setTitle('');
      setNotes('');
      setAdding(false);
      if (filter === 'archived') setFilter('all');
    });
  };

  return (
    <Card style={{ gap: 16 }}>
      <View style={[S.between, { flexWrap: 'wrap', gap: 10 }]}>
        <View style={[S.row, { gap: 8 }]}>
          <Compass size={17} color={C.green} strokeWidth={1.6} />
          <T kind="label" style={{ color: C.green }}>
            FUTURE ADVENTURES · BUCKET LIST
          </T>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={adding ? 'Close bucket list form' : 'Add a future adventure goal'}
          onPress={() => setAdding(prev => !prev)}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            paddingHorizontal: 11,
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
            {adding ? 'Close' : 'Add goal'}
          </T>
        </Pressable>
      </View>

      <View style={{ gap: 5 }}>
        <T kind="serif" style={{ fontSize: 22, lineHeight: 30 }}>
          Dreams, desires & things to try together.
        </T>
        <T kind="small">
          From travel escapes and shared hobbies to private fantasies and intimacy goals.
        </T>
      </View>

      {/* Visual Progress Bar */}
      <View
        accessible
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: overall.percent }}
        accessibilityLabel={`Bucket list progress: ${overall.completed} of ${overall.total} completed (${overall.percent}%)`}
        style={{
          backgroundColor: C.bg,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: C.line,
          padding: 14,
          gap: 10,
        }}
      >
        <View style={[S.between, { flexWrap: 'wrap', gap: 6 }]}>
          <T style={{ fontSize: 13, fontFamily: F.bold, color: C.ink }}>
            {overall.completed} of {overall.total} adventures completed
          </T>
          <T style={{ fontSize: 13, fontFamily: F.bold, color: C.green }}>
            {overall.percent}%
          </T>
        </View>
        <View
          style={{
            height: 10,
            borderRadius: 5,
            backgroundColor: C.line,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              width: `${overall.percent}%`,
              height: '100%',
              borderRadius: 5,
              backgroundColor: C.green,
            }}
          />
        </View>
        <View style={[S.wrap, { gap: 8 }]}>
          {ADVENTURE_CATEGORIES.map(cat => {
            const stat = adventureProgress(goals, cat.id);
            return (
              <T key={cat.id} kind="small" style={{ fontSize: 11 }}>
                {cat.label}: {stat.completed}/{stat.total}
              </T>
            );
          })}
        </View>
      </View>

      {/* Add Goal Form */}
      {adding && (
        <View
          style={{
            backgroundColor: C.bg,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: C.line,
            padding: 15,
            gap: 12,
          }}
        >
          <T kind="label" style={{ color: C.muted }}>
            CHOOSE A CATEGORY
          </T>
          <View style={[S.wrap, { gap: 8 }]}>
            {ADVENTURE_CATEGORIES.map(cat => {
              const Icon = CATEGORY_ICONS[cat.id];
              const selected = category === cat.id;
              return (
                <Pressable
                  key={cat.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Category ${cat.label}`}
                  onPress={() => setCategory(cat.id)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    paddingHorizontal: 11,
                    paddingVertical: 7,
                    borderRadius: 10,
                    backgroundColor: selected ? cat.bg : C.paper,
                    borderWidth: 1,
                    borderColor: selected ? cat.accent : C.line,
                  }}
                >
                  <Icon size={13} color={selected ? cat.accent : C.muted} strokeWidth={1.7} />
                  <T
                    style={{
                      fontSize: 12,
                      fontFamily: selected ? F.bold : F.medium,
                      color: selected ? cat.accent : C.ink,
                    }}
                  >
                    {cat.label}
                  </T>
                </Pressable>
              );
            })}
          </View>

          <Field
            label="Adventure or goal"
            value={title}
            onChangeText={setTitle}
            maxLength={120}
            placeholder={currentMeta.placeholder}
          />

          <Field
            label="Private note or details (optional)"
            value={notes}
            onChangeText={setNotes}
            maxLength={300}
            placeholder="Where, how, or a little secret detail for the two of us…"
          />

          <View style={{ gap: 6 }}>
            <T kind="small" style={{ fontSize: 11 }}>
              Quick inspiration for {currentMeta.label.toLowerCase()}:
            </T>
            <View style={[S.wrap, { gap: 6 }]}>
              {QUICK_SPARKS[category].map(spark => (
                <Pressable
                  key={spark}
                  accessibilityRole="button"
                  accessibilityLabel={`Use adventure idea ${spark}`}
                  onPress={() => setTitle(spark)}
                  style={({ pressed }) => ({
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 8,
                    backgroundColor: C.paper,
                    borderWidth: 1,
                    borderColor: C.line,
                    opacity: pressed ? 0.72 : 1,
                  })}
                >
                  <T style={{ fontSize: 11, color: C.ink }}>{spark}</T>
                </Pressable>
              ))}
            </View>
          </View>

          <Button
            title="Add to our bucket list"
            compact
            icon={Plus}
            disabled={!title.trim()}
            loading={busy}
            onPress={handleAdd}
          />
        </View>
      )}

      {/* Filter Pills */}
      <View style={[S.wrap, { gap: 7 }]}>
        {[
          { id: 'all' as const, label: `Active (${overall.total})` },
          ...ADVENTURE_CATEGORIES.map(c => ({ id: c.id, label: c.label })),
          { id: 'archived' as const, label: `Archived (${overall.archived})` },
        ].map(tab => {
          const active = filter === tab.id;
          return (
            <Pressable
              key={tab.id}
              accessibilityRole="button"
              accessibilityLabel={`Filter adventures by ${tab.label}`}
              onPress={() => setFilter(tab.id)}
              style={{
                paddingHorizontal: 11,
                paddingVertical: 6,
                borderRadius: 10,
                backgroundColor: active ? C.ink : C.bg,
                borderWidth: 1,
                borderColor: active ? C.ink : C.line,
              }}
            >
              <T
                style={{
                  fontSize: 12,
                  fontFamily: active ? F.bold : F.medium,
                  color: active ? C.paper : C.ink,
                }}
              >
                {tab.label}
              </T>
            </Pressable>
          );
        })}
      </View>

      {/* Goals List */}
      <View style={{ gap: 10 }}>
        {displayedGoals.length ? (
          displayedGoals.map(goal => {
            const meta = adventureCategoryMeta(goal.category);
            const Icon = CATEGORY_ICONS[goal.category];
            const authorName = space.profiles.find(p => p.id === goal.authorId)?.name ?? 'Partner';
            return (
              <View
                key={goal.id}
                style={{
                  backgroundColor: goal.completed ? C.yellow : C.bg,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: goal.completed ? C.green : C.line,
                  padding: 13,
                  gap: 9,
                }}
              >
                <View style={[S.between, { flexWrap: 'wrap', gap: 8 }]}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 5,
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 7,
                      backgroundColor: meta.bg,
                    }}
                  >
                    <Icon size={12} color={meta.accent} strokeWidth={1.7} />
                    <T style={{ fontSize: 10, fontFamily: F.bold, color: meta.accent, letterSpacing: 0.6 }}>
                      {meta.badge}
                    </T>
                  </View>
                  <T kind="small" style={{ fontSize: 11 }}>
                    Added by {authorName}
                  </T>
                </View>

                <View style={[S.row, { alignItems: 'flex-start', gap: 10 }]}>
                  <Pressable
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: goal.completed }}
                    accessibilityLabel={`${goal.title}, ${goal.completed ? 'completed' : 'mark completed'}`}
                    onPress={() => {
                      void run(() => toggleAdventure(goal.id));
                    }}
                    style={{
                      paddingTop: 2,
                      minWidth: 28,
                      minHeight: 28,
                      justifyContent: 'center',
                    }}
                  >
                    {goal.completed ? (
                      <Check size={20} color={C.green} strokeWidth={2.2} />
                    ) : (
                      <Circle size={20} color={C.muted} strokeWidth={1.6} />
                    )}
                  </Pressable>
                  <View style={{ flex: 1, gap: 4 }}>
                    <T
                      style={{
                        fontFamily: F.serif,
                        fontSize: 17,
                        lineHeight: 24,
                        color: C.ink,
                        textDecorationLine: goal.completed ? 'line-through' : 'none',
                      }}
                    >
                      {goal.title}
                    </T>
                    {!!goal.notes && (
                      <T kind="small" style={{ fontSize: 12, lineHeight: 18 }}>
                        {goal.notes}
                      </T>
                    )}
                  </View>
                </View>

                <View style={[S.between, { flexWrap: 'wrap', gap: 8, marginTop: 2 }]}>
                  <T kind="small" style={{ fontSize: 11, color: goal.completed ? C.green : C.muted }}>
                    {goal.completed ? '✓ Completed together' : 'On our bucket list'}
                  </T>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={goal.archived ? `Restore ${goal.title}` : `Archive ${goal.title}`}
                    onPress={() => {
                      void run(() => archiveAdventure(goal.id));
                    }}
                    style={({ pressed }) => ({
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 5,
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      borderRadius: 8,
                      backgroundColor: C.paper,
                      borderWidth: 1,
                      borderColor: C.line,
                      opacity: pressed ? 0.72 : 1,
                    })}
                  >
                    {goal.archived ? (
                      <RotateCcw size={12} color={C.ink} />
                    ) : (
                      <Archive size={12} color={C.muted} />
                    )}
                    <T style={{ fontSize: 11, fontFamily: F.medium, color: C.ink }}>
                      {goal.archived ? 'Restore' : 'Archive'}
                    </T>
                  </Pressable>
                </View>
              </View>
            );
          })
        ) : (
          <View
            style={{
              padding: 18,
              borderRadius: 14,
              backgroundColor: C.bg,
              borderWidth: 1,
              borderColor: C.line,
              alignItems: 'center',
              gap: 6,
            }}
          >
            <T style={{ fontFamily: F.medium, fontSize: 14 }}>
              {filter === 'archived'
                ? 'No archived adventures yet.'
                : 'No goals in this category yet.'}
            </T>
            <T kind="small" style={{ textAlign: 'center' }}>
              Tap “Add goal” above to add a travel, hobby, fantasy, or intimacy goal for the two of you.
            </T>
          </View>
        )}
      </View>

      {showFullLink && (
        <Button
          title="Explore all future adventures"
          secondary
          compact
          onPress={() => router.push('/adventures' as '/plans')}
        />
      )}
    </Card>
  );
}
