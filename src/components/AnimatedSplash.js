import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { colors } from '../constants/theme';

// Animation is 2s at 60fps (confirmed from the exported Lottie JSON).
// Safety fallback fires slightly after that in case onAnimationFinish
// doesn't fire for some reason (malformed export, dropped frames on a
// slow device) — without this, a misfire would leave the splash stuck
// on screen forever.
const ANIMATION_DURATION_MS = 2000;
const SAFETY_TIMEOUT_MS = ANIMATION_DURATION_MS + 800;

export default function AnimatedSplash({ onFinish }) {
  const animationRef = useRef(null);
  const finishedRef = useRef(false);

  const handleFinish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onFinish();
  };

  useEffect(() => {
    const timeout = setTimeout(handleFinish, SAFETY_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.container}>
      <LottieView
        ref={animationRef}
        source={require('../../assets/animations/hack-hub-splash.json')}
        autoPlay
        loop={false}
        onAnimationFinish={handleFinish}
        style={styles.animation}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  animation: { width: '100%', height: '100%' },
});