import ConfirmModal from '@/components/ConfirmModal';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useEffect, useRef, useState } from 'react';
import 'react-calendar/dist/Calendar.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
    ActivityIndicator,
    Alert,
    Animated,
    FlatList, KeyboardAvoidingView,
    Platform,
    Pressable, ScrollView,
    StyleSheet, Text, TextInput, View
} from 'react-native';
import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';
import './index.css';



export default function BookingsScreen() {
    const scrollRef = useRef<ScrollView>(null);

    const [mode, setMode] = useState<'none' | 'form' | 'list' | 'edit'>('none');
    const [customerName, setCustomerName] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [pickup, setPickup] = useState('');
    const [dropoff, setDropoff] = useState('');
    const [notes, setNotes] = useState('');
    // const [pickupTime, setPickupTime] = useState('');
    // const [dropoffTime, setDropoffTime] = useState('');
    const [email, setEmail] = useState('');
    // const [date, setDate] = useState('');
    const [date, setDate] = useState(new Date());
    const [pickupTime, setPickupTime] = useState(new Date());
    const [dropoffTime, setDropoffTime] = useState(new Date());

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showPickupTimePicker, setShowPickupTimePicker] = useState(false);
    const [showDropoffTimePicker, setShowDropoffTimePicker] = useState(false);

    const [fare, setFare] = useState('');
    const [paymentStatus, setPaymentStatus] = useState<'paid' | 'pending'>('pending');
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [bookings, setBookings] = useState<any[]>([]);
    const [lastKey, setLastKey] = useState<string | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [hasMore, setHasMore] = useState(true);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const API_URL = 'https://0izwka3sk3.execute-api.us-east-1.amazonaws.com/v1/bookings';

    const spinAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (isLoading) {
            Animated.loop(
                Animated.timing(spinAnim, {
                    toValue: 1,
                    duration: 1200,
                    useNativeDriver: true,
                })
            ).start();
        } else {
            spinAnim.setValue(0);
        }
    }, [isLoading]);

    const spin = spinAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const resetForm = () => {
        setCustomerName('');
        setContactNumber('');
        setPickup('');
        setDropoff('');
        setNotes('');
        // setPickupTime('');
        // setDropoffTime('');
        setEmail('');
        // setDate('');
        setDate(new Date());
        setPickupTime(new Date());
        setDropoffTime(new Date());
        setFare('');
        setPaymentMethod('cash');
        setPaymentStatus('pending');
    };

    const handleAddBooking = async () => {
        if (!customerName || !contactNumber || !pickup || !dropoff) {
            Alert.alert('Error', 'Please fill in all required fields.');
            return;
        }

        const bookingData = {
            customerName, contactNumber, pickup, dropoff,
            pickupTime: pickupTime.toISOString(),
            dropoffTime: dropoffTime.toISOString(),
            notes, email,
            date: date.toISOString().split('T')[0], // Format: YYYY-MM-DD
            fare,
            paymentMethod,
            paymentStatus,
        };


        setIsLoading(true); // start loading

        try {
            const response = await axios.post(API_URL, bookingData);
            setBookings(prev => [...prev, response.data]);
            resetForm();
            setMode('list');
        } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message || err.message);
        } finally {
            setIsLoading(false); // End loading
        }
    };

    const handleDeleteBooking = async () => {
        if (!selectedBooking) return;
        setShowConfirm(true);
    };

    const confirmDeleteBooking = async () => {
        setIsLoading(true); // start loading
        try {
            await axios.delete(`${API_URL}/${selectedBooking.bookingId}`);
            setSelectedBooking(null);
            setMode('list');
            fetchBookingsPage(true);
        } catch (err: any) {
            console.log('❌ Error deleting booking:', err.message);
            Alert.alert('Error', 'Failed to delete booking.');
        } finally {
            setShowConfirm(false);
            setIsLoading(false); // End loading
        }
    };



    const handleEditBooking = (booking: any) => {
        setCustomerName(booking.customerName);
        setContactNumber(booking.contactNumber);
        setEmail(booking.email || '');
        setPickup(booking.pickup);
        setDropoff(booking.dropoff);
        // setPickupTime(booking.pickupTime || '');
        // setDropoffTime(booking.dropoffTime || '');
        setPickupTime(booking.pickupTime ? new Date(booking.pickupTime) : new Date());
        setDropoffTime(booking.dropoffTime ? new Date(booking.dropoffTime) : new Date());
        setDate(booking.date ? new Date(booking.date) : new Date());

        setNotes(booking.notes || '');
        // setDate(booking.date);
        setFare(booking.fare || '');
        setPaymentMethod(booking.paymentMethod || 'cash');
        setPaymentStatus(booking.paymentStatus || 'pending');
        setSelectedBooking(booking);
        setMode('edit');
    };

    const handleUpdateBooking = async () => {
        if (!selectedBooking) return;

        const updatedBooking = {
            bookingId: selectedBooking.bookingId,
            customerName, contactNumber, email, pickup, dropoff,
            pickupTime, dropoffTime, notes, date, fare,
            paymentMethod, paymentStatus,
        };

        setIsLoading(true); // Start loading
        try {
            await axios.put(`${API_URL}/${selectedBooking.bookingId}`, updatedBooking);
            setSelectedBooking(null);
            setMode('list');
            fetchBookingsPage(true);
        } catch (err) {
            Alert.alert('Error', 'Failed to update booking.');
        } finally {
            setIsLoading(false); // End loading
        }
    };

    const fetchBookingsPage = async (reset = false) => {
        if (loadingMore || (!hasMore && !reset)) return;

        setLoadingMore(true);
        setIsLoading(true); // Start loading
        try {
            const params = new URLSearchParams({ limit: "10" });
            if (!reset && lastKey) params.append("lastKey", lastKey);

            const response = await axios.get(`${API_URL}?${params.toString()}`);
            const { bookings: newBookings, lastKey: newLastKey } = response.data;

            setBookings(reset ? newBookings : prev => [...prev, ...newBookings]);
            setLastKey(newLastKey);
            setHasMore(Boolean(newLastKey));
        } catch (err) {
            Alert.alert('Error', 'Failed to fetch bookings.');
        } finally {
            setLoadingMore(false);
            setIsLoading(false); // End loading
        }
    };

    const fetchBookingById = async (id: string) => {
        setIsLoading(true); // Start loading
        try {
            const response = await axios.get(`${API_URL}/${id}`);
            setSelectedBooking(response.data);
        } catch {
            Alert.alert('Error', 'Failed to fetch booking.');
        } finally {
            setIsLoading(false); // Stop loading
        }
    };

    const generatePDFInvoice = async () => {
        if (!selectedBooking) return;

        const html = `
      <html><body>
        <h1>Invoice</h1>
        <p><strong>Customer:</strong> ${selectedBooking.customerName}</p>
        <p><strong>Phone:</strong> ${selectedBooking.contactNumber}</p>
        <p><strong>Email:</strong> ${selectedBooking.email}</p>
        <p><strong>Fare:</strong> £${selectedBooking.fare}</p>
        <p><strong>Method:</strong> ${selectedBooking.paymentMethod}</p>
        <p><strong>Status:</strong> ${selectedBooking.paymentStatus}</p>
        <p><strong>Pickup:</strong> ${selectedBooking.pickup}</p>
        <p><strong>Dropoff:</strong> ${selectedBooking.dropoff}</p>
        <p><strong>Date:</strong> ${selectedBooking.date}</p>
      </body></html>
    `;

        try {
            const { uri } = await Print.printToFileAsync({ html });
            await Sharing.shareAsync(uri);
        } catch {
            Alert.alert('Error', 'Failed to generate PDF.');
        }
    };

    useEffect(() => {
        if (mode === 'list') {
            fetchBookingsPage(true);
        }
    }, [mode]);

    useEffect(() => {
        if (scrollRef.current && (mode === 'form' || mode === 'edit')) {
            scrollRef.current.scrollTo({ y: 0, animated: true });
        }
    }, [mode]);

    const filteredBookings = bookings.filter(b => {
        const q = searchQuery.toLowerCase();
        return (
            b.customerName?.toLowerCase().includes(q) ||
            b.contactNumber?.includes(q) ||
            b.email?.toLowerCase().includes(q) ||
            b.date?.includes(q) ||
            b.pickup?.toLowerCase().includes(q) ||
            b.dropoff?.toLowerCase().includes(q)
        );
    });

    return (
        // <View style={{ flex: 1 }}>
        <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
            <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
                <View style={{
                    paddingTop: 48, paddingBottom: 12, paddingHorizontal: 16,
                    backgroundColor: '#ffffff', flexDirection: 'row', alignItems: 'center',
                    borderBottomColor: '#e5e7eb', borderBottomWidth: 1,
                }}>
                    {mode === 'list' && (
                        <Pressable
                            onPress={() => {
                                if (selectedBooking) {
                                    setSelectedBooking(null);
                                } else {
                                    setMode('none');
                                }
                            }}
                            style={{ marginRight: 12, padding: 4 }}
                        >
                            {/* <Text style={{ fontSize: 22, color: 'white' }}>{'←'}</Text> */}
                            <Text style={{ fontSize: 22, color: '#111827' }}>{'←'}</Text>

                        </Pressable>
                    )}
                    <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827', flexShrink: 1 }}>

                        {/* <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white', flexShrink: 1 }}> */}
                        {mode === 'list' && selectedBooking ? '📄 Booking Details' :
                            mode === 'list' ? '📋 Bookings List' :
                                mode === 'edit' ? '✏️ Edit Booking' :
                                    mode === 'form' ? '📝 Add Booking' : '📦 Bookings'}
                    </Text>
                </View>

                {/* -- Main Screen Buttons -- */}
                {mode === 'none' && (
                    <View style={[styles.buttonGroup, { alignItems: 'center' }]}>
                        <Pressable style={styles.menuButton} onPress={() => setMode('form')}>
                            <Text style={styles.buttonText}>➕ Add Booking</Text>
                        </Pressable>
                        <Pressable style={styles.menuButton} onPress={() => setMode('list')}>
                            <Text style={styles.buttonText}>📋 View Bookings</Text>
                        </Pressable>
                    </View>
                )}

                {/* -- Booking List -- */}
                {mode === 'list' && !selectedBooking && (
                    <FlatList
                        data={filteredBookings}
                        contentContainerStyle={{ padding: 20 }}
                        keyExtractor={item => item.bookingId}
                        onEndReached={() => fetchBookingsPage()}
                        onEndReachedThreshold={0.3}
                        ListHeaderComponent={
                            <TextInput
                                placeholder="Search bookings..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                style={styles.input}
                            />
                        }
                        renderItem={({ item }) => (
                            <Pressable onPress={() => fetchBookingById(item.bookingId)}>
                                <View style={styles.bookingCard}>
                                    <Text style={styles.cardTitle}>{item.customerName}</Text>
                                    <Text>{item.date ? new Date(item.date).toDateString() : 'N/A'}</Text>

                                </View>
                            </Pressable>
                        )}
                        ListFooterComponent={loadingMore && <Text>Loading more...</Text>}
                    />
                )}

                {/* -- Booking Details -- */}
                {mode === 'list' && selectedBooking && (
                    <ScrollView contentContainerStyle={styles.detailContainer}>
                        <View style={styles.detailCard}>
                            <Text style={styles.detailTitle}>{selectedBooking.customerName}</Text>
                            {[
                                { icon: '📞', value: selectedBooking.contactNumber },
                                { icon: '📧', value: selectedBooking.email || 'N/A' },
                                // { icon: '📅', value: selectedBooking.date },
                                { icon: '📍', value: selectedBooking.pickup },
                                { icon: '🎯', value: selectedBooking.dropoff },
                                {
                                    icon: '📅',
                                    value: selectedBooking.date
                                        ? new Date(selectedBooking.date).toDateString()
                                        : 'N/A',
                                },
                                {
                                    icon: '⏰',
                                    value: selectedBooking.pickupTime && selectedBooking.dropoffTime
                                        ? `${new Date(selectedBooking.pickupTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(selectedBooking.dropoffTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                        : 'N/A',
                                },
                                // { icon: '⏰', value: `${selectedBooking.pickupTime || 'N/A'} - ${selectedBooking.dropoffTime || 'N/A'}` },
                                { icon: '💷', value: `£${selectedBooking.fare || 'TBD'}` },
                                { icon: '💳', value: selectedBooking.paymentMethod },
                                { icon: '✅', value: selectedBooking.paymentStatus },
                            ].map((item, index) => (
                                <View key={index} style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>{item.icon}</Text>
                                    <Text style={styles.detailValue}>{item.value}</Text>
                                </View>
                            ))}

                            <View style={styles.buttonGroupVertical}>
                                <Pressable style={styles.gradientButton} onPress={generatePDFInvoice}>
                                    <Text style={styles.buttonText}>📄 Generate Invoice</Text>
                                </Pressable>
                                <Pressable style={styles.gradientButton} onPress={() => handleEditBooking(selectedBooking)}>
                                    <Text style={styles.buttonText}>✏️ Edit Booking</Text>
                                </Pressable>
                                <Pressable style={styles.deleteButton} onPress={handleDeleteBooking}>
                                    <Text style={styles.buttonText}>🗑️ Delete Booking</Text>
                                </Pressable>

                            </View>
                        </View>
                    </ScrollView>
                )}

                {/* -- Booking Form -- */}
                {(mode === 'form' || mode === 'edit') && (
                    <ScrollView ref={scrollRef} contentContainerStyle={styles.container}>
                        <View style={[styles.formWrapper, { backgroundColor: '#f9fafb', padding: 20, borderRadius: 12 }]}>
                            {[
                                ['Customer Name', customerName, setCustomerName],
                                ['Contact Number', contactNumber, setContactNumber],
                                ['Email', email, setEmail],
                                ['Pickup Location', pickup, setPickup],
                                ['Dropoff Location', dropoff, setDropoff],
                                ['Fare', fare, setFare],
                            ].map(([label, value, setter], i) => (
                                <View key={i} style={{ width: '100%', marginBottom: 12 }}>
                                    <Text style={styles.label}>{label}</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder={label as string}
                                        value={value as string}
                                        onChangeText={setter as (text: string) => void}
                                    />
                                </View>
                            ))}

                            {/* 📅 Date Field */}
                            {Platform.OS === 'web' ? (
                                <View style={[styles.pickerWrapper, styles.webPickerFix]}>
                                    <Text style={styles.label}>Date</Text>
                                    <DatePicker
                                        selected={date}
                                        onChange={(val) => {
                                            if (val instanceof Date && !isNaN(val.getTime())) setDate(val);
                                        }}
                                        className="customPickerInput"
                                        calendarClassName="customCalendar"
                                        popperPlacement="bottom-start"
                                    />
                                </View>
                            ) : (
                                <View style={{ width: '100%', marginBottom: 12 }}>
                                    <Text style={styles.label}>Date</Text>
                                    <Pressable onPress={() => setShowDatePicker(true)} style={styles.input}>
                                        <Text>
                                            {date instanceof Date && !isNaN(date.getTime())
                                                ? date.toDateString()
                                                : 'Select Date'}
                                        </Text>
                                    </Pressable>
                                    {showDatePicker && (
                                        <DateTimePicker
                                            value={date}
                                            mode="date"
                                            display="default"
                                            onChange={(event, selectedDate) => {
                                                setShowDatePicker(false);
                                                if (selectedDate) setDate(selectedDate);
                                            }}
                                        />
                                    )}
                                </View>
                            )}

                            {/* 🕐 Pickup Time Field */}
                            {Platform.OS === 'web' ? (
                                <View style={styles.timePickerWrapper}>
                                    <Text style={styles.label}>Pickup Time</Text>
                                    <TimePicker
                                        onChange={(val) => {
                                            if (val) {
                                                const [h, m] = val.split(':');
                                                const d = new Date(pickupTime);
                                                d.setHours(Number(h));
                                                d.setMinutes(Number(m));
                                                setPickupTime(d);
                                            }
                                        }}
                                        value={pickupTime.toTimeString().substring(0, 5)} // "HH:MM"
                                        disableClock={true}
                                        format="HH:mm"
                                        clearIcon={null}
                                    />
                                </View>
                            ) : (
                                <View style={{ width: '100%', marginBottom: 12 }}>
                                    <Text style={styles.label}>Pickup Time</Text>
                                    <Pressable onPress={() => setShowPickupTimePicker(true)} style={styles.input}>
                                        <Text>
                                            {pickupTime instanceof Date && !isNaN(pickupTime.getTime())
                                                ? pickupTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                : 'Select Time'}
                                        </Text>
                                    </Pressable>
                                    {showPickupTimePicker && (
                                        <DateTimePicker
                                            value={pickupTime}
                                            mode="time"
                                            display="default"
                                            onChange={(event, selectedTime) => {
                                                setShowPickupTimePicker(false);
                                                if (selectedTime) setPickupTime(selectedTime);
                                            }}
                                        />
                                    )}
                                </View>
                            )}

                            {/* 🕑 Dropoff Time Field */}
                            {Platform.OS === 'web' ? (
                                <View style={styles.timePickerWrapper}>
                                    <Text style={styles.label}>Dropoff Time</Text>
                                    <TimePicker
                                        onChange={(val) => {
                                            if (val) {
                                                const [h, m] = val.split(':');
                                                const d = new Date(dropoffTime);
                                                d.setHours(Number(h));
                                                d.setMinutes(Number(m));
                                                setDropoffTime(d);
                                            }
                                        }}
                                        value={dropoffTime.toTimeString().substring(0, 5)}
                                        disableClock={true}
                                        format="HH:mm"
                                        clearIcon={null}
                                    />
                                </View>
                            ) : (
                                <View style={{ width: '100%', marginBottom: 12 }}>
                                    <Text style={styles.label}>Dropoff Time</Text>
                                    <Pressable onPress={() => setShowDropoffTimePicker(true)} style={styles.input}>
                                        <Text>
                                            {dropoffTime instanceof Date && !isNaN(dropoffTime.getTime())
                                                ? dropoffTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                : 'Select Time'}
                                        </Text>
                                    </Pressable>
                                    {showDropoffTimePicker && (
                                        <DateTimePicker
                                            value={dropoffTime}
                                            mode="time"
                                            display="default"
                                            onChange={(event, selectedTime) => {
                                                setShowDropoffTimePicker(false);
                                                if (selectedTime) setDropoffTime(selectedTime);
                                            }}
                                        />
                                    )}
                                </View>
                            )}
                            <View style={styles.paymentToggleRow}>
                                {/* Method */}
                                <View style={styles.paymentToggleColumn}>
                                    <Text style={styles.label}>Method</Text>
                                    <View style={styles.toggleRow}>
                                        {['cash', 'card'].map((method) => (
                                            <Pressable
                                                key={method}
                                                style={[
                                                    styles.toggleButton,
                                                    paymentMethod === method && styles.toggleButtonActive,
                                                ]}
                                                onPress={() => setPaymentMethod(method as 'cash' | 'card')}
                                            >
                                                <Text
                                                    style={[
                                                        styles.toggleButtonText,
                                                        { color: paymentMethod === method ? '#fff' : '#000' },
                                                    ]}
                                                >
                                                    {method.toUpperCase()}
                                                </Text>
                                            </Pressable>
                                        ))}
                                    </View>
                                </View>

                                {/* Status */}
                                <View style={styles.paymentToggleColumn}>
                                    <Text style={styles.label}>Status</Text>
                                    <View style={styles.toggleRow}>
                                        {['paid', 'pending'].map((status) => (
                                            <Pressable
                                                key={status}
                                                style={[
                                                    styles.toggleButton,
                                                    paymentStatus === status && styles.toggleButtonActive,
                                                ]}
                                                onPress={() => setPaymentStatus(status as 'paid' | 'pending')}
                                            >
                                                <Text
                                                    style={[
                                                        styles.toggleButtonText,
                                                        { color: paymentStatus === status ? '#fff' : '#000' },
                                                    ]}
                                                >
                                                    {status.toUpperCase()}
                                                </Text>
                                            </Pressable>
                                        ))}
                                    </View>
                                </View>
                            </View>



                            <TextInput
                                style={[styles.input, styles.notesInput]}
                                placeholder="Notes"
                                value={notes}
                                onChangeText={setNotes}
                                multiline
                            />
                            <View style={styles.buttonGroupVertical}>
                                {/* <Pressable style={styles.gradientButton} onPress={mode === 'edit' ? handleUpdateBooking : handleAddBooking}>
                                    <Text style={styles.buttonText}>{mode === 'edit' ? 'Update Booking' : 'Submit Booking'}</Text>
                                </Pressable> */}
                                <Pressable
                                    style={styles.gradientButton}
                                    onPress={() => {
                                        if (mode === 'edit') {
                                            setShowUpdateConfirm(true);
                                        } else {
                                            handleAddBooking();
                                        }
                                    }}>
                                    <Text style={styles.buttonText}>{mode === 'edit' ? 'Update Booking' : 'Submit Booking'}</Text>
                                </Pressable>
                                <Pressable style={styles.deleteButton} onPress={() => { resetForm(); setMode('none'); }}>
                                    <Text style={styles.buttonText}>Cancel</Text>
                                </Pressable>
                            </View>
                        </View>
                    </ScrollView>
                )}
                {/* ✅ Add the ConfirmModal here */}
                <ConfirmModal
                    visible={showConfirm}
                    title="Delete Booking"
                    message="Are you sure you want to delete this booking?"
                    onCancel={() => setShowConfirm(false)}
                    onConfirm={confirmDeleteBooking}
                />
                <ConfirmModal
                    visible={showUpdateConfirm}
                    title="Confirm Update"
                    message="Are you sure you want to update this booking?"
                    onCancel={() => setShowUpdateConfirm(false)}
                    onConfirm={() => {
                        setShowUpdateConfirm(false);
                        handleUpdateBooking();
                    }}
                />
            </KeyboardAvoidingView>
            {isLoading && (
                <View style={styles.loadingOverlay}>
                    <View style={styles.loadingCard}>
                        {/* <Animated.Image
                source={require('@/assets/logo.png')} // Replace with your actual logo path
                style={[styles.logo, { transform: [{ rotate: spin }] }]}
                resizeMode="contain"
            /> */}
                        <ActivityIndicator size="large" color="#3b82f6" />
                        <Text style={styles.loadingText}>Please wait...</Text>
                    </View>
                </View>
            )}

        </View>
    );
}


const styles = StyleSheet.create({
    timePickerWrapper: {
        width: '100%',
        marginBottom: 12,
        position: 'relative',
        zIndex: 1,
    },

    webPickerFix: {
        alignItems: 'flex-start',
    },
    paymentWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 12,
        gap: 12,
    },

    paymentColumn: {
        flex: 1,
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },

    loadingCard: {
        backgroundColor: '#ffffff',
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 10,
    },

    logo: {
        width: 80,
        height: 80,
        marginBottom: 20,
    },

    loadingText: {
        marginTop: 12,
        fontSize: 16,
        fontWeight: '500',
        color: '#1f2937',
    },

    deleteButton: {
        paddingVertical: 14,
        borderRadius: 30,
        alignItems: 'center',
        backgroundColor: '#dc2626',
    },

    menuButton: {
        backgroundColor: '#3b82f6',
        paddingVertical: 14,
        borderRadius: 12,
        marginVertical: 10,
        paddingHorizontal: 32,
        alignItems: 'center',
        width: 220,
    },
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#ffffff',
    },

    detailContainer: {
        flexGrow: 1,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        paddingVertical: 32,
        paddingHorizontal: 16,
    },

    detailCard: {
        backgroundColor: '#ffffff',
        borderRadius: 24,
        padding: 24,
        marginTop: 16,
        width: '100%',
        maxWidth: 500,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 6,
    },

    detailTitle: {
        fontSize: 26,
        fontWeight: '700',
        textAlign: 'center',
        color: '#111827',
        marginBottom: 24,
    },

    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },

    detailLabel: {
        width: 32,
        fontSize: 18,
        textAlign: 'center',
        color: '#6b7280',
    },

    detailValue: {
        fontSize: 16,
        color: '#1f2937',
        flex: 1,
        paddingLeft: 8,
        flexWrap: 'wrap',
    },

    buttonGroupVertical: {
        marginTop: 28,
        gap: 16,
        width: '100%',
    },

    gradientButton: {
        paddingVertical: 14,
        borderRadius: 30,
        alignItems: 'center',
        backgroundColor: '#6a11cb', // fallback if gradient not supported
    },

    // Optional: If using a gradient library like `react-native-linear-gradient`
    // wrap <LinearGradient> around children instead of using this color directly

    actionButton: {
        paddingVertical: 14,
        borderRadius: 30,
        alignItems: 'center',
        backgroundColor: '#6b7280',
    },

    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },

    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        backgroundColor: '#f9fafb',
        padding: 14,
        borderRadius: 8,
        marginBottom: 12,
        fontSize: 16,
        width: '100%',
    },

    notesInput: {
        height: 100,
        textAlignVertical: 'top',
    },

    formWrapper: {
        width: '100%',
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: 24,
    },

    form: {
        width: '100%',
        maxWidth: 640,
        padding: 20,
        borderRadius: 16,
        backgroundColor: '#ffffff',
        shadowColor: '#000000',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 4,
    },

    bookingCard: {
        backgroundColor: '#ffffff',
        padding: 16,
        marginBottom: 16,
        borderRadius: 12,
        shadowColor: '#000000',
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 3,
    },
    pickerWrapper: {
        width: '100%',
        marginBottom: 12,
        zIndex: 10, // ensure stacking
        position: 'relative', // required for zIndex to apply
    },

    label: {
        fontWeight: '500',
        fontSize: 16,
        color: '#111827',
        marginBottom: 6,
    },
    cardTitle: {
        fontWeight: '700',
        fontSize: 18,
        marginBottom: 6,
        color: '#111827',
    },

    sectionHeader: {
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
        paddingBottom: 8,
        marginTop: 32,
        marginBottom: 20,
        borderBottomWidth: 1,
        borderColor: '#e5e7eb',
        color: '#111827',
    },

    primaryButton: {
        backgroundColor: '#3b82f6',
        paddingVertical: 14,
        borderRadius: 10,
    },

    secondaryButton: {
        backgroundColor: '#1f2937',
        paddingVertical: 14,
        borderRadius: 10,
    },

    submitButton: {
        backgroundColor: '#16a34a',
        paddingVertical: 14,
        borderRadius: 10,
        marginTop: 12,
    },

    cancelButton: {
        backgroundColor: '#ef4444',
        paddingVertical: 14,
        borderRadius: 10,
        marginTop: 12,
    },

    backButton: {
        backgroundColor: '#6b7280',
        paddingVertical: 14,
        borderRadius: 10,
        marginTop: 16,
    },

    buttonGroup: {
        padding: 20,
        gap: 16,
        backgroundColor: '#f9fafb',
    },

    clickable: {
        color: '#2563eb',
        fontWeight: '600',
        textDecorationLine: 'underline',
        marginBottom: 6,
    },

    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        gap: 12, // space between buttons
        marginTop: 6,
    },
    toggleButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: '#e5e7eb',
        borderRadius: 8,
        minWidth: 80,
        alignItems: 'center',
    },
    paymentToggleRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start', // align to left
        alignItems: 'flex-start',
        width: '100%',
        gap: 20,
        marginBottom: 16,
        flexWrap: 'wrap',
    },

    paymentToggleColumn: {
        flexGrow: 1,
        minWidth: 160,
        position: 'relative',
        zIndex: 1,
        alignItems: 'flex-start',
    },

    toggleButtonActive: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#3b82f6',
        borderRadius: 8,
    },

    toggleButtonText: {
        color: '#ffffff',
        fontWeight: '600',
    },

});
