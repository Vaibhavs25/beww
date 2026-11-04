import React, { useMemo, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeftRight, Award, Check, HelpCircle, Plus, Sparkles, Trophy, X } from 'lucide-react-native';
import { TRIVIA_TEMPLATES, triviaScoreboard } from '../domain';
import { usePeople, useSpace } from '../store';
import { Avatar, Button, C, Card, F, S, SectionTitle, T } from './ui';

export function RelationshipQuiz({ maxItems }: { maxItems?: number }) {
  const { space, userId, run, busy, addTriviaQuestion, guessTriviaQuestion, demo, switchPartner } = useSpace();
  const { me, partner } = usePeople();
  const [composing, setComposing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'for_me' | 'by_me'>('all');
  const [prompt, setPrompt] = useState('');
  const [option0, setOption0] = useState('');
  const [option1, setOption1] = useState('');
  const [option2, setOption2] = useState('');
  const [correctIndex, setCorrectIndex] = useState(0);

  const questions = useMemo(() => space.trivia ?? [], [space.trivia]);
  const scoreboard = useMemo(
    () => triviaScoreboard(questions, space.profiles, userId),
    [questions, space.profiles, userId]
  );

  const filteredQuestions = useMemo(() => {
    const list = questions.filter(q => {
      if (filter === 'for_me') return q.authorId !== userId;
      if (filter === 'by_me') return q.authorId === userId;
      return true;
    });
    return maxItems ? list.slice(0, maxItems) : list;
  }, [questions, filter, userId, maxItems]);

  const unansweredForMeCount = useMemo(
    () => questions.filter(q => q.authorId !== userId && q.guesses[userId] === undefined).length,
    [questions, userId]
  );

  const applyTemplate = (index: number) => {
    const tpl = TRIVIA_TEMPLATES[index % TRIVIA_TEMPLATES.length];
    setPrompt(tpl.prompt);
    setOption0(tpl.options[0]);
    setOption1(tpl.options[1]);
    setOption2(tpl.options[2]);
    setCorrectIndex(0);
  };

  const handleCreate = async () => {
    if (!prompt.trim() || !option0.trim() || !option1.trim() || !option2.trim()) return;
    const ok = await run(() =>
      addTriviaQuestion(prompt, [option0, option1, option2], correctIndex)
    );
    if (ok) {
      setPrompt('');
      setOption0('');
      setOption1('');
      setOption2('');
      setCorrectIndex(0);
      setComposing(false);
    }
  };

  return (
    <View style={{ gap: 14 }}>
      <SectionTitle
        title="Relationship Quiz"
        link={maxItems ? 'Play all' : composing ? 'Close' : '+ Ask a question'}
        onPress={() => {
          if (maxItems) router.push('/trivia' as '/quiz');
          else setComposing(v => !v);
        }}
      />

      <Card style={{ backgroundColor: C.paper, padding: 20, gap: 16 }}>
        {/* Scoreboard Banner */}
        <View
          style={{
            backgroundColor: C.yellow,
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: C.line,
            gap: 12,
          }}
        >
          <View style={[S.between, { flexWrap: 'wrap', gap: 10 }]}>
            <View style={{ flex: 1, minWidth: 170, gap: 4 }}>
              <View style={[S.row, { gap: 6 }]}>
                <Trophy size={14} color={C.green} />
                <T kind="label" style={{ color: C.green }}>
                  HOW WELL WE KNOW EACH OTHER
                </T>
              </View>
              <T kind="serif" style={{ fontSize: 22 }}>
                {scoreboard.levelLabel} · {scoreboard.totalPoints} pts
              </T>
              <T kind="small">
                {scoreboard.totalAnswered > 0
                  ? `${scoreboard.totalCorrect} of ${scoreboard.totalAnswered} trivia guesses right (${scoreboard.overallPercent}% accuracy)`
                  : 'Create trivia questions about yourselves and guess each other’s answers.'}
              </T>
            </View>
            <Button
              compact
              secondary={composing}
              title={composing ? 'Cancel' : 'Create question'}
              icon={composing ? undefined : Plus}
              onPress={() => setComposing(v => !v)}
            />
          </View>

          {/* Progress Bar */}
          <View style={{ gap: 6 }}>
            <View
              accessible
              accessibilityRole="progressbar"
              accessibilityValue={{ min: 0, max: 100, now: scoreboard.overallPercent }}
              style={{
                height: 9,
                backgroundColor: C.paper,
                borderRadius: 999,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: C.line,
              }}
            >
              <View
                style={{
                  width: `${Math.max(scoreboard.totalAnswered > 0 ? 6 : 0, scoreboard.overallPercent)}%`,
                  height: '100%',
                  backgroundColor: C.green,
                  borderRadius: 999,
                }}
              />
            </View>

            {/* Per-partner Score Breakdown */}
            <View style={[S.between, { flexWrap: 'wrap', gap: 8, paddingTop: 4 }]}>
              <View style={[S.row, { gap: 6 }]}>
                <Avatar name={me.name} size={22} />
                <T kind="small" style={{ color: C.ink, fontFamily: F.medium }}>
                  {me.name}: {scoreboard.myCorrect * 10} pts ({scoreboard.myCorrect}/{scoreboard.myAnswered})
                </T>
              </View>
              {partner && (
                <View style={[S.row, { gap: 6 }]}>
                  <Avatar name={partner.name} size={22} color={C.rose} />
                  <T kind="small" style={{ color: C.ink, fontFamily: F.medium }}>
                    {partner.name}: {scoreboard.partnerCorrect * 10} pts ({scoreboard.partnerCorrect}/{scoreboard.partnerAnswered})
                  </T>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Filter Pills */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {([
            { id: 'all', label: `All (${questions.length})` },
            {
              id: 'for_me',
              label: unansweredForMeCount > 0 ? `To guess (${unansweredForMeCount} new)` : `About ${partner?.name ?? 'Partner'}`,
            },
            { id: 'by_me', label: `Asked by ${me.name}` },
          ] as const).map(tab => {
            const active = filter === tab.id;
            return (
              <Pressable
                key={tab.id}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={`Filter trivia: ${tab.label}`}
                onPress={() => setFilter(tab.id)}
                style={{
                  paddingHorizontal: 11,
                  paddingVertical: 6,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: active ? C.green : C.line,
                  backgroundColor: active ? C.pale : C.bg,
                }}
              >
                <T
                  kind="small"
                  style={{
                    fontSize: 12,
                    color: active ? C.green : C.ink,
                    fontFamily: active ? F.bold : F.medium,
                  }}
                >
                  {tab.label}
                </T>
              </Pressable>
            );
          })}
        </View>

        {/* Create Question Form */}
        {composing && (
          <View
            style={{
              backgroundColor: C.bg,
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: C.line,
              gap: 12,
            }}
          >
            <View style={[S.between, { flexWrap: 'wrap', gap: 8 }]}>
              <T kind="label" style={{ color: C.green }}>
                WRITE A TRIVIA QUESTION ABOUT YOU
              </T>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {TRIVIA_TEMPLATES.map((_, idx) => (
                  <Pressable
                    key={idx}
                    accessibilityRole="button"
                    accessibilityLabel={`Load template ${idx + 1}`}
                    onPress={() => applyTemplate(idx)}
                    style={{
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 8,
                      backgroundColor: C.paper,
                      borderWidth: 1,
                      borderColor: C.line,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Sparkles size={11} color={C.green} />
                    <T kind="small" style={{ fontSize: 11, color: C.ink }}>
                      Idea {idx + 1}
                    </T>
                  </Pressable>
                ))}
              </View>
            </View>

            <TextInput
              accessibilityLabel="Trivia question prompt"
              value={prompt}
              onChangeText={setPrompt}
              placeholder={`e.g., What is ${me.name}’s secret comfort food?`}
              placeholderTextColor="#9A887E"
              maxLength={140}
              style={S.input}
            />

            <T kind="small" style={{ color: C.muted }}>
              Add 3 choices and mark the one that’s true for you:
            </T>

            {[
              { value: option0, setValue: setOption0, placeholder: 'Option A' },
              { value: option1, setValue: setOption1, placeholder: 'Option B' },
              { value: option2, setValue: setOption2, placeholder: 'Option C' },
            ].map((opt, idx) => {
              const isCorrect = correctIndex === idx;
              return (
                <View key={idx} style={{ gap: 6 }}>
                  <View style={[S.between, { flexWrap: 'wrap', gap: 6 }]}>
                    <T kind="small" style={{ fontFamily: F.medium, color: C.ink }}>
                      Choice {idx + 1}
                    </T>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ selected: isCorrect }}
                      accessibilityLabel={`Mark choice ${idx + 1} as correct answer`}
                      onPress={() => setCorrectIndex(idx)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 5,
                        paddingHorizontal: 9,
                        paddingVertical: 4,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: isCorrect ? C.green : C.line,
                        backgroundColor: isCorrect ? C.pale : C.paper,
                      }}
                    >
                      {isCorrect && <Check size={12} color={C.green} />}
                      <T
                        kind="small"
                        style={{
                          fontSize: 11,
                          color: isCorrect ? C.green : C.muted,
                          fontFamily: isCorrect ? F.bold : F.medium,
                        }}
                      >
                        {isCorrect ? 'Correct answer' : 'Mark as correct'}
                      </T>
                    </Pressable>
                  </View>
                  <TextInput
                    accessibilityLabel={`Trivia choice ${idx + 1}`}
                    value={opt.value}
                    onChangeText={opt.setValue}
                    placeholder={opt.placeholder}
                    placeholderTextColor="#9A887E"
                    maxLength={90}
                    style={S.input}
                  />
                </View>
              );
            })}

            <View style={[S.between, { flexWrap: 'wrap', gap: 10 }]}>
              <T kind="small" style={{ flex: 1, minWidth: 160 }}>
                {partner?.name ?? 'Your partner'} earns +10 points when they guess right.
              </T>
              <Button
                compact
                title="Post trivia"
                icon={Award}
                loading={busy}
                disabled={!prompt.trim() || !option0.trim() || !option1.trim() || !option2.trim()}
                onPress={() => {
                  void handleCreate();
                }}
              />
            </View>
          </View>
        )}

        {/* Trivia Question List */}
        {filteredQuestions.length === 0 ? (
          <View
            style={{
              backgroundColor: C.bg,
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: C.line,
              alignItems: 'center',
              gap: 10,
            }}
          >
            <HelpCircle size={24} color={C.green} strokeWidth={1.5} />
            <T kind="serif" style={{ fontSize: 18, textAlign: 'center' }}>
              No trivia questions in this view yet.
            </T>
            <T kind="small" style={{ textAlign: 'center', maxWidth: 320 }}>
              Write a playful question about your habits, memories, or favorites to test how well you know each other.
            </T>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {filteredQuestions.map(q => {
              const isMine = q.authorId === userId;
              const authorName = isMine ? me.name : partner?.name ?? 'Partner';
              const guesserId = isMine ? partner?.id : userId;
              const guesserName = isMine ? partner?.name ?? 'Partner' : me.name;
              const existingGuess = guesserId ? q.guesses[guesserId] : undefined;
              const hasGuessed = existingGuess !== undefined;
              const guessedRight = existingGuess === q.correctIndex;
              const revealAnswer = isMine || hasGuessed;

              return (
                <View
                  key={q.id}
                  style={{
                    backgroundColor: C.bg,
                    borderRadius: 16,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: !isMine && !hasGuessed ? C.green : C.line,
                    gap: 12,
                  }}
                >
                  <View style={[S.between, { flexWrap: 'wrap', gap: 8 }]}>
                    <View style={[S.row, { gap: 8 }]}>
                      <Avatar name={authorName} size={26} color={isMine ? C.pale : C.rose} />
                      <T kind="label" style={{ color: C.muted, fontSize: 10 }}>
                        ABOUT {authorName.toUpperCase()}
                      </T>
                    </View>
                    <View
                      style={{
                        paddingHorizontal: 9,
                        paddingVertical: 3,
                        borderRadius: 8,
                        backgroundColor: hasGuessed
                          ? guessedRight
                            ? '#EBF3EC'
                            : C.rose
                          : isMine
                            ? C.paper
                            : C.pale,
                        borderWidth: 1,
                        borderColor: hasGuessed && guessedRight ? '#4C7A57' : C.line,
                      }}
                    >
                      <T
                        kind="small"
                        style={{
                          fontSize: 11,
                          fontFamily: F.bold,
                          color: hasGuessed
                            ? guessedRight
                              ? '#2F5E3B'
                              : C.green
                            : C.ink,
                        }}
                      >
                        {hasGuessed
                          ? guessedRight
                            ? `✓ ${guesserName} got it (+10 pts)`
                            : `${guesserName} guessed`
                          : isMine
                            ? `Waiting for ${guesserName}`
                            : 'Your turn to guess'}
                      </T>
                    </View>
                  </View>

                  <T kind="serif" style={{ fontSize: 19, lineHeight: 26 }}>
                    {q.prompt}
                  </T>

                  <View style={{ gap: 8 }}>
                    {q.options.map((opt, idx) => {
                      const isCorrectOption = idx === q.correctIndex;
                      const isPickedOption = existingGuess === idx;
                      const canGuess = !isMine && !hasGuessed;

                      let borderColor = C.line;
                      let bgColor = C.paper;
                      if (revealAnswer) {
                        if (isCorrectOption) {
                          borderColor = '#4C7A57';
                          bgColor = '#EBF3EC';
                        } else if (isPickedOption) {
                          borderColor = C.green;
                          bgColor = C.rose;
                        }
                      }

                      return (
                        <Pressable
                          key={`${q.id}-${idx}`}
                          accessibilityRole="button"
                          accessibilityState={{ disabled: !canGuess, selected: isPickedOption }}
                          accessibilityLabel={`Answer option: ${opt}`}
                          disabled={!canGuess || busy}
                          onPress={() => {
                            if (canGuess) {
                              void run(() => guessTriviaQuestion(q.id, idx));
                            }
                          }}
                          style={({ pressed }) => ({
                            borderWidth: 1,
                            borderColor,
                            backgroundColor: bgColor,
                            borderRadius: 12,
                            paddingVertical: 11,
                            paddingHorizontal: 13,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 8,
                            opacity: pressed && canGuess ? 0.75 : 1,
                          })}
                        >
                          <View style={{ flex: 1 }}>
                            <T
                              style={{
                                fontSize: 14,
                                fontFamily: revealAnswer && isCorrectOption ? F.bold : F.body,
                              }}
                            >
                              {opt}
                            </T>
                            {revealAnswer && (isCorrectOption || isPickedOption) && (
                              <T kind="small" style={{ fontSize: 11, color: C.muted }}>
                                {isCorrectOption && isPickedOption
                                  ? `${guesserName} nailed it!`
                                  : isCorrectOption
                                    ? `${authorName}’s true answer`
                                    : `${guesserName}’s guess`}
                              </T>
                            )}
                          </View>
                          {revealAnswer && isCorrectOption && <Check size={16} color="#2F5E3B" />}
                          {revealAnswer && isPickedOption && !isCorrectOption && <X size={16} color={C.green} />}
                        </Pressable>
                      );
                    })}
                  </View>

                  {demo && isMine && !hasGuessed && (
                    <View style={[S.between, { flexWrap: 'wrap', gap: 8, paddingTop: 2 }]}>
                      <T kind="small">
                        Switch to {partner?.name ?? 'your partner'} in demo mode to test guessing this question.
                      </T>
                      <Button
                        compact
                        secondary
                        title={`Switch to ${partner?.name ?? 'partner'}`}
                        icon={ArrowLeftRight}
                        onPress={switchPartner}
                      />
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {maxItems && questions.length > maxItems && (
          <Button
            compact
            secondary
            title={`See all ${questions.length} trivia questions`}
            onPress={() => router.push('/trivia' as '/quiz')}
          />
        )}
      </Card>
    </View>
  );
}
