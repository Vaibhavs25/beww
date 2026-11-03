import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { DMSans_400Regular } from '@expo-google-fonts/dm-sans/400Regular';
import { DMSans_500Medium } from '@expo-google-fonts/dm-sans/500Medium';
import { DMSans_700Bold } from '@expo-google-fonts/dm-sans/700Bold';
import { Lora_400Regular } from '@expo-google-fonts/lora/400Regular';
import { Lora_400Regular_Italic } from '@expo-google-fonts/lora/400Regular_Italic';
import { SpaceProvider, useSpace } from '../store';
import { Notices } from '../components/shell';
import { C } from '../components/ui';
import { CallBanner, CallProvider } from '../calls';
import { CallAudio } from '../components/call-audio';

export default function RootLayout() {
  const [loaded, error] = useFonts({ DMSans_400Regular, DMSans_500Medium, DMSans_700Bold, Lora_400Regular, Lora_400Regular_Italic });
  if (!loaded && !error) return <View style={{ flex: 1, backgroundColor: C.bg, justifyContent: 'center' }}><ActivityIndicator color={C.green} /></View>;
  return <SafeAreaProvider><SpaceProvider><Screens /></SpaceProvider></SafeAreaProvider>;
}
function Screens() {
  const { ready, demo, userId, space } = useSpace();
  if (!ready) return <View style={{ flex: 1, backgroundColor: C.bg, justifyContent: 'center' }}><ActivityIndicator color={C.green} /></View>;
  // Reset private drafts and media as well as the data cache when the account changes.
  return <CallProvider key={`${demo}:${userId}:${space.id}`}><StatusBar style="dark" /><SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.bg }, animation: 'fade' }} /><CallAudio /><CallBanner /><Notices /></SafeAreaView></CallProvider>;
}
