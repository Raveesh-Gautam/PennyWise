
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
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const C = {
    bg: '#0B0B10',
    card: '#15151D',
    field: '#20202A',
    border: '#2B2B38',
    purple: '#8B5CF6',
    purpleLight: '#C4B5FD',
    text: '#F7F7FB',
    muted: '#9696A8',
    red: '#FB7185',
    orange: '#FDBA74',
    green: '#6EE7B7',
};

const API_URL = 'http://10.149.204.247:8082/signup';

function getStrength(password: string) {
    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;

    return score;
}

export default function Signup() {
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [focused, setFocused] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const strength = getStrength(password);
    const strengthColor =
        strength === 1 ? C.red :
            strength === 2 ? C.orange :
                C.green;

    const strengthLabel =
        password.length === 0 ? '' :
            strength === 1 ? 'Weak' :
                strength === 2 ? 'Medium' :
                    'Strong';

    const handleSignup = async () => {
        setError('');

        if (!email.trim() || !phone.trim() || !password || !confirm) {
            setError('Please fill all fields.');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            setError('Please enter a valid email address.');
            return;
        }

        const phoneDigits = phone.replace(/\D/g, '');

        if (phoneDigits.length !== 10) {
            setError('Please enter a valid 10-digit phone number.');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        if (password !== confirm) {
            setError('Passwords do not match.');
            return;
        }

        if (!agreed) {
            setError('Please accept the Terms & Privacy Policy.');
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email.trim(),
                    phone: phoneDigits,
                    password,
                }),
            });

            if (!response.ok) {
                if (response.status === 409) {
                    throw new Error('An account with this email already exists.');
                }

                throw new Error(`Signup failed (${response.status}).`);
            }

            console.log('Signup successful');
            router.replace('/login');
        } catch (err) {
            console.error(
                'Signup error:',
                err instanceof Error ? err.message : 'Unknown error'
            );

            setError(
                err instanceof Error
                    ? err.message
                    : 'Unable to connect to the server.'
            );
        } finally {
            setLoading(false);
        }
    };

    const fieldStyle = (key: string) => [
        styles.inputContainer,
        focused === key && styles.inputFocused,
    ];

    const focusHandlers = (key: string) => ({
        onFocus: () => setFocused(key),
        onBlur: () => setFocused(''),
    });

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <StatusBar barStyle="light-content" backgroundColor={C.bg} />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.topBar}>
                    <Pressable
                        style={styles.backButton}
                        onPress={() => router.back()}
                        accessibilityRole="button"
                        accessibilityLabel="Go back"
                    >
                        <Ionicons
                            name="arrow-back"
                            size={21}
                            color={C.text}
                        />
                    </Pressable>

                    <View style={styles.brand}>
                        <View style={styles.brandIcon}>
                            <Ionicons
                                name="wallet"
                                size={20}
                                color={C.purpleLight}
                            />
                        </View>
                        <Text style={styles.brandText}>Pennywise</Text>
                    </View>

                    <View style={styles.headerSpacer} />
                </View>

                {/* Intro */}
                <View style={styles.intro}>
                    <View style={styles.eyebrow}>
                        <View style={styles.eyebrowDot} />
                        <Text style={styles.eyebrowText}>
                            START YOUR JOURNEY
                        </Text>
                    </View>

                    <Text style={styles.title}>Create your{'\n'}account.</Text>

                    <Text style={styles.subtitle}>
                        Take control of your money, one{'\n'}smart decision at a time.
                    </Text>
                </View>

                {/* Form card */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Your details</Text>
                    <Text style={styles.sectionSubtitle}>
                        Enter your information to get started.
                    </Text>

                    {/* Email */}
                    <Text style={styles.label}>EMAIL ADDRESS</Text>

                    <View style={fieldStyle('email')}>
                        <Ionicons
                            name="mail-outline"
                            size={19}
                            color={focused === 'email' ? C.purpleLight : C.muted}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="you@example.com"
                            placeholderTextColor={C.muted}
                            value={email}
                            onChangeText={(value) => {
                                setEmail(value);
                                setError('');
                            }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            autoComplete="email"
                            {...focusHandlers('email')}
                        />
                    </View>

                    {/* Phone */}
                    <Text style={styles.label}>PHONE NUMBER</Text>

                    <View style={fieldStyle('phone')}>
                        <Ionicons
                            name="call-outline"
                            size={19}
                            color={focused === 'phone' ? C.purpleLight : C.muted}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="10-digit mobile number"
                            placeholderTextColor={C.muted}
                            value={phone}
                            onChangeText={(value) => {
                                setPhone(value.replace(/[^0-9+()\-\s]/g, ''));
                                setError('');
                            }}
                            keyboardType="phone-pad"
                            autoComplete="tel"
                            {...focusHandlers('phone')}
                        />
                    </View>

                    {/* Password */}
                    <Text style={styles.label}>PASSWORD</Text>

                    <View style={fieldStyle('password')}>
                        <Ionicons
                            name="lock-closed-outline"
                            size={19}
                            color={focused === 'password' ? C.purpleLight : C.muted}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Create a strong password"
                            placeholderTextColor={C.muted}
                            value={password}
                            onChangeText={(value) => {
                                setPassword(value);
                                setError('');
                            }}
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                            autoComplete="new-password"
                            {...focusHandlers('password')}
                        />

                        <Pressable
                            onPress={() => setShowPassword(!showPassword)}
                            hitSlop={10}
                            accessibilityRole="button"
                            accessibilityLabel={
                                showPassword ? 'Hide password' : 'Show password'
                            }
                        >
                            <Ionicons
                                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                size={20}
                                color={C.muted}
                            />
                        </Pressable>
                    </View>

                    {/* Password strength */}
                    {password.length > 0 && (
                        <View style={styles.strengthWrap}>
                            <View style={styles.strengthBars}>
                                {[1, 2, 3].map((item) => (
                                    <View
                                        key={item}
                                        style={[
                                            styles.strengthBar,
                                            {
                                                backgroundColor:
                                                    strength >= item
                                                        ? strengthColor
                                                        : C.border,
                                            },
                                        ]}
                                    />
                                ))}
                            </View>

                            <Text
                                style={[
                                    styles.strengthText,
                                    { color: strengthColor },
                                ]}
                            >
                                {strengthLabel}
                            </Text>
                        </View>
                    )}

                    {/* Confirm password */}
                    <Text style={styles.label}>CONFIRM PASSWORD</Text>

                    <View style={fieldStyle('confirm')}>
                        <Ionicons
                            name="shield-checkmark-outline"
                            size={19}
                            color={focused === 'confirm' ? C.purpleLight : C.muted}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Re-enter your password"
                            placeholderTextColor={C.muted}
                            value={confirm}
                            onChangeText={(value) => {
                                setConfirm(value);
                                setError('');
                            }}
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                            autoComplete="new-password"
                            {...focusHandlers('confirm')}
                        />
                    </View>

                    {confirm.length > 0 && (
                        <View style={styles.matchRow}>
                            <Ionicons
                                name={
                                    password === confirm
                                        ? 'checkmark-circle'
                                        : 'information-circle-outline'
                                }
                                size={15}
                                color={password === confirm ? C.green : C.muted}
                            />
                            <Text
                                style={[
                                    styles.matchText,
                                    password === confirm && { color: C.green },
                                ]}
                            >
                                {password === confirm
                                    ? 'Passwords match'
                                    : 'Passwords do not match yet'}
                            </Text>
                        </View>
                    )}

                    {/* Terms */}
                    <Pressable
                        style={styles.checkRow}
                        onPress={() => {
                            setAgreed(!agreed);
                            setError('');
                        }}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: agreed }}
                    >
                        <View style={[styles.checkbox, agreed && styles.checkboxOn]}>
                            {agreed && (
                                <Ionicons
                                    name="checkmark"
                                    size={14}
                                    color="#FFFFFF"
                                />
                            )}
                        </View>

                        <Text style={styles.termsText}>
                            I agree to the <Text style={styles.termsLink}>Terms</Text>
                            {' '}and{' '}
                            <Text style={styles.termsLink}>Privacy Policy</Text>
                        </Text>
                    </Pressable>

                    {/* Error */}
                    {error !== '' && (
                        <View style={styles.errorBox}>
                            <Ionicons
                                name="alert-circle-outline"
                                size={18}
                                color={C.red}
                            />
                            <Text style={styles.errorText}>{error}</Text>
                        </View>
                    )}

                    {/* Submit */}
                    <Pressable
                        style={({ pressed }) => [
                            styles.button,
                            pressed && !loading && styles.buttonPressed,
                            loading && styles.buttonDisabled,
                        ]}
                        onPress={handleSignup}
                        disabled={loading}
                        accessibilityRole="button"
                    >
                        {loading ? (
                            <>
                                <ActivityIndicator color="#FFFFFF" />
                                <Text style={styles.buttonText}>
                                    Creating account...
                                </Text>
                            </>
                        ) : (
                            <>
                                <Text style={styles.buttonText}>
                                    Create Account
                                </Text>
                                <Ionicons
                                    name="arrow-forward"
                                    size={19}
                                    color="#FFFFFF"
                                />
                            </>
                        )}
                    </Pressable>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        Already have an account?
                    </Text>

                    <Pressable
                        onPress={() => router.replace('/login')}
                        hitSlop={8}
                    >
                        <Text style={styles.footerLink}>Log in</Text>
                    </Pressable>
                </View>

                <View style={styles.securityNote}>
                    <Ionicons
                        name="shield-checkmark-outline"
                        size={15}
                        color={C.muted}
                    />
                    <Text style={styles.securityText}>
                        Your information is protected
                    </Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: C.bg,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 22,
        paddingTop: Platform.OS === 'android' ? 28 : 56,
        paddingBottom: 30,
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 15,
        backgroundColor: C.card,
        borderWidth: 1,
        borderColor: C.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    brand: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 9,
    },
    brandIcon: {
        width: 34,
        height: 34,
        borderRadius: 11,
        backgroundColor: '#251B3D',
        alignItems: 'center',
        justifyContent: 'center',
    },
    brandText: {
        color: C.text,
        fontSize: 17,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    headerSpacer: {
        width: 44,
    },
    intro: {
        marginBottom: 26,
    },
    eyebrow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 13,
    },
    eyebrowDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: C.purpleLight,
    },
    eyebrowText: {
        color: C.purpleLight,
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 1.8,
    },
    title: {
        color: C.text,
        fontSize: 36,
        lineHeight: 42,
        fontWeight: '800',
        letterSpacing: -1.2,
    },
    subtitle: {
        color: C.muted,
        fontSize: 14,
        lineHeight: 22,
        marginTop: 12,
    },
    card: {
        backgroundColor: C.card,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: C.border,
        padding: 20,
    },
    sectionTitle: {
        color: C.text,
        fontSize: 19,
        fontWeight: '800',
        letterSpacing: -0.3,
    },
    sectionSubtitle: {
        color: C.muted,
        fontSize: 12,
        lineHeight: 18,
        marginTop: 5,
        marginBottom: 8,
    },
    label: {
        color: C.muted,
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 1.1,
        marginTop: 19,
        marginBottom: 9,
    },
    inputContainer: {
        minHeight: 54,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: C.field,
        borderWidth: 1,
        borderColor: C.border,
        borderRadius: 15,
        paddingHorizontal: 15,
    },
    inputFocused: {
        borderColor: C.purple,
    },
    input: {
        flex: 1,
        minWidth: 0,
        height: 52,
        color: C.text,
        fontSize: 14,
    },
    strengthWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: 11,
    },
    strengthBars: {
        flex: 1,
        flexDirection: 'row',
        gap: 6,
    },
    strengthBar: {
        flex: 1,
        height: 4,
        borderRadius: 3,
    },
    strengthText: {
        fontSize: 11,
        fontWeight: '700',
        minWidth: 48,
        textAlign: 'right',
    },
    matchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 9,
    },
    matchText: {
        color: C.muted,
        fontSize: 11,
    },
    checkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 11,
        marginTop: 22,
    },
    checkbox: {
        width: 21,
        height: 21,
        borderRadius: 6,
        borderWidth: 1.5,
        borderColor: C.muted,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxOn: {
        backgroundColor: C.purple,
        borderColor: C.purple,
    },
    termsText: {
        flex: 1,
        color: C.muted,
        fontSize: 12,
        lineHeight: 19,
    },
    termsLink: {
        color: C.purpleLight,
        fontWeight: '700',
    },
    errorBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 9,
        padding: 12,
        marginTop: 16,
        borderRadius: 12,
        backgroundColor: '#351B25',
        borderWidth: 1,
        borderColor: '#5A2937',
    },
    errorText: {
        flex: 1,
        color: C.red,
        fontSize: 12,
        lineHeight: 18,
    },
    button: {
        minHeight: 55,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: C.purple,
        borderRadius: 16,
        marginTop: 22,
        paddingHorizontal: 16,
    },
    buttonPressed: {
        opacity: 0.85,
        transform: [{ scale: 0.99 }],
    },
    buttonDisabled: {
        opacity: 0.65,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '800',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5,
        marginTop: 25,
    },
    footerText: {
        color: C.muted,
        fontSize: 13,
    },
    footerLink: {
        color: C.purpleLight,
        fontSize: 13,
        fontWeight: '800',
    },
    securityNote: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
        marginTop: 20,
    },
    securityText: {
        color: C.muted,
        fontSize: 11,
    },
});
