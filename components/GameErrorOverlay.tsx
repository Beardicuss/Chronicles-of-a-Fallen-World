import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Platform,
} from 'react-native';
import { AlertTriangle, RefreshCcw, XCircle } from 'lucide-react-native';

interface Props {
    error: Error | null;
    stack?: string;
    onDismiss: () => void;
}

export const GameErrorOverlay: React.FC<Props> = ({
    error,
    stack,
    onDismiss,
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <View style={styles.header}>
                    <AlertTriangle color="#ff4444" size={24} />
                    <Text style={styles.title}>VOID BREACH</Text>
                </View>

                <View style={styles.errorBox}>
                    <Text style={styles.errorLabel}>The fabric of reality has torn:</Text>
                    <Text style={styles.errorMessage}>{error?.message || 'Unknown catastrophic failure'}</Text>

                    {stack && (
                        <ScrollView style={styles.stackScroll} nestedScrollEnabled={true}>
                            <Text style={styles.stackText}>{stack}</Text>
                        </ScrollView>
                    )}
                </View>

                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
                        <XCircle color="#fff" size={18} />
                        <Text style={styles.buttonText}>DISMISS</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.reloadButton}
                        onPress={() => {
                            // In Expo Router, we might need a specific reload logic,
                            // but usually reset state via onDismiss is enough.
                            // For now, onDismiss acts as the reset.
                            onDismiss();
                        }}
                    >
                        <RefreshCcw color="#fff" size={18} />
                        <Text style={styles.buttonText}>RESTORE</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.footer}>The Architect will attempt to stabilize the realm.</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        zIndex: 10000,
    },
    card: {
        width: '100%',
        maxWidth: 500,
        backgroundColor: '#121218',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#c41e3d',
        padding: 24,
        shadowColor: '#c41e3d',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
    },
    title: {
        color: '#c41e3d',
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: 2,
    },
    errorBox: {
        backgroundColor: '#0a0a0f',
        padding: 16,
        borderRadius: 8,
        marginBottom: 24,
    },
    errorLabel: {
        color: '#9a9088',
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
    },
    errorMessage: {
        color: '#ff6b6b',
        fontSize: 14,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        lineHeight: 20,
    },
    stackScroll: {
        marginTop: 12,
        maxHeight: 150,
        backgroundColor: 'rgba(0,0,0,0.3)',
        padding: 8,
        borderRadius: 4,
    },
    stackText: {
        color: '#5a5550',
        fontSize: 10,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
    },
    dismissButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#333',
        paddingVertical: 12,
        borderRadius: 6,
    },
    reloadButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#c41e3d',
        paddingVertical: 12,
        borderRadius: 6,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 12,
        letterSpacing: 1,
    },
    footer: {
        color: 'rgba(255,255,255,0.2)',
        fontSize: 11,
        textAlign: 'center',
        marginTop: 20,
        fontStyle: 'italic',
    },
});
