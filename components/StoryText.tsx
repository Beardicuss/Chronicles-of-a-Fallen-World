import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import Colors from '@/constants/colors';

interface StoryTextProps {
    text: string;
    nodeId: string;
    speaker?: string;
    speakerColor?: string;
    onTextComplete?: () => void;
}

const CHAR_DELAY = 18;

export default React.memo(function StoryText({ text, nodeId, speaker, speakerColor, onTextComplete }: StoryTextProps) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [displayedLength, setDisplayedLength] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const textRef = useRef(text);
    const nodeRef = useRef(nodeId);

    useEffect(() => {
        if (nodeRef.current !== nodeId) {
            nodeRef.current = nodeId;
            textRef.current = text;
            setDisplayedLength(0);
            setIsComplete(false);
            fadeAnim.setValue(0);
        }

        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [nodeId, text, fadeAnim]);

    useEffect(() => {
        if (isComplete) return;

        intervalRef.current = setInterval(() => {
            setDisplayedLength((prev) => {
                const next = prev + 1;
                if (next >= text.length) {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    return text.length;
                }
                return next;
            });
        }, CHAR_DELAY);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [nodeId, text, isComplete]);

    useEffect(() => {
        if (displayedLength >= text.length && text.length > 0 && !isComplete) {
            setIsComplete(true);
            onTextComplete?.();
        }
    }, [displayedLength, text.length, isComplete, onTextComplete]);

    const handleSkip = useCallback(() => {
        if (!isComplete) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setDisplayedLength(text.length);
            setIsComplete(true);
            onTextComplete?.();
        }
    }, [isComplete, text, onTextComplete]);

    const visibleText = text.substring(0, displayedLength);
    const paragraphs = visibleText.split('\n\n');

    return (
        <Pressable onPress={handleSkip} style={styles.pressable}>
            <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
                {speaker && (
                    <View style={styles.speakerRow}>
                        <View style={[styles.speakerBadge, { backgroundColor: (speakerColor ?? Colors.crimson) + '25' }]}>
                            <View style={[styles.speakerDot, { backgroundColor: speakerColor ?? Colors.crimson }]} />
                            <Text style={[styles.speakerName, { color: speakerColor ?? Colors.crimson }]}>{speaker}</Text>
                        </View>
                    </View>
                )}
                <View style={styles.textArea}>
                    {paragraphs.map((paragraph, index) => (
                        <Text key={`${nodeId}-${index}`} style={styles.paragraph}>
                            {paragraph.trim()}
                        </Text>
                    ))}
                    {!isComplete && (
                        <Text style={styles.cursor}>|</Text>
                    )}
                </View>
                {!isComplete && (
                    <Text style={styles.tapHint}>Tap to skip</Text>
                )}
            </Animated.View>
        </Pressable>
    );
});

const styles = StyleSheet.create({
    pressable: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    speakerRow: {
        flexDirection: 'row',
        marginBottom: 10,
        paddingHorizontal: 16,
    },
    speakerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
        gap: 6,
    },
    speakerDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    speakerName: {
        fontSize: 13,
        fontWeight: '700' as const,
        letterSpacing: 1,
        textTransform: 'uppercase' as const,
    },
    textArea: {
        paddingHorizontal: 16,
        flex: 1,
    },
    paragraph: {
        fontSize: 15,
        lineHeight: 24,
        color: Colors.textNarrative,
        marginBottom: 10,
        letterSpacing: 0.2,
    },
    cursor: {
        color: Colors.crimson,
        fontSize: 15,
        fontWeight: '700' as const,
        position: 'absolute',
        bottom: 0,
        right: 16,
    },
    tapHint: {
        fontSize: 11,
        color: Colors.textMuted,
        textAlign: 'center',
        marginTop: 8,
        letterSpacing: 0.5,
    },
});
