import React, { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, Share, View, useWindowDimensions } from 'react-native';
import { Redirect, router } from 'expo-router';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Camera,
  Check,
  Clock,
  Copy,
  Heart,
  KeyRound,
  Link2,
  MapPin,
  Plane,
  RefreshCw,
  Share2,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from 'lucide-react-native';
import { Avatar, Brand, Button, C, CoupleAvatars, F, Field, S, T } from '../components/ui';
import {
  AVATAR_PRESETS,
  ONBOARDING_STEPS,
  OUTFIT_SUGGESTIONS,
  createInitialOnboardingDraft,
  dateKey,
  finalizeOnboardingOriginStory,
  generateSixDigitInviteCode,
  isValidConnectionCode,
  normalizeConnectionCode,
  validateOnboardingStep,
  validDate,
  type GenderId,
} from '../domain';
import { useSpace } from '../store';
import { RelationshipClockCard } from '../components/relationship-clock';
import { pickAndPrepareInstantPhoto } from '../components/quick-notes';
import { LegalAgreementPanel } from '../components/legal-agreement';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const NICKNAME_IDEAS = ['Babe', 'Jaan', 'Honey', 'Cutie', 'My Love', 'Sunshine', 'Sweetheart'];
const MEET_IDEAS = [
  'In college',
  'Through mutual friends',
  'At a cozy cafe',
  'At work',
  'Online / social media',
  'At a wedding / party',
];

function daysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export default function Welcome() {
  const { width } = useWindowDimensions();
  const wide = width > 900;
  const compactPhone = width < 440;
  const { space, session, onboarded, completeOnboarding, generateConnectionCode, notify, run, busy } = useSpace();
  const existing = space.originStory;

  const initialDraft = useMemo(
    () =>
      createInitialOnboardingDraft(
        {
          ...existing,
          myName: existing?.myName || space.profiles[0]?.name || '',
          partnerName: existing?.partnerName || space.profiles[1]?.name || '',
          partnerNickname: existing?.partnerNickname || space.profiles[1]?.nickname || '',
        },
        space.mode || 'distance'
      ),
    [existing, space.mode, space.profiles]
  );

  const initialDate = useMemo(() => {
    const parsed = new Date(initialDraft.relationshipStartedAt);
    if (!Number.isNaN(parsed.getTime())) return parsed;
    const fallback = new Date();
    fallback.setMonth(fallback.getMonth() - 6);
    fallback.setHours(20, 30, 0, 0);
    return fallback;
  }, [initialDraft.relationshipStartedAt]);

  const [step, setStep] = useState(1);
  const totalSteps = ONBOARDING_STEPS.length;

  // Step 1: Long distance or Near by
  const [mode, setMode] = useState<'nearby' | 'distance'>(initialDraft.mode);

  // Step 2: Name, Partner Nickname & Girl / Boy
  const [myName, setMyName] = useState(initialDraft.myName);
  const [partnerNickname, setPartnerNickname] = useState(initialDraft.partnerNickname);
  const [partnerName, setPartnerName] = useState(initialDraft.partnerName);
  const [myGender, setMyGender] = useState<GenderId>(initialDraft.myGender);
  const [partnerGender, setPartnerGender] = useState<GenderId>(initialDraft.partnerGender);

  // Step 3: Love Story Questions (1-4)
  const [whenWeMet, setWhenWeMet] = useState(initialDraft.whenWeMet);
  const [partnerOutfit, setPartnerOutfit] = useState(initialDraft.partnerOutfit);
  const [whoProposed, setWhoProposed] = useState(initialDraft.whoProposed);
  const [proposalNote, setProposalNote] = useState(initialDraft.proposalNote);
  const [whenRelationshipStarted, setWhenRelationshipStarted] = useState(initialDraft.whenRelationshipStarted);

  // Step 4: Calendar & Exact Time (Year, Month, Day, Hour, Min, Sec)
  const [relYear, setRelYear] = useState(initialDate.getFullYear());
  const [relMonth, setRelMonth] = useState(initialDate.getMonth());
  const [relDay, setRelDay] = useState(initialDate.getDate());
  const [relHour, setRelHour] = useState(initialDate.getHours());
  const [relMinute, setRelMinute] = useState(initialDate.getMinutes());
  const [relSecond, setRelSecond] = useState(initialDate.getSeconds());
  const [manualDateInput, setManualDateInput] = useState(() => dateKey(initialDate));

  // Step 5: Profile Pics
  const [myAvatar, setMyAvatar] = useState<string | undefined>(initialDraft.myAvatar);
  const [partnerAvatar, setPartnerAvatar] = useState<string | undefined>(initialDraft.partnerAvatar);

  // Step 6: Share Invite Code / Join Partner Code
  const [inviteCode, setInviteCode] = useState(initialDraft.inviteCode);
  const [joinCode, setJoinCode] = useState(initialDraft.joinCode);
  const [joinedSuccess, setJoinedSuccess] = useState(Boolean(initialDraft.joinCode));

  // Step 7: Mandatory Terms of Service & Privacy Policy Agreement
  const [acceptedTerms, setAcceptedTerms] = useState(initialDraft.acceptedTerms);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(initialDraft.acceptedPrivacy);

  const maxDays = daysInMonth(relYear, relMonth);
  const safeDay = Math.min(relDay, maxDays);

  const relationshipStartedAtIso = useMemo(() => {
    const dt = new Date(relYear, relMonth, safeDay, relHour, relMinute, relSecond);
    return dt.toISOString();
  }, [relYear, relMonth, safeDay, relHour, relMinute, relSecond]);

  const formattedCalendarSummary = useMemo(() => {
    const dt = new Date(relYear, relMonth, safeDay, relHour, relMinute, relSecond);
    return dt.toLocaleString(undefined, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }, [relYear, relMonth, safeDay, relHour, relMinute, relSecond]);

  const syncDateParts = (y: number, m: number, d: number) => {
    const clampedD = Math.min(d, daysInMonth(y, m));
    setRelYear(y);
    setRelMonth(m);
    setRelDay(clampedD);
    setManualDateInput(`${y}-${String(m + 1).padStart(2, '0')}-${String(clampedD).padStart(2, '0')}`);
  };

  const handleManualDateChange = (raw: string) => {
    setManualDateInput(raw);
    const trimmed = raw.trim();
    if (validDate(trimmed)) {
      const [y, m, d] = trimmed.split('-').map(Number);
      setRelYear(y);
      setRelMonth(m - 1);
      setRelDay(d);
    }
  };

  const applyQuickStartPreset = (monthsAgo: number) => {
    const target = new Date();
    target.setMonth(target.getMonth() - monthsAgo);
    syncDateParts(target.getFullYear(), target.getMonth(), target.getDate());
  };

  const partnerPronounObj = partnerGender === 'girl' ? 'her' : 'him';
  const partnerPronounSubj = partnerGender === 'girl' ? 'she' : 'he';
  const displayNickname = partnerNickname.trim() || partnerName.trim() || (partnerGender === 'girl' ? 'Her' : 'Him');
  const displayMyName = myName.trim() || 'Me';

  const handleGenderChange = (who: 'me' | 'partner', gender: GenderId) => {
    if (who === 'me') {
      setMyGender(gender);
      const isPreset = !myAvatar || AVATAR_PRESETS.some(p => p.uri === myAvatar);
      if (isPreset) {
        setMyAvatar(AVATAR_PRESETS.find(p => p.gender === gender)?.uri);
      }
    } else {
      setPartnerGender(gender);
      const isPreset = !partnerAvatar || AVATAR_PRESETS.some(p => p.uri === partnerAvatar);
      if (isPreset) {
        setPartnerAvatar(AVATAR_PRESETS.find(p => p.gender === gender)?.uri);
      }
    }
  };

  const pickPhotoFor = async (who: 'me' | 'partner') => {
    const uri = await pickAndPrepareInstantPhoto(false, 'avatar');
    if (!uri) return;
    if (who === 'me') {
      setMyAvatar(uri);
      notify('Your profile photo is ready ♡');
    } else {
      setPartnerAvatar(uri);
      notify(`${displayNickname}’s profile photo is ready ♡`);
    }
  };

  const regenerateUniqueCode = async () => {
    try {
      const fresh = await generateConnectionCode();
      if (fresh && fresh !== inviteCode) {
        setInviteCode(fresh);
        notify(`Generated new unique 6-digit code: ${fresh}`);
        return;
      }
    } catch {
      // Fallback to local 6-digit generator if not connected to cloud yet
    }
    const localFresh = generateSixDigitInviteCode(`${displayMyName}-${displayNickname}-${Date.now()}`, [inviteCode]);
    setInviteCode(localFresh);
    notify(`Generated new unique 6-digit code: ${localFresh}`);
  };

  const copyInviteCode = async () => {
    if (!session) { notify('Sign in from Connect our phones to generate a live invitation.'); return; }
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(inviteCode);
      }
      notify(`Invite code ${inviteCode} copied! Share it with ${displayNickname} ♡`);
    } catch {
      notify(`Your code: ${inviteCode}`);
    }
  };

  const shareInviteCode = async () => {
    if (!session) { notify('Sign in from Connect our phones to generate a live invitation.'); return; }
    try {
      await Share.share({
        message: `Hey ${displayNickname}! I set up our private space on Closer. Join me with our unique 6-digit couple code: ${inviteCode}`,
      });
    } catch {
      await copyInviteCode();
    }
  };

  const currentDraft = {
    mode,
    myName: displayMyName,
    partnerName: partnerName.trim() || displayNickname,
    partnerNickname: displayNickname,
    myGender,
    partnerGender,
    whenWeMet,
    partnerOutfit,
    whoProposed,
    proposalNote,
    whenRelationshipStarted: whenRelationshipStarted.trim() || formattedCalendarSummary,
    relationshipStartedAt: relationshipStartedAtIso,
    myAvatar,
    partnerAvatar,
    inviteCode,
    joinCode: joinCode.trim(),
    acceptedTerms,
    acceptedPrivacy,
  };

  const proceedFromCodeStep = async () => {
    const check = validateOnboardingStep(6, currentDraft);
    if (!check.valid) {
      throw new Error(check.error);
    }
    setStep(7);
  };

  const finishOnboarding = async (overrideJoinedCode?: string) => {
    const finalized = finalizeOnboardingOriginStory({
      ...currentDraft,
      joinCode: (overrideJoinedCode ?? joinCode).trim(),
    });
    await completeOnboarding(mode, finalized);
    router.replace('/');
  };

  if (onboarded) {
    return <Redirect href="/" />;
  }

  const currentYear = new Date().getFullYear();
  const yearChoices = Array.from({ length: 12 }, (_, i) => currentYear - i);
  const activeStepMeta = ONBOARDING_STEPS[step - 1] ?? ONBOARDING_STEPS[0];
  const bothLegalAccepted = acceptedTerms && acceptedPrivacy;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          padding: wide ? 44 : 18,
          maxWidth: 1180,
          alignSelf: 'center',
          width: '100%',
          justifyContent: 'center',
        }}
      >
        {/* Top Header & Step Progress Indicator */}
        <View style={{ gap: 14 }}>
          <View style={S.between}>
            <Brand />
            <View style={[S.row, { gap: 6 }]}>
              {ONBOARDING_STEPS.map(sMeta => {
                const active = sMeta.step === step;
                const done = sMeta.step < step;
                return (
                  <Pressable
                    key={sMeta.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Go to step ${sMeta.step}: ${sMeta.shortLabel}`}
                    onPress={() => setStep(sMeta.step)}
                    style={{
                      width: active ? 24 : 9,
                      height: 9,
                      borderRadius: 5,
                      backgroundColor: active ? C.green : done ? '#C68B82' : C.line,
                    }}
                  />
                );
              })}
            </View>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {ONBOARDING_STEPS.map(sMeta => {
              const active = sMeta.step === step;
              const done = sMeta.step < step;
              return (
                <Pressable
                  key={`pill-${sMeta.id}`}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: active }}
                  onPress={() => setStep(sMeta.step)}
                  style={{
                    paddingHorizontal: 9,
                    paddingVertical: 5,
                    borderRadius: 10,
                    backgroundColor: active ? C.pale : done ? '#F5DFDA' : C.paper,
                    borderWidth: 1,
                    borderColor: active ? C.green : C.line,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <T
                    kind="small"
                    style={{
                      fontSize: 11,
                      fontFamily: active ? F.bold : F.medium,
                      color: active ? C.green : C.ink,
                    }}
                  >
                    {sMeta.step}. {sMeta.shortLabel}
                  </T>
                  {done && <Check size={11} color={C.green} />}
                </Pressable>
              );
            })}
          </View>
        </View>

        <View
          style={{
            flexDirection: wide ? 'row' : 'column',
            gap: wide ? 56 : 24,
            alignItems: wide ? 'center' : 'stretch',
            marginTop: wide ? 32 : 18,
          }}
        >
          {/* Left column: context & live preview */}
          <View style={{ flex: 1, gap: 18 }}>
            <T kind="label" style={{ color: C.green }}>
              STEP {step} OF {totalSteps} · INITIAL RELATIONSHIP SETUP
            </T>
            <T kind="title" style={{ fontSize: wide ? 46 : 32, lineHeight: wide ? 56 : 40 }}>
              {step === 1 && activeStepMeta.title}
              {step === 2 && activeStepMeta.title}
              {step === 3 && `How you & ${displayNickname} began.`}
              {step === 4 && activeStepMeta.title}
              {step === 5 && activeStepMeta.title}
              {step === 6 && `Invite ${displayNickname} with your code.`}
              {step === 7 && activeStepMeta.title}
            </T>
            <T style={{ color: C.muted, maxWidth: 440, fontSize: 15, lineHeight: 24 }}>
              {step === 1 && activeStepMeta.subtitle}
              {step === 2 && activeStepMeta.subtitle}
              {step === 3 &&
                `Answer a few sweet questions about when you met ${partnerPronounObj}, what ${partnerPronounSubj} wore, who proposed, and when you got together.`}
              {step === 4 && activeStepMeta.subtitle}
              {step === 5 && activeStepMeta.subtitle}
              {step === 6 && activeStepMeta.subtitle}
              {step === 7 && activeStepMeta.subtitle}
            </T>

            {step >= 4 ? (
              <RelationshipClockCard
                startedAt={relationshipStartedAtIso}
                mode={mode}
                myName={displayMyName}
                partnerName={partnerName || displayNickname}
                partnerNickname={displayNickname}
                myAvatar={myAvatar}
                partnerAvatar={partnerAvatar}
                compact
              />
            ) : wide ? (
              <View
                style={{
                  backgroundColor: C.pale,
                  borderRadius: 28,
                  padding: 22,
                  alignItems: 'center',
                  justifyContent: 'center',
                  maxWidth: 360,
                  gap: 12,
                }}
              >
                <CoupleAvatars
                  names={[displayMyName, displayNickname]}
                  avatars={[myAvatar, partnerAvatar]}
                  size={64}
                />
                <T style={{ fontFamily: F.serif, fontSize: 20, color: C.ink }}>
                  {displayMyName} & {displayNickname}
                </T>
                <T kind="small" style={{ textAlign: 'center' }}>
                  {mode === 'distance' ? 'Long distance · One shared space' : 'Near by · Everyday moments together'}
                </T>
              </View>
            ) : null}
          </View>

          {/* Right column: interactive step card */}
          <View
            style={[
              S.card,
              {
                flex: 1.15,
                width: '100%',
                maxWidth: 560,
                padding: wide ? 30 : 20,
                gap: 20,
              },
            ]}
          >
            {/* STEP 1: LONG DISTANCE OR NEAR BY */}
            {step === 1 && (
              <View style={{ gap: 18 }}>
                <View style={{ gap: 6 }}>
                  <T kind="serif">Are you Long distance or Near by?</T>
                  <T kind="small">You can switch this anytime as life changes.</T>
                </View>

                <View style={{ gap: 12 }}>
                  {(
                    [
                      {
                        id: 'distance' as const,
                        icon: Plane,
                        title: 'Long distance',
                        desc: 'Miles apart, counting down the days and staying close across the distance.',
                      },
                      {
                        id: 'nearby' as const,
                        icon: MapPin,
                        title: 'Near by',
                        desc: 'Same city, same neighborhood, or same couch—sharing everyday life.',
                      },
                    ]
                  ).map(({ id, icon: Icon, title, desc }) => (
                    <Pressable
                      key={id}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: mode === id }}
                      onPress={() => setMode(id)}
                      style={{
                        borderRadius: 16,
                        borderWidth: 1.5,
                        borderColor: mode === id ? C.green : C.line,
                        backgroundColor: mode === id ? C.pale : C.paper,
                        padding: 16,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 14,
                      }}
                    >
                      <Icon size={26} color={C.green} strokeWidth={1.5} />
                      <View style={{ flex: 1, gap: 3 }}>
                        <T style={{ fontFamily: F.bold, fontSize: 16 }}>{title}</T>
                        <T kind="small">{desc}</T>
                      </View>
                      {mode === id && <Check size={18} color={C.green} />}
                    </Pressable>
                  ))}
                </View>

                <Button
                  title="Next: Names & Nickname"
                  icon={ArrowRight}
                  onPress={() => setStep(2)}
                />

                <Pressable
                  accessibilityRole="button"
                  onPress={() => setStep(6)}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                    borderRadius: 12,
                    backgroundColor: C.bg,
                    borderWidth: 1,
                    borderColor: C.line,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  <KeyRound size={14} color={C.green} />
                  <T kind="small" style={{ color: C.green, fontFamily: F.medium }}>
                    Already have a partner’s code? Redeem code to link
                  </T>
                </Pressable>
              </View>
            )}

            {/* STEP 2: NAME, PARTNER NICKNAME & GIRL OR BOY */}
            {step === 2 && (
              <View style={{ gap: 18 }}>
                <View style={{ gap: 6 }}>
                  <T kind="serif">Who are the two of you?</T>
                  <T kind="small">Add your name, what you love calling your partner, and Girl or Boy.</T>
                </View>

                <Field
                  label="Your name"
                  placeholder="Enter your name"
                  value={myName}
                  onChangeText={setMyName}
                  maxLength={30}
                />

                <View style={{ gap: 8 }}>
                  <Field
                    label="What do you call your partner? (Nickname)"
                    placeholder="e.g., Babe, Jaan, Honey, Cutie…"
                    value={partnerNickname}
                    onChangeText={setPartnerNickname}
                    maxLength={30}
                  />
                  <View style={[S.wrap, { gap: 6 }]}>
                    {NICKNAME_IDEAS.map(nick => (
                      <Pressable
                        key={nick}
                        accessibilityRole="button"
                        onPress={() => setPartnerNickname(nick)}
                        style={{
                          paddingHorizontal: 11,
                          paddingVertical: 6,
                          borderRadius: 10,
                          backgroundColor: partnerNickname === nick ? C.green : C.bg,
                          borderWidth: 1,
                          borderColor: partnerNickname === nick ? C.green : C.line,
                        }}
                      >
                        <T
                          kind="small"
                          style={{
                            fontSize: 11,
                            color: partnerNickname === nick ? '#fff' : C.ink,
                            fontFamily: F.medium,
                          }}
                        >
                          {nick}
                        </T>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <Field
                  label="Partner’s real name (optional)"
                  placeholder="Their first name"
                  value={partnerName}
                  onChangeText={setPartnerName}
                  maxLength={30}
                />

                <View style={{ gap: 12 }}>
                  <View style={{ gap: 8 }}>
                    <T kind="small" style={{ fontFamily: F.medium, color: C.ink }}>
                      I am a…
                    </T>
                    <View style={S.row}>
                      {(
                        [
                          { id: 'girl' as const, label: 'Girl 👩' },
                          { id: 'boy' as const, label: 'Boy 👨' },
                        ]
                      ).map(opt => (
                        <Pressable
                          key={opt.id}
                          accessibilityRole="radio"
                          accessibilityState={{ checked: myGender === opt.id }}
                          onPress={() => handleGenderChange('me', opt.id)}
                          style={{
                            flex: 1,
                            paddingVertical: 13,
                            paddingHorizontal: 12,
                            borderRadius: 14,
                            borderWidth: 1.5,
                            borderColor: myGender === opt.id ? C.green : C.line,
                            backgroundColor: myGender === opt.id ? C.pale : C.bg,
                            alignItems: 'center',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            gap: 8,
                          }}
                        >
                          <T style={{ fontFamily: F.bold, color: myGender === opt.id ? C.green : C.ink }}>
                            {opt.label}
                          </T>
                          {myGender === opt.id && <Check size={15} color={C.green} />}
                        </Pressable>
                      ))}
                    </View>
                  </View>

                  <View style={{ gap: 8 }}>
                    <T kind="small" style={{ fontFamily: F.medium, color: C.ink }}>
                      {displayNickname} is a…
                    </T>
                    <View style={S.row}>
                      {(
                        [
                          { id: 'girl' as const, label: 'Girl 👩' },
                          { id: 'boy' as const, label: 'Boy 👨' },
                        ]
                      ).map(opt => (
                        <Pressable
                          key={opt.id}
                          accessibilityRole="radio"
                          accessibilityState={{ checked: partnerGender === opt.id }}
                          onPress={() => handleGenderChange('partner', opt.id)}
                          style={{
                            flex: 1,
                            paddingVertical: 13,
                            paddingHorizontal: 12,
                            borderRadius: 14,
                            borderWidth: 1.5,
                            borderColor: partnerGender === opt.id ? C.green : C.line,
                            backgroundColor: partnerGender === opt.id ? C.pale : C.bg,
                            alignItems: 'center',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            gap: 8,
                          }}
                        >
                          <T style={{ fontFamily: F.bold, color: partnerGender === opt.id ? C.green : C.ink }}>
                            {opt.label}
                          </T>
                          {partnerGender === opt.id && <Check size={15} color={C.green} />}
                        </Pressable>
                      ))}
                    </View>
                  </View>
                </View>

                <View style={S.row}>
                  <Button title="Back" secondary icon={ArrowLeft} onPress={() => setStep(1)} style={{ flex: 0.45 }} />
                  <Button
                    title="Next: Our Questions"
                    icon={ArrowRight}
                    onPress={() => setStep(3)}
                    style={{ flex: 1 }}
                  />
                </View>
              </View>
            )}

            {/* STEP 3: THE 4 LOVE STORY QUESTIONS */}
            {step === 3 && (
              <View style={{ gap: 16 }}>
                <View style={{ gap: 4 }}>
                  <T kind="serif">Your first memories together</T>
                  <T kind="small">
                    Tell the story of how you and {displayNickname} started.
                  </T>
                </View>

                {/* Question 1 */}
                <View style={{ gap: 8 }}>
                  <Field
                    label={`1. When did you first meet ${partnerPronounObj}?`}
                    placeholder="e.g., March 2024 at a friend’s party, or rainy Tuesday…"
                    value={whenWeMet}
                    onChangeText={setWhenWeMet}
                    maxLength={120}
                  />
                  <View style={[S.wrap, { gap: 6 }]}>
                    {MEET_IDEAS.map(idea => (
                      <Pressable
                        key={idea}
                        accessibilityRole="button"
                        onPress={() => setWhenWeMet(idea)}
                        style={{
                          paddingHorizontal: 10,
                          paddingVertical: 5,
                          borderRadius: 9,
                          backgroundColor: whenWeMet === idea ? C.green : C.bg,
                          borderWidth: 1,
                          borderColor: whenWeMet === idea ? C.green : C.line,
                        }}
                      >
                        <T
                          kind="small"
                          style={{
                            fontSize: 11,
                            color: whenWeMet === idea ? '#fff' : C.ink,
                          }}
                        >
                          {idea}
                        </T>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Question 2 */}
                <View style={{ gap: 8 }}>
                  <Field
                    label={`2. Which kind of dress / outfit was ${partnerPronounSubj} in?`}
                    placeholder={
                      partnerGender === 'girl'
                        ? 'e.g., Yellow floral dress, black kurti, denim jacket…'
                        : 'e.g., White button-down shirt, black hoodie & jeans…'
                    }
                    value={partnerOutfit}
                    onChangeText={setPartnerOutfit}
                    maxLength={120}
                  />
                  <View style={[S.wrap, { gap: 6 }]}>
                    {OUTFIT_SUGGESTIONS[partnerGender].map(outfit => (
                      <Pressable
                        key={outfit}
                        accessibilityRole="button"
                        onPress={() => setPartnerOutfit(outfit)}
                        style={{
                          paddingHorizontal: 10,
                          paddingVertical: 5,
                          borderRadius: 9,
                          backgroundColor: partnerOutfit === outfit ? C.green : C.bg,
                          borderWidth: 1,
                          borderColor: partnerOutfit === outfit ? C.green : C.line,
                        }}
                      >
                        <T
                          kind="small"
                          style={{
                            fontSize: 11,
                            color: partnerOutfit === outfit ? '#fff' : C.ink,
                          }}
                        >
                          {outfit}
                        </T>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Question 3 */}
                <View style={{ gap: 8 }}>
                  <T kind="small" style={{ fontFamily: F.medium, color: C.ink }}>
                    3. Who proposed first?
                  </T>
                  <View style={S.wrap}>
                    {[
                      `I (${displayMyName}) proposed`,
                      `${displayNickname} proposed`,
                      'Both of us together ♡',
                    ].map(choice => (
                      <Pressable
                        key={choice}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: whoProposed === choice }}
                        onPress={() => setWhoProposed(choice)}
                        style={{
                          paddingHorizontal: 13,
                          paddingVertical: 10,
                          borderRadius: 12,
                          borderWidth: 1.5,
                          borderColor: whoProposed === choice ? C.green : C.line,
                          backgroundColor: whoProposed === choice ? C.pale : C.bg,
                        }}
                      >
                        <T
                          style={{
                            fontSize: 13,
                            fontFamily: F.medium,
                            color: whoProposed === choice ? C.green : C.ink,
                          }}
                        >
                          {choice}
                        </T>
                      </Pressable>
                    ))}
                  </View>
                  <Field
                    label="How did the proposal happen? (optional)"
                    placeholder="Under the streetlights, over a late-night call, with flowers…"
                    value={proposalNote}
                    onChangeText={setProposalNote}
                    maxLength={140}
                  />
                </View>

                {/* Question 4 */}
                <Field
                  label="4. When did you get into a relationship?"
                  placeholder="e.g., Our magical night on 14 Feb, or set exact date & time next…"
                  value={whenRelationshipStarted}
                  onChangeText={setWhenRelationshipStarted}
                  maxLength={120}
                />

                <View style={S.row}>
                  <Button title="Back" secondary icon={ArrowLeft} onPress={() => setStep(2)} style={{ flex: 0.45 }} />
                  <Button
                    title="Next: Start Date & Clock"
                    icon={CalendarDays}
                    onPress={() => setStep(4)}
                    style={{ flex: 1 }}
                  />
                </View>
              </View>
            )}

            {/* STEP 4: RELATIONSHIP CALENDAR (YEAR, MONTH, DAY, HOUR, MIN, SEC) */}
            {step === 4 && (
              <View style={{ gap: 16 }}>
                <View style={{ gap: 4 }}>
                  <T kind="serif">When did your relationship start?</T>
                  <T kind="small">
                    Select the year, month, day, hour, minute, and second for your live relationship clock.
                  </T>
                </View>

                {/* Direct YYYY-MM-DD input + Quick Presets */}
                <View style={{ gap: 8 }}>
                  <Field
                    label="Start Date · YYYY-MM-DD"
                    placeholder="YYYY-MM-DD"
                    value={manualDateInput}
                    onChangeText={handleManualDateChange}
                    maxLength={10}
                    keyboardType="numbers-and-punctuation"
                  />
                  <View style={[S.wrap, { gap: 6 }]}>
                    {[
                      { label: 'Today', months: 0 },
                      { label: '1 month ago', months: 1 },
                      { label: '6 months ago', months: 6 },
                      { label: '1 year ago', months: 12 },
                      { label: '2 years ago', months: 24 },
                    ].map(preset => (
                      <Pressable
                        key={preset.label}
                        accessibilityRole="button"
                        onPress={() => applyQuickStartPreset(preset.months)}
                        style={{
                          paddingHorizontal: 10,
                          paddingVertical: 5,
                          borderRadius: 9,
                          backgroundColor: C.bg,
                          borderWidth: 1,
                          borderColor: C.line,
                        }}
                      >
                        <T kind="small" style={{ fontSize: 11, fontFamily: F.medium, color: C.ink }}>
                          {preset.label}
                        </T>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Year selector */}
                <View style={{ gap: 8 }}>
                  <View style={S.between}>
                    <T kind="small" style={{ fontFamily: F.medium, color: C.ink }}>
                      Year
                    </T>
                    <View style={[S.row, { gap: 8 }]}>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Previous year"
                        onPress={() => syncDateParts(Math.max(1980, relYear - 1), relMonth, safeDay)}
                        style={{
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: 8,
                          backgroundColor: C.bg,
                          borderWidth: 1,
                          borderColor: C.line,
                        }}
                      >
                        <T style={{ fontFamily: F.bold }}>−</T>
                      </Pressable>
                      <T style={{ fontFamily: F.serif, fontSize: 18, color: C.green }}>{relYear}</T>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Next year"
                        onPress={() => syncDateParts(Math.min(currentYear, relYear + 1), relMonth, safeDay)}
                        style={{
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: 8,
                          backgroundColor: C.bg,
                          borderWidth: 1,
                          borderColor: C.line,
                        }}
                      >
                        <T style={{ fontFamily: F.bold }}>+</T>
                      </Pressable>
                    </View>
                  </View>
                  <View style={[S.wrap, { gap: 6 }]}>
                    {yearChoices.map(yr => (
                      <Pressable
                        key={yr}
                        accessibilityRole="button"
                        onPress={() => syncDateParts(yr, relMonth, safeDay)}
                        style={{
                          paddingHorizontal: 11,
                          paddingVertical: 6,
                          borderRadius: 10,
                          backgroundColor: relYear === yr ? C.green : C.bg,
                          borderWidth: 1,
                          borderColor: relYear === yr ? C.green : C.line,
                        }}
                      >
                        <T
                          kind="small"
                          style={{
                            fontSize: 12,
                            fontFamily: F.medium,
                            color: relYear === yr ? '#fff' : C.ink,
                          }}
                        >
                          {yr}
                        </T>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Month selector */}
                <View style={{ gap: 8 }}>
                  <T kind="small" style={{ fontFamily: F.medium, color: C.ink }}>
                    Month
                  </T>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                    {MONTHS.map((mLabel, idx) => (
                      <Pressable
                        key={mLabel}
                        accessibilityRole="button"
                        onPress={() => syncDateParts(relYear, idx, safeDay)}
                        style={{
                          width: '22%',
                          flexGrow: 1,
                          paddingVertical: 8,
                          borderRadius: 10,
                          backgroundColor: relMonth === idx ? C.green : C.bg,
                          borderWidth: 1,
                          borderColor: relMonth === idx ? C.green : C.line,
                          alignItems: 'center',
                        }}
                      >
                        <T
                          kind="small"
                          style={{
                            fontFamily: F.medium,
                            color: relMonth === idx ? '#fff' : C.ink,
                          }}
                        >
                          {mLabel}
                        </T>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Day calendar grid */}
                <View style={{ gap: 8 }}>
                  <T kind="small" style={{ fontFamily: F.medium, color: C.ink }}>
                    Date ({MONTHS[relMonth]} {safeDay}, {relYear})
                  </T>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
                    {Array.from({ length: maxDays }, (_, i) => i + 1).map(d => (
                      <Pressable
                        key={d}
                        accessibilityRole="button"
                        onPress={() => syncDateParts(relYear, relMonth, d)}
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 10,
                          backgroundColor: safeDay === d ? C.green : C.bg,
                          borderWidth: 1,
                          borderColor: safeDay === d ? C.green : C.line,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <T
                          kind="small"
                          style={{
                            fontSize: 12,
                            fontFamily: safeDay === d ? F.bold : F.body,
                            color: safeDay === d ? '#fff' : C.ink,
                          }}
                        >
                          {d}
                        </T>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Exact Time (Hours, Minutes, Seconds) */}
                <View
                  style={{
                    backgroundColor: C.bg,
                    borderRadius: 14,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: C.line,
                    gap: 10,
                  }}
                >
                  <View style={[S.row, { gap: 6 }]}>
                    <Clock size={15} color={C.green} />
                    <T kind="small" style={{ fontFamily: F.medium, color: C.ink }}>
                      Exact Time (Hour : Min : Sec)
                    </T>
                  </View>
                  <View style={{ flexDirection: compactPhone ? 'column' : 'row', gap: 8 }}>
                    {[
                      {
                        label: 'Hour (0-23)',
                        value: relHour,
                        dec: () => setRelHour(h => (h + 23) % 24),
                        inc: () => setRelHour(h => (h + 1) % 24),
                      },
                      {
                        label: 'Min (0-59)',
                        value: relMinute,
                        dec: () => setRelMinute(m => (m + 59) % 60),
                        inc: () => setRelMinute(m => (m + 1) % 60),
                      },
                      {
                        label: 'Sec (0-59)',
                        value: relSecond,
                        dec: () => setRelSecond(s => (s + 59) % 60),
                        inc: () => setRelSecond(s => (s + 1) % 60),
                      },
                    ].map(ctrl => (
                      <View
                        key={ctrl.label}
                        style={{
                          flex: 1,
                          backgroundColor: C.paper,
                          borderRadius: 12,
                          paddingHorizontal: 10,
                          paddingVertical: 8,
                          borderWidth: 1,
                          borderColor: C.line,
                          flexDirection: compactPhone ? 'row' : 'column',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 6,
                        }}
                      >
                        <T kind="small" style={{ fontSize: 11 }}>
                          {ctrl.label}
                        </T>
                        <View style={[S.row, { gap: 8 }]}>
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`Decrease ${ctrl.label}`}
                            onPress={ctrl.dec}
                            style={{
                              width: 26,
                              height: 26,
                              borderRadius: 8,
                              backgroundColor: C.bg,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <T style={{ fontFamily: F.bold }}>−</T>
                          </Pressable>
                          <T style={{ fontFamily: F.serif, fontSize: 18, minWidth: 26, textAlign: 'center' }}>
                            {String(ctrl.value).padStart(2, '0')}
                          </T>
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`Increase ${ctrl.label}`}
                            onPress={ctrl.inc}
                            style={{
                              width: 26,
                              height: 26,
                              borderRadius: 8,
                              backgroundColor: C.bg,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <T style={{ fontFamily: F.bold }}>+</T>
                          </Pressable>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={S.row}>
                  <Button title="Back" secondary icon={ArrowLeft} onPress={() => setStep(3)} style={{ flex: 0.45 }} />
                  <Button
                    title="Next: Profile Photos"
                    icon={Camera}
                    onPress={() => setStep(5)}
                    style={{ flex: 1 }}
                  />
                </View>
              </View>
            )}

            {/* STEP 5: PROFILE PICS FOR YOU & YOUR PARTNER */}
            {step === 5 && (
              <View style={{ gap: 18 }}>
                <View style={{ gap: 4 }}>
                  <T kind="serif">Choose your profile pictures</T>
                  <T kind="small">
                    Upload a photo from your camera/gallery or pick a portrait for {displayMyName} and {displayNickname}.
                  </T>
                </View>

                <View style={{ flexDirection: width > 520 ? 'row' : 'column', gap: 14 }}>
                  {/* My Profile Pic */}
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: C.bg,
                      borderRadius: 16,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: C.line,
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <Avatar name={displayMyName} uri={myAvatar} size={82} />
                    <View style={{ alignItems: 'center', gap: 2 }}>
                      <T style={{ fontFamily: F.bold }}>{displayMyName}</T>
                      <T kind="small">{myGender === 'girl' ? 'Girl' : 'Boy'} · You</T>
                    </View>
                    <Button
                      compact
                      title="Upload my photo"
                      icon={Camera}
                      onPress={() => void pickPhotoFor('me')}
                      style={{ width: '100%' }}
                    />
                    <View style={[S.row, { gap: 8 }]}>
                      {AVATAR_PRESETS.map(p => (
                        <Pressable
                          key={`me-${p.id}`}
                          accessibilityRole="button"
                          accessibilityLabel={`Select ${p.label} avatar for yourself`}
                          onPress={() => setMyAvatar(p.uri)}
                          style={{
                            borderRadius: 20,
                            borderWidth: 2,
                            borderColor: myAvatar === p.uri ? C.green : 'transparent',
                            padding: 2,
                          }}
                        >
                          <Avatar name={displayMyName} uri={p.uri} size={32} />
                        </Pressable>
                      ))}
                    </View>
                  </View>

                  {/* Partner Profile Pic */}
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: C.bg,
                      borderRadius: 16,
                      padding: 16,
                      borderWidth: 1,
                      borderColor: C.line,
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <Avatar name={displayNickname} uri={partnerAvatar} size={82} />
                    <View style={{ alignItems: 'center', gap: 2 }}>
                      <T style={{ fontFamily: F.bold }}>{displayNickname}</T>
                      <T kind="small">{partnerGender === 'girl' ? 'Girl' : 'Boy'} · Your partner</T>
                    </View>
                    <Button
                      compact
                      secondary
                      title={`Upload ${partnerPronounObj} photo`}
                      icon={Camera}
                      onPress={() => void pickPhotoFor('partner')}
                      style={{ width: '100%' }}
                    />
                    <View style={[S.row, { gap: 8 }]}>
                      {AVATAR_PRESETS.map(p => (
                        <Pressable
                          key={`partner-${p.id}`}
                          accessibilityRole="button"
                          accessibilityLabel={`Select ${p.label} avatar for partner`}
                          onPress={() => setPartnerAvatar(p.uri)}
                          style={{
                            borderRadius: 20,
                            borderWidth: 2,
                            borderColor: partnerAvatar === p.uri ? C.green : 'transparent',
                            padding: 2,
                          }}
                        >
                          <Avatar name={displayNickname} uri={p.uri} size={32} />
                        </Pressable>
                      ))}
                    </View>
                  </View>
                </View>

                <View style={S.row}>
                  <Button title="Back" secondary icon={ArrowLeft} onPress={() => setStep(4)} style={{ flex: 0.45 }} />
                  <Button
                    title="Next: Connection Code"
                    icon={Link2}
                    onPress={() => setStep(6)}
                    style={{ flex: 1 }}
                  />
                </View>
              </View>
            )}

            {/* STEP 6: INVITE CODE TO SHARE WITH PARTNER OR JOIN */}
            {step === 6 && (
              <View style={{ gap: 18 }}>
                <View style={{ gap: 4 }}>
                  <T kind="serif">Connect with {displayNickname}</T>
                  <T kind="small">
                    This setup code is a preview. After setup, sign in from Connect our phones to create or verify a live invitation for {displayNickname}.
                  </T>
                </View>

                <View
                  style={{
                    backgroundColor: C.pale,
                    borderRadius: 18,
                    padding: 18,
                    borderWidth: 1.5,
                    borderColor: C.green,
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <CoupleAvatars
                    names={[displayMyName, displayNickname]}
                    avatars={[myAvatar, partnerAvatar]}
                    size={56}
                  />
                  <View style={[S.wrap, { justifyContent: 'center', alignItems: 'center', gap: 8 }]}>
                    <T kind="label" style={{ color: C.green }}>
                      YOUR UNIQUE 6-DIGIT CODE
                    </T>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Generate a new unique connection code"
                      onPress={() => {
                        void regenerateUniqueCode();
                      }}
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
                      <RefreshCw size={11} color={C.green} />
                      <T kind="small" style={{ fontSize: 10, color: C.green, fontFamily: F.medium }}>
                        New code
                      </T>
                    </Pressable>
                  </View>
                  <T
                    selectable
                    style={{
                      fontFamily: F.serif,
                      fontSize: 30,
                      letterSpacing: 4,
                      color: C.ink,
                    }}
                  >
                    {inviteCode}
                  </T>
                  <View style={[S.row, { width: '100%' }]}>
                    <Button
                      compact
                      secondary
                      title="Copy code"
                      icon={Copy}
                      onPress={() => void copyInviteCode()}
                      style={{ flex: 1 }}
                    />
                    <Button
                      compact
                      title={`Share with ${displayNickname}`}
                      icon={Share2}
                      onPress={() => void shareInviteCode()}
                      style={{ flex: 1.2 }}
                    />
                  </View>
                </View>

                {/* Configuration Summary Snapshot */}
                <View
                  style={{
                    backgroundColor: C.bg,
                    borderRadius: 14,
                    padding: 14,
                    borderWidth: 1,
                    borderColor: C.line,
                    gap: 6,
                  }}
                >
                  <View style={[S.row, { gap: 6 }]}>
                    <Heart size={14} color={C.green} />
                    <T kind="small" style={{ fontFamily: F.bold, color: C.ink }}>
                      Relationship Configuration Summary
                    </T>
                  </View>
                  <T kind="small">
                    • Mode: {mode === 'distance' ? 'Long distance' : 'Near by'}
                  </T>
                  <T kind="small">
                    • Partners: {displayMyName} ({myGender === 'girl' ? 'Girl' : 'Boy'}) & {displayNickname} ({partnerGender === 'girl' ? 'Girl' : 'Boy'})
                  </T>
                  <T kind="small">
                    • Together since: {formattedCalendarSummary}
                  </T>
                </View>

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
                  <T kind="small" style={{ fontFamily: F.medium, color: C.ink }}>
                    Already received {displayNickname}’s connection code? Redeem it once to link accounts:
                  </T>
                  <Field
                    label="Partner’s 6-digit connection code"
                    placeholder="e.g., 482917"
                    value={joinCode}
                    onChangeText={t => {
                      setJoinCode(t.toUpperCase());
                      setJoinedSuccess(false);
                    }}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    maxLength={18}
                  />
                  {joinCode.trim().length > 0 && (
                    <Button
                      compact
                      secondary={!joinedSuccess}
                      title={
                        joinedSuccess
                          ? `Linked with ${normalizeConnectionCode(joinCode)} ✓`
                          : isValidConnectionCode(joinCode)
                            ? `Redeem ${normalizeConnectionCode(joinCode)} & Continue`
                            : 'Enter a valid 6-digit partner code'
                      }
                      disabled={!isValidConnectionCode(joinCode)}
                      icon={UserCheck}
                      onPress={() => {
                        const normalized = normalizeConnectionCode(joinCode);
                        setJoinCode(normalized);
                        setJoinedSuccess(false);
                        notify('Code saved for later. Sign in from Connect our phones to verify it.');
                        setStep(7);
                      }}
                    />
                  )}
                </View>

                <View style={S.row}>
                  <Button title="Back" secondary icon={ArrowLeft} onPress={() => setStep(5)} style={{ flex: 0.4 }} />
                  <Button
                    title="Next: Terms & Privacy"
                    icon={ShieldCheck}
                    onPress={() => {
                      void run(proceedFromCodeStep);
                    }}
                    style={{ flex: 1 }}
                  />
                </View>
              </View>
            )}

            {/* STEP 7: MANDATORY TERMS OF SERVICE & PRIVACY POLICY AGREEMENT */}
            {step === 7 && (
              <View style={{ gap: 18 }}>
                <View style={{ gap: 4 }}>
                  <T kind="serif">Terms of Service & Privacy Policy</T>
                  <T kind="small">
                    Before entering your main dashboard with {displayNickname}, please review and accept our Terms of Service and Privacy Policy.
                  </T>
                </View>

                <LegalAgreementPanel
                  acceptedTerms={acceptedTerms}
                  acceptedPrivacy={acceptedPrivacy}
                  onToggleTerms={setAcceptedTerms}
                  onTogglePrivacy={setAcceptedPrivacy}
                  partnerName={displayNickname}
                  compact
                />

                <View style={S.row}>
                  <Button title="Back" secondary icon={ArrowLeft} onPress={() => setStep(6)} style={{ flex: 0.38 }} />
                  <Button
                    title="Accept & Enter Main Dashboard ♡"
                    icon={Sparkles}
                    loading={busy}
                    disabled={!bothLegalAccepted}
                    onPress={() => {
                      void run(() => finishOnboarding(joinCode));
                    }}
                    style={{ flex: 1 }}
                  />
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
