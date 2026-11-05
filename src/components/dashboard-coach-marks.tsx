import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, AppState, Modal, Platform, Pressable, ScrollView, View, useWindowDimensions, type ScrollViewProps, type ViewProps } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePathname } from 'expo-router';
import { ArrowLeft, ArrowRight, Camera, Check, Heart, StickyNote, X } from 'lucide-react-native';
import Svg, { Defs, Mask, Rect } from 'react-native-svg';
import { coachMarkLayout, DASHBOARD_TIPS, dashboardTipsKey, type CoachMarkRect, type DashboardTip } from '../coach-marks';
import { Button, C, F, Page, S, T } from './ui';

type Anchor = { view: View; reveal?: () => void };
type TargetRegistry = { register: (id: DashboardTip, anchor: Anchor | null) => void };
const Targets = createContext<TargetRegistry | null>(null);

export function CoachMarkTarget({ id, onReveal, children, ...props }: ViewProps & { id: DashboardTip; onReveal?: () => void }) {
  const registry = useContext(Targets);
  const attach = useCallback((view: View | null) => registry?.register(id, view ? { view, reveal: onReveal } : null), [id, registry, onReveal]);
  return <View testID={`coach-target-${id}`} {...props} ref={attach} collapsable={false}>{children}</View>;
}

type PageProps = React.ComponentProps<typeof Page>;
export function DashboardCoachMarkPage({ owner, eligible = true, ...props }: PageProps & { owner: string; eligible?: boolean }) {
  return <CoachMarkHost key={owner} owner={owner} eligible={eligible} pageProps={props} />;
}

function measure(view: View | null): Promise<CoachMarkRect | null> {
  return new Promise(resolve => {
    if (!view) { resolve(null); return; }
    view.measureInWindow((x, y, width, height) => resolve(width > 0 && height > 0 ? { x, y, width, height } : null));
  });
}

function CoachMarkHost({ owner, eligible, pageProps }: { owner: string; eligible: boolean; pageProps: PageProps }) {
  const pathname = usePathname(); const window = useWindowDimensions();
  const scroll = useRef<ScrollView>(null); const viewport = useRef<View>(null); const modal = useRef<View>(null);
  const anchors = useRef<Partial<Record<DashboardTip, Anchor>>>({}); const scrollY = useRef(0);
  const [version, setVersion] = useState(0); const [unseen, setUnseen] = useState(false);
  const [requested, setRequested] = useState<number | null>(null);
  const [placement, setPlacement] = useState<{ index: number; target: CoachMarkRect } | null>(null);
  const [modalFrame, setModalFrame] = useState<CoachMarkRect | null>(null);
  const [cardHeight, setCardHeight] = useState(270); const title = useRef<View>(null);
  const active = eligible && pathname === '/';
  const storageKey = dashboardTipsKey(owner);
  const register = useCallback((id: DashboardTip, anchor: Anchor | null) => {
    if (anchors.current[id]?.view === anchor?.view) return;
    if (anchor) anchors.current[id] = anchor; else delete anchors.current[id];
    setVersion(value => value + 1);
  }, []);
  const registry = useMemo(() => ({ register }), [register]);
  const onScroll: ScrollViewProps['onScroll'] = useCallback(event => { scrollY.current = event.nativeEvent.contentOffset.y; }, []);

  useEffect(() => {
    let live = true;
    void AsyncStorage.getItem(storageKey).then(value => { if (live) setUnseen(value !== 'done'); }).catch(() => {
      // A device that cannot read storage can still use and dismiss the tour.
      if (live) setUnseen(true);
    });
    return () => { live = false; };
  }, [storageKey]);

  useEffect(() => {
    if (!active || !unseen || requested !== null || !DASHBOARD_TIPS.every(tip => anchors.current[tip.id])) return;
    // Wait until the first dashboard layout has committed before measuring.
    const timer = setTimeout(() => setRequested(0), 250);
    return () => clearTimeout(timer);
  }, [active, unseen, requested, version]);

  useEffect(() => {
    if (!active || requested === null) return;
    let live = true; let settle: ReturnType<typeof setTimeout> | undefined;
    const anchor = anchors.current[DASHBOARD_TIPS[requested].id];
    if (!anchor) return;
    anchor.reveal?.();
    void Promise.all([measure(anchor.view), measure(viewport.current)]).then(([target, frame]) => {
      if (!live || !target || !frame) return;
      const desiredTop = frame.y + Math.max(18, (frame.height - target.height) / 2 - 110);
      scroll.current?.scrollTo({ y: Math.max(0, scrollY.current + target.y - desiredTop), animated: false });
      settle = setTimeout(() => {
        void measure(anchor.view).then(box => { if (live && box) setPlacement({ index: requested, target: box }); });
      }, 120);
    });
    return () => { live = false; clearTimeout(settle); };
  }, [active, requested, version, window.width, window.height, window.fontScale]);

  const finish = useCallback(() => {
    setUnseen(false); setRequested(null); setPlacement(null); setModalFrame(null);
    void AsyncStorage.setItem(storageKey, 'done').catch(() => {});
  }, [storageKey]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') setVersion(value => value + 1);
    });
    return () => subscription.remove();
  }, []);

  const shown = active && placement !== null;
  const readModalFrame = useCallback(() => { void measure(modal.current).then(frame => { if (frame) setModalFrame(frame); }); }, []);
  useEffect(() => {
    if (!shown) return;
    const timer = setTimeout(readModalFrame, 0);
    return () => clearTimeout(timer);
  }, [shown, window.width, window.height, readModalFrame]);

  useEffect(() => {
    if (!shown || !placement) return;
    const tip = DASHBOARD_TIPS[placement.index];
    AccessibilityInfo.announceForAccessibility(`Tip ${placement.index + 1} of ${DASHBOARD_TIPS.length}. ${tip.label}. ${tip.body}`);
    // The web modal traps focus; begin at its explanation, before the controls.
    if (Platform.OS === 'web') title.current?.focus();
  }, [shown, placement]);

  const tip = placement ? DASHBOARD_TIPS[placement.index] : null;
  const frame = modalFrame ?? { x: 0, y: 0, width: window.width, height: window.height };
  const target = placement ? { ...placement.target, x: placement.target.x - frame.x, y: placement.target.y - frame.y } : null;
  const layout = target ? coachMarkLayout(target, frame, cardHeight) : null;
  const positioning = placement?.index !== requested;
  const Icon = placement?.index === 0 ? StickyNote : Camera;

  return <Targets.Provider value={registry}>
    <View ref={viewport} collapsable={false} style={{ flex: 1 }} accessibilityElementsHidden={shown} importantForAccessibility={shown ? 'no-hide-descendants' : 'auto'}>
      <Page {...pageProps} scrollRef={scroll} onScroll={onScroll} scrollEnabled={!shown} />
    </View>
    <Modal transparent visible={shown} animationType="none" statusBarTranslucent onRequestClose={finish} onShow={readModalFrame}>
      <View ref={modal} collapsable={false} onLayout={readModalFrame} style={{ flex: 1 }} accessibilityViewIsModal role="dialog" accessibilityLabel="Dashboard tips" testID="dashboard-coach-marks">
        {layout && tip && <>
          <Svg width="100%" height="100%" style={{ position: 'absolute' }} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <Defs><Mask id="dashboard-tip-spotlight"><Rect width="100%" height="100%" fill="white" /><Rect {...layout.highlight} rx={16} fill="black" /></Mask></Defs>
            <Rect width="100%" height="100%" fill="#241918" opacity={0.74} mask="url(#dashboard-tip-spotlight)" />
            <Rect {...layout.highlight} rx={16} fill="none" stroke="#FFF9EC" strokeWidth={2.5} />
          </Svg>
          <View pointerEvents="none" testID="coach-mark-highlight" style={{ position: 'absolute', left: layout.highlight.x, top: layout.highlight.y, width: layout.highlight.width, height: layout.highlight.height }} />
          <ScrollView testID="coach-mark-card" style={{ position: 'absolute', ...layout.card, backgroundColor: C.paper, borderRadius: 22, borderWidth: 1, borderColor: '#EADACD' }} contentContainerStyle={{ padding: 21, gap: 16 }} keyboardShouldPersistTaps="handled">
            <View onLayout={event => { const height = event.nativeEvent.layout.height + 42; setCardHeight(previous => Math.abs(previous - height) > 1 ? height : previous); }} style={{ gap: 16 }}>
              <View style={S.between}>
                <View style={[S.row, { gap: 8 }]}><View style={{ width: 32, height: 32, borderRadius: 11, backgroundColor: placement?.index === 0 ? C.yellow : '#ECE5F3', justifyContent: 'center', alignItems: 'center' }}><Icon size={17} color={C.green} strokeWidth={1.5} /></View><T kind="small" style={{ fontFamily: F.medium, color: C.green }}>A LITTLE TOUR · {(placement?.index ?? 0) + 1} / 2</T></View>
                <Heart size={16} color={C.green} strokeWidth={1.3} />
              </View>
              <View style={{ gap: 7 }}><View ref={title} focusable accessible accessibilityRole="header"><T kind="serif" style={{ fontSize: 24, lineHeight: 32 }}>{tip.label}</T></View><T style={{ fontFamily: F.italic, fontSize: 14, lineHeight: 21 }}>{tip.title}</T><T style={{ fontSize: 13, lineHeight: 21, color: C.muted }}>{tip.body}</T></View>
              <View style={{ flexDirection: 'row', gap: 9 }}>
                {placement?.index === 1 && <Button title="Back" icon={ArrowLeft} compact secondary disabled={positioning} onPress={() => setRequested(0)} />}
                <Button title={placement?.index === 0 ? 'Next: Instant Pic' : 'Got it'} icon={placement?.index === 0 ? ArrowRight : Check} compact disabled={positioning} style={{ flex: 1 }} onPress={() => { if (placement?.index === 0) setRequested(1); else finish(); }} />
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel="Skip tour" onPress={finish} style={{ minHeight: 44, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 5 }}><X size={13} color={C.muted} /><T kind="small">Skip for now</T></Pressable>
            </View>
          </ScrollView>
        </>}
      </View>
    </Modal>
  </Targets.Provider>;
}
