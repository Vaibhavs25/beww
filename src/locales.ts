export type Language = 'en' | 'hi';
export const LANGUAGES = [
  { id: 'en', label: 'English', locale: 'en-IN' },
  { id: 'hi', label: 'हिन्दी', locale: 'hi-IN' },
] as const;
export function isLanguage(value: unknown): value is Language { return value === 'en' || value === 'hi'; }
export function normalizeLanguage(value: unknown): Language { return isLanguage(value) ? value : 'en'; }

const en = {
  'nav.today': 'Today', 'nav.chat': 'Chat', 'nav.together': 'Together', 'nav.story': 'Our story', 'nav.us': 'Us',
  'nav.tagline': 'A little world. Just for two.', 'nav.justUs': 'JUST THE TWO OF YOU', 'nav.local': 'On this device', 'nav.connected': 'Connected', 'nav.reconnecting': 'Reconnecting', 'nav.connecting': 'Connecting', 'nav.settings': 'Your settings', 'nav.send': 'Send a moment', 'nav.quote': '“The little things are the big things.”', 'nav.space': 'Your shared space',
  'language.title': 'Language', 'language.subtitle': 'Choose the language that feels like home.',
  'language.scope': 'For navigation, settings, the home greeting, and dashboard tips. Other features currently use English.',
  'language.profile': 'Saved to your profile and used on your other signed-in devices. Your partner chooses their own language.',
  'language.local': 'Saved on this device. Sign in to keep your language across devices.',
  'language.saving': 'Saving your language…', 'language.saved': 'Language saved to your profile', 'language.savedLocal': 'Language saved on this device',
  'language.failed': 'Could not save your language. Please try again.', 'language.setup': 'Finish setting up your profile before choosing a language.',
  'settings.title': 'A space that’s ours.', 'settings.subtitle': 'However far apart, whatever chapter you’re in.', 'settings.eyebrow': 'JUST US',
  'settings.person': 'your person', 'settings.days': '{count} days of you & me', 'settings.storyStarts': 'Your story starts here', 'settings.linkedBadge': 'Accounts linked ✓ (One-time setup complete)', 'settings.setupBadge': 'One-time story setup complete',
  'settings.details': 'The little details', 'settings.name': 'Your name', 'settings.startDate': 'Our start date · YYYY-MM-DD', 'settings.datePlaceholder': 'The day it all began', 'settings.save': 'Save our details',
  'settings.how': 'How are we doing together?', 'settings.modeDescription': 'Your space can change when life does. Both modes include every activity.', 'settings.nearby': 'Nearby', 'settings.distance': 'Long distance',
  'settings.timeZone': 'Our shared day follows {zone}. Questions and daily wins use the same day for both partners.', 'settings.memories': 'Our First Chapter & Memories', 'settings.plans': 'Our dates & someday list',
  'settings.linked': 'Accounts permanently linked ✓', 'settings.linkTitle': 'One-time partner link', 'settings.linkedDescription': '{me} & {partner} are connected in this private space. Your one-time connection code was used during setup and is now locked.', 'settings.linkDescription': 'Need to finish linking accounts with {partner}? Connection codes are used once during initial partner setup.', 'settings.link': 'Complete one-time partner link', 'settings.switchPartner': 'Switch partner view',
  'settings.privacy': 'Privacy & keepsake archive', 'settings.privacyDescription': 'Your moods, photos, sticky notes, and journal entries belong only to the two of you. Camera and microphone access are used strictly when you snap a photo or place a call—with zero ad trackers or public profiles.', 'settings.terms': 'Terms & Privacy Policy', 'settings.export': 'Export our keepsake data', 'settings.resetDevice': 'Reset device space', 'settings.signedIn': 'Signed in as {email}', 'settings.signOut': 'Sign out on this device',
  'settings.resetTitle': 'Start with a fresh space?', 'settings.resetDescription': 'This resets the saved couple space on this device back to a fresh start.', 'settings.keep': 'Keep our moments', 'settings.reset': 'Reset space', 'settings.exported': 'Your keepsake archive is ready', 'settings.exportNative': 'Your keepsake has {moments} moments, {notes} notes, and {entries} journal entries. Open Closer on the web to download a JSON archive.',
  'home.title': 'A little closer, {name}.', 'home.subtitle': 'It’s the little things that make a life together.', 'home.localFeatures': 'Journals, adventures, trivia, sticky notes, and errands are saved on this device.',
  'tour.quickLabel': 'Quick Notes', 'tour.quickTitle': 'A little note goes a long way.', 'tour.quickBody': 'Write a few words in the box above, then tap Stick Note. A tiny reminder, an inside joke, or a little “thinking of you” belongs here.',
  'tour.picLabel': 'Instant Pic', 'tour.picTitle': 'Let them see your little world.', 'tour.picBody': 'Tap Instant Snap to choose a photo from your device. A caption is optional, so an ordinary moment can speak for itself.',
  'tour.label': 'A LITTLE TOUR', 'tour.next': 'Next: Instant Pic', 'tour.back': 'Back', 'tour.done': 'Got it', 'tour.skip': 'Skip for now', 'tour.skipLabel': 'Skip tour', 'tour.dialog': 'Dashboard tips', 'tour.announcement': 'Tip {step} of {total}. {label}. {body}',
} as const;
export type TranslationKey = keyof typeof en;
const hi: Record<TranslationKey, string> = {
  'nav.today': 'आज', 'nav.chat': 'बातचीत', 'nav.together': 'साथ में', 'nav.story': 'हमारी कहानी', 'nav.us': 'हम',
  'nav.tagline': 'एक छोटी-सी दुनिया। सिर्फ हम दोनों की।', 'nav.justUs': 'सिर्फ तुम और मैं', 'nav.local': 'इस डिवाइस पर', 'nav.connected': 'जुड़े हुए', 'nav.reconnecting': 'फिर से जुड़ रहे हैं', 'nav.connecting': 'जुड़ रहे हैं', 'nav.settings': 'आपकी सेटिंग्स', 'nav.send': 'एक पल साझा करें', 'nav.quote': '“छोटी-छोटी बातें ही सबसे खास होती हैं।”', 'nav.space': 'हमारी साझा दुनिया',
  'language.title': 'भाषा', 'language.subtitle': 'वह भाषा चुनें जो अपनी-सी लगे।',
  'language.scope': 'नेविगेशन, सेटिंग्स, होम के अभिवादन और डैशबोर्ड की गाइड के लिए। बाकी सुविधाएँ अभी अंग्रेज़ी में हैं।',
  'language.profile': 'आपकी प्रोफ़ाइल में सहेजी जाती है और आपके दूसरे साइन-इन किए हुए डिवाइस पर भी लागू होती है। आपके साथी अपनी भाषा खुद चुनते हैं।',
  'language.local': 'इस डिवाइस पर सहेजी जाती है। दूसरे डिवाइस पर भी यही भाषा रखने के लिए साइन इन करें।',
  'language.saving': 'आपकी भाषा सहेज रहे हैं…', 'language.saved': 'भाषा आपकी प्रोफ़ाइल में सहेज दी गई', 'language.savedLocal': 'भाषा इस डिवाइस पर सहेज दी गई',
  'language.failed': 'भाषा सहेजी नहीं जा सकी। कृपया फिर कोशिश करें।', 'language.setup': 'भाषा चुनने से पहले अपनी प्रोफ़ाइल का सेटअप पूरा करें।',
  'settings.title': 'हमारी अपनी दुनिया।', 'settings.subtitle': 'दूरी चाहे जितनी हो, कहानी हमारी है।', 'settings.eyebrow': 'बस हम दोनों',
  'settings.person': 'आपका साथी', 'settings.days': 'तुम और मैं, {count} दिनों से', 'settings.storyStarts': 'हमारी कहानी यहीं से शुरू होती है', 'settings.linkedBadge': 'अकाउंट जुड़ गए ✓ (सेटअप पूरा)', 'settings.setupBadge': 'कहानी का शुरुआती सेटअप पूरा',
  'settings.details': 'हमारी छोटी-छोटी बातें', 'settings.name': 'आपका नाम', 'settings.startDate': 'हमारी शुरुआत की तारीख · YYYY-MM-DD', 'settings.datePlaceholder': 'जिस दिन यह कहानी शुरू हुई', 'settings.save': 'हमारी जानकारी सहेजें',
  'settings.how': 'साथ में हमारा सफ़र कैसा है?', 'settings.modeDescription': 'ज़िंदगी बदले तो आपकी दुनिया भी बदल सकती है। दोनों विकल्पों में सभी गतिविधियाँ शामिल हैं।', 'settings.nearby': 'आस-पास', 'settings.distance': 'दूर रहते हैं',
  'settings.timeZone': 'हमारा साझा दिन {zone} के अनुसार चलता है। सवालों और रोज़ की जीत के लिए दोनों का दिन एक ही है।', 'settings.memories': 'हमारा पहला अध्याय और यादें', 'settings.plans': 'हमारी डेट और सपनों की सूची',
  'settings.linked': 'अकाउंट जुड़ चुके हैं ✓', 'settings.linkTitle': 'साथी से अकाउंट जोड़ें', 'settings.linkedDescription': '{me} और {partner} इस निजी दुनिया में जुड़े हैं। सेटअप में इस्तेमाल किया गया कोड अब बंद हो चुका है।', 'settings.linkDescription': '{partner} के साथ अकाउंट जोड़ना बाकी है? कनेक्शन कोड शुरुआती सेटअप में एक बार इस्तेमाल होता है।', 'settings.link': 'साथी से अकाउंट जोड़ना पूरा करें', 'settings.switchPartner': 'साथी का नज़रिया देखें',
  'settings.privacy': 'गोपनीयता और यादों का संग्रह', 'settings.privacyDescription': 'आपके मूड, फ़ोटो, छोटे नोट और डायरी सिर्फ आप दोनों के हैं। कैमरा और माइक्रोफ़ोन का इस्तेमाल केवल फ़ोटो लेने या कॉल करने पर होता है। कोई विज्ञापन ट्रैकर या सार्वजनिक प्रोफ़ाइल नहीं है।', 'settings.terms': 'शर्तें और गोपनीयता नीति', 'settings.export': 'हमारी यादों का डेटा डाउनलोड करें', 'settings.resetDevice': 'इस डिवाइस की दुनिया रीसेट करें', 'settings.signedIn': '{email} से साइन इन हैं', 'settings.signOut': 'इस डिवाइस से साइन आउट करें',
  'settings.resetTitle': 'एक नई शुरुआत करें?', 'settings.resetDescription': 'इससे इस डिवाइस पर सहेजी हुई साझा दुनिया रीसेट हो जाएगी।', 'settings.keep': 'हमारी यादें रहने दें', 'settings.reset': 'दुनिया रीसेट करें', 'settings.exported': 'आपकी यादों का संग्रह तैयार है', 'settings.exportNative': 'आपके संग्रह में {moments} पल, {notes} नोट और {entries} डायरी पन्ने हैं। JSON संग्रह डाउनलोड करने के लिए Closer को वेब पर खोलें।',
  'home.title': 'थोड़ा और करीब, {name}।', 'home.subtitle': 'छोटी-छोटी बातें ही साथ की ज़िंदगी बनाती हैं।', 'home.localFeatures': 'डायरी, रोमांच, ट्रिविया, छोटे नोट और कामों की सूची इस डिवाइस पर सहेजे जाते हैं।',
  'tour.quickLabel': 'छोटे नोट', 'tour.quickTitle': 'एक छोटा-सा नोट भी बहुत कुछ कहता है।', 'tour.quickBody': 'ऊपर वाले बॉक्स में कुछ शब्द लिखें, फिर Stick Note दबाएँ। कोई याद दिलाने वाली बात, अपना मज़ाक या बस “तुम्हारी याद आई” लिख दें।',
  'tour.picLabel': 'झटपट फ़ोटो', 'tour.picTitle': 'उन्हें अपनी छोटी-सी दुनिया दिखाएँ।', 'tour.picBody': 'अपने डिवाइस से फ़ोटो चुनने के लिए Instant Snap दबाएँ। कैप्शन ज़रूरी नहीं—कभी-कभी एक साधारण पल ही सब कह देता है।',
  'tour.label': 'एक छोटी-सी गाइड', 'tour.next': 'अगला: झटपट फ़ोटो', 'tour.back': 'पीछे', 'tour.done': 'समझ गए', 'tour.skip': 'अभी छोड़ें', 'tour.skipLabel': 'गाइड छोड़ें', 'tour.dialog': 'डैशबोर्ड की गाइड', 'tour.announcement': 'सुझाव {step}, कुल {total}। {label}। {body}',
};
export const TRANSLATIONS = { en, hi };
export function translate(language: Language, key: TranslationKey, values: Record<string, string | number> = {}) {
  return TRANSLATIONS[language][key].replace(/\{(\w+)\}/g, (placeholder, name: string) => String(values[name] ?? placeholder));
}
