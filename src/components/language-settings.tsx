import React, { useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { Check, Languages } from 'lucide-react-native';
import { LANGUAGES, type Language } from '../locales';
import { useI18n } from '../localization';
import { useSpace } from '../store';
import { C, Card, F, S, T } from './ui';

export function LanguageSettings() {
  const { language, setLanguage, session, busy, run } = useSpace(); const { t } = useI18n();
  const [pending, setPending] = useState<Language | null>(null);
  const choose = async (choice: Language) => {
    if (choice === language || busy || pending) return;
    setPending(choice);
    try { await run(() => setLanguage(choice)); } finally { setPending(null); }
  };
  return <Card style={{ gap: 15 }}>
    <View style={[S.row, { gap: 9 }]}><Languages size={22} color={C.green} /><T kind="sub">{t('language.title')} / {language === 'en' ? 'भाषा' : 'Language'}</T></View>
    <T>{t('language.subtitle')}</T>
    <View role="radiogroup" accessibilityLabel={t('language.title')} style={{ flexDirection: 'row', gap: 10 }}>
      {LANGUAGES.map(option => <Pressable key={option.id} accessibilityRole="radio" accessibilityLabel={option.label} aria-checked={language === option.id} aria-disabled={busy || pending !== null} accessibilityState={{ checked: language === option.id, disabled: busy || pending !== null }} disabled={busy || pending !== null} onPress={() => { void choose(option.id); }} style={({ pressed }) => ({ flex: 1, minHeight: 54, borderRadius: 14, borderWidth: language === option.id ? 1.5 : 1, borderColor: language === option.id ? C.green : C.line, backgroundColor: language === option.id ? C.pale : C.paper, padding: 13, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.7 : 1 })}>
        <T style={{ fontFamily: F.medium, fontSize: 15 }}>{option.label}</T>
        {pending === option.id ? <ActivityIndicator size="small" color={C.green} /> : language === option.id ? <Check size={16} color={C.green} /> : null}
      </Pressable>)}
    </View>
    {pending && <T accessibilityLiveRegion="polite" kind="small">{t('language.saving')}</T>}
    <T kind="small">{t(session ? 'language.profile' : 'language.local')}</T>
    <T kind="small">{t('language.scope')}</T>
  </Card>;
}
