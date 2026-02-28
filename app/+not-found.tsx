import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Colors from '@/constants/colors';

export default function NotFoundScreen() {
    return (
        <>
            <Stack.Screen options={{ title: 'Lost in the Void' }} />
            <View style={styles.container}>
                <Text style={styles.icon}>🌑</Text>
                <Text style={styles.title}>This path leads nowhere.</Text>
                <Text style={styles.subtitle}>The Void has consumed this route.</Text>
                <Link href="/(tabs)/architect" asChild>
                    <TouchableOpacity style={styles.link}>
                        <Text style={styles.linkText}>Return to the Crypt</Text>
                    </TouchableOpacity>
                </Link>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: Colors.background,
    },
    icon: {
        fontSize: 48,
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '700' as const,
        color: Colors.textPrimary,
    },
    subtitle: {
        fontSize: 14,
        color: Colors.textMuted,
        marginTop: 8,
    },
    link: {
        marginTop: 24,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.crimsonGlow,
    },
    linkText: {
        fontSize: 14,
        color: Colors.crimson,
        fontWeight: '600' as const,
    },
});
