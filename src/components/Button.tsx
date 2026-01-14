import Colors from '@/constants/Colors';
import React, { forwardRef } from 'react';
import {
    Pressable,
    StyleSheet,
    Text,
    View,
    type PressableProps,
} from 'react-native';

type ButtonProps = {
  text: string;
} & PressableProps;

const Button = forwardRef<View | null, ButtonProps>(
  ({ text, style, ...pressableProps }, ref) => {
    return (
      <Pressable
        ref={ref}
        {...pressableProps}
        style={(state) => [
          styles.container,
          typeof style === 'function' ? style(state) : style,
        ]}
      >
        <Text style={styles.text}>{text}</Text>
      </Pressable>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.tint,
    padding: 15,
    alignItems: 'center',
    borderRadius: 100,
    marginVertical: 10,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default Button;
