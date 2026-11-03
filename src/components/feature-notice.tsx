import React from 'react';
import { router } from 'expo-router';
import { useSpace } from '../store';
import { Button, Card, T } from './ui';

export function FeatureNotice() {
  const { space } = useSpace();
  if (space.featuresReady) return null;
  return <Card style={{ gap: 12 }}><T kind="sub">{space.profiles.length < 2 ? 'Make this space yours, together.' : 'A little more is on its way.'}</T><T kind="small">{space.profiles.length < 2 ? 'Connect your partner to chat, adopt a pet, and plan your next date.' : 'Chat, pets, and the new date planner aren’t available in your live space yet. Your existing shared moments are still here.'}</T>{space.profiles.length < 2 && <Button title="Connect our phones" secondary onPress={() => router.push('/connect')} />}</Card>;
}
