
import { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

const COLORS = {
    bg: '#0B0B10',
    card: '#15151D',
    field: '#20202A',
    border: '#30303D',
    primary: '#8B5CF6',
    link: '#B69AFF',
    text: '#F7F7FB',
    muted: '#9A9AA9',
    error: '#FB7185',
};

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [focused, setFocused] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const API_URL = 'http://10.149.204.247:8082/login';

    const handleLogin = async () => {
        setError('');

        if (!email.trim() || !password) {
            setError('Please fill all fields.');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            setError('Enter a valid email address.');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'text/plain',
                },
                body: JSON.stringify({
                    email: email.trim(),
                    password,
                }),
            });

            const token = (await response.text()).trim();

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Invalid email or password.');
                }

                if (response.status === 403) {
                    throw new Error(
                        'Access denied. Please check your server security settings.'
                    );
                }

                throw new Error(`Login failed: ${response.status}`);
            }

            if (!token) {
                throw new Error('Token not received from server.');
            }

            await SecureStore.setItemAsync('jwt_token', token);
            await SecureStore.setItemAsync(
                'user_email',
                email.trim()
            );

            console.log('Login successful');

            router.replace('/home');
        } catch (err) {
            console.error(
                'Login error:',
                err instanceof Error ? err.message : 'Unknown error'
            );

            setError(
                err instanceof Error
                    ? err.message
                    : 'Unable to connect to server.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Brand */}
                <View style={styles.brandRow}>
                    <View style={styles.logo}>
                        <Ionicons
                            name="wallet"
                            size={27}
                            color="#FFFFFF"
                        />
                    </View>

                    <Text style={styles.brandName}>Pennywise</Text>
                </View>

                {/* Heading */}
                <Text style={styles.eyebrow}>
                    YOUR MONEY, IN CONTROL
                </Text>

                <Text style={styles.title}>
                    Welcome{'\n'}back.
                </Text>

                <Text style={styles.subtitle}>
                    A clearer view of your money starts here.
                </Text>

                {/* Login card */}
                <View style={styles.card}>
                    <Text style={styles.label}>Email address</Text>

                    <View
                        style={[
                            styles.inputRow,
                            focused === 'email' && styles.inputFocused,
                        ]}
                    >
                        <Ionicons
                            name="mail-outline"
                            size={20}
                            color={COLORS.muted}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="you@example.com"
                            placeholderTextColor={COLORS.muted}
                            value={email}
                            onChangeText={(value) => {
                                setEmail(value);
                                setError('');
                            }}
                            onFocus={() => setFocused('email')}
                            onBlur={() => setFocused('')}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            autoComplete="email"
                            editable={!loading}
                            returnKeyType="next"
                        />
                    </View>

                    <Text style={[styles.label, styles.passwordLabel]}>
                        Password
                    </Text>

                    <View
                        style={[
                            styles.inputRow,
                            focused === 'password' && styles.inputFocused,
                        ]}
                    >
                        <Ionicons
                            name="lock-closed-outline"
                            size={20}
                            color={COLORS.muted}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Enter your password"
                            placeholderTextColor={COLORS.muted}
                            value={password}
                            onChangeText={(value) => {
                                setPassword(value);
                                setError('');
                            }}
                            onFocus={() => setFocused('password')}
                            onBlur={() => setFocused('')}
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                            autoComplete="current-password"
                            editable={!loading}
                            returnKeyType="done"
                            onSubmitEditing={handleLogin}
                        />

                        <Pressable
                            onPress={() =>
                                setShowPassword(!showPassword)
                            }
                            disabled={loading}
                            hitSlop={10}
                            accessibilityRole="button"
                            accessibilityLabel={
                                showPassword
                                    ? 'Hide password'
                                    : 'Show password'
                            }
                        >
                            <Ionicons
                                name={
                                    showPassword
                                        ? 'eye-off-outline'
                                        : 'eye-outline'
                                }
                                size={21}
                                color={COLORS.link}
                            />
                        </Pressable>
                    </View>

                    <Pressable
                        style={styles.forgot}
                        onPress={() =>
                            router.push('/forgot-password')
                        }
                    >
                        <Text style={styles.link}>
                            Forgot password?
                        </Text>
                    </Pressable>

                    {error !== '' && (
                        <View style={styles.errorContainer}>
                            <Ionicons
                                name="alert-circle-outline"
                                size={18}
                                color={COLORS.error}
                            />
                            <Text style={styles.error}>{error}</Text>
                        </View>
                    )}

                    <Pressable
                        style={({ pressed }) => [
                            styles.button,
                            pressed && !loading && styles.buttonPressed,
                            loading && styles.buttonDisabled,
                        ]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <>
                                <Text style={styles.buttonText}>
                                    Sign in
                                </Text>

                                <Ionicons
                                    name="arrow-forward"
                                    size={20}
                                    color="#FFFFFF"
                                />
                            </>
                        )}
                    </Pressable>

                    <View style={styles.secureNote}>
                        <Ionicons
                            name="shield-checkmark-outline"
                            size={16}
                            color="#6EE7B7"
                        />
                        <Text style={styles.secureText}>
                            Your account is protected
                        </Text>
                    </View>
                </View>

                {/* Social sign-in placeholders */}
                <View style={styles.dividerRow}>
                    <View style={styles.line} />
                    <Text style={styles.dividerText}>
                        OR CONTINUE WITH
                    </Text>
                    <View style={styles.line} />
                </View>

                <View style={styles.socialRow}>
                    <Pressable
                        style={({ pressed }) => [
                            styles.socialButton,
                            pressed && styles.buttonPressed,
                        ]}
                        onPress={() =>
                            console.log('Google login not implemented')
                        }
                    >
                        <Ionicons
                            name="logo-google"
                            size={19}
                            color={COLORS.text}
                        />
                        <Text style={styles.socialText}>Google</Text>
                    </Pressable>

                    <Pressable
                        style={({ pressed }) => [
                            styles.socialButton,
                            pressed && styles.buttonPressed,
                        ]}
                        onPress={() =>
                            console.log('Apple login not implemented')
                        }
                    >
                        <Ionicons
                            name="logo-apple"
                            size={21}
                            color={COLORS.text}
                        />
                        <Text style={styles.socialText}>Apple</Text>
                    </Pressable>
                </View>

                {/* Sign up */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Don't have an account?
                    </Text>

                    <Pressable
                        onPress={() => router.push('/signup')}
                        disabled={loading}
                    >
                        <Text style={styles.signupLink}>
                            {' '}Sign up
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bg,
    },

    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingTop: 30,
        paddingBottom: 36,
    },

    brandRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 34,
        marginTop: 10,
    },

    logo: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },

    brandName: {
        color: COLORS.text,
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: 0.3,
    },

    eyebrow: {
        color: COLORS.link,
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 2,
        marginBottom: 12,
    },

    title: {
        fontSize: 42,
        lineHeight: 48,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: 10,
        letterSpacing: -1,
    },

    subtitle: {
        fontSize: 15,
        lineHeight: 23,
        color: COLORS.muted,
        marginBottom: 28,
    },

    card: {
        backgroundColor: COLORS.card,
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: '#292936',
    },

    label: {
        fontSize: 13,
        fontWeight: '700',
        color: '#D4D4DE',
        marginBottom: 9,
    },

    passwordLabel: {
        marginTop: 22,
    },

    inputRow: {
        minHeight: 56,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: COLORS.field,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 15,
        paddingHorizontal: 15,
    },

    inputFocused: {
        borderColor: COLORS.primary,
    },

    input: {
        flex: 1,
        minWidth: 0,
        height: 54,
        fontSize: 15,
        color: COLORS.text,
        paddingVertical: 12,
    },

    forgot: {
        alignSelf: 'flex-end',
        marginTop: 15,
        paddingVertical: 4,
    },

    link: {
        color: COLORS.link,
        fontSize: 13,
        fontWeight: '700',
    },

    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 14,
    },

    error: {
        flex: 1,
        color: COLORS.error,
        fontSize: 13,
        lineHeight: 19,
    },

    button: {
        backgroundColor: COLORS.primary,
        minHeight: 58,
        borderRadius: 16,
        marginTop: 22,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 10,
    },

    buttonPressed: {
        opacity: 0.82,
        transform: [{ scale: 0.99 }],
    },

    buttonDisabled: {
        opacity: 0.65,
    },

    buttonText: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '800',
    },

    secureNote: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
        marginTop: 19,
    },

    secureText: {
        color: COLORS.muted,
        fontSize: 12,
    },

    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginVertical: 25,
    },

    line: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.border,
    },

    dividerText: {
        color: COLORS.muted,
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
    },

    socialRow: {
        flexDirection: 'row',
        gap: 12,
    },

    socialButton: {
        flex: 1,
        minHeight: 52,
        flexDirection: 'row',
        gap: 9,
        borderRadius: 15,
        backgroundColor: COLORS.card,
        borderWidth: 1,
        borderColor: '#292936',
        alignItems: 'center',
        justifyContent: 'center',
    },

    socialText: {
        color: COLORS.text,
        fontSize: 14,
        fontWeight: '700',
    },

    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 30,
    },

    footerText: {
        color: COLORS.muted,
        fontSize: 13,
    },

    signupLink: {
        color: COLORS.link,
        fontSize: 13,
        fontWeight: '800',
    },
});
