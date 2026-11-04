import React, { useState } from 'react';
import { Platform, Pressable, Share, View } from 'react-native';
import { router } from 'expo-router';
import { Check, Copy, FileText, Heart, KeyRound, Link2, Lock, Mail, Share2, Sparkles, UserCheck } from 'lucide-react-native';
import { Button, C, Card, Chip, CoupleAvatars, F, Field, FormPage, S, T } from '../components/ui';
import { usePeople, useSpace } from '../store';
import { client, generateSupabaseInvitationCode, supabase } from '../lib/supabase';
import {
  cleanText,
  generateUniqueConnectionCode,
  isValidConnectionCode,
  normalizeConnectionCode,
  validateLegalAgreement,
} from '../domain';
import { LegalAgreementPanel, LegalDocumentModal } from '../components/legal-agreement';

export default function Connect() {
  const {
    session,
    space,
    run,
    busy,
    refresh,
    notify,
    generateConnectionCode,
    redeemConnectionCode,
  } = useSpace();
  const { me, partner } = usePeople();

  const origin = space.originStory;
  const isAlreadyLinked = Boolean(origin?.isLinked);
  const partnerDisplay =
    partner?.nickname || origin?.partnerNickname || partner?.name || origin?.partnerName || 'Your Partner';

  const [fallbackCode, setFallbackCode] = useState<string>(() =>
    generateUniqueConnectionCode(me.name || 'closer')
  );
  const myCode = origin?.inviteCode || fallbackCode;
  const [partnerCodeInput, setPartnerCodeInput] = useState('');
  const [partnerNicknameInput, setPartnerNicknameInput] = useState(
    origin?.partnerNickname || partner?.name || ''
  );

  // Mandatory Terms of Service & Privacy Policy acceptance for final connection stage
  const [acceptedTerms, setAcceptedTerms] = useState(Boolean(origin?.acceptedTerms));
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(Boolean(origin?.acceptedPrivacy));
  const [legalModalOpen, setLegalModalOpen] = useState(false);

  // Optional cloud account state when Supabase is configured
  const [signUp, setSignUp] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cloudInvite, setCloudInvite] = useState<{ code: string; expires_at: string } | null>(null);

  const handleGenerateCode = async () => {
    const generated = await generateConnectionCode();
    setFallbackCode(generated);
    notify(`Unique connection code ready: ${generated}`);
  };

  const handleCopyCode = async () => {
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(myCode);
      }
      notify(`Connection code ${myCode} copied! Share it with ${partnerDisplay} ♡`);
    } catch {
      notify(`Your connection code: ${myCode}`);
    }
  };

  const handleShareCode = async () => {
    try {
      await Share.share({
        message: `Join our private couple space on Closer! Open "Redeem Connection Code" and enter our unique one-time code: ${myCode}`,
      });
    } catch {
      await handleCopyCode();
    }
  };

  const normalizedInput = normalizeConnectionCode(partnerCodeInput);
  const codeValid = isValidConnectionCode(partnerCodeInput);
  const bothLegalAccepted = acceptedTerms && acceptedPrivacy;

  const handleRedeem = async () => {
    const legalCheck = validateLegalAgreement(acceptedTerms, acceptedPrivacy);
    if (!legalCheck.valid) {
      throw new Error(legalCheck.error);
    }
    await redeemConnectionCode(partnerCodeInput, partnerNicknameInput);
    router.replace('/');
  };

  const auth = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) throw new Error('Enter a valid email address.');
    if (password.length < 8) throw new Error('Use a password with at least 8 characters.');
    if (signUp) {
      const { data, error } = await client().auth.signUp({
        email: email.trim(),
        password,
        options: { data: { display_name: cleanText(name, 30) } },
      });
      if (error) throw error;
      setPassword('');
      if (!data.session) {
        notify('Check your email to confirm your account, then sign in here.');
        setSignUp(false);
      }
    } else {
      const { error } = await client().auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      setPassword('');
    }
  };

  const createCloudInvite = async () => {
    const invited = await generateSupabaseInvitationCode(
      space.mode,
      Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
    );
    setCloudInvite(invited);
    await refresh();
  };

  return (
    <FormPage
      title="Link your accounts."
      subtitle="Share your unique connection code with your partner, or redeem their code and accept our Terms & Privacy to enter your shared dashboard."
    >
      <View style={{ alignItems: 'center', paddingVertical: 8, gap: 10 }}>
        <CoupleAvatars
          names={[me.name || 'You', partnerDisplay]}
          avatars={[me.avatar, partner?.avatar]}
          size={72}
        />
        <View
          style={{
            paddingHorizontal: 12,
            paddingVertical: 5,
            borderRadius: 10,
            backgroundColor: isAlreadyLinked ? '#E4EDE4' : C.pale,
            borderWidth: 1,
            borderColor: isAlreadyLinked ? '#3D5A45' : C.line,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
          }}
        >
          {isAlreadyLinked ? <Lock size={13} color="#3D5A45" /> : <KeyRound size={13} color={C.green} />}
          <T
            kind="small"
            style={{
              fontFamily: F.bold,
              fontSize: 11,
              color: isAlreadyLinked ? '#3D5A45' : C.green,
              letterSpacing: 0.8,
            }}
          >
            {isAlreadyLinked ? 'ONE-TIME LINK COMPLETED' : 'ONE-TIME PARTNER CONNECTION'}
          </T>
        </View>
      </View>

      {/* 1. YOUR UNIQUE CONNECTION CODE TO SHARE (ONLY BEFORE ONE-TIME LINK IS COMPLETE) */}
      {!isAlreadyLinked && (
        <Card style={{ gap: 16, backgroundColor: C.pale, borderColor: C.green }}>
          <View style={{ gap: 4 }}>
            <T kind="label" style={{ color: C.green }}>
              SHARE YOUR CODE · ONE-TIME SETUP
            </T>
            <T kind="sub">Your unique connection code</T>
            <T kind="small">
              Send this one-time code to {partnerDisplay} so they can enter it on their screen and link with your space.
            </T>
          </View>

          <View
            style={{
              backgroundColor: C.paper,
              borderRadius: 16,
              padding: 18,
              borderWidth: 1,
              borderColor: C.line,
              alignItems: 'center',
              gap: 8,
            }}
          >
            <T
              selectable
              style={{
                fontFamily: F.serif,
                fontSize: 28,
                letterSpacing: 3,
                color: C.ink,
                textAlign: 'center',
              }}
            >
              {myCode}
            </T>
            <T kind="small" style={{ fontSize: 11, color: C.muted }}>
              Unique to {me.name || 'your space'} · Valid for one-time partner link only
            </T>
          </View>

          <View style={[S.row, { gap: 10 }]}>
            <Button
              secondary
              compact
              title="Copy code"
              icon={Copy}
              onPress={() => void handleCopyCode()}
              style={{ flex: 1 }}
            />
            <Button
              compact
              title={`Share with ${partnerDisplay}`}
              icon={Share2}
              onPress={() => void handleShareCode()}
              style={{ flex: 1.2 }}
            />
          </View>

          {!origin?.inviteCode && (
            <Button
              secondary
              compact
              title="Save & lock my unique code"
              icon={Sparkles}
              loading={busy}
              onPress={() => {
                void run(handleGenerateCode);
              }}
            />
          )}
        </Card>
      )}

      {/* 2. REDEEM PARTNER'S CONNECTION CODE & MANDATORY TERMS/PRIVACY AGREEMENT */}
      {isAlreadyLinked ? (
        <Card style={{ gap: 16, alignItems: 'center', paddingVertical: 26 }}>
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              backgroundColor: '#E4EDE4',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Check color="#3D5A45" size={28} />
          </View>
          <T kind="serif" style={{ textAlign: 'center' }}>
            Accounts permanently linked ✓
          </T>
          <T style={{ textAlign: 'center', color: C.muted }}>
            {me.name} & {partnerDisplay} are connected. Your one-time connection code was redeemed during initial setup and is now locked.
          </T>
          {origin?.linkedAt ? (
            <T kind="small" style={{ color: C.muted }}>
              Linked on{' '}
              {new Date(origin.linkedAt).toLocaleDateString(undefined, {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </T>
          ) : null}
          <View
            style={{
              backgroundColor: C.bg,
              borderRadius: 12,
              padding: 12,
              borderWidth: 1,
              borderColor: C.line,
              width: '100%',
            }}
          >
            <T kind="small" style={{ textAlign: 'center' }}>
              Partner code redemption and Terms & Privacy acceptance are complete for your couple space.
            </T>
          </View>
          <Button
            secondary
            compact
            title="View Terms of Service & Privacy Policy"
            icon={FileText}
            onPress={() => setLegalModalOpen(true)}
            style={{ width: '100%' }}
          />
          <Button
            title="Go to our shared space"
            icon={Heart}
            onPress={() => router.replace('/')}
            style={{ width: '100%' }}
          />
        </Card>
      ) : (
        <Card style={{ gap: 18 }}>
          <View style={{ gap: 4 }}>
            <T kind="label" style={{ color: C.green }}>
              REDEEM PARTNER CODE · ONE-TIME ONLY
            </T>
            <T kind="sub">Have {partnerDisplay}’s connection code?</T>
            <T kind="small">
              Enter the unique code your partner shared with you and accept our Terms of Service & Privacy Policy to link your accounts and enter the main dashboard.
            </T>
          </View>

          <Field
            label="Partner’s 6-digit invitation code"
            placeholder="e.g., 482917"
            value={partnerCodeInput}
            onChangeText={t => setPartnerCodeInput(t.toUpperCase())}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={18}
          />

          {partnerCodeInput.trim().length > 0 && (
            <View
              style={{
                backgroundColor: codeValid ? '#E4EDE4' : C.bg,
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderWidth: 1,
                borderColor: codeValid ? '#3D5A45' : C.line,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <T kind="small" style={{ color: codeValid ? '#233D29' : C.muted, fontFamily: F.medium }}>
                {codeValid ? `Ready to verify & link: ${normalizedInput}` : 'Keep typing your 6-digit invitation code…'}
              </T>
              {codeValid && <Check size={16} color="#3D5A45" />}
            </View>
          )}

          <Field
            label="What do you call your partner? (optional)"
            placeholder="e.g., Babe, Jaan, Honey…"
            value={partnerNicknameInput}
            onChangeText={setPartnerNicknameInput}
            maxLength={30}
          />

          <View style={S.line} />

          <LegalAgreementPanel
            acceptedTerms={acceptedTerms}
            acceptedPrivacy={acceptedPrivacy}
            onToggleTerms={setAcceptedTerms}
            onTogglePrivacy={setAcceptedPrivacy}
            partnerName={partnerDisplay}
            compact
          />

          <Button
            title="Accept, Redeem Code & Enter Dashboard"
            icon={UserCheck}
            loading={busy}
            disabled={!codeValid || !bothLegalAccepted}
            onPress={() => {
              void run(handleRedeem);
            }}
          />
        </Card>
      )}

      {/* 3. OPTIONAL CLOUD ACCOUNT SYNC WHEN SUPABASE IS CONFIGURED */}
      {supabase && !session ? (
        <Card style={{ gap: 16 }}>
          <T kind="sub">Optional: Cloud account sign-in</T>
          <View style={S.wrap}>
            <Chip title="Create account" selected={signUp} onPress={() => setSignUp(true)} />
            <Chip title="Sign in" selected={!signUp} onPress={() => setSignUp(false)} />
          </View>
          {signUp && (
            <Field
              label="Your first name"
              value={name}
              onChangeText={setName}
              maxLength={30}
              autoComplete="given-name"
            />
          )}
          <Field
            label="Email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <Field
            label="Password · at least 8 characters"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete={signUp ? 'new-password' : 'current-password'}
          />
          <Button
            title={signUp ? 'Create cloud account' : 'Sign in'}
            icon={Mail}
            loading={busy}
            disabled={!email || !password || (signUp && !name.trim())}
            onPress={() => {
              void run(auth);
            }}
          />
        </Card>
      ) : supabase && session && !partner ? (
        <Card style={{ gap: 14 }}>
          <T kind="sub">Cloud 10-minute session code</T>
          {cloudInvite && (
            <View style={{ backgroundColor: C.pale, borderRadius: 14, padding: 16, gap: 8 }}>
              <T selectable kind="serif" style={{ textAlign: 'center', letterSpacing: 3 }}>
                {cloudInvite.code}
              </T>
              <T kind="small" style={{ textAlign: 'center' }}>
                Expires{' '}
                {new Date(cloudInvite.expires_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </T>
            </View>
          )}
          <Button
            secondary
            compact
            title={cloudInvite ? 'Refresh cloud code' : 'Generate cloud invite'}
            icon={Link2}
            loading={busy}
            onPress={() => {
              void run(createCloudInvite);
            }}
          />
        </Card>
      ) : null}

      <Pressable
        accessibilityRole="button"
        onPress={() => router.replace('/')}
        style={{ alignSelf: 'center', paddingVertical: 8 }}
      >
        <T kind="small" style={{ color: C.green, fontFamily: F.medium }}>
          ← Back to our shared space
        </T>
      </Pressable>

      <LegalDocumentModal visible={legalModalOpen} onClose={() => setLegalModalOpen(false)} />
    </FormPage>
  );
}
