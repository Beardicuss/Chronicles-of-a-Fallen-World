import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ErrorBoundary from "@/components/ErrorBoundary";
import { GameProvider } from "@/contexts/GameContext";

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
    useEffect(() => {
        SplashScreen.hideAsync();
    }, []);

    return (
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <GameProvider>
                    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#0a0a0f' }}>
                        <StatusBar style="light" />
                        <RootLayoutNav />
                    </GestureHandlerRootView>
                </GameProvider>
            </QueryClientProvider>
        </ErrorBoundary>
    );
}
