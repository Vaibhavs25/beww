import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Check, ShieldCheck } from 'lucide-react-native';
import { Button, C, Card, F, FormPage, S, T } from '../components/ui';
import { LEGAL_POLICY_VERSION, validateLegalAgreement } from '../domain';
import { usePeople, useSpace } from '../store';
import { LegalAgreementPanel } from '../components/legal-agreement';

export default function LegalScreen() {
  const { space, updateOriginStory, run, busy, notify } = useSpace();
  const { partner } = usePeople();
  const origin = space.originStory;
  const partnerDisplay =
    partner?.nickname || origin?.partnerNickname || partner?.name || origin?.partnerName || 'your partner';

  const [acceptedTerms, setAcceptedTerms] = useState(Boolean(origin?.acceptedTerms));
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(Boolean(origin?.acceptedPrivacy));

  const bothAccepted = acceptedTerms && acceptedPrivacy;

  const handleSaveAcceptance = async () => {
    const check = validateLegalAgreement(acceptedTerms, acceptedPrivacy);
    if (!check.valid) {
      throw new Error(check.error);
    }
    const nowIso = new Date().toISOString();
    await updateOriginStory({
      acceptedTerms: true,
      acceptedPrivacy: true,
      legalAcceptedAt: origin?.legalAcceptedAt || nowIso,
      legalVersion: LEGAL_POLICY_VERSION,
    });
    notify('Terms of Service & Privacy Policy accepted ♡');
    router.replace('/');
  };

  return (
    <FormPage
      title="Terms of Service & Privacy Policy."
      subtitle="Review and accept our mandatory couple space agreements before entering the main dashboard."
    >
      <Card style={{ gap: 18 }}>
        <View style={[S.row, { gap: 8 }]}>
          <ShieldCheck size={20} color={C.green} />
          <T kind="sub">Legal Agreement & Data Privacy</T>
        </View>

        <LegalAgreementPanel
          acceptedTerms={acceptedTerms}
          acceptedPrivacy={acceptedPrivacy}
          onToggleTerms={setAcceptedTerms}
          onTogglePrivacy={setAcceptedPrivacy}
          partnerName={partnerDisplay}
        />

        {origin?.legalAcceptedAt ? (
          <View
            style={{
              backgroundColor: '#E4EDE4',
              borderRadius: 12,
              padding: 12,
              borderWidth: 1,
              borderColor: '#3D5A45',
            }}
          >
            <T kind="small" style={{ color: '#233D29', fontFamily: F.medium }}>
              Accepted v{origin.legalVersion || LEGAL_POLICY_VERSION} on{' '}
              {new Date(origin.legalAcceptedAt).toLocaleString()}
            </T>
          </View>
        ) : null}

        <Button
          title="Accept & Enter Main Dashboard ♡"
          icon={Check}
          loading={busy}
          disabled={!bothAccepted}
          onPress={() => {
            void run(handleSaveAcceptance);
          }}
        />
      </Card>
    </FormPage>
  );
}
