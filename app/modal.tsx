import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Colors from '@/constants/colors';

export default function ModalScreen() {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={true}
            onRequestClose={() => router.back()}
        >
            <Pressable style={styles.overlay} onPress={() => router.back()}>
                <View style={styles.modalContent}>
                    <Text style={styles.title}>Crown of Darkness</Text>
                    <Text style={styles.description}>
                        A dark fantasy awaits. Make your choices wisely, Architect.
                    </Text>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.closeButtonText}>Return</Text>
                    </TouchableOpacity>
                </View>
            </Pressable>
            <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: Colors.surface,
        borderRadius: 20,
        padding: 24,
        margin: 20,
        alignItems: 'center',
        minWidth: 300,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    title: {
        fontSize: 20,
        fontWeight: '700' as const,
        marginBottom: 16,
        color: Colors.crimson,
    },
    description: {
        textAlign: 'center',
        marginBottom: 24,
        color: Colors.textSecondary,
        lineHeight: 20,
    },
    closeButton: {
        backgroundColor: Colors.crimsonDark,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 10,
        minWidth: 100,
    },
    closeButtonText: {
        color: Colors.textPrimary,
        fontWeight: '600' as const,
        textAlign: 'center',
    },
});
