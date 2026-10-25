
import { useCallback, useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Pressable,
    ScrollView,
    Alert,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
    StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { api } from '../lib/api';

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
    green: '#6EE7B7',
    orange: '#FDBA74',
};

type Expense = {
    id: number;
    title: string;
    amount: number;
    category: string;
    description?: string;
    expenseDate: string;
};

type ExpenseSummary = {
    totalExpense: number;
    totalTransactions: number;
};

type CategoryInfo = {
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    background: string;
};

const CATEGORIES: { name: string; info: CategoryInfo }[] = [
    {
        name: 'Food',
        info: {
            icon: 'fast-food-outline',
            color: '#FDBA74',
            background: '#39281E',
        },
    },
    {
        name: 'Shopping',
        info: {
            icon: 'bag-handle-outline',
            color: '#C4B5FD',
            background: '#302448',
        },
    },
    {
        name: 'Travel',
        info: {
            icon: 'airplane-outline',
            color: '#7DD3FC',
            background: '#193344',
        },
    },
    {
        name: 'Bills',
        info: {
            icon: 'receipt-outline',
            color: '#FDE68A',
            background: '#39331E',
        },
    },
    {
        name: 'Groceries',
        info: {
            icon: 'cart-outline',
            color: '#86EFAC',
            background: '#193629',
        },
    },
    {
        name: 'Health',
        info: {
            icon: 'heart-outline',
            color: '#FDA4AF',
            background: '#41232D',
        },
    },
    {
        name: 'Entertainment',
        info: {
            icon: 'game-controller-outline',
            color: '#D8B4FE',
            background: '#342448',
        },
    },
    {
        name: 'Other',
        info: {
            icon: 'wallet-outline',
            color: '#C4B5FD',
            background: '#302448',
        },
    },
];

const getCategoryInfo = (category?: string): CategoryInfo => {
    const normalized = category?.trim().toLowerCase();

    const found = CATEGORIES.find(
        (item) => item.name.toLowerCase() === normalized
    );

    return (
        found?.info ?? {
            icon: 'wallet-outline',
            color: C.purpleLight,
            background: '#302448',
        }
    );
};

const money = (value: number): string =>
    `₹${Number(value || 0).toLocaleString('en-IN', {
        maximumFractionDigits: 2,
    })}`;

const getMessage = (e: unknown, fallback: string): string =>
    e instanceof Error ? e.message : fallback;

const getToday = (): string => {
    const d = new Date();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
};

export default function Home() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [summary, setSummary] = useState<ExpenseSummary | null>(null);
    const [userEmail, setUserEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [saving, setSaving] = useState(false);

    const loadData = useCallback(async () => {
        try {
            setError('');

            const [list, sum, savedEmail] = await Promise.all([
                api<Expense[]>('/expenses'),
                api<ExpenseSummary>('/expenses/summary'),
                SecureStore.getItemAsync('user_email'),
            ]);

            setExpenses(list);
            setSummary(sum);
            setUserEmail(savedEmail ?? '');
        } catch (e) {
            setError(getMessage(e, 'Unable to load expenses.'));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        void loadData();
    }, [loadData]);

    const handleRefresh = () => {
        setRefreshing(true);
        void loadData();
    };

    const handleAdd = async () => {
        setError('');

        if (!title.trim() || !amount.trim() || !category) {
            setError('Please fill in the title, amount and category.');
            return;
        }

        const parsedAmount = Number(amount);

        if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
            setError('Enter a valid amount greater than zero.');
            return;
        }

        try {
            setSaving(true);

            await api<Expense>('/expenses', {
                method: 'POST',
                body: JSON.stringify({
                    title: title.trim(),
                    amount: parsedAmount,
                    category,
                    description: description.trim(),
                    expenseDate: getToday(),
                }),
            });

            setTitle('');
            setAmount('');
            setCategory('');
            setDescription('');
            setShowForm(false);

            await loadData();
        } catch (e) {
            setError(getMessage(e, 'Unable to save expense.'));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = (id: number) => {
        Alert.alert(
            'Delete expense?',
            'This transaction will be permanently deleted.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setError('');
                            await api<null>(`/expenses/${id}`, {
                                method: 'DELETE',
                            });
                            await loadData();
                        } catch (e) {
                            setError(
                                getMessage(e, 'Unable to delete expense.')
                            );
                        }
                    },
                },
            ]
        );
    };

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: async () => {
                    await SecureStore.deleteItemAsync('jwt_token');
                    await SecureStore.deleteItemAsync('user_email');
                    router.replace('/login');
                },
            },
        ]);
    };

    const total = Number(summary?.totalExpense ?? 0);
    const count = summary?.totalTransactions ?? expenses.length;

    return (
        <View style={styles.screen}>
            <StatusBar barStyle="light-content" backgroundColor={C.bg} />

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={C.purpleLight}
                        colors={[C.purple]}
                    />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.brandRow}>
                        <View style={styles.brandIcon}>
                            <Ionicons
                                name="wallet"
                                size={22}
                                color="#FFFFFF"
                            />
                        </View>
                        <Text style={styles.brandName}>Pennywise</Text>
                    </View>

                    <Pressable
                        onPress={handleLogout}
                        style={styles.logoutButton}
                        accessibilityLabel="Logout"
                    >
                        <Ionicons
                            name="log-out-outline"
                            size={20}
                            color={C.purpleLight}
                        />
                    </Pressable>
                </View>

                <Text style={styles.eyebrow}>YOUR FINANCES</Text>
                <Text style={styles.heading}>My Expenses</Text>
                <Text style={styles.welcome} numberOfLines={1}>
                    {userEmail || 'Welcome back!'}
                </Text>

                {/* Spending summary */}
                <View style={styles.totalCard}>
                    <View style={styles.cardDecoration} />

                    <View style={styles.totalTop}>
                        <View>
                            <Text style={styles.totalLabel}>
                                Total expenses
                            </Text>
                            <Text style={styles.totalValue}>
                                {money(total)}
                            </Text>
                        </View>

                        <View style={styles.totalIcon}>
                            <Ionicons
                                name="wallet-outline"
                                size={27}
                                color="#FFFFFF"
                            />
                        </View>
                    </View>

                    <View style={styles.totalDivider} />

                    <View style={styles.totalBottom}>
                        <View style={styles.transactionPill}>
                            <Ionicons
                                name="receipt-outline"
                                size={15}
                                color="#FFFFFF"
                            />
                            <Text style={styles.transactionText}>
                                {count} {count === 1 ? 'transaction' : 'transactions'}
                            </Text>
                        </View>

                        <View style={styles.secureBadge}>
                            <Ionicons
                                name="shield-checkmark-outline"
                                size={15}
                                color="#E9DDFF"
                            />
                            <Text style={styles.secureBadgeText}>Secure</Text>
                        </View>
                    </View>
                </View>

                {/* Error state */}
                {error !== '' && (
                    <View style={styles.errorBox}>
                        <Ionicons
                            name="alert-circle-outline"
                            size={20}
                            color={C.red}
                        />
                        <Text style={styles.errorText}>{error}</Text>
                        <Pressable onPress={() => setError('')}>
                            <Ionicons
                                name="close"
                                size={19}
                                color={C.muted}
                            />
                        </Pressable>
                    </View>
                )}

                {/* Add expense action */}
                <Pressable
                    style={({ pressed }) => [
                        styles.addButton,
                        pressed && styles.pressed,
                    ]}
                    onPress={() => {
                        setError('');
                        setShowForm((current) => !current);
                    }}
                >
                    <View style={styles.addButtonIcon}>
                        <Ionicons
                            name={showForm ? 'close' : 'add'}
                            size={25}
                            color={C.purple}
                        />
                    </View>

                    <View style={styles.addButtonContent}>
                        <Text style={styles.addButtonTitle}>
                            {showForm ? 'Close form' : 'Add an expense'}
                        </Text>
                        <Text style={styles.addButtonSubtitle}>
                            {showForm
                                ? 'Return to your transactions'
                                : 'Track where your money goes'}
                        </Text>
                    </View>

                    <Ionicons
                        name="arrow-forward"
                        size={20}
                        color="#FFFFFF"
                    />
                </Pressable>

                {/* Add expense form */}
                {showForm && (
                    <View style={styles.formCard}>
                        <Text style={styles.formTitle}>New transaction</Text>
                        <Text style={styles.formSubtitle}>
                            Enter the details below
                        </Text>

                        <Text style={styles.label}>Expense title</Text>
                        <View style={styles.inputRow}>
                            <Ionicons
                                name="create-outline"
                                size={19}
                                color={C.muted}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Monthly groceries"
                                placeholderTextColor={C.muted}
                                value={title}
                                onChangeText={setTitle}
                                maxLength={100}
                            />
                        </View>

                        <Text style={styles.label}>Amount (₹)</Text>
                        <View style={styles.inputRow}>
                            <Ionicons
                                name="cash-outline"
                                size={20}
                                color={C.muted}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="0.00"
                                placeholderTextColor={C.muted}
                                value={amount}
                                onChangeText={(value) => {
                                    if (/^\d*\.?\d{0,2}$/.test(value)) {
                                        setAmount(value);
                                    }
                                }}
                                keyboardType="decimal-pad"
                            />
                        </View>

                        <Text style={styles.label}>Choose category</Text>
                        <View style={styles.categoryGrid}>
                            {CATEGORIES.map((item) => {
                                const selected = category === item.name;

                                return (
                                    <Pressable
                                        key={item.name}
                                        onPress={() => setCategory(item.name)}
                                        style={[
                                            styles.categoryOption,
                                            selected &&
                                            styles.categoryOptionSelected,
                                        ]}
                                    >
                                        <View
                                            style={[
                                                styles.categoryOptionIcon,
                                                {
                                                    backgroundColor:
                                                        item.info.background,
                                                },
                                            ]}
                                        >
                                            <Ionicons
                                                name={item.info.icon}
                                                size={20}
                                                color={item.info.color}
                                            />
                                        </View>
                                        <Text
                                            style={[
                                                styles.categoryOptionText,
                                                selected &&
                                                styles.categoryOptionTextSelected,
                                            ]}
                                        >
                                            {item.name}
                                        </Text>

                                        {selected && (
                                            <Ionicons
                                                name="checkmark-circle"
                                                size={16}
                                                color={C.purpleLight}
                                            />
                                        )}
                                    </Pressable>
                                );
                            })}
                        </View>

                        <Text style={styles.label}>
                            Description (optional)
                        </Text>
                        <View style={[styles.inputRow, styles.descriptionRow]}>
                            <Ionicons
                                name="document-text-outline"
                                size={19}
                                color={C.muted}
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Add a note..."
                                placeholderTextColor={C.muted}
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                maxLength={300}
                            />
                        </View>

                        <Pressable
                            style={({ pressed }) => [
                                styles.saveButton,
                                (saving || pressed) && styles.pressed,
                            ]}
                            onPress={handleAdd}
                            disabled={saving}
                        >
                            {saving ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <>
                                    <Ionicons
                                        name="checkmark-circle-outline"
                                        size={21}
                                        color="#FFFFFF"
                                    />
                                    <Text style={styles.saveButtonText}>
                                        Save expense
                                    </Text>
                                </>
                            )}
                        </Pressable>

                        <Pressable
                            onPress={() => setShowForm(false)}
                            style={styles.cancelButton}
                            disabled={saving}
                        >
                            <Text style={styles.cancelText}>Cancel</Text>
                        </Pressable>
                    </View>
                )}

                {/* Recent expenses */}
                <View style={styles.sectionHeader}>
                    <View>
                        <Text style={styles.sectionTitle}>
                            Recent activity
                        </Text>
                        <Text style={styles.sectionSubtitle}>
                            Your latest transactions
                        </Text>
                    </View>

                    <View style={styles.countBadge}>
                        <Text style={styles.countBadgeText}>
                            {expenses.length}
                        </Text>
                    </View>
                </View>

                {loading && expenses.length === 0 ? (
                    <View style={styles.stateCard}>
                        <ActivityIndicator
                            size="large"
                            color={C.purpleLight}
                        />
                        <Text style={styles.stateText}>
                            Loading your expenses...
                        </Text>
                    </View>
                ) : expenses.length === 0 && error === '' ? (
                    <View style={styles.stateCard}>
                        <View style={styles.emptyIcon}>
                            <Ionicons
                                name="receipt-outline"
                                size={30}
                                color={C.purpleLight}
                            />
                        </View>
                        <Text style={styles.emptyTitle}>
                            Nothing here yet
                        </Text>
                        <Text style={styles.stateText}>
                            Add your first expense and start tracking your spending.
                        </Text>
                        <Pressable
                            style={styles.emptyButton}
                            onPress={() => setShowForm(true)}
                        >
                            <Text style={styles.emptyButtonText}>
                                Add first expense
                            </Text>
                        </Pressable>
                    </View>
                ) : (
                    expenses.map((item) => {
                        const info = getCategoryInfo(item.category);

                        return (
                            <View key={item.id} style={styles.expenseRow}>
                                <View
                                    style={[
                                        styles.expenseIcon,
                                        { backgroundColor: info.background },
                                    ]}
                                >
                                    <Ionicons
                                        name={info.icon}
                                        size={23}
                                        color={info.color}
                                    />
                                </View>

                                <View style={styles.expenseInfo}>
                                    <Text
                                        style={styles.expenseTitle}
                                        numberOfLines={1}
                                    >
                                        {item.title}
                                    </Text>
                                    <Text style={styles.expenseMeta}>
                                        {item.category}
                                    </Text>
                                    <Text
                                        style={styles.expenseDate}
                                        numberOfLines={1}
                                    >
                                        {item.expenseDate}
                                    </Text>
                                </View>

                                <View style={styles.expenseRight}>
                                    <Text style={styles.expenseAmount}>
                                        −{money(Number(item.amount))}
                                    </Text>

                                    <Pressable
                                        onPress={() => handleDelete(item.id)}
                                        hitSlop={8}
                                        style={styles.deleteButton}
                                        accessibilityLabel={`Delete ${item.title}`}
                                    >
                                        <Ionicons
                                            name="trash-outline"
                                            size={17}
                                            color={C.muted}
                                        />
                                        <Text style={styles.deleteText}>
                                            Delete
                                        </Text>
                                    </Pressable>
                                </View>
                            </View>
                        );
                    })
                )}

                <View style={styles.footer}>
                    <Ionicons
                        name="shield-checkmark-outline"
                        size={15}
                        color={C.muted}
                    />
                    <Text style={styles.footerText}>
                        Your money, organised your way.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: C.bg,
    },
    content: {
        paddingHorizontal: 21,
        paddingTop: 18,
        paddingBottom: 32,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 31,
    },
    brandRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 11,
    },
    brandIcon: {
        width: 43,
        height: 43,
        borderRadius: 15,
        backgroundColor: C.purple,
        alignItems: 'center',
        justifyContent: 'center',
    },
    brandName: {
        color: C.text,
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: 0.2,
    },
    logoutButton: {
        width: 43,
        height: 43,
        borderRadius: 15,
        backgroundColor: '#211A30',
        borderWidth: 1,
        borderColor: '#332747',
        alignItems: 'center',
        justifyContent: 'center',
    },
    eyebrow: {
        color: C.purpleLight,
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 2,
        marginBottom: 8,
    },
    heading: {
        color: C.text,
        fontSize: 30,
        fontWeight: '800',
        letterSpacing: -0.7,
    },
    welcome: {
        color: C.muted,
        fontSize: 13,
        marginTop: 7,
        marginBottom: 24,
    },
    totalCard: {
        overflow: 'hidden',
        backgroundColor: '#5833A0',
        borderRadius: 25,
        padding: 22,
        marginBottom: 18,
    },
    cardDecoration: {
        position: 'absolute',
        right: -45,
        top: 35,
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(255,255,255,0.045)',
    },
    totalTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        color: '#E5D9FF',
        fontSize: 14,
        fontWeight: '600',
    },
    totalValue: {
        color: '#FFFFFF',
        fontSize: 35,
        fontWeight: '800',
        marginTop: 10,
        letterSpacing: -0.6,
    },
    totalIcon: {
        width: 50,
        height: 50,
        borderRadius: 17,
        backgroundColor: '#7752BB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    totalDivider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.17)',
        marginVertical: 19,
    },
    totalBottom: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
    },
    transactionPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        backgroundColor: '#704DB5',
        paddingHorizontal: 11,
        paddingVertical: 8,
        borderRadius: 30,
    },
    transactionText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
    },
    secureBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    secureBadgeText: {
        color: '#E9DDFF',
        fontSize: 12,
        fontWeight: '600',
    },
    errorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 9,
        backgroundColor: '#301B25',
        borderWidth: 1,
        borderColor: '#55303C',
        borderRadius: 15,
        padding: 13,
        marginBottom: 15,
    },
    errorText: {
        flex: 1,
        color: '#FECDD3',
        fontSize: 12,
        lineHeight: 18,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: C.purple,
        borderRadius: 19,
        paddingHorizontal: 15,
        paddingVertical: 14,
        minHeight: 76,
        marginBottom: 31,
        gap: 12,
    },
    addButtonIcon: {
        width: 43,
        height: 43,
        borderRadius: 14,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    addButtonContent: {
        flex: 1,
    },
    addButtonTitle: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '800',
    },
    addButtonSubtitle: {
        color: '#E9DDFF',
        fontSize: 11,
        marginTop: 5,
    },
    pressed: {
        opacity: 0.82,
    },
    formCard: {
        backgroundColor: C.card,
        borderWidth: 1,
        borderColor: C.border,
        borderRadius: 23,
        padding: 18,
        marginBottom: 30,
    },
    formTitle: {
        color: C.text,
        fontSize: 19,
        fontWeight: '800',
    },
    formSubtitle: {
        color: C.muted,
        fontSize: 12,
        marginTop: 5,
        marginBottom: 12,
    },
    label: {
        color: '#D8D8E3',
        fontSize: 12,
        fontWeight: '700',
        marginTop: 16,
        marginBottom: 9,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 11,
        minHeight: 54,
        backgroundColor: C.field,
        borderWidth: 1,
        borderColor: C.border,
        borderRadius: 15,
        paddingHorizontal: 14,
    },
    input: {
        flex: 1,
        minWidth: 0,
        minHeight: 52,
        color: C.text,
        fontSize: 14,
        paddingVertical: 10,
    },
    descriptionRow: {
        alignItems: 'flex-start',
        paddingTop: 2,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    categoryOption: {
        width: '48%',
        minHeight: 57,
        flexGrow: 1,
        flexBasis: '40%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 9,
        paddingVertical: 8,
        borderRadius: 13,
        borderWidth: 1,
        borderColor: C.border,
        backgroundColor: C.field,
    },
    categoryOptionSelected: {
        borderColor: C.purple,
        backgroundColor: '#251C36',
    },
    categoryOptionIcon: {
        width: 34,
        height: 34,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoryOptionText: {
        flex: 1,
        color: C.muted,
        fontSize: 11,
        fontWeight: '700',
    },
    categoryOptionTextSelected: {
        color: '#FFFFFF',
    },
    saveButton: {
        minHeight: 54,
        backgroundColor: C.purple,
        borderRadius: 15,
        marginTop: 22,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 9,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '800',
    },
    cancelButton: {
        alignItems: 'center',
        paddingVertical: 14,
    },
    cancelText: {
        color: C.muted,
        fontSize: 13,
        fontWeight: '600',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 17,
    },
    sectionTitle: {
        color: C.text,
        fontSize: 20,
        fontWeight: '800',
    },
    sectionSubtitle: {
        color: C.muted,
        fontSize: 12,
        marginTop: 5,
    },
    countBadge: {
        minWidth: 38,
        height: 34,
        borderRadius: 11,
        paddingHorizontal: 10,
        backgroundColor: '#211A30',
        borderWidth: 1,
        borderColor: '#332747',
        alignItems: 'center',
        justifyContent: 'center',
    },
    countBadgeText: {
        color: C.purpleLight,
        fontSize: 13,
        fontWeight: '800',
    },
    expenseRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: C.card,
        borderWidth: 1,
        borderColor: C.border,
        borderRadius: 19,
        padding: 13,
        marginBottom: 11,
        gap: 11,
    },
    expenseIcon: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    expenseInfo: {
        flex: 1,
        minWidth: 0,
    },
    expenseTitle: {
        color: C.text,
        fontSize: 14,
        fontWeight: '700',
    },
    expenseMeta: {
        color: C.purpleLight,
        fontSize: 11,
        marginTop: 5,
        fontWeight: '600',
    },
    expenseDate: {
        color: C.muted,
        fontSize: 10,
        marginTop: 4,
    },
    expenseRight: {
        alignItems: 'flex-end',
        gap: 10,
        maxWidth: '42%',
    },
    expenseAmount: {
        color: C.red,
        fontSize: 13,
        fontWeight: '800',
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 3,
    },
    deleteText: {
        color: C.muted,
        fontSize: 10,
        fontWeight: '600',
    },
    stateCard: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: C.card,
        borderWidth: 1,
        borderColor: C.border,
        borderRadius: 21,
        paddingHorizontal: 22,
        paddingVertical: 28,
        gap: 12,
    },
    stateText: {
        color: C.muted,
        fontSize: 12,
        lineHeight: 19,
        textAlign: 'center',
    },
    emptyIcon: {
        width: 62,
        height: 62,
        borderRadius: 21,
        backgroundColor: '#302448',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 2,
    },
    emptyTitle: {
        color: C.text,
        fontSize: 17,
        fontWeight: '800',
    },
    emptyButton: {
        backgroundColor: C.purple,
        borderRadius: 13,
        paddingHorizontal: 17,
        paddingVertical: 11,
        marginTop: 5,
    },
    emptyButtonText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '800',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
        marginTop: 23,
        paddingVertical: 10,
    },
    footerText: {
        color: C.muted,
        fontSize: 11,
    },
});
