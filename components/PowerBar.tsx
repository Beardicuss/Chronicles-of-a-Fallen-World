import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Colors from '@/constants/colors';

interface PowerBarProps {
    label: string;
    value: number;
    maxValue: number;
    barColor: string;
    icon: string;
}

export default React.memo(function PowerBar({ label, value, maxValue, barColor, icon }: PowerBarProps) {
    const widthAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(widthAnim, {
            toValue: value / maxValue,
            friction: 8,
            tension: 40,
            useNativeDriver: false,
        }).start();
    }, [value, maxValue, widthAnim]);

    const widthInterpolation = widthAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
    });

    return (
        <View style={styles.container}>
            <View style={styles.labelRow}>
                <Text style={styles.icon}>{icon}</Text>
                <Text style={styles.label}>{label}</Text>
                <Text style={[styles.value, { color: barColor }]}>{value}/{maxValue}</Text>
            </View>
            <View style={styles.trackOuter}>
                <View style={styles.track}>
                    <Animated.View
                        style={[
                            styles.fill,
                            {
                                width: widthInterpolation,
                                backgroundColor: barColor,
                            },
                        ]}
                    />
                </View>
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    icon: {
        fontSize: 16,
        marginRight: 8,
    },
    label: {
        fontSize: 14,
        color: Colors.textSecondary,
        flex: 1,
        fontWeight: '600' as const,
        textTransform: 'uppercase' as const,
        letterSpacing: 1.2,
    },
    value: {
        fontSize: 14,
        fontWeight: '700' as const,
    },
    trackOuter: {
        borderRadius: 6,
        overflow: 'hidden',
    },
    track: {
        height: 8,
        backgroundColor: Colors.surfaceHighlight,
        borderRadius: 6,
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        borderRadius: 6,
    },
});
