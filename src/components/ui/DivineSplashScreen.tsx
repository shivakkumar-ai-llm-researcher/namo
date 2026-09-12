import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
  TouchableWithoutFeedback,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FallingFlowers } from './FallingFlowers';

interface DivineSplashScreenProps {
  onFinish?: () => void;
  minDuration?: number;
}

const { width } = Dimensions.get('window');
const IMAGE_SIZE = Math.min(Math.round(width * 0.54), 210);

export const DivineSplashScreen: React.FC<DivineSplashScreenProps> = ({
  onFinish,
  minDuration = 2500,
}) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const imageScaleAnim = useRef(new Animated.Value(0.9)).current;
  const haloScaleAnim = useRef(new Animated.Value(1)).current;
  const haloOpacityAnim = useRef(new Animated.Value(0.4)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;
  const textTranslateAnim = useRef(new Animated.Value(18)).current;
  const exitFadeAnim = useRef(new Animated.Value(1)).current;
  const hasExited = useRef(false);

  const handleExit = () => {
    if (hasExited.current) return;
    hasExited.current = true;

    Animated.timing(exitFadeAnim, {
      toValue: 0,
      duration: 500,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      if (onFinish) {
        onFinish();
      }
    });
  };

  useEffect(() => {
    // 1. Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(imageScaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(textFadeAnim, {
        toValue: 1,
        duration: 800,
        delay: 350,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(textTranslateAnim, {
        toValue: 0,
        duration: 800,
        delay: 350,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Subtle, elegant breathing halo animation (constrained so it never overlaps)
    const haloAnimation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(haloScaleAnim, {
            toValue: 1.08,
            duration: 1600,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(haloOpacityAnim, {
            toValue: 0.75,
            duration: 1600,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(haloScaleAnim, {
            toValue: 1.0,
            duration: 1600,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(haloOpacityAnim, {
            toValue: 0.35,
            duration: 1600,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    haloAnimation.start();

    // 3. Automatic transition after duration
    const timer = setTimeout(() => {
      handleExit();
    }, minDuration);

    return () => {
      clearTimeout(timer);
      haloAnimation.stop();
    };
  }, []);

  return (
    <TouchableWithoutFeedback onPress={handleExit}>
      <Animated.View
        style={[
          styles.container,
          {
            opacity: exitFadeAnim,
          },
        ]}
      >
        <LinearGradient
          colors={['#3D0707', '#751717', '#851D1D', '#5E1010', '#2E0505']}
          locations={[0, 0.3, 0.55, 0.8, 1]}
          style={StyleSheet.absoluteFill}
        />

        {/* Sacred Falling Flowers (Pushpa Vrishti) */}
        <FallingFlowers count={26} />

        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Divine Centerpiece: Balaji Portrait with Soft Golden Halo */}
          <View style={styles.centerpieceContainer}>
            {/* Outer Subtle Golden Aura */}
            <Animated.View
              style={[
                styles.haloOuterRing,
                {
                  transform: [{ scale: haloScaleAnim }],
                  opacity: haloOpacityAnim,
                },
              ]}
            />

            {/* Circular Portal Frame with Lord Balaji Portrait */}
            <Animated.View
              style={[
                styles.imageFrame,
                {
                  transform: [{ scale: imageScaleAnim }],
                },
              ]}
            >
              <Image
                source={require('../../../assets/balaji_divine.jpg')}
                style={styles.balajiImage}
                resizeMode="cover"
              />
              {/* Inner Golden Rim */}
              <View style={styles.goldRimOverlay} />
            </Animated.View>
          </View>

          {/* Sacred Vedic Chanting and App Title with Clean Spacing */}
          <Animated.View
            style={[
              styles.textContainer,
              {
                opacity: textFadeAnim,
                transform: [{ translateY: textTranslateAnim }],
              },
            ]}
          >
            {/* Vedic Shloka */}
            <Text style={styles.mantraText}>॥ ॐ நமோ வேங்கடேசாய ॥</Text>

            {/* Srivari Title - Clean Typography without box shadow artifacts */}
            <Text style={styles.titleText}>SRIVARI COMMUNITY FUND</Text>

            {/* Gold Trim Decorative Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerDot}>✦</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Subtitle */}
            <Text style={styles.subtitleText}>
              Tirupati Balaji Devotees Financial Seva & Accounting
            </Text>
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    zIndex: 99999,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#851D1D',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  centerpieceContainer: {
    width: IMAGE_SIZE + 32,
    height: IMAGE_SIZE + 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  haloOuterRing: {
    position: 'absolute',
    width: IMAGE_SIZE + 24,
    height: IMAGE_SIZE + 24,
    borderRadius: (IMAGE_SIZE + 24) / 2,
    borderWidth: 2,
    borderColor: '#F59E0B',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
  },
  imageFrame: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: IMAGE_SIZE / 2,
    borderWidth: 3.5,
    borderColor: '#D97706',
    overflow: 'hidden',
    backgroundColor: '#3A0B0B',
  },
  balajiImage: {
    width: '100%',
    height: '100%',
  },
  goldRimOverlay: {
    ...StyleSheet.absoluteFill,
    borderRadius: IMAGE_SIZE / 2,
    borderWidth: 1.5,
    borderColor: 'rgba(253, 230, 138, 0.45)',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  mantraText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FDE68A',
    letterSpacing: 2,
    marginBottom: 10,
    textAlign: 'center',
    textShadowColor: 'rgba(217, 119, 6, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  titleText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 4,
    width: 160,
    justifyContent: 'center',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(245, 158, 11, 0.4)',
  },
  dividerDot: {
    fontSize: 10,
    color: '#F59E0B',
  },
  subtitleText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(254, 243, 199, 0.85)',
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 290,
    lineHeight: 18,
  },
});
