import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, Pressable, ScrollView, TextInput, View, useWindowDimensions } from 'react-native';
import { Camera, Check, Heart, Pin, Plus, Send, Sparkles, StickyNote, Trash2, Zap } from 'lucide-react-native';
import {
  INSTANT_PIC_PRESETS,
  QUICK_NOTE_COLORS,
  QUICK_NOTE_SPARKS,
  quickNoteColorMeta,
  relativeTime,
  sortQuickNotes,
  type ImageOptimizationPreset,
  type InstantPicPreset,
  type QuickNote,
  type QuickNoteColor,
} from '../domain';
import { getCdnImageUri, pickAndOptimizeImage, prefetchDashboardImages } from '../lib/image-cdn';
import { hapticHeart, hapticInstantPic, hapticQuickNote, hapticSelection, hapticWarning } from '../haptics';
import { usePeople, useSpace } from '../store';
import { Avatar, Button, C, Card, F, S, SectionTitle, T } from './ui';
import { CoachMarkTarget } from './dashboard-coach-marks';

export async function pickAndPrepareInstantPhoto(
  camera = false,
  preset: ImageOptimizationPreset = 'instant-pic'
): Promise<string | null> {
  const optimized = await pickAndOptimizeImage({ camera, preset });
  return optimized ? optimized.dataUri : null;
}

export function QuickNotes() {
  const { space, userId, busy, run, addQuickNote, updateQuickNoteText, heartQuickNote, pinQuickNote, deleteQuickNote } = useSpace();
  const { me, partner } = usePeople();
  const { width } = useWindowDimensions();

  const [text, setText] = useState('');
  const [color, setColor] = useState<QuickNoteColor>('butter');
  const [editingCaptionId, setEditingCaptionId] = useState<string | null>(null);
  const [captionDraft, setCaptionDraft] = useState('');
  const picRow = useRef<ScrollView>(null);
  const revealInstantPic = useCallback(() => picRow.current?.scrollTo({ x: 0, animated: false }), []);

  const notes = sortQuickNotes(space.quickNotes);
  const activeColor = quickNoteColorMeta(color);
  const partnerName = partner?.name ?? 'your partner';

  useEffect(() => {
    prefetchDashboardImages(
      notes.map(n => n.image),
      'card'
    );
  }, [notes]);

  const authorFor = (authorId: string) => {
    if (authorId === userId) return me.name;
    return space.profiles.find(p => p.id === authorId)?.name ?? partnerName;
  };

  const handleStickNote = () => {
    if (!text.trim()) return;
    hapticQuickNote();
    const noteText = text.trim();
    const noteColor = color;
    void run(async () => {
      await addQuickNote(noteText, noteColor);
      setText('');
    });
  };

  const handleOneClickSpark = (sparkText: string, sparkColor: QuickNoteColor) => {
    hapticQuickNote();
    void run(async () => {
      await addQuickNote(sparkText, sparkColor);
    });
  };

  const handleOneClickPresetPic = (preset: InstantPicPreset) => {
    hapticInstantPic();
    const optionalCaption = text.trim();
    void run(async () => {
      await addQuickNote(optionalCaption, preset.color, preset.image);
      if (optionalCaption) setText('');
    });
  };

  const handleOneClickDevicePic = (camera: boolean) => {
    hapticInstantPic();
    const optionalCaption = text.trim();
    const noteColor = color;
    void run(async () => {
      const dataUri = await pickAndPrepareInstantPhoto(camera);
      if (!dataUri) return;
      await addQuickNote(optionalCaption, noteColor, dataUri);
      if (optionalCaption) setText('');
    });
  };

  const startCaptionEdit = (note: QuickNote) => {
    setEditingCaptionId(note.id);
    setCaptionDraft(note.text);
  };

  const saveCaptionEdit = (noteId: string) => {
    void run(async () => {
      await updateQuickNoteText(noteId, captionDraft);
      setEditingCaptionId(null);
    });
  };

  return (
    <View style={{ gap: 14 }}>
      <SectionTitle
        title="Quick Notes & Instant Pic Widget"
        link={`${notes.length} on board`}
      />
      <T kind="small" style={{ marginTop: -10 }}>
        Stick a spontaneous note or share a 1-click Instant Pic straight to {partnerName}’s widget—writing is optional for pics.
      </T>

      {/* Instant Composer & 1-Click Widget Bar */}
      <Card
        style={{
          backgroundColor: activeColor.bg,
          borderColor: activeColor.border,
          padding: 16,
          gap: 13,
        }}
      >
        <View style={[S.between, { flexWrap: 'wrap', gap: 8 }]}>
          <View style={[S.row, { gap: 7 }]}>
            <StickyNote size={15} color={activeColor.ink} />
            <T kind="label" style={{ color: activeColor.ink, fontSize: 11 }}>
              LEAVE ON {partnerName.toUpperCase()}’S WIDGET
            </T>
          </View>

          {/* Paper Color Picker */}
          <View style={[S.row, { gap: 7 }]}>
            {QUICK_NOTE_COLORS.map(swatch => {
              const selected = swatch.id === color;
              return (
                <Pressable
                  key={swatch.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${swatch.label} sticky note paper`}
                  onPress={() => {
                    hapticSelection();
                    setColor(swatch.id);
                  }}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    backgroundColor: swatch.bg,
                    borderWidth: selected ? 2.5 : 1,
                    borderColor: selected ? swatch.ink : swatch.border,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {selected && <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: swatch.ink }} />}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Single-line / compact input: serves as Sticky Note text OR optional Instant Pic caption */}
        <View
          style={{
            flexDirection: width < 420 ? 'column' : 'row',
            gap: 8,
            alignItems: width < 420 ? 'stretch' : 'center',
          }}
        >
          <TextInput
            value={text}
            onChangeText={setText}
            maxLength={160}
            placeholder="Write a quick sticky note (or optional caption for Instant Pic)…"
            placeholderTextColor={activeColor.muted}
            style={[
              S.input,
              {
                flex: 1,
                backgroundColor: '#FFFFFFB8',
                borderColor: activeColor.border,
                color: activeColor.ink,
                paddingVertical: 11,
                fontFamily: F.serif,
                fontSize: 15,
              },
            ]}
          />
          <CoachMarkTarget id="quick-notes"><Pressable
            accessibilityRole="button"
            accessibilityLabel="Post sticky note"
            disabled={busy || !text.trim()}
            onPress={handleStickNote}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              paddingHorizontal: 15,
              paddingVertical: 12,
              borderRadius: 12,
              backgroundColor: text.trim() ? activeColor.ink : activeColor.border,
              opacity: !text.trim() ? 0.55 : pressed ? 0.8 : 1,
            })}
          >
            <Send size={14} color="#FAF5EE" />
            <T style={{ color: '#FAF5EE', fontSize: 13, fontFamily: F.medium }}>Stick Note</T>
          </Pressable></CoachMarkTarget>
        </View>

        {/* 1-Click Instant Pic Row (Zero multi-click, auto-shares immediately, text optional) */}
        <View
          style={{
            backgroundColor: '#FFFFFF99',
            borderRadius: 14,
            borderWidth: 1,
            borderColor: activeColor.border,
            padding: 11,
            gap: 9,
          }}
        >
          <View style={[S.between, { flexWrap: 'wrap', gap: 6 }]}>
            <View style={[S.row, { gap: 6 }]}>
              <Zap size={14} color={activeColor.ink} />
              <T style={{ fontSize: 12, fontFamily: F.bold, color: activeColor.ink }}>
                1-Click Instant Pic
              </T>
            </View>
            <T kind="small" style={{ fontSize: 11, color: activeColor.muted }}>
              One tap shares immediately · writing is optional
            </T>
          </View>

          <ScrollView
            ref={picRow}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, alignItems: 'center' }}
          >
            <CoachMarkTarget id="instant-pic" onReveal={revealInstantPic}><Pressable
              accessibilityRole="button"
              accessibilityLabel="One-click instant photo from device"
              disabled={busy}
              onPress={() => handleOneClickDevicePic(false)}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 10,
                backgroundColor: activeColor.ink,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Camera size={14} color="#FAF5EE" />
              <T style={{ fontSize: 12, fontFamily: F.medium, color: '#FAF5EE' }}>
                Instant Snap
              </T>
            </Pressable></CoachMarkTarget>

            {INSTANT_PIC_PRESETS.map(preset => (
              <Pressable
                key={preset.id}
                accessibilityRole="button"
                accessibilityLabel={`Instant share ${preset.label} pic`}
                disabled={busy}
                onPress={() => handleOneClickPresetPic(preset)}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingHorizontal: 11,
                  paddingVertical: 7,
                  borderRadius: 10,
                  backgroundColor: '#FAF5EE',
                  borderWidth: 1,
                  borderColor: activeColor.border,
                  opacity: pressed ? 0.75 : 1,
                })}
              >
                <T style={{ fontSize: 13 }}>{preset.emoji}</T>
                <T style={{ fontSize: 12, fontFamily: F.medium, color: activeColor.ink }}>
                  {preset.label}
                </T>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* 1-Tap Spontaneous Note Sparks */}
        <View style={{ gap: 6 }}>
          <View style={[S.row, { gap: 5 }]}>
            <Sparkles size={12} color={activeColor.muted} />
            <T kind="small" style={{ fontSize: 11, color: activeColor.muted }}>
              Or tap a 1-click spontaneous sticky note:
            </T>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 7 }}
          >
            {QUICK_NOTE_SPARKS.map(spark => (
              <Pressable
                key={spark.text}
                accessibilityRole="button"
                accessibilityLabel={`Send quick note: ${spark.text}`}
                disabled={busy}
                onPress={() => handleOneClickSpark(spark.text, spark.color)}
                style={({ pressed }) => ({
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 10,
                  backgroundColor: '#FFFFFFB0',
                  borderWidth: 1,
                  borderColor: activeColor.border,
                  opacity: pressed ? 0.75 : 1,
                })}
              >
                <T style={{ fontSize: 12, color: activeColor.ink }}>{spark.text}</T>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </Card>

      {/* Sticky Notes & Instant Pics Board */}
      {notes.length === 0 ? (
        <Card style={{ alignItems: 'center', paddingVertical: 24, gap: 8 }}>
          <StickyNote size={24} color={C.muted} strokeWidth={1.4} />
          <T kind="sub">The sticky board is clear</T>
          <T kind="small" style={{ textAlign: 'center', maxWidth: 280 }}>
            Leave a little sticky note or a 1-click Instant Pic for {partnerName} to find when they open the app.
          </T>
        </Card>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 14, paddingVertical: 6, paddingRight: 8 }}
        >
          {notes.map((note, idx) => {
            const palette = quickNoteColorMeta(note.color);
            const author = authorFor(note.authorId);
            const isMine = note.authorId === userId;
            const liked = note.hearts.includes(userId);
            const tilt = idx % 2 === 0 ? '-0.8deg' : '0.8deg';
            const isEditingThis = editingCaptionId === note.id;

            return (
              <View
                key={note.id}
                style={{
                  width: note.image ? 225 : 210,
                  backgroundColor: palette.bg,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: palette.border,
                  padding: 14,
                  paddingTop: 18,
                  justifyContent: 'space-between',
                  gap: 10,
                  transform: [{ rotate: tilt }],
                }}
              >
                {/* Top Washi Tape / Pin Strip */}
                <View
                  style={{
                    position: 'absolute',
                    top: -5,
                    alignSelf: 'center',
                    width: 58,
                    height: 12,
                    borderRadius: 3,
                    backgroundColor: palette.tape,
                    opacity: 0.75,
                  }}
                />

                <View style={{ gap: 10 }}>
                  {/* Header: Author + Pin / Delete */}
                  <View style={S.between}>
                    <View style={[S.row, { gap: 6, flex: 1, minWidth: 0 }]}>
                      <Avatar name={author} size={24} color={palette.tape} />
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <T numberOfLines={1} style={{ fontSize: 12, fontFamily: F.bold, color: palette.ink }}>
                          {author}
                        </T>
                        <T style={{ fontSize: 10, color: palette.muted }}>
                          {note.image ? 'Instant Pic · ' : ''}{relativeTime(note.createdAt)}
                        </T>
                      </View>
                    </View>

                    <View style={[S.row, { gap: 4 }]}>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={note.pinned ? 'Unpin sticky note' : 'Pin sticky note'}
                        onPress={() => {
                          hapticSelection();
                          void run(() => pinQuickNote(note.id));
                        }}
                        style={{
                          padding: 5,
                          borderRadius: 8,
                          backgroundColor: note.pinned ? palette.tape : 'transparent',
                        }}
                      >
                        <Pin size={13} color={palette.ink} />
                      </Pressable>
                      {isMine && (
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel="Remove sticky note"
                          onPress={() => {
                            hapticWarning();
                            void run(() => deleteQuickNote(note.id));
                          }}
                          style={{ padding: 5, borderRadius: 8 }}
                        >
                          <Trash2 size={13} color={palette.muted} />
                        </Pressable>
                      )}
                    </View>
                  </View>

                  {/* Optional Instant Pic Polaroid Frame */}
                  {Boolean(note.image) && (
                    <View
                      style={{
                        backgroundColor: '#FFFDF9',
                        padding: 6,
                        borderRadius: 11,
                        borderWidth: 1,
                        borderColor: palette.border,
                      }}
                    >
                      <Image
                        accessibilityLabel={note.text || `Instant pic from ${author}`}
                        source={{ uri: getCdnImageUri(note.image, 'card', { width: 420, height: 260, quality: 72 }) }}
                        style={{ width: '100%', height: 124, borderRadius: 7 }}
                        resizeMode="cover"
                      />
                    </View>
                  )}

                  {/* Note Text or Optional Caption */}
                  {isEditingThis ? (
                    <View style={{ gap: 6 }}>
                      <TextInput
                        value={captionDraft}
                        onChangeText={setCaptionDraft}
                        placeholder="Write an optional note…"
                        placeholderTextColor={palette.muted}
                        maxLength={160}
                        style={[
                          S.input,
                          {
                            paddingVertical: 6,
                            paddingHorizontal: 9,
                            fontSize: 13,
                            backgroundColor: '#FFFFFFCC',
                            borderColor: palette.border,
                            color: palette.ink,
                          },
                        ]}
                      />
                      <Button
                        compact
                        title="Save"
                        icon={Check}
                        onPress={() => saveCaptionEdit(note.id)}
                      />
                    </View>
                  ) : Boolean(note.text) ? (
                    <Pressable
                      disabled={!isMine}
                      onPress={() => startCaptionEdit(note)}
                    >
                      <T
                        style={{
                          fontFamily: F.serif,
                          fontSize: note.image ? 14 : 16,
                          lineHeight: note.image ? 20 : 23,
                          color: palette.ink,
                        }}
                      >
                        “{note.text}”
                      </T>
                    </Pressable>
                  ) : isMine && note.image ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Add optional caption"
                      onPress={() => startCaptionEdit(note)}
                      style={[S.row, { gap: 4, paddingVertical: 2 }]}
                    >
                      <Plus size={12} color={palette.muted} />
                      <T style={{ fontSize: 11, fontFamily: F.italic, color: palette.muted }}>
                        Add optional note…
                      </T>
                    </Pressable>
                  ) : null}
                </View>

                {/* Footer: Pin badge & Heart reaction */}
                <View style={[S.between, { marginTop: 4 }]}>
                  <T style={{ fontSize: 10, fontFamily: F.medium, color: palette.muted }}>
                    {note.pinned ? '📌 Pinned' : note.image ? '📸 Instant Pic' : '🗒️ Sticky Note'}
                  </T>

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={liked ? 'Unlike sticky note' : 'Heart sticky note'}
                    onPress={() => {
                      hapticHeart();
                      void run(() => heartQuickNote(note.id));
                    }}
                    style={[
                      S.row,
                      {
                        gap: 4,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 12,
                        backgroundColor: liked ? '#FFFFFFC8' : 'transparent',
                      },
                    ]}
                  >
                    <Heart
                      size={13}
                      color={liked ? '#B5483C' : palette.ink}
                      fill={liked ? '#B5483C' : 'transparent'}
                      strokeWidth={1.7}
                    />
                    {note.hearts.length > 0 && (
                      <T style={{ fontSize: 11, fontFamily: F.medium, color: palette.ink }}>
                        {note.hearts.length}
                      </T>
                    )}
                  </Pressable>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
