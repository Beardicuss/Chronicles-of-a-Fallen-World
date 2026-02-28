import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Animated,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield, Swords, Zap, Heart, Wind, Book, Trash2, Save } from 'lucide-react-native';
import { useGame } from '@/contexts/GameContext';

interface StatBarProps {
    label: string;
    value: number;
    maxValue: number;
    color: string;
    icon: React.ReactNode;
}

function StatBar({ label, value, maxValue, color, icon }: StatBarProps) {
    const animWidth = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(animWidth, {
            toValue: value / maxValue,
            duration: 800,
            useNativeDriver: false,
        }).start();
    }, [value, maxValue, animWidth]);

    return (
        <View style={statStyles.row}>
            <View style={statStyles.iconWrap}>{icon}</View>
            <View style={statStyles.info}>
                <View style={statStyles.labelRow}>
                    <Text style={statStyles.label}>{label}</Text>
                    <Text style={[statStyles.value, { color }]}>{value}</Text>
                </View>
                <View style={statStyles.track}>
                    <Animated.View
                        style={[
                            statStyles.fill,
                            {
                                backgroundColor: color,
                                width: animWidth.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: ['0%', '100%'],
                                }),
                            },
                        ]}
                    />
                </View>
            </View>
        </View>
    );
}

const statStyles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 18,
    },
    iconWrap: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.04)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    info: {
        flex: 1,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    label: {
        fontSize: 12,
        fontWeight: '600' as const,
        color: '#9a9088',
        letterSpacing: 0.5,
        textTransform: 'uppercase' as const,
    },
    value: {
        fontSize: 13,
        fontWeight: '700' as const,
    },
    track: {
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.06)',
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        borderRadius: 3,
    },
});

const CONTROLS_INFO = [
    { key: 'move', label: 'Move', desc: 'D-Pad Left / Right', color: '#e8e0d4' },
    { key: 'jump', label: 'Jump', desc: 'D-Pad Up', color: '#e8e0d4' },
    { key: 'dash', label: 'Dash', desc: 'Dash button (has i-frames)', color: '#ffc83c' },
    { key: 'gaia', label: "Gaia's Strike", desc: 'Fast melee slash, low stamina', color: '#3aad62' },
    { key: 'void', label: 'Void Slam', desc: 'Heavy slam, high damage + cost', color: '#8b3fd4' },
    { key: 'ice', label: 'Ice Parry', desc: 'Deflect enemy attacks', color: '#64b4ff' },
];

const ENEMY_INFO = [
    {
        key: 'mutant',
        name: 'Mutated Survivor',
        desc: 'Patrols platforms. Charges with a telegraphed attack when you get close. Watch for the red flash warning.',
        color: '#c41e3d',
    },
];

export default function ArchitectScreen() {
    const insets = useSafeAreaInsets();
    const { gameState, slotIndex, setActiveSlot, isLoading } = useGame();
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);

    if (isLoading) {
        return (
            <View style={[styles.root, styles.center]}>
                <ActivityIndicator size="large" color="#c41e3d" />
            </View>
        );
    }

    return (
        <View style={styles.root}>
            <LinearGradient
                colors={['#0a0a0f', '#0d0a12', '#0a0a0f']}
                style={StyleSheet.absoluteFill}
            />

            <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
                <Shield size={20} color="#c41e3d" />
                <Text style={styles.headerTitle}>The Architect</Text>
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View style={[styles.profileCard, { opacity: fadeAnim }]}>
                    <View style={styles.avatarContainer}>
                        <LinearGradient
                            colors={['#5a0a1a', '#c41e3d', '#5a0a1a']}
                            style={styles.avatarGradient}
                        >
                            <Text style={styles.avatarText}>M</Text>
                        </LinearGradient>
                        <View style={styles.avatarGlow} />
                    </View>

                    <Text style={styles.characterName}>Merunes</Text>
                    <Text style={styles.characterTitle}>The Architect</Text>
                    <Text style={styles.characterDesc}>
                        Builder of barriers, keeper of the Crown. Returned from death to reclaim what was stolen.
                    </Text>
                </Animated.View>

                {/* Save Slots Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Book size={16} color="#c41e3d" />
                        <Text style={styles.sectionTitle}>Chronicles</Text>
                    </View>

                    <View style={styles.sectionCard}>
                        {(slotIndex?.slots || []).map((slot: any) => (
                            <TouchableOpacity
                                key={slot.id}
                                style={[
                                    styles.slotRow,
                                    slot.exists && styles.activeSlotRow
                                ]}
                                onPress={() => setActiveSlot(slot.id)}
                            >
                                <View style={styles.slotInfo}>
                                    <View style={styles.slotHeaderRow}>
                                        <Text style={styles.slotName}>Memory Slot {slot.id + 1}</Text>
                                        {slot.exists && <Save size={12} color="#d4a547" />}
                                    </View>
                                    <Text style={styles.slotDesc}>{slot.description}</Text>
                                    {slot.exists && (
                                        <Text style={styles.slotDate}>
                                            Last Updated: {new Date(slot.updatedAt).toLocaleDateString()}
                                        </Text>
                                    )}
                                </View>
                                {slot.exists && (
                                    <TouchableOpacity style={styles.clearBtn}>
                                        <Trash2 size={16} color="rgba(255,255,255,0.2)" />
                                    </TouchableOpacity>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Swords size={16} color="#c41e3d" />
                        <Text style={styles.sectionTitle}>Combat Stats</Text>
                    </View>

                    <View style={styles.sectionCard}>
                        <StatBar
                            label="Vitality"
                            value={100}
                            maxValue={100}
                            color="#c41e3d"
                            icon={<Heart size={16} color="#c41e3d" />}
                        />
                        <StatBar
                            label="Stamina"
                            value={100}
                            maxValue={100}
                            color="#3aad62"
                            icon={<Wind size={16} color="#3aad62" />}
                        />
                        <StatBar
                            label="Gaia Power"
                            value={gameState.stats.gaia * 10} // Scaling stat for display
                            maxValue={100}
                            color="#3aad62"
                            icon={<Zap size={16} color="#3aad62" />}
                        />
                        <StatBar
                            label="Corruption"
                            value={gameState.stats.darkness * 5}
                            maxValue={100}
                            color="#8b3fd4"
                            icon={<Zap size={16} color="#8b3fd4" />}
                        />
                        <StatBar
                            label="Light Essence"
                            value={gameState.stats.light * 5}
                            maxValue={100}
                            color="#d4a547"
                            icon={<Zap size={16} color="#d4a547" />}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Swords size={16} color="#c41e3d" />
                        <Text style={styles.sectionTitle}>Controls</Text>
                    </View>

                    <View style={styles.sectionCard}>
                        {CONTROLS_INFO.map((ctrl, i) => (
                            <View
                                key={ctrl.key}
                                style={[
                                    styles.controlRow,
                                    i < CONTROLS_INFO.length - 1 && styles.controlRowBorder,
                                ]}
                            >
                                <View style={[styles.controlDot, { backgroundColor: ctrl.color }]} />
                                <View style={styles.controlInfo}>
                                    <Text style={[styles.controlLabel, { color: ctrl.color }]}>{ctrl.label}</Text>
                                    <Text style={styles.controlDesc}>{ctrl.desc}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Shield size={16} color="#c41e3d" />
                        <Text style={styles.sectionTitle}>Bestiary</Text>
                    </View>

                    <View style={styles.sectionCard}>
                        {ENEMY_INFO.map((enemy) => (
                            <View key={enemy.key} style={styles.enemyRow}>
                                <View style={[styles.enemyIcon, { borderColor: enemy.color }]}>
                                    <View style={[styles.enemyBlock, { backgroundColor: enemy.color }]} />
                                </View>
                                <View style={styles.enemyInfo}>
                                    <Text style={[styles.enemyName, { color: enemy.color }]}>{enemy.name}</Text>
                                    <Text style={styles.enemyDesc}>{enemy.desc}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={styles.loreSection}>
                    <Text style={styles.loreQuote}>
                        "The Architect built the barriers between our world and the Void. The Consortium found a way to siphon that power. The Weaver came through the cracks."
                    </Text>
                    <Text style={styles.loreSource}>— Varen, Guardian of the Deep</Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#0a0a0f',
    },
    center: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 12,
        gap: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#1a1a24',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700' as const,
        color: '#c41e3d',
        letterSpacing: 1.5,
        textTransform: 'uppercase' as const,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: 20,
    },
    profileCard: {
        alignItems: 'center',
        paddingVertical: 24,
        marginHorizontal: 20,
        marginBottom: 8,
        backgroundColor: 'rgba(20,20,26,0.8)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#1a1a24',
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    avatarGradient: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 32,
        fontWeight: '800' as const,
        color: '#fff',
    },
    avatarGlow: {
        position: 'absolute',
        top: -4,
        left: -4,
        right: -4,
        bottom: -4,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: 'rgba(196,30,61,0.25)',
    },
    characterName: {
        fontSize: 24,
        fontWeight: '800' as const,
        color: '#e8e0d4',
        letterSpacing: 1,
    },
    characterTitle: {
        fontSize: 13,
        fontWeight: '600' as const,
        color: '#c41e3d',
        textTransform: 'uppercase' as const,
        letterSpacing: 2,
        marginTop: 4,
    },
    characterDesc: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.35)',
        textAlign: 'center',
        marginTop: 12,
        paddingHorizontal: 24,
        lineHeight: 20,
    },
    section: {
        marginTop: 16,
        paddingHorizontal: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700' as const,
        color: '#9a9088',
        textTransform: 'uppercase' as const,
        letterSpacing: 1.5,
    },
    sectionCard: {
        backgroundColor: 'rgba(20,20,26,0.8)',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#1a1a24',
    },
    slotRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.02)',
        marginBottom: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    activeSlotRow: {
        borderColor: 'rgba(212,165,71,0.2)',
        backgroundColor: 'rgba(212,165,71,0.03)',
    },
    slotInfo: {
        flex: 1,
    },
    slotHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    slotName: {
        color: '#e8e0d4',
        fontSize: 14,
        fontWeight: '700',
    },
    slotDesc: {
        color: 'rgba(255,255,255,0.3)',
        fontSize: 12,
    },
    slotDate: {
        color: '#9a9088',
        fontSize: 10,
        marginTop: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    clearBtn: {
        padding: 8,
    },
    controlRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    controlRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.04)',
    },
    controlDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 12,
    },
    controlInfo: {
        flex: 1,
    },
    controlLabel: {
        fontSize: 14,
        fontWeight: '600' as const,
    },
    controlDesc: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.3)',
        marginTop: 2,
    },
    enemyRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    enemyIcon: {
        width: 40,
        height: 40,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        backgroundColor: 'rgba(196,30,61,0.08)',
    },
    enemyBlock: {
        width: 18,
        height: 22,
        borderRadius: 3,
    },
    enemyInfo: {
        flex: 1,
    },
    enemyName: {
        fontSize: 15,
        fontWeight: '700' as const,
    },
    enemyDesc: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.35)',
        marginTop: 4,
        lineHeight: 18,
    },
    loreSection: {
        marginTop: 24,
        marginHorizontal: 20,
        padding: 24,
        backgroundColor: 'rgba(196,30,61,0.04)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(196,30,61,0.1)',
    },
    loreQuote: {
        fontSize: 14,
        fontStyle: 'italic' as const,
        color: 'rgba(200,191,179,0.7)',
        lineHeight: 22,
        textAlign: 'center',
    },
    loreSource: {
        fontSize: 12,
        color: '#d4a547',
        textAlign: 'center',
        marginTop: 12,
        fontWeight: '600' as const,
    },
});
