import React from 'react';
import { View, ViewStyle } from 'react-native';
import Svg, { Path, Circle, Rect, Ellipse } from 'react-native-svg';

interface BalajiHundiProps {
  size?: number;
  style?: ViewStyle;
  color?: string;
}

export const BalajiHundi: React.FC<BalajiHundiProps> = ({
  size = 32,
  style,
  color = '#D97706', // Sacred Gold
}) => {
  return (
    <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        {/* Hundi Rim / Lid */}
        <Ellipse cx="50" cy="24" rx="26" ry="7" fill={color} />
        <Rect x="30" y="20" width="40" height="8" rx="3" fill="#B45309" />

        {/* Hundi Pot Body */}
        <Path
          d="M24 28 C16 45, 12 70, 24 85 C32 94, 68 94, 76 85 C88 70, 84 45, 76 28 Z"
          fill={color}
        />

        {/* Sacred Cloth / Garland knot on Hundi */}
        <Path
          d="M22 52 C35 60, 65 60, 78 52 C75 66, 25 66, 22 52 Z"
          fill="#DC2626"
        />

        {/* Central Auspicious Namam on Hundi */}
        <Path
          d="M44 68 L44 80 M56 68 L56 80 M50 64 L50 82"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <Path
          d="M50 67 L50 79"
          stroke="#DC2626"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Gold Coins Overflowing / Top Offering Slot */}
        <Circle cx="50" cy="18" r="7" fill="#FBBF24" stroke="#B45309" strokeWidth="2" />
        <Circle cx="40" cy="22" r="5" fill="#FDE68A" stroke="#B45309" strokeWidth="1.5" />
        <Circle cx="60" cy="22" r="5" fill="#FDE68A" stroke="#B45309" strokeWidth="1.5" />
      </Svg>
    </View>
  );
};
