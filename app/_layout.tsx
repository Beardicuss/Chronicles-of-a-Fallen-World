/**
 * app/_layout.tsx  (ROOT layout)
 * Shows SplashScreen first, then transitions to the main tabs
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { router, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ErrorBoundary from "@/components/ErrorBoundary";
import { GameProvider } from "@/contexts/GameContext";
import CustomSplash from "@/components/CustomSplash";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
    return (
        <Stack screenOptions={{ headerBackTitle: "Back" }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
    );
}

export default function RootLayout() {
    const [splashDone, setSplashDone] = useState(false);

    useEffect(() => {
        SplashScreen.hideAsync();
    }, []);

    const handleSplashComplete = () => {
        setSplashDone(true);
    };

    return (
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <GameProvider>
                    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#000' }}>
                        <StatusBar style="light" />
                        {!splashDone ? (
                            <CustomSplash onComplete={handleSplashComplete} />
                        ) : (
                            <RootLayoutNav />
                        )}
                    </GestureHandlerRootView>
                </GameProvider>
            </QueryClientProvider>
        </ErrorBoundary>
    );
}