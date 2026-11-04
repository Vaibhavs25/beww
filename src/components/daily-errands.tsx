import React, { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { Check, CheckSquare, Plus, RotateCcw, Trash2 } from 'lucide-react-native';
import {
  ERRAND_CATEGORIES,
  QUICK_ERRAND_SUGGESTIONS,
  errandCategoryMeta,
  errandsProgress,
  relativeTime,
  type ErrandCategory,
  type ErrandItem,
} from '../domain';
import { usePeople, useSpace } from '../store';
import { hapticSelection, hapticTap, hapticTaskToggle, hapticWarning } from '../haptics';
import { Button, C, Card, F, S, T } from './ui';

export function DailyErrands() {
  const { space, userId, busy, run, addErrand, toggleErrand, deleteErrand, clearDoneErrands } = useSpace();
  const { me, partner } = usePeople();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ErrandCategory>('groceries');
  const [assignee, setAssignee] = useState<'either' | 'me' | 'partner'>('either');
  const [filter, setFilter] = useState<'all' | 'todo' | 'done'>('all');
  const [showComposerDetails, setShowComposerDetails] = useState(false);

  const progress = errandsProgress(space.errands);
  const categoryMeta = errandCategoryMeta(category);

  const visibleItems: ErrandItem[] =
    filter === 'todo'
      ? progress.activeList
      : filter === 'done'
        ? progress.completedList
        : progress.allList;

  const resolvePersonName = (id?: string) => {
    if (!id) return 'Either of us';
    if (id === userId) return me.name;
    return partner?.name ?? 'Partner';
  };

  const handleAdd = async () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    const assigneeId =
      assignee === 'me'
        ? userId
        : assignee === 'partner' && partner?.id
          ? partner.id
          : undefined;
    const ok = await run(() => addErrand(trimmed, category, assigneeId));
    if (ok) {
      setTitle('');
    }
  };

  const handleQuickSuggestion = async (suggestionTitle: string, suggestionCategory: ErrandCategory) => {
    await run(() => addErrand(suggestionTitle, suggestionCategory));
  };

  return (
    <Card style={{ gap: 18 }}>
      <View style={[S.between, { alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }]}>
        <View style={{ flex: 1, minWidth: 200, gap: 4 }}>
          <View style={[S.row, { gap: 8 }]}>
            <CheckSquare size={17} color={C.green} />
            <T kind="label" style={{ color: C.green }}>
              JOINT RESPONSIBILITIES
            </T>
          </View>
          <T kind="sub" style={{ fontSize: 22, lineHeight: 28 }}>
            Daily Errands
          </T>
          <T kind="small">
            A shared checklist either of you can add to, check off, or tidy up together.
          </T>
        </View>

        <View style={{ alignItems: 'flex-end', gap: 2 }}>
          <T style={{ fontFamily: F.bold, fontSize: 15, color: C.ink }}>
            {progress.completed} of {progress.total} done
          </T>
          <T kind="small" style={{ fontSize: 11 }}>
            {progress.pending === 0 && progress.total > 0
              ? 'All caught up together ♡'
              : `${progress.pending} ${progress.pending === 1 ? 'errand' : 'errands'} left`}
          </T>
        </View>
      </View>

      {/* Progress Bar */}
      <View
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={`${progress.completed} of ${progress.total} errands completed`}
        style={{
          height: 8,
          borderRadius: 99,
          backgroundColor: C.bg,
          borderWidth: 1,
          borderColor: C.line,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: `${progress.percent}%`,
            height: '100%',
            backgroundColor: progress.percent === 100 ? '#3D5A45' : C.green,
            borderRadius: 99,
          }}
        />
      </View>

      {/* Quick Add Form */}
      <View
        style={{
          backgroundColor: C.bg,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: C.line,
          padding: 14,
          gap: 12,
        }}
      >
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <TextInput
            value={title}
            onChangeText={text => {
              setTitle(text);
              if (text.trim().length > 0 && !showComposerDetails) {
                setShowComposerDetails(true);
              }
            }}
            onFocus={() => setShowComposerDetails(true)}
            onSubmitEditing={() => {
              void handleAdd();
            }}
            placeholder={categoryMeta.placeholder}
            placeholderTextColor="#9A8E84"
            maxLength={140}
            accessibilityLabel="New daily errand"
            style={{
              flex: 1,
              backgroundColor: C.paper,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: C.line,
              paddingHorizontal: 14,
              paddingVertical: 11,
              fontFamily: F.body,
              fontSize: 14,
              color: C.ink,
            }}
          />
          <Button
            compact
            title="Add"
            icon={Plus}
            loading={busy}
            disabled={!title.trim()}
            onPress={() => {
              void handleAdd();
            }}
          />
        </View>

        {showComposerDetails && (
          <View style={{ gap: 10 }}>
            {/* Category Selector */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
              <T kind="small" style={{ fontSize: 11, marginRight: 4 }}>
                Category:
              </T>
              {ERRAND_CATEGORIES.map(cat => {
                const active = category === cat.id;
                return (
                  <Pressable
                    key={cat.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={`Category ${cat.label}`}
                    onPress={() => {
                      hapticSelection();
                      setCategory(cat.id);
                    }}
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      borderRadius: 8,
                      backgroundColor: active ? cat.bg : C.paper,
                      borderWidth: 1,
                      borderColor: active ? cat.accent : C.line,
                    }}
                  >
                    <T
                      style={{
                        fontSize: 12,
                        fontFamily: active ? F.bold : F.medium,
                        color: active ? cat.accent : C.muted,
                      }}
                    >
                      {cat.label}
                    </T>
                  </Pressable>
                );
              })}
            </View>

            {/* Assignee Selector */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
              <T kind="small" style={{ fontSize: 11, marginRight: 4 }}>
                Who’s on it:
              </T>
              {[
                { id: 'either' as const, label: 'Either of us' },
                { id: 'me' as const, label: me.name },
                ...(partner ? [{ id: 'partner' as const, label: partner.name }] : []),
              ].map(opt => {
                const active = assignee === opt.id;
                return (
                  <Pressable
                    key={opt.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={`Assign to ${opt.label}`}
                    onPress={() => {
                      hapticSelection();
                      setAssignee(opt.id);
                    }}
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      borderRadius: 8,
                      backgroundColor: active ? C.pale : C.paper,
                      borderWidth: 1,
                      borderColor: active ? C.green : C.line,
                    }}
                  >
                    <T
                      style={{
                        fontSize: 12,
                        fontFamily: active ? F.bold : F.medium,
                        color: active ? C.green : C.muted,
                      }}
                    >
                      {opt.label}
                    </T>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* Quick 1-Tap Errand Starters */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
          <T kind="small" style={{ fontSize: 11, color: C.muted }}>
            Quick add:
          </T>
          {QUICK_ERRAND_SUGGESTIONS.map(item => (
            <Pressable
              key={item.title}
              accessibilityRole="button"
              accessibilityLabel={`Quick add ${item.title}`}
              onPress={() => {
                hapticTap();
                void handleQuickSuggestion(item.title, item.category);
              }}
              style={({ pressed }) => ({
                paddingHorizontal: 9,
                paddingVertical: 4,
                borderRadius: 8,
                backgroundColor: C.paper,
                borderWidth: 1,
                borderColor: C.line,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <T style={{ fontSize: 11, color: C.ink, fontFamily: F.medium }}>+ {item.title}</T>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Interactive Filter Controls & Clear Completed */}
      <View style={[S.between, { flexWrap: 'wrap', gap: 8 }]}>
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: C.bg,
            padding: 3,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: C.line,
            gap: 2,
          }}
        >
          {[
            { id: 'all' as const, label: `All (${progress.total})` },
            { id: 'todo' as const, label: `To do (${progress.pending})` },
            { id: 'done' as const, label: `Done (${progress.completed})` },
          ].map(tab => {
            const active = filter === tab.id;
            return (
              <Pressable
                key={tab.id}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => {
                  hapticSelection();
                  setFilter(tab.id);
                }}
                style={{
                  paddingHorizontal: 11,
                  paddingVertical: 6,
                  borderRadius: 7,
                  backgroundColor: active ? C.paper : 'transparent',
                }}
              >
                <T
                  style={{
                    fontSize: 12,
                    fontFamily: active ? F.bold : F.medium,
                    color: active ? C.ink : C.muted,
                  }}
                >
                  {tab.label}
                </T>
              </Pressable>
            );
          })}
        </View>

        {progress.completed > 0 && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear completed errands"
            onPress={() => {
              hapticWarning();
              void run(() => clearDoneErrands());
            }}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 8,
              backgroundColor: C.bg,
              borderWidth: 1,
              borderColor: C.line,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <RotateCcw size={12} color={C.muted} />
            <T kind="small" style={{ fontSize: 11, fontFamily: F.medium }}>
              Clear done ({progress.completed})
            </T>
          </Pressable>
        )}
      </View>

      {/* Errands List */}
      {visibleItems.length === 0 ? (
        <View
          style={{
            paddingVertical: 24,
            paddingHorizontal: 16,
            borderRadius: 14,
            backgroundColor: C.bg,
            borderWidth: 1,
            borderColor: C.line,
            alignItems: 'center',
            gap: 6,
          }}
        >
          <T style={{ fontFamily: F.medium, color: C.ink }}>
            {filter === 'done'
              ? 'No errands checked off yet today.'
              : filter === 'todo'
                ? 'Nothing left on the to-do list!'
                : 'Your shared errands list is clear.'}
          </T>
          <T kind="small" style={{ textAlign: 'center' }}>
            Add groceries, household tasks, or little reminders above so neither of you has to carry the mental load alone.
          </T>
        </View>
      ) : (
        <View style={{ gap: 10 }}>
          {visibleItems.map(item => {
            const cat = errandCategoryMeta(item.category);
            const addedBy = resolvePersonName(item.authorId);
            const assignedLabel = item.assigneeId ? `For ${resolvePersonName(item.assigneeId)}` : 'Either of us';
            const completedByName = item.completedBy ? resolvePersonName(item.completedBy) : null;

            return (
              <View
                key={item.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  padding: 13,
                  borderRadius: 14,
                  backgroundColor: item.done ? C.bg : C.paper,
                  borderWidth: 1,
                  borderColor: item.done ? C.line : '#E2D6C8',
                }}
              >
                {/* Check-off toggle usable by either partner */}
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: item.done }}
                  accessibilityLabel={`${item.done ? 'Uncheck' : 'Check off'} ${item.title}`}
                  onPress={() => {
                    hapticTaskToggle(!item.done);
                    void run(() => toggleErrand(item.id));
                  }}
                  style={({ pressed }) => ({
                    width: 26,
                    height: 26,
                    borderRadius: 8,
                    borderWidth: 1.5,
                    borderColor: item.done ? '#3D5A45' : C.green,
                    backgroundColor: item.done ? '#3D5A45' : C.paper,
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: pressed ? 0.75 : 1,
                  })}
                >
                  {item.done && <Check size={15} color="#FAF5EE" strokeWidth={2.5} />}
                </Pressable>

                {/* Errand Title & Unboxed Clean Metadata */}
                <Pressable
                  onPress={() => {
                    hapticTaskToggle(!item.done);
                    void run(() => toggleErrand(item.id));
                  }}
                  style={{ flex: 1, minWidth: 0, gap: 3 }}
                >
                  <T
                    style={{
                      fontSize: 15,
                      lineHeight: 21,
                      fontFamily: F.medium,
                      color: item.done ? C.muted : C.ink,
                      textDecorationLine: item.done ? 'line-through' : 'none',
                    }}
                  >
                    {item.title}
                  </T>
                  <T kind="small" style={{ fontSize: 11, color: C.muted }}>
                    <T kind="small" style={{ fontSize: 11, color: cat.accent, fontFamily: F.medium }}>
                      {cat.label}
                    </T>
                    {' · '}
                    {assignedLabel}
                    {' · '}
                    {item.done && completedByName
                      ? `Checked off by ${completedByName}`
                      : `Added by ${addedBy} ${relativeTime(item.createdAt)}`}
                  </T>
                </Pressable>

                {/* Delete button usable by either partner */}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Delete errand ${item.title}`}
                  onPress={() => {
                    hapticWarning();
                    void run(() => deleteErrand(item.id));
                  }}
                  style={({ pressed }) => ({
                    padding: 8,
                    borderRadius: 10,
                    backgroundColor: C.bg,
                    borderWidth: 1,
                    borderColor: C.line,
                    opacity: pressed ? 0.65 : 1,
                  })}
                >
                  <Trash2 size={15} color={C.muted} />
                </Pressable>
              </View>
            );
          })}
        </View>
      )}
    </Card>
  );
}
