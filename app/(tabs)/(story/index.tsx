import React, { useRef, useCallback, useEffect, useState, useMemo } from 'react';
import {
    View,
    StyleSheet,
    Platform,
    ActivityIndicator,
    Text,
    Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Asset } from 'expo-asset';
import * as ScreenOrientation from 'expo-screen-orientation';
import { createGameHTML } from '@/constants/gameEngine';
import { createIntroHTML } from '@/constants/introEngine';
import { createMenuHTML } from '@/constants/menuEngine';
import { useGame } from '@/contexts/GameContext';

let WebView: any = null;
if (Platform.OS !== 'web') {
    WebView = require('react-native-webview').default;
}

const GAME_ASSET_MODULES = {
    bg: require('@/assets/game/scene1.png'),
    player: require('@/assets/game/player/idle/frame_000.png'),
    enemySmall: require('@/assets/game/enemy_reaper.png'),
    enemyBig: require('@/assets/game/enemy_big.png'),
    platforms: require('@/assets/game/platforms.png'),
    props: require('@/assets/game/darkprops.png'),
    tree1: require('@/assets/game/tree1.png'),
    tree2: require('@/assets/game/tree2.png'),
    tombstones: require('@/assets/game/tombstones.png'),
    skulls: require('@/assets/game/skulls.png'),
    bones: require('@/assets/game/bones.png'),
    stonearch: require('@/assets/game/stonearch.png'),
    darkprops: require('@/assets/game/darkprops.png'),
    carriage: require('@/assets/game/carriage.png'),
    idle_0: require('@/assets/game/player/idle/frame_000.png'),
    idle_1: require('@/assets/game/player/idle/frame_001.png'),
    idle_2: require('@/assets/game/player/idle/frame_002.png'),
    idle_3: require('@/assets/game/player/idle/frame_003.png'),
    idle_4: require('@/assets/game/player/idle/frame_004.png'),
    idle_5: require('@/assets/game/player/idle/frame_005.png'),
    idle_6: require('@/assets/game/player/idle/frame_006.png'),
    idle_7: require('@/assets/game/player/idle/frame_007.png'),
    idle_8: require('@/assets/game/player/idle/frame_008.png'),
    idle_9: require('@/assets/game/player/idle/frame_009.png'),
    idle_10: require('@/assets/game/player/idle/frame_010.png'),
    idle_11: require('@/assets/game/player/idle/frame_011.png'),
    idle_12: require('@/assets/game/player/idle/frame_012.png'),
    idle_13: require('@/assets/game/player/idle/frame_013.png'),
    idle_14: require('@/assets/game/player/idle/frame_014.png'),
    idle_15: require('@/assets/game/player/idle/frame_015.png'),
    idle_16: require('@/assets/game/player/idle/frame_016.png'),
    idle_17: require('@/assets/game/player/idle/frame_017.png'),
    idle_18: require('@/assets/game/player/idle/frame_018.png'),
    idle_19: require('@/assets/game/player/idle/frame_019.png'),
    idle_20: require('@/assets/game/player/idle/frame_020.png'),
    idle_21: require('@/assets/game/player/idle/frame_021.png'),
    idle_22: require('@/assets/game/player/idle/frame_022.png'),
    idle_23: require('@/assets/game/player/idle/frame_023.png'),
    idle_24: require('@/assets/game/player/idle/frame_024.png'),
    idle2_0: require('@/assets/game/player/idle2/frame_000.png'),
    idle2_1: require('@/assets/game/player/idle2/frame_001.png'),
    idle2_2: require('@/assets/game/player/idle2/frame_002.png'),
    idle2_3: require('@/assets/game/player/idle2/frame_003.png'),
    idle2_4: require('@/assets/game/player/idle2/frame_004.png'),
    idle2_5: require('@/assets/game/player/idle2/frame_005.png'),
    idle2_6: require('@/assets/game/player/idle2/frame_006.png'),
    idle2_7: require('@/assets/game/player/idle2/frame_007.png'),
    idle2_8: require('@/assets/game/player/idle2/frame_008.png'),
    idle2_9: require('@/assets/game/player/idle2/frame_009.png'),
    idle2_10: require('@/assets/game/player/idle2/frame_010.png'),
    idle2_11: require('@/assets/game/player/idle2/frame_011.png'),
    idle2_12: require('@/assets/game/player/idle2/frame_012.png'),
    idle2_13: require('@/assets/game/player/idle2/frame_013.png'),
    idle2_14: require('@/assets/game/player/idle2/frame_014.png'),
    idle2_15: require('@/assets/game/player/idle2/frame_015.png'),
    jump_0: require('@/assets/game/player/jump/frame_000.png'),
    jump_1: require('@/assets/game/player/jump/frame_001.png'),
    jump_2: require('@/assets/game/player/jump/frame_002.png'),
    jump_3: require('@/assets/game/player/jump/frame_003.png'),
    jump_4: require('@/assets/game/player/jump/frame_004.png'),
    jump_5: require('@/assets/game/player/jump/frame_005.png'),
    jump_6: require('@/assets/game/player/jump/frame_006.png'),
    jump_7: require('@/assets/game/player/jump/frame_007.png'),
    jump_8: require('@/assets/game/player/jump/frame_008.png'),
    jump_9: require('@/assets/game/player/jump/frame_009.png'),
    jump_10: require('@/assets/game/player/jump/frame_010.png'),
    jump_11: require('@/assets/game/player/jump/frame_011.png'),
    jump_12: require('@/assets/game/player/jump/frame_012.png'),
    jump_13: require('@/assets/game/player/jump/frame_013.png'),
    jump_14: require('@/assets/game/player/jump/frame_014.png'),
    jump_15: require('@/assets/game/player/jump/frame_015.png'),
    run_0: require('@/assets/game/player/run/frame_000.png'),
    run_1: require('@/assets/game/player/run/frame_005.png'),
    run_2: require('@/assets/game/player/run/frame_006.png'),
    run_3: require('@/assets/game/player/run/frame_007.png'),
    run_4: require('@/assets/game/player/run/frame_008.png'),
    run_5: require('@/assets/game/player/run/frame_009.png'),
    run_6: require('@/assets/game/player/run/frame_010.png'),
    run_7: require('@/assets/game/player/run/frame_011.png'),
    run_8: require('@/assets/game/player/run/frame_013.png'),
    run_9: require('@/assets/game/player/run/frame_014.png'),
    run_10: require('@/assets/game/player/run/frame_015.png'),
    run_11: require('@/assets/game/player/run/frame_016.png'),
    run_12: require('@/assets/game/player/run/frame_017.png'),
    run_13: require('@/assets/game/player/run/frame_018.png'),
    run_14: require('@/assets/game/player/run/frame_019.png'),
    run_15: require('@/assets/game/player/run/frame_020.png'),
    run_16: require('@/assets/game/player/run/frame_021.png'),
    run_17: require('@/assets/game/player/run/frame_022.png'),
    run_18: require('@/assets/game/player/run/frame_023.png'),
    run_19: require('@/assets/game/player/run/frame_024.png'),
};

const INTRO_ASSET_MODULES = {
    cryptBg: require('@/assets/game/scene1/crypt_bg.png'),
    coffin: require('@/assets/game/scene1/coffin.png'),

    stoneDoor: require('@/assets/game/stonearch.png'),
    player: require('@/assets/game/player/idle/frame_000.png'),
    idle_0: require('@/assets/game/player/idle/frame_000.png'),
    idle_1: require('@/assets/game/player/idle/frame_001.png'),
    idle_2: require('@/assets/game/player/idle/frame_002.png'),
    idle_3: require('@/assets/game/player/idle/frame_003.png'),
    idle_4: require('@/assets/game/player/idle/frame_004.png'),
    idle_5: require('@/assets/game/player/idle/frame_005.png'),
    idle_6: require('@/assets/game/player/idle/frame_006.png'),
    idle_7: require('@/assets/game/player/idle/frame_007.png'),
    idle_8: require('@/assets/game/player/idle/frame_008.png'),
    idle_9: require('@/assets/game/player/idle/frame_009.png'),
    idle_10: require('@/assets/game/player/idle/frame_010.png'),
    idle_11: require('@/assets/game/player/idle/frame_011.png'),
    idle_12: require('@/assets/game/player/idle/frame_012.png'),
    idle_13: require('@/assets/game/player/idle/frame_013.png'),
    idle_14: require('@/assets/game/player/idle/frame_014.png'),
    idle_15: require('@/assets/game/player/idle/frame_015.png'),
    idle_16: require('@/assets/game/player/idle/frame_016.png'),
    idle_17: require('@/assets/game/player/idle/frame_017.png'),
    idle_18: require('@/assets/game/player/idle/frame_018.png'),
    idle_19: require('@/assets/game/player/idle/frame_019.png'),
    idle_20: require('@/assets/game/player/idle/frame_020.png'),
    idle_21: require('@/assets/game/player/idle/frame_021.png'),
    idle_22: require('@/assets/game/player/idle/frame_022.png'),
    idle_23: require('@/assets/game/player/idle/frame_023.png'),
    idle_24: require('@/assets/game/player/idle/frame_024.png'),
    idle2_0: require('@/assets/game/player/idle2/frame_000.png'),
    idle2_1: require('@/assets/game/player/idle2/frame_001.png'),
    idle2_2: require('@/assets/game/player/idle2/frame_002.png'),
    idle2_3: require('@/assets/game/player/idle2/frame_003.png'),
    idle2_4: require('@/assets/game/player/idle2/frame_004.png'),
    idle2_5: require('@/assets/game/player/idle2/frame_005.png'),
    idle2_6: require('@/assets/game/player/idle2/frame_006.png'),
    idle2_7: require('@/assets/game/player/idle2/frame_007.png'),
    idle2_8: require('@/assets/game/player/idle2/frame_008.png'),
    idle2_9: require('@/assets/game/player/idle2/frame_009.png'),
    idle2_10: require('@/assets/game/player/idle2/frame_010.png'),
    idle2_11: require('@/assets/game/player/idle2/frame_011.png'),
    idle2_12: require('@/assets/game/player/idle2/frame_012.png'),
    idle2_13: require('@/assets/game/player/idle2/frame_013.png'),
    idle2_14: require('@/assets/game/player/idle2/frame_014.png'),
    idle2_15: require('@/assets/game/player/idle2/frame_015.png'),
    rise_0: require('@/assets/game/player/rise/frame_000.png'),
    rise_1: require('@/assets/game/player/rise/frame_001.png'),
    rise_2: require('@/assets/game/player/rise/frame_002.png'),
    rise_3: require('@/assets/game/player/rise/frame_003.png'),
    rise_4: require('@/assets/game/player/rise/frame_004.png'),
    rise_5: require('@/assets/game/player/rise/frame_005.png'),
    rise_6: require('@/assets/game/player/rise/frame_006.png'),
    rise_7: require('@/assets/game/player/rise/frame_007.png'),
    rise_8: require('@/assets/game/player/rise/frame_008.png'),
    rise_9: require('@/assets/game/player/rise/frame_009.png'),
    rise_10: require('@/assets/game/player/rise/frame_010.png'),
    rise_11: require('@/assets/game/player/rise/frame_011.png'),
    rise_12: require('@/assets/game/player/rise/frame_012.png'),
    rise_13: require('@/assets/game/player/rise/frame_013.png'),
    rise_14: require('@/assets/game/player/rise/frame_014.png'),
    rise_15: require('@/assets/game/player/rise/frame_015.png'),
    rise_16: require('@/assets/game/player/rise/frame_016.png'),
    rise_17: require('@/assets/game/player/rise/frame_017.png'),
    rise_18: require('@/assets/game/player/rise/frame_018.png'),
    rise_19: require('@/assets/game/player/rise/frame_019.png'),
    rise_20: require('@/assets/game/player/rise/frame_020.png'),
    rise_21: require('@/assets/game/player/rise/frame_021.png'),
    rise_22: require('@/assets/game/player/rise/frame_022.png'),
    rise_23: require('@/assets/game/player/rise/frame_023.png'),
    rise_24: require('@/assets/game/player/rise/frame_024.png'),
    walk_0: require('@/assets/game/player/walk/frame_00.png'),
    walk_1: require('@/assets/game/player/walk/frame_01.png'),
    walk_2: require('@/assets/game/player/walk/frame_02.png'),
    walk_3: require('@/assets/game/player/walk/frame_03.png'),
    walk_4: require('@/assets/game/player/walk/frame_04.png'),
    walk_5: require('@/assets/game/player/walk/frame_05.png'),
    walk_6: require('@/assets/game/player/walk/frame_06.png'),
    walk_7: require('@/assets/game/player/walk/frame_07.png'),
    walk_8: require('@/assets/game/player/walk/frame_08.png'),
    walk_9: require('@/assets/game/player/walk/frame_09.png'),
    walk_10: require('@/assets/game/player/walk/frame_10.png'),
    walk_11: require('@/assets/game/player/walk/frame_11.png'),
    walk_12: require('@/assets/game/player/walk/frame_12.png'),
    walk_13: require('@/assets/game/player/walk/frame_13.png'),
    walk_14: require('@/assets/game/player/walk/frame_14.png'),
    walk_15: require('@/assets/game/player/walk/frame_15.png'),
    walk_16: require('@/assets/game/player/walk/frame_16.png'),
    walk_17: require('@/assets/game/player/walk/frame_17.png'),
    walk_18: require('@/assets/game/player/walk/frame_18.png'),
    walk_19: require('@/assets/game/player/walk/frame_19.png'),
    walk_20: require('@/assets/game/player/walk/frame_20.png'),
    walk_21: require('@/assets/game/player/walk/frame_21.png'),
    walk_22: require('@/assets/game/player/walk/frame_22.png'),
    walk_23: require('@/assets/game/player/walk/frame_23.png'),
    walk_24: require('@/assets/game/player/walk/frame_24.png'),
};

function resolveAssetUri(mod: number): string {
    try {
        const asset = Asset.fromModule(mod);
        return asset.uri || asset.localUri || '';
    } catch (e) {
        console.log('[resolveAssetUri] Error resolving asset:', e);
        return '';
    }
}

type GamePhase = 'intro' | 'menu' | 'game';

export default function GameScreen() {
    const insets = useSafeAreaInsets();
    const { updateBattleStats, makeChoice } = useGame();
    const webViewRef = useRef<any>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [webError, setWebError] = useState<boolean>(false);
    const [assetsReady, setAssetsReady] = useState<boolean>(false);
    const [gameAssetUrls, setGameAssetUrls] = useState<Record<string, string>>({});
    const [introAssetUrls, setIntroAssetUrls] = useState<Record<string, string>>({});
    const [gamePhase, setGamePhase] = useState<GamePhase>('intro');

    // Lock to landscape when screen mounts, unlock when leaving
    useEffect(() => {
        if (Platform.OS !== 'web') {
            ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        }
        return () => {
            if (Platform.OS !== 'web') {
                ScreenOrientation.unlockAsync();
            }
        };
    }, []);

    useEffect(() => {
        async function loadAssets() {
            try {
                console.log('[GameScreen] Loading all assets...');
                const introUrls: Record<string, string> = {};
                const gameUrls: Record<string, string> = {};

                if (Platform.OS === 'web') {
                    for (const [key, mod] of Object.entries(INTRO_ASSET_MODULES)) {
                        introUrls[key] = resolveAssetUri(mod as number);
                    }
                    for (const [key, mod] of Object.entries(GAME_ASSET_MODULES)) {
                        gameUrls[key] = resolveAssetUri(mod as number);
                    }
                } else {
                    const introAssets: Record<string, Asset> = {};
                    for (const [key, mod] of Object.entries(INTRO_ASSET_MODULES)) {
                        introAssets[key] = Asset.fromModule(mod);
                    }
                    await Promise.all(Object.values(introAssets).map(a => a.downloadAsync()));
                    for (const [key, asset] of Object.entries(introAssets)) {
                        introUrls[key] = asset.localUri || asset.uri || '';
                    }

                    const gAssets: Record<string, Asset> = {};
                    for (const [key, mod] of Object.entries(GAME_ASSET_MODULES)) {
                        gAssets[key] = Asset.fromModule(mod);
                    }
                    await Promise.all(Object.values(gAssets).map(a => a.downloadAsync()));
                    for (const [key, asset] of Object.entries(gAssets)) {
                        gameUrls[key] = asset.localUri || asset.uri || '';
                    }
                }

                console.log('[GameScreen] All assets resolved');
                setIntroAssetUrls(introUrls);
                setGameAssetUrls(gameUrls);
                setAssetsReady(true);
            } catch (err) {
                console.log('[GameScreen] Asset loading error:', err);
                const introFallback: Record<string, string> = {};
                const gameFallback: Record<string, string> = {};
                for (const [key, mod] of Object.entries(INTRO_ASSET_MODULES)) {
                    introFallback[key] = resolveAssetUri(mod as number);
                }
                for (const [key, mod] of Object.entries(GAME_ASSET_MODULES)) {
                    gameFallback[key] = resolveAssetUri(mod as number);
                }
                setIntroAssetUrls(introFallback);
                setGameAssetUrls(gameFallback);
                setAssetsReady(true);
            }
        }
        loadAssets();
    }, []);

    const introHtml = useMemo(() => {
        if (!assetsReady) return null;
        return createIntroHTML(introAssetUrls);
    }, [assetsReady, introAssetUrls]);

    const menuHtml = useMemo(() => {
        if (!assetsReady) return null;
        return createMenuHTML(gameAssetUrls);
    }, [assetsReady, gameAssetUrls]);

    const gameHtml = useMemo(() => {
        if (!assetsReady) return null;
        return createGameHTML(gameAssetUrls);
    }, [assetsReady, gameAssetUrls]);

    const handleLoadEnd = useCallback(() => {
        setLoading(false);
        console.log('[GameScreen] WebView loaded -', gamePhase);
    }, [gamePhase]);

    // Fallback: clear loading after 3s in case onLoadEnd never fires (Android quirk)
    useEffect(() => {
        if (loading) {
            const t = setTimeout(() => setLoading(false), 3000);
            return () => clearTimeout(t);
        }
    }, [loading, gamePhase]);

    const handleError = useCallback(() => {
        setWebError(true);
        setLoading(false);
        console.log('[GameScreen] WebView error');
    }, []);

    const handleMessage = useCallback((event: any) => {
        try {
            const data = JSON.parse(event.nativeEvent?.data || '{}');

            if (data.type === "DEBUG_DIMS") { console.log("[DIMS]", JSON.stringify(data)); }

            if (data.type === "ERROR") {
                console.log('[GameScreen] WebView Error:', data);
            }

            // Handle Battle Stats Sync
            if (data.type === 'SYNC_STATS') {
                updateBattleStats(data.payload.health, data.payload.stamina);
            }

            // Handle Intro Transition → Menu
            if (data.type === 'INTRO_COMPLETE') {
                console.log('[GameScreen] Intro complete, going to menu');
                setGamePhase('menu');
            }

            // New Game from menu → game
            if (data.type === 'NEW_GAME') {
                console.log('[GameScreen] New game, slot:', data.slot);
                setGamePhase('game');
            }

            // Load Save from menu → game
            if (data.type === 'LOAD_SAVE') {
                console.log('[GameScreen] Loading save slot:', data.slot);
                setGamePhase('game');
            }

            // Handle Choices from Battle phase (if implemented)
            if (data.type === 'MAKE_CHOICE') {
                makeChoice(data.payload);
            }
        } catch (e) {
            console.log('[GameScreen] Message parse error:', e);
        }
    }, [updateBattleStats, makeChoice]);

    const handleWebMessage = useCallback((event: MessageEvent) => {
        try {
            const data = JSON.parse(event.data);
            if (data.type === 'ERROR') {
                console.log('[GameScreen] Web iframe Error:', data);
            }
            if (data.type === 'INTRO_COMPLETE') {
                console.log('[GameScreen] Intro complete (web), going to menu');
                setGamePhase('menu');
            }
            if (data.type === 'NEW_GAME' || data.type === 'LOAD_SAVE') {
                setGamePhase('game');
            }
            if (data.type === 'SYNC_STATS') {
                updateBattleStats(data.payload.health, data.payload.stamina);
            }
        } catch (e) { }
    }, [updateBattleStats]);

    useEffect(() => {
        if (Platform.OS === 'web') {
            window.addEventListener('message', handleWebMessage);
            return () => window.removeEventListener('message', handleWebMessage);
        }
    }, [handleWebMessage]);

    const currentHtml = gamePhase === 'intro' ? introHtml : gamePhase === 'menu' ? menuHtml : gameHtml;

    if (!assetsReady || !currentHtml) {
        return (
            <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#c41e3d" />
                <Text style={styles.loadingText}>LOADING REALM...</Text>
            </View>
        );
    }

    if (Platform.OS === 'web') {
        return (
            <View style={styles.root}>
                <iframe
                    key={gamePhase}
                    srcDoc={currentHtml}
                    style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        backgroundColor: '#000',
                    } as any}
                    title="Crown of Darkness"
                    onLoad={() => setLoading(false)}
                />
                {loading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#c41e3d" />
                        <Text style={styles.loadingText}>
                            {gamePhase === 'intro' ? 'ENTERING THE CRYPT...' : 'AWAKENING...'}
                        </Text>
                    </View>
                )}
            </View>
        );
    }

    if (webError) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorTitle}>VOID BREACH</Text>
                <Text style={styles.errorText}>The realm failed to materialize</Text>
                <Pressable
                    style={styles.retryBtn}
                    onPress={() => {
                        setWebError(false);
                        setLoading(true);
                    }}
                    testID="retry-button"
                >
                    <Text style={styles.retryText}>TRY AGAIN</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <View style={styles.root}>
            {WebView && (
                <WebView
                    key={gamePhase}
                    ref={webViewRef}
                    source={{ html: currentHtml }}
                    style={styles.webview}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    allowsInlineMediaPlayback={true}
                    mediaPlaybackRequiresUserAction={false}
                    scrollEnabled={false}
                    bounces={false}
                    overScrollMode="never"
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    allowFileAccess={true}
                    allowFileAccessFromFileURLs={true}
                    allowUniversalAccessFromFileURLs={true}
                    mixedContentMode="always"
                    onLoadEnd={handleLoadEnd}
                    onError={handleError}
                    onMessage={handleMessage}
                    originWhitelist={['*']}
                    testID="game-webview"
                />
            )}
            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#c41e3d" />
                    <Text style={styles.loadingText}>
                        {gamePhase === 'intro' ? 'ENTERING THE CRYPT...' : 'AWAKENING...'}
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#000',
        width: '100%',
        height: '100%',
    },
    webview: {
        flex: 1,
        backgroundColor: '#000',
        width: '100%',
        height: '100%',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        color: '#c41e3d',
        fontSize: 14,
        fontWeight: '600' as const,
        letterSpacing: 4,
        marginTop: 16,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    errorContainer: {
        flex: 1,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
    },
    errorTitle: {
        color: '#c41e3d',
        fontSize: 24,
        fontWeight: '700' as const,
        letterSpacing: 4,
        marginBottom: 12,
    },
    errorText: {
        color: 'rgba(255,255,255,0.4)',
        fontSize: 14,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        marginBottom: 32,
    },
    retryBtn: {
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderWidth: 1,
        borderColor: 'rgba(196,30,61,0.5)',
        backgroundColor: 'rgba(196,30,61,0.1)',
        borderRadius: 4,
    },
    retryText: {
        color: '#c41e3d',
        fontSize: 14,
        fontWeight: '600' as const,
        letterSpacing: 3,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
});