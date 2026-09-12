import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type FlowerType = 'marigold' | 'lotus' | 'jasmine' | 'rose';

interface FlowerConfig {
  id: number;
  type: FlowerType;
  startX: number;
  size: number;
  duration: number;
  delay: number;
  swayDist: number;
  swayDuration: number;
  spinDir: number;
}

const FlowerGraphic: React.FC<{ type: FlowerType; size: number }> = ({ type, size }) => {
  switch (type) {
    case 'marigold':
      // Golden Temple Marigold
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle cx="12" cy="12" r="3.5" fill="#B45309" />
          <Circle cx="12" cy="5" r="3" fill="#F59E0B" />
          <Circle cx="17" cy="7" r="3" fill="#FBBF24" />
          <Circle cx="19" cy="12" r="3" fill="#F59E0B" />
          <Circle cx="17" cy="17" r="3" fill="#FBBF24" />
          <Circle cx="12" cy="19" r="3" fill="#F59E0B" />
          <Circle cx="7" cy="17" r="3" fill="#FBBF24" />
          <Circle cx="5" cy="12" r="3" fill="#F59E0B" />
          <Circle cx="7" cy="7" r="3" fill="#FBBF24" />
        </Svg>
      );
    case 'lotus':
      // Pink Sacred Lotus Petal
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path
            d="M12 2 C7 8, 4 14, 7 19 C9.5 22, 14.5 22, 17 19 C20 14, 17 8, 12 2 Z"
            fill="#F472B6"
          />
          <Path
            d="M12 5 C10 9, 8.5 14, 10.5 18"
            stroke="#FB7185"
            strokeWidth="1"
            fill="none"
          />
        </Svg>
      );
    case 'jasmine':
      // Sacred Sandalwood Jasmine Floret
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle cx="12" cy="12" r="2.5" fill="#FDE68A" />
          <Path d="M12 3 C10.5 7, 10.5 9, 12 11 C13.5 9, 13.5 7, 12 3 Z" fill="#FFFDF5" />
          <Path d="M21 12 C17 10.5, 15 10.5, 13 12 C15 13.5, 17 13.5, 21 12 Z" fill="#FFFDF5" />
          <Path d="M12 21 C10.5 17, 10.5 15, 12 13 C13.5 15, 13.5 17, 12 21 Z" fill="#FFFDF5" />
          <Path d="M3 12 C7 10.5, 9 10.5, 11 12 C9 13.5, 7 13.5, 3 12 Z" fill="#FFFDF5" />
        </Svg>
      );
    case 'rose':
      // Deep Sacred Kumkum Rose Petal
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path
            d="M5 8 C5 3, 19 3, 19 8 C19 15, 12 21, 12 21 C12 21, 5 15, 5 8 Z"
            fill="#E11D48"
          />
        </Svg>
      );
  }
};

const SingleFlower: React.FC<{ config: FlowerConfig }> = ({ config }) => {
  const fallAnim = useRef(new Animated.Value(0)).current;
  const swayAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Vertical falling loop
    const startFalling = () => {
      fallAnim.setValue(0);
      Animated.timing(fallAnim, {
        toValue: 1,
        duration: config.duration,
        delay: config.delay,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => {
        // Reset delay to 0 for subsequent loops so flow is continuous
        config.delay = Math.random() * 800;
        startFalling();
      });
    };

    // 2. Horizontal swaying loop (drifting naturally left and right)
    const swayLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(swayAnim, {
          toValue: 1,
          duration: config.swayDuration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(swayAnim, {
          toValue: -1,
          duration: config.swayDuration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // 3. Rotation loop
    const rotateLoop = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: config.duration * 0.8,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    startFalling();
    swayLoop.start();
    rotateLoop.start();

    return () => {
      swayLoop.stop();
      rotateLoop.stop();
    };
  }, []);

  const translateY = fallAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-40, SCREEN_HEIGHT + 40],
  });

  const translateX = swayAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-config.swayDist, config.swayDist],
  });

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: config.spinDir > 0 ? ['0deg', '360deg'] : ['360deg', '0deg'],
  });

  const opacity = fallAnim.interpolate({
    inputRange: [0, 0.08, 0.88, 1],
    outputRange: [0, 0.9, 0.9, 0],
  });

  return (
    <Animated.View
      style={[
        styles.flowerItem,
        {
          left: config.startX,
          opacity,
          transform: [{ translateY }, { translateX }, { rotate }],
        },
      ]}
      pointerEvents="none"
    >
      <FlowerGraphic type={config.type} size={config.size} />
    </Animated.View>
  );
};

export const FallingFlowers: React.FC<{ count?: number }> = ({ count = 22 }) => {
  const flowersRef = useRef<FlowerConfig[]>([]);

  if (flowersRef.current.length === 0) {
    const types: FlowerType[] = ['marigold', 'lotus', 'jasmine', 'rose'];
    const list: FlowerConfig[] = [];

    for (let i = 0; i < count; i++) {
      const type = types[i % types.length];
      const startX = Math.random() * (SCREEN_WIDTH - 30);
      const size = Math.floor(Math.random() * 10) + 16; // 16px to 26px
      const duration = Math.floor(Math.random() * 1800) + 2600; // 2.6s to 4.4s
      const delay = Math.random() * 2200; // Staggered initial starts
      const swayDist = Math.floor(Math.random() * 22) + 14; // 14px to 36px sway
      const swayDuration = Math.floor(Math.random() * 800) + 1200;
      const spinDir = Math.random() > 0.5 ? 1 : -1;

      list.push({
        id: i,
        type,
        startX,
        size,
        duration,
        delay,
        swayDist,
        swayDuration,
        spinDir,
      });
    }
    flowersRef.current = list;
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {flowersRef.current.map((config) => (
        <SingleFlower key={config.id} config={config} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  flowerItem: {
    position: 'absolute',
    top: 0,
  },
});
