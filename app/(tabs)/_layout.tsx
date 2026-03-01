import { Tabs } from 'expo-router';
import React from 'react';
import { Swords } from 'lucide-react-native';
import { Shield } from 'lucide-react-native';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#c41e3d',
                tabBarInactiveTintColor: '#5a5550',
                tabBarStyle: {
                    backgroundColor: '#0a0a0f',
                    borderTopColor: '#1a1a24',
                    borderTopWidth: 1,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600' as const,
                    letterSpacing: 0.5,
                },
            }}
        >
            <Tabs.Screen
                name="(story)"
                options={{
                    title: 'Battle',
                    tabBarIcon: ({ color, size }) => <Swords size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="architect"
                options={{
                    title: 'Architect',
                    tabBarIcon: ({ color, size }) => <Shield size={size} color={color} />,
                }}
            />
        </Tabs>
    );
}
