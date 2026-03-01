import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    Animated,
    Easing,
    TouchableWithoutFeedback,
    Platform,
    Dimensions,
} from 'react-native';

// ─── ASSET PATH ──────────────────────────────────────────────────────────────
const SOFTCURSE_LOGO = require('@/assets/game/intro/logo.png');

// ─── VIDEO PATHS (paste your video paths here when ready) ────────────────────
// const INTRO_VIDEO_1 = require('@/assets/videos/intro1.mp4');
// const INTRO_VIDEO_2 = require('@/assets/videos/intro2.mp4');

// ─── RESPONSIVE SIZING ───────────────────────────────────────────────────────
const { width: W, height: H } = Dimensions.get('window');
const isTablet = W >= 768;
const isDesktop = W >= 1200;
const SCALE = isDesktop ? 1.6 : isTablet ? 1.5 : 1.0;

const LOGO_SIZE = Math.round(160 * SCALE);
const FONT_COMPANY = Math.round(32 * SCALE);
const FONT_TAGLINE = Math.round(11 * SCALE);
const FONT_ORNAMENT = Math.round(14 * SCALE);
const FONT_LABEL = Math.round(11 * SCALE);
const FONT_BOOK_TITLE = Math.round(42 * SCALE);
const FONT_BOOK_SUB = Math.round(22 * SCALE);
const FONT_ORNAMENT_SM = Math.round(10 * SCALE);
const FONT_PROMPT = Math.round(11 * SCALE);
const DIVIDER_W = Math.round(120 * SCALE);
const DIVIDER_W_SM = Math.round(60 * SCALE);

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface GlitchSlice {
    y: number;
    h: number;
    offsetX: number;
    opacity: number;
    dark: boolean;
    red: boolean;
}

interface StaticPatch {
    x: number; y: number;
    w: number; h: number;
    opacity: number;
    variant: number;
}

type Phase =
    | 'black_start' | 'glitch_in' | 'logo_show'
    | 'glitch_out' | 'black_mid' | 'title_show'
    | 'wait_input' | 'done';

interface Props { onComplete: () => void; }

export default function SplashScreen({ onComplete }: Props) {
    const [phase, setPhase] = useState<Phase>('black_start');
    const [slices, setSlices] = useState<GlitchSlice[]>([]);
    const [patches, setPatches] = useState<StaticPatch[]>([]);
    const [showBlackout, setShowBlackout] = useState(false);
    const [showPrompt, setShowPrompt] = useState(false);

    const logoOpacity = useRef(new Animated.Value(0)).current;
    const logoTranslate = useRef(new Animated.Value(20)).current;
    const titleOpacity = useRef(new Animated.Value(0)).current;
    const titleScale = useRef(new Animated.Value(0.95)).current;
    const promptOpacity = useRef(new Animated.Value(0)).current;
    const glitchOpacity = useRef(new Animated.Value(0)).current;
    const vignetteAnim = useRef(new Animated.Value(0)).current;

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Horror glitch frame — scan tears + static + blackout flicker
    const generateHorrorFrame = () => {
        const newSlices: GlitchSlice[] = [];
        const count = 2 + Math.floor(Math.random() * 5);
        for (let i = 0; i < count; i++) {
            newSlices.push({
                y: Math.random(),
                h: 1 + Math.random() * 18,
                offsetX: (Math.random() - 0.5) * 50,
                opacity: 0.35 + Math.random() * 0.65,
                dark: Math.random() > 0.35,
                red: Math.random() > 0.72,
            });
        }
        setSlices(newSlices);

        const newPatches: StaticPatch[] = [];
        const pCount = 1 + Math.floor(Math.random() * 4);
        for (let i = 0; i < pCount; i++) {
            newPatches.push({
                x: Math.random() * 0.85,
                y: Math.random() * 0.85,
                w: 0.04 + Math.random() * 0.22,
                h: 0.015 + Math.random() * 0.1,
                opacity: 0.08 + Math.random() * 0.28,
                variant: Math.floor(Math.random() * 3),
            });
        }
        setPatches(newPatches);

        // Brief blackout flash
        if (Math.random() > 0.6) {
            setShowBlackout(true);
            setTimeout(() => setShowBlackout(false), 30 + Math.random() * 70);
        }
    };

    const startHorrorGlitch = (duration: number, onDone: () => void) => {
        Animated.timing(glitchOpacity, { toValue: 1, duration: 50, useNativeDriver: true }).start();

        // Vignette flicker during glitch
        Animated.sequence([
            Animated.timing(vignetteAnim, { toValue: 1.0, duration: 60, useNativeDriver: true }),
            Animated.timing(vignetteAnim, { toValue: 0.3, duration: 120, useNativeDriver: true }),
            Animated.timing(vignetteAnim, { toValue: 0.9, duration: 50, useNativeDriver: true }),
            Animated.timing(vignetteAnim, { toValue: 0.2, duration: 200, useNativeDriver: true }),
        ]).start();

        intervalRef.current = setInterval(generateHorrorFrame, 50);

        setTimeout(() => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setSlices([]);
            setPatches([]);
            setShowBlackout(false);
            Animated.timing(glitchOpacity, { toValue: 0, duration: 80, useNativeDriver: true }).start(onDone);
        }, duration);
    };

    useEffect(() => {
        const timeline = async () => {
            await delay(700);

            setPhase('glitch_in');
            await new Promise<void>(resolve => startHorrorGlitch(480, () => resolve()));

            setPhase('logo_show');
            Animated.parallel([
                Animated.timing(logoOpacity, { toValue: 1, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
                Animated.timing(logoTranslate, { toValue: 0, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
                // Vignette slowly bleeds in during logo show
                Animated.timing(vignetteAnim, { toValue: 0.45, duration: 900, useNativeDriver: true }),
            ]).start();

            await delay(2000);

            setPhase('glitch_out');
            await new Promise<void>(resolve => startHorrorGlitch(700, () => resolve()));

            // Hard cut to black
            Animated.timing(logoOpacity, { toValue: 0, duration: 60, useNativeDriver: true }).start();
            Animated.timing(vignetteAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start();

            await delay(450);
            setPhase('black_mid');
            await delay(650);

            setPhase('title_show');
            Animated.parallel([
                Animated.timing(titleOpacity, { toValue: 1, duration: 2000, easing: Easing.out(Easing.quad), useNativeDriver: true }),
                Animated.timing(titleScale, { toValue: 1, duration: 2000, easing: Easing.out(Easing.quad), useNativeDriver: true }),
                // Vignette creeps back in — heavy, oppressive
                Animated.timing(vignetteAnim, { toValue: 0.65, duration: 2000, useNativeDriver: true }),
            ]).start();

            await delay(2200);

            setPhase('wait_input');
            setShowPrompt(true);
            // Very slow pulse — like a heartbeat
            Animated.loop(
                Animated.sequence([
                    Animated.timing(promptOpacity, { toValue: 1, duration: 1400, useNativeDriver: true }),
                    Animated.timing(promptOpacity, { toValue: 0.05, duration: 1400, useNativeDriver: true }),
                ])
            ).start();
        };

        timeline();
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, []);

    const handleTouch = () => {
        if (phase !== 'wait_input') return;
        setPhase('done');
        Animated.parallel([
            Animated.timing(titleOpacity, { toValue: 0, duration: 900, useNativeDriver: true }),
            Animated.timing(promptOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
            Animated.timing(vignetteAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
        ]).start(() => onComplete());
    };

    const isLogoPhase = phase === 'glitch_in' || phase === 'logo_show' || phase === 'glitch_out';
    const isTitlePhase = phase === 'title_show' || phase === 'wait_input' || phase === 'done';

    // Vignette: interpolate opacity from 0→0.65
    const vignetteOpacity = vignetteAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    return (
        <TouchableWithoutFeedback onPress={handleTouch}>
            <View style={styles.root}>

                {/* ── VIGNETTE — thick dark border crushing inward ── */}
                <Animated.View
                    style={[styles.vignette, { opacity: vignetteOpacity }]}
                    pointerEvents="none"
                />

                {/* ── HORROR GLITCH OVERLAY ── */}
                <Animated.View
                    style={[styles.glitchOverlay, { opacity: glitchOpacity }]}
                    pointerEvents="none"
                >
                    {/* Full blackout flicker */}
                    {showBlackout && <View style={StyleSheet.absoluteFillObject as any} />}

                    {/* Scan-line tears */}
                    {slices.map((s, i) => (
                        <View
                            key={i}
                            style={{
                                position: 'absolute',
                                top: `${s.y * 100}%` as any,
                                left: 0,
                                right: 0,
                                height: s.h,
                                transform: [{ translateX: s.offsetX }],
                                opacity: s.opacity,
                                backgroundColor: s.red
                                    ? `rgba(90,0,0,0.85)`
                                    : s.dark
                                        ? `rgba(0,0,0,0.9)`
                                        : `rgba(220,210,200,0.12)`,
                            }}
                        />
                    ))}

                    {/* Static noise patches */}
                    {patches.map((p, i) => (
                        <View
                            key={`p${i}`}
                            style={{
                                position: 'absolute',
                                left: `${p.x * 100}%` as any,
                                top: `${p.y * 100}%` as any,
                                width: `${p.w * 100}%` as any,
                                height: `${p.h * 100}%` as any,
                                opacity: p.opacity,
                                backgroundColor:
                                    p.variant === 0 ? 'rgba(255,255,255,0.04)'
                                        : p.variant === 1 ? 'rgba(0,0,0,0.6)'
                                            : 'rgba(50,0,0,0.35)',
                            }}
                        />
                    ))}

                    {/* VHS vertical damage lines */}
                    {[0, 1].map((_, i) => (
                        <View
                            key={`vl${i}`}
                            style={{
                                position: 'absolute',
                                top: 0, bottom: 0,
                                left: `${15 + i * 55 + Math.random() * 12}%` as any,
                                width: 1,
                                opacity: 0.06 + Math.random() * 0.1,
                                backgroundColor: 'rgba(200,190,180,0.4)',
                            }}
                        />
                    ))}
                </Animated.View>

                {/* ── SOFTCURSE LOGO ── */}
                {isLogoPhase && (
                    <Animated.View style={[styles.logoContainer, {
                        opacity: logoOpacity,
                        transform: [{ translateY: logoTranslate }],
                    }]}>
                        <Image source={SOFTCURSE_LOGO} style={styles.logo} resizeMode="contain" />
                        <Text style={styles.companyName}>SOFTCURSE</Text>
                        <View style={styles.companyDivider} />
                        <Text style={styles.companyTagline}>STUDIOS</Text>
                    </Animated.View>
                )}

                {/* ── TITLE SCREEN ── */}
                {isTitlePhase && (
                    <Animated.View style={[styles.titleContainer, {
                        opacity: titleOpacity,
                        transform: [{ scale: titleScale }],
                    }]}>
                        <Text style={styles.ornament}>✦ ✦ ✦</Text>
                        <Text style={styles.bookLabel}>CHRONICLES OF A FALLEN WORLD</Text>
                        <View style={styles.titleDivider} />
                        <Text style={styles.bookTitle}>Book I</Text>
                        <Text style={styles.bookSubtitle}>Awaken</Text>
                        <View style={styles.titleDivider} />
                        <Text style={styles.ornamentSmall}>— The Architect Returns —</Text>
                    </Animated.View>
                )}

                {/* ── PROMPT ── */}
                {showPrompt && (
                    <Animated.Text style={[styles.prompt, { opacity: promptOpacity }]}>
                        TOUCH TO CONTINUE
                    </Animated.Text>
                )}
            </View>
        </TouchableWithoutFeedback>
    );
}

function delay(ms: number) {
    return new Promise<void>(resolve => setTimeout(resolve, ms));
}

const VIGNETTE_BORDER = Math.round(W * 0.14);

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Thick dark border that crushes in from all sides
    vignette: {
        ...StyleSheet.absoluteFillObject,
        borderWidth: VIGNETTE_BORDER,
        borderColor: 'rgba(0,0,0,0.92)',
        zIndex: 10,
    },

    glitchOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'transparent',
        zIndex: 20,
    },

    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 5,
    },
    logo: {
        width: LOGO_SIZE,
        height: LOGO_SIZE,
        marginBottom: Math.round(20 * SCALE),
    },
    companyName: {
        color: '#9b59b6',
        fontSize: FONT_COMPANY,
        fontWeight: '700',
        letterSpacing: Math.round(12 * SCALE),
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    companyDivider: {
        width: DIVIDER_W_SM,
        height: 1,
        backgroundColor: 'rgba(155,89,182,0.4)',
        marginVertical: Math.round(8 * SCALE),
    },
    companyTagline: {
        color: 'rgba(155,89,182,0.5)',
        fontSize: FONT_TAGLINE,
        letterSpacing: Math.round(8 * SCALE),
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },

    titleContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Math.round(40 * SCALE),
        zIndex: 5,
    },
    ornament: {
        color: 'rgba(196,30,61,0.45)',
        fontSize: FONT_ORNAMENT,
        letterSpacing: Math.round(8 * SCALE),
        marginBottom: Math.round(24 * SCALE),
    },
    bookLabel: {
        color: 'rgba(180,160,140,0.38)',
        fontSize: FONT_LABEL,
        letterSpacing: Math.round(6 * SCALE),
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        textAlign: 'center',
        marginBottom: Math.round(16 * SCALE),
    },
    titleDivider: {
        width: DIVIDER_W,
        height: 1,
        backgroundColor: 'rgba(196,30,61,0.2)',
        marginVertical: Math.round(14 * SCALE),
    },
    bookTitle: {
        color: 'rgba(210,190,170,0.82)',
        fontSize: FONT_BOOK_TITLE,
        fontWeight: '700',
        letterSpacing: Math.round(6 * SCALE),
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        textAlign: 'center',
        marginBottom: Math.round(6 * SCALE),
    },
    bookSubtitle: {
        color: '#901428',
        fontSize: FONT_BOOK_SUB,
        fontWeight: '400',
        letterSpacing: Math.round(10 * SCALE),
        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
        fontStyle: 'italic',
        textAlign: 'center',
    },
    ornamentSmall: {
        color: 'rgba(150,110,90,0.32)',
        fontSize: FONT_ORNAMENT_SM,
        letterSpacing: Math.round(3 * SCALE),
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        fontStyle: 'italic',
    },

    prompt: {
        position: 'absolute',
        bottom: '10%',
        color: 'rgba(170,130,50,0.65)',
        fontSize: FONT_PROMPT,
        letterSpacing: Math.round(5 * SCALE),
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        zIndex: 5,
    },
});