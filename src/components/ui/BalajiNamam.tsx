import React from 'react';
import { View, ViewStyle } from 'react-native';
import Svg, { Path, G, Rect } from 'react-native-svg';

interface BalajiNamamProps {
  size?: number;
  style?: ViewStyle;
  variant?: 'gold' | 'white' | 'colored';
}

export const BalajiNamam: React.FC<BalajiNamamProps> = ({
  size = 40,
  style,
  variant = 'colored',
}) => {
  const outerColor = variant === 'gold' ? '#F59E0B' : '#FFFFFF';
  const innerColor = '#DC2626'; // Sacred Kumkum Red

  // Proportional height is 1.25x width
  const height = size * 1.2;

  return (
    <View style={[{ width: size, height, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Svg width={size} height={height} viewBox="0 0 100 120" fill="none">
        {/* Left White Prong (Vishnu Padam) */}
        <Path
          d="M20 10 C20 45, 28 85, 45 105 C48 108, 48 114, 44 116 C38 118, 30 114, 25 108 C12 85, 8 45, 8 10 C8 6, 12 4, 15 5 C18 6, 20 8, 20 10 Z"
          fill={outerColor}
        />

        {/* Right White Prong (Vishnu Padam) */}
        <Path
          d="M80 10 C80 45, 72 85, 55 105 C52 108, 52 114, 56 116 C62 118, 70 114, 75 108 C88 85, 92 45, 92 10 C92 6, 88 4, 85 5 C82 6, 80 8, 80 10 Z"
          fill={outerColor}
        />

        {/* Bottom Connecting Base */}
        <Path
          d="M38 102 C45 110, 55 110, 62 102 C58 112, 42 112, 38 102 Z"
          fill={outerColor}
        />

        {/* Central Sacred Kumkum / Srichurnam Tilakam */}
        <Path
          d="M47 18 C47 14, 53 14, 53 18 L53 92 C53 96, 47 96, 47 92 Z"
          fill={innerColor}
        />
        {/* Top Flame of Tilak */}
        <Path
          d="M50 8 C48 12, 47 15, 50 18 C53 15, 52 12, 50 8 Z"
          fill={innerColor}
        />
      </Svg>
    </View>
  );
};
