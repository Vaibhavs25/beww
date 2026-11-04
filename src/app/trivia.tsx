import React from 'react';
import { View } from 'react-native';
import { BackLink, Page } from '../components/ui';
import { RelationshipQuiz } from '../components/relationship-quiz';

export default function TriviaScreen() {
  return (
    <Page
      title="How well do you know me?"
      subtitle="Write playful trivia about yourselves, guess each other’s answers, and build your score together."
      eyebrow="RELATIONSHIP QUIZ"
    >
      <BackLink />
      <View style={{ maxWidth: 680, width: '100%', alignSelf: 'center', gap: 20 }}>
        <RelationshipQuiz />
      </View>
    </Page>
  );
}
