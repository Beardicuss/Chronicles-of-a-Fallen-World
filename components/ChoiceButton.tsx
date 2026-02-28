import React, { useRef, useCallback } from 'react';
import {
    Text,
    StyleSheet,
    Pressable,
    Animated,
    Platform,
    View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { StoryChoice } from '@/constants/gameData';

interface ChoiceButtonProps {
    choice: StoryChoice;
    index: number;
    onPress: (choice: StoryChoice) => void;
}

export default React.memo(function ChoiceButton({ choice, index, onPress }: ChoiceButtonProps) {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 350,
            delay: 100 + index * 120,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim, index]);

    const handlePressIn = useCallback(() => {
        Animated.spring(scaleAnim, {
            toValue: 0.95,
            useNativeDriver: true,
        }).start();
    }, [scaleAnim]);

    const handlePressOut = useCallback(() => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 4,
            useNativeDriver: true,
        }).start();
    }, [scaleAnim]);

    const handlePress = useCallback(() => {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        onPress(choice);
    }, [choice, onPress]);

    return (
        <Animated.View
            style={[
                styles.wrapper,
                {
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }],
                },
            ]}
        >
            <Pressable
                style={styles.button}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={handlePress}
                testID={`choice-${choice.id}`}
            >
                <View style={styles.indexBadge}>
                    <Text style={styles.indexText}>{index + 1}</Text>
                </View>
                <Text style={styles.buttonText}>{choice.text}</Text>
            </Pressable>
        </Animated.View>
    );
});

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: 8,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(10, 10, 10, 0.85)',
        borderWidth: 1,
        borderColor: 'rgba(196, 30, 61, 0.3)',
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 14,
        gap: 12,
    },
    indexBadge: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: Colors.crimson,
        alignItems: 'center',
        justifyContent: 'center',
    },
    indexText: {
        fontSize: 13,
        fontWeight: '700' as const,
        color: Colors.white,
    },
    buttonText: {
        fontSize: 14,
        color: Colors.textPrimary,
        flex: 1,
        fontWeight: '500' as const,
        letterSpacing: 0.2,
        lineHeight: 20,
    },
});
