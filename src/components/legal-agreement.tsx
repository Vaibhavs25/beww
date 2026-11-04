import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { Check, FileText, Lock, ShieldCheck, X } from 'lucide-react-native';
import { Button, C, Card, F, S, T } from './ui';
import {
  LEGAL_POLICY_VERSION,
  PRIVACY_POLICY_SECTIONS,
  TERMS_OF_SERVICE_SECTIONS,
} from '../domain';

export type LegalAgreementPanelProps = {
  acceptedTerms: boolean;
  acceptedPrivacy: boolean;
  onToggleTerms: (next: boolean) => void;
  onTogglePrivacy: (next: boolean) => void;
  partnerName?: string;
  compact?: boolean;
};

export function LegalAgreementPanel({
  acceptedTerms,
  acceptedPrivacy,
  onToggleTerms,
  onTogglePrivacy,
  partnerName = 'your partner',
  compact = false,
}: LegalAgreementPanelProps) {
  const [activeDoc, setActiveDoc] = useState<'terms' | 'privacy'>('terms');
  const bothAccepted = acceptedTerms && acceptedPrivacy;
  const sections = activeDoc === 'terms' ? TERMS_OF_SERVICE_SECTIONS : PRIVACY_POLICY_SECTIONS;

  const toggleBoth = () => {
    const target = !bothAccepted;
    onToggleTerms(target);
    onTogglePrivacy(target);
  };

  return (
    <View style={{ gap: 16 }}>
      {/* Header badge */}
      <View
        style={{
          backgroundColor: bothAccepted ? '#E4EDE4' : C.pale,
          borderRadius: 14,
          padding: 14,
          borderWidth: 1,
          borderColor: bothAccepted ? '#3D5A45' : C.line,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <ShieldCheck size={20} color={bothAccepted ? '#3D5A45' : C.green} />
        <View style={{ flex: 1, gap: 2 }}>
          <T
            kind="small"
            style={{
              fontFamily: F.bold,
              color: bothAccepted ? '#233D29' : C.green,
              fontSize: 11,
              letterSpacing: 0.6,
            }}
          >
            {bothAccepted
              ? 'TERMS OF SERVICE & PRIVACY POLICY ACCEPTED ✓'
              : 'MANDATORY AGREEMENT · FINAL CONNECTION STAGE'}
          </T>
          <T kind="small" style={{ fontSize: 12 }}>
            {bothAccepted
              ? `You’re ready to enter your private space with ${partnerName}.`
              : 'Please review and accept both the Terms of Service and Privacy Policy before entering the main dashboard.'}
          </T>
        </View>
      </View>

      {/* Document switcher tabs */}
      <View style={[S.row, { gap: 8 }]}>
        {(
          [
            { id: 'terms' as const, label: 'Terms of Service', icon: FileText },
            { id: 'privacy' as const, label: 'Privacy Policy', icon: Lock },
          ]
        ).map(tab => {
          const selected = activeDoc === tab.id;
          const Icon = tab.icon;
          return (
            <Pressable
              key={tab.id}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              onPress={() => setActiveDoc(tab.id)}
              style={{
                flex: 1,
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderRadius: 12,
                borderWidth: 1.5,
                borderColor: selected ? C.green : C.line,
                backgroundColor: selected ? C.pale : C.bg,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <Icon size={14} color={selected ? C.green : C.muted} />
              <T
                kind="small"
                style={{
                  fontFamily: selected ? F.bold : F.medium,
                  color: selected ? C.green : C.ink,
                }}
              >
                {tab.label}
              </T>
            </Pressable>
          );
        })}
      </View>

      {/* Scrollable Legal Document Reader */}
      <View
        style={{
          backgroundColor: C.bg,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: C.line,
          maxHeight: compact ? 190 : 250,
          overflow: 'hidden',
        }}
      >
        <ScrollView
          nestedScrollEnabled
          contentContainerStyle={{ padding: 14, gap: 12 }}
          showsVerticalScrollIndicator
        >
          <View style={S.between}>
            <T style={{ fontFamily: F.bold, fontSize: 13, color: C.ink }}>
              {activeDoc === 'terms' ? 'Closer Terms of Service' : 'Closer Privacy Policy'}
            </T>
            <T kind="small" style={{ fontSize: 11 }}>
              v{LEGAL_POLICY_VERSION}
            </T>
          </View>
          {sections.map(sec => (
            <View key={sec.id} style={{ gap: 4 }}>
              <T kind="small" style={{ fontFamily: F.bold, color: C.ink }}>
                {sec.heading}
              </T>
              <T kind="small" style={{ lineHeight: 19, color: C.muted }}>
                {sec.body}
              </T>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Mandatory Checkboxes */}
      <View style={{ gap: 10 }}>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityLabel="I have read and agree to the Terms of Service"
          accessibilityState={{ checked: acceptedTerms }}
          onPress={() => onToggleTerms(!acceptedTerms)}
          style={{
            borderRadius: 14,
            borderWidth: 1.5,
            borderColor: acceptedTerms ? C.green : C.line,
            backgroundColor: acceptedTerms ? C.pale : C.bg,
            padding: 13,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <View
            style={{
              width: 22,
              height: 22,
              borderRadius: 7,
              borderWidth: 1.5,
              borderColor: acceptedTerms ? C.green : C.muted,
              backgroundColor: acceptedTerms ? C.green : C.paper,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {acceptedTerms && <Check size={14} color="#fff" />}
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <T style={{ fontFamily: F.bold, fontSize: 13, color: C.ink }}>
              I accept the Terms of Service (Required)
            </T>
            <T kind="small" style={{ fontSize: 11 }}>
              Shared couple space rules, content ownership, and one-time partner linking.
            </T>
          </View>
        </Pressable>

        <Pressable
          accessibilityRole="checkbox"
          accessibilityLabel="I have read and agree to the Privacy Policy"
          accessibilityState={{ checked: acceptedPrivacy }}
          onPress={() => onTogglePrivacy(!acceptedPrivacy)}
          style={{
            borderRadius: 14,
            borderWidth: 1.5,
            borderColor: acceptedPrivacy ? C.green : C.line,
            backgroundColor: acceptedPrivacy ? C.pale : C.bg,
            padding: 13,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <View
            style={{
              width: 22,
              height: 22,
              borderRadius: 7,
              borderWidth: 1.5,
              borderColor: acceptedPrivacy ? C.green : C.muted,
              backgroundColor: acceptedPrivacy ? C.green : C.paper,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {acceptedPrivacy && <Check size={14} color="#fff" />}
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <T style={{ fontFamily: F.bold, fontSize: 13, color: C.ink }}>
              I accept the Privacy Policy (Required)
            </T>
            <T kind="small" style={{ fontSize: 11 }}>
              Private two-person storage, camera/notification permissions, and zero ad tracking.
            </T>
          </View>
        </Pressable>

        {!bothAccepted && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Accept both Terms of Service and Privacy Policy"
            onPress={toggleBoth}
            style={{
              paddingVertical: 9,
              paddingHorizontal: 12,
              borderRadius: 10,
              backgroundColor: C.paper,
              borderWidth: 1,
              borderColor: C.line,
              alignItems: 'center',
            }}
          >
            <T kind="small" style={{ color: C.green, fontFamily: F.bold }}>
              Check both Terms of Service & Privacy Policy
            </T>
          </Pressable>
        )}
      </View>
    </View>
  );
}

export function LegalDocumentModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: '#1D2C2866',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
        }}
      >
        <Card style={{ maxWidth: 560, width: '100%', maxHeight: '88%', gap: 16 }}>
          <View style={S.between}>
            <View style={[S.row, { gap: 8 }]}>
              <ShieldCheck size={20} color={C.green} />
              <T kind="sub">Terms of Service & Privacy Policy</T>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close legal documents"
              onPress={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: C.bg,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={16} color={C.ink} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ gap: 16 }}>
            <View style={{ gap: 8 }}>
              <T kind="label" style={{ color: C.green }}>
                TERMS OF SERVICE · v{LEGAL_POLICY_VERSION}
              </T>
              {TERMS_OF_SERVICE_SECTIONS.map(sec => (
                <View key={sec.id} style={{ gap: 3 }}>
                  <T kind="small" style={{ fontFamily: F.bold, color: C.ink }}>
                    {sec.heading}
                  </T>
                  <T kind="small" style={{ lineHeight: 19 }}>
                    {sec.body}
                  </T>
                </View>
              ))}
            </View>

            <View style={S.line} />

            <View style={{ gap: 8 }}>
              <T kind="label" style={{ color: C.green }}>
                PRIVACY POLICY · v{LEGAL_POLICY_VERSION}
              </T>
              {PRIVACY_POLICY_SECTIONS.map(sec => (
                <View key={sec.id} style={{ gap: 3 }}>
                  <T kind="small" style={{ fontFamily: F.bold, color: C.ink }}>
                    {sec.heading}
                  </T>
                  <T kind="small" style={{ lineHeight: 19 }}>
                    {sec.body}
                  </T>
                </View>
              ))}
            </View>
          </ScrollView>

          <Button title="Done reading" icon={Check} onPress={onClose} />
        </Card>
      </View>
    </Modal>
  );
}
