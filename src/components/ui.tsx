import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions, type StyleProp, type ViewStyle, type TextStyle, type TextInputProps } from 'react-native';
import { ArrowLeft, ArrowRight, Heart, X, type LucideIcon } from 'lucide-react-native';
import { router } from 'expo-router';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { strokePath, type Stroke } from '../domain';
import { PetPortrait } from './pet-portrait';

export const C = { bg: '#F7F3EE', paper: '#FFFCF8', ink: '#2B1E1A', muted: '#7A6860', green: '#9E3B33', pale: '#F2E8DF', line: '#E5DBD0', rose: '#F5E1DA', yellow: '#F6ECD9', purple: '#ECE6DF', lavender: '#8C5A4C' };
export const F = { body: 'DMSans_400Regular', medium: 'DMSans_500Medium', bold: 'DMSans_700Bold', serif: 'Lora_400Regular', italic: 'Lora_400Regular_Italic' };
export const S = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 }, between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  stack: { gap: 18 }, wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, flex: { flex: 1 },
  card: { backgroundColor: C.paper, borderRadius: 20, borderWidth: 1, borderColor: C.line, padding: 22 },
  line: { height: 1, backgroundColor: C.line, marginVertical: 18 },
  input: { fontFamily: F.body, fontSize: 15, color: C.ink, backgroundColor: '#FAF6F0', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, minHeight: 50, borderWidth: 1, borderColor: C.line },
});
export function T({ children, style, kind = 'body', ...props }: React.ComponentProps<typeof Text> & { kind?: 'body' | 'title' | 'sub' | 'label' | 'small' | 'serif' }) {
  const styles: Record<string, TextStyle> = {
    body: { fontSize: 15, lineHeight: 23 }, title: { fontFamily: F.serif, fontSize: 36, lineHeight: 45, letterSpacing: -0.8 }, sub: { fontFamily: F.medium, fontSize: 18, lineHeight: 26 },
    label: { fontFamily: F.bold, fontSize: 10, lineHeight: 16, letterSpacing: 1.8 }, small: { fontSize: 12, lineHeight: 19, color: C.muted }, serif: { fontFamily: F.serif, fontSize: 24, lineHeight: 34, letterSpacing: -0.4 },
  };
  return <Text {...props} style={[{ fontFamily: F.body, color: C.ink }, styles[kind], style]}>{children}</Text>;
}
export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) { return <View style={[S.card, style]}>{children}</View>; }
export function Button({ title, onPress, icon: Icon = ArrowRight, secondary, compact, disabled, loading, style, accessibilityLabel }: { title: string; onPress: () => void; icon?: LucideIcon; secondary?: boolean; compact?: boolean; disabled?: boolean; loading?: boolean; style?: StyleProp<ViewStyle>; accessibilityLabel?: string }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel ?? title} accessibilityState={{ disabled: !!disabled || !!loading }} disabled={disabled || loading} onPress={onPress} style={({ pressed }) => [{ borderRadius: 13, minHeight: compact ? 42 : 50, paddingHorizontal: compact ? 16 : 20, paddingVertical: 11, backgroundColor: secondary ? '#FFFCF8' : C.green, borderColor: secondary ? C.line : C.green, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, opacity: disabled || loading ? 0.5 : pressed ? 0.75 : 1 }, style]}>
    <T style={{ color: secondary ? C.ink : '#FFFFFF', fontFamily: F.medium, fontSize: compact ? 13 : 14, flexShrink: 1, textAlign: 'center' }}>{title}</T>{loading ? <ActivityIndicator size="small" color={secondary ? C.ink : '#fff'} /> : <Icon size={17} color={secondary ? C.ink : '#fff'} strokeWidth={1.7} />}
  </Pressable>;
}
export function IconButton({ icon: Icon, label, onPress, color = C.ink, background = 'transparent', disabled }: { icon: LucideIcon; label: string; onPress: () => void; color?: string; background?: string; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} disabled={disabled} onPress={onPress} style={({ pressed }) => ({ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: background, opacity: disabled ? 0.3 : pressed ? 0.55 : 1 })}><Icon size={20} strokeWidth={1.6} color={color} /></Pressable>;
}
export function Chip({ title, selected, onPress, icon: Icon }: { title: string; selected?: boolean; onPress?: () => void; icon?: LucideIcon }) {
  return <Pressable disabled={!onPress} accessibilityRole={onPress ? 'button' : undefined} accessibilityState={{ selected }} onPress={onPress} style={({ pressed }) => ({ paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: selected ? C.green : C.paper, borderWidth: 1, borderColor: selected ? C.green : C.line, opacity: pressed ? 0.7 : 1, flexDirection: 'row', gap: 7, alignItems: 'center' })}>{Icon && <Icon size={15} color={selected ? '#fff' : C.ink} />}<T style={{ fontSize: 12, color: selected ? '#fff' : C.ink, fontFamily: F.medium }}>{title}</T></Pressable>;
}
export function Field({ label, ...props }: TextInputProps & { label: string }) { return <View style={{ gap: 8 }}><T kind="small" style={{ fontFamily: F.medium, color: C.ink }}>{label}</T><TextInput accessibilityLabel={label} placeholderTextColor="#9A887E" {...props} style={[S.input, props.multiline && { minHeight: 120, textAlignVertical: 'top' }, props.style]} /></View>; }
export function Avatar({ name, color = C.rose, size = 40 }: { name: string; color?: string; size?: number }) { return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: C.paper }}><T style={{ fontFamily: F.serif, fontSize: size * 0.4 }}>{name.slice(0, 1).toUpperCase()}</T></View>; }
export function CoupleAvatars({ names, size = 42 }: { names: string[]; size?: number }) { return <View style={{ flexDirection: 'row' }}><Avatar name={names[0] || 'Y'} size={size} /><View style={{ marginLeft: -10 }}><Avatar name={names[1] || '?'} color={C.pale} size={size} /></View></View>; }
export function Brand({ small = false }: { small?: boolean }) { return <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Heart size={small ? 20 : 25} color={C.green} strokeWidth={1.7} fill={C.rose} /><T style={{ fontFamily: F.serif, fontSize: small ? 24 : 30, letterSpacing: -1 }}>closer<T style={{ color: C.green, fontSize: small ? 26 : 32 }}>.</T></T></View>; }
export function Page({ children, title, subtitle, eyebrow, action }: { children: React.ReactNode; title?: string; subtitle?: string; eyebrow?: string; action?: React.ReactNode }) {
  const { width } = useWindowDimensions();
  return <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: width > 800 ? 38 : 22, paddingBottom: 50, width: '100%', maxWidth: 1200, alignSelf: 'center', gap: 24 }} keyboardShouldPersistTaps="handled">{title && <View style={[S.between, { alignItems: 'flex-end', marginBottom: 5 }]}><View style={{ flex: 1, gap: 8 }}>{eyebrow && <T kind="label" style={{ color: C.muted }}>{eyebrow}</T>}<T kind="title" style={{ fontSize: width < 400 ? 31 : 37 }}>{title}</T>{subtitle && <T style={{ color: C.muted }}>{subtitle}</T>}</View>{action}</View>}{children}</ScrollView>;
}
export function FormPage({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) { return <View style={{ flex: 1, backgroundColor: C.bg }}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ width: '100%', maxWidth: 650, alignSelf: 'center', padding: 25, paddingTop: 35, paddingBottom: 80, gap: 25 }}><View style={S.between}><Brand small /><IconButton icon={X} label="Close" onPress={() => router.canGoBack() ? router.back() : router.replace('/')} /></View><View style={{ gap: 8 }}><T kind="title">{title}</T>{subtitle && <T style={{ color: C.muted }}>{subtitle}</T>}</View>{children}</ScrollView></View>; }
export function SectionTitle({ title, link, onPress }: { title: string; link?: string; onPress?: () => void }) { return <View style={[S.between, { marginBottom: 15 }]}><T kind="sub">{title}</T>{link && <Pressable accessibilityRole="button" onPress={onPress} style={[S.row, { minHeight: 36, gap: 5 }]}><T kind="small" style={{ color: C.green, fontFamily: F.medium }}>{link}</T><ArrowRight color={C.green} size={14} /></Pressable>}</View>; }
export function Empty({ title, text, icon: Icon = Heart }: { title: string; text: string; icon?: LucideIcon }) { return <View style={{ padding: 28, alignItems: 'center', gap: 12 }}><Icon color={C.muted} size={30} strokeWidth={1.3} /><T kind="sub" style={{ textAlign: 'center' }}>{title}</T><T kind="small" style={{ textAlign: 'center', maxWidth: 300 }}>{text}</T></View>; }
export function BackLink() { return <Pressable accessibilityRole="button" onPress={() => router.canGoBack() ? router.back() : router.replace('/together')} style={[S.row, { minHeight: 44 }]}><ArrowLeft size={18} color={C.ink} /><T kind="small">Back to together</T></Pressable>; }

export function Bloom({ size = 220, color = '#C47A6A', calm = false }: { size?: number; color?: string; calm?: boolean }) {
  return <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}><Svg width={size} height={size} viewBox="0 0 240 240" style={{ position: 'absolute' }} accessibilityLabel="Little hearts around a teddy"><Path d="M40 68C12 48 26 27 40 42C54 27 68 48 40 68Z" fill={color} /><Path d="M200 55C180 40 190 26 200 36C210 26 220 40 200 55Z" fill="#D4A373" /><Path d="M202 188C182 173 192 159 202 169C212 159 222 173 202 188Z" fill="#B56557" /><Circle cx="32" cy="157" r="4" fill="#C9ADA1" /></Svg><PetPortrait kind="bear" resting={calm} size={size * 0.86} /></View>;
}
export function Postcard({ width = 260, height = 155 }: { width?: number | `${number}%`; height?: number }) {
  return <Svg width={width} height={height} viewBox="0 0 320 190" preserveAspectRatio="xMidYMid slice"><Rect width="320" height="190" fill="#F2E6D8" /><Circle cx="243" cy="48" r="24" fill="#E8B88A" /><Path d="M0 130 Q75 75 150 132 T320 105 V190 H0" fill="#D4B59E" /><Path d="M0 153 Q130 105 220 164 T320 143 V190 H0" fill="#A97C65" /><Path d="M161 190 Q165 163 203 145 Q232 132 223 122" stroke="#FAF3EB" strokeWidth="14" fill="none" /><Path d="M76 88 q9 -8 18 0 M96 67 q7 -6 14 0" stroke="#7A5646" strokeWidth="2" fill="none" /><Path d="M30 184 v-42 m-8 15 8 5 8-5" stroke="#6B4F3B" strokeWidth="3" /></Svg>;
}
export function DrawingPreview({ strokes, height = 250 }: { strokes: Stroke[]; height?: number }) { return <View style={{ height, backgroundColor: C.paper, borderRadius: 14, overflow: 'hidden' }}><Svg width="100%" height="100%" viewBox="0 0 320 320">{strokes.map(stroke => <Path key={stroke.id} d={strokePath(stroke)} stroke={stroke.color} strokeWidth={stroke.width} strokeLinecap="round" strokeLinejoin="round" fill="none" />)}</Svg></View>; }
