import axios from 'axios';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Linking,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import AutocompleteInput from '../../components/AutoCompleteInput';
import { GOOGLE_API_KEY } from '../../constants/google';

export default function BookingsScreen() {
    const [mode, setMode] = useState<'none' | 'form' | 'list'>('none');
    const [customerName, setCustomerName] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [pickup, setPickup] = useState('');
    const [dropoff, setDropoff] = useState('');
    const [notes, setNotes] = useState('');
    const [useCustomPickup, setUseCustomPickup] = useState(false);
    const [useCustomDropoff, setUseCustomDropoff] = useState(false);
    const [pickupTime, setPickupTime] = useState('');
    const [dropoffTime, setDropoffTime] = useState('');
    const [email, setEmail] = useState('');
    const [date, setDate] = useState('');
    const [selectedBooking, setSelectedBooking] = useState<typeof bookings[0] | null>(null);
    // const [bookings, setBookings] = useState<any[]>([]);
    const [lastKey, setLastKey] = useState<string | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [fare, setFare] = useState('');
    const [paymentStatus, setPaymentStatus] = useState<'paid' | 'pending'>('pending');
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');


    const [bookings, setBookings] = useState<{
        bookingId: string;
        customerName: string;
        contactNumber: string;
        pickup: string;
        dropoff: string;
        pickupTime?: string;
        dropoffTime?: string;
        notes?: string;
        email?: string;
        date: string;
        fare?: string,
        paymentStatus?: string,
        paymentMethod?: string,

    }[]>([]);

    const API_URL = 'https://0izwka3sk3.execute-api.us-east-1.amazonaws.com/v1/bookings';

    const handleAddBooking = async () => {
        if (!customerName || !contactNumber || !pickup || !dropoff) {
            alert('Please fill all required fields');
            return;
        }

        const bookingData = {
            customerName,
            contactNumber,
            pickup,
            dropoff,
            pickupTime,
            dropoffTime,
            notes,
            email,
            date,
        };

        try {
            const response = await axios.post(API_URL, bookingData);
            const savedBooking = response.data;

            setBookings(prev => [...prev, savedBooking]);
            setCustomerName('');
            setContactNumber('');
            setPickup('');
            setDropoff('');
            setPickupTime('');
            setDropoffTime('');
            setNotes('');
            setEmail('')
            setDate('')
            setMode('list');
        } catch (err: any) {
            alert('Error: ' + (err?.response?.data?.message || err.message));
        }
    };

    const fetchBookings = async () => {
        try {
            const response = await axios.get(API_URL);
            setBookings(response.data);
        } catch (err) {
            alert('Failed to fetch bookings');
        }
    };

    useEffect(() => {
        if (mode === 'list') {
            setBookings([]);
            setLastKey(null);
            setHasMore(true);
            fetchBookingsPage();
        }
    }, [mode]);

    const SectionHeader = ({ title }: { title: string }) => (
        <Text style={styles.sectionHeader}>{title}</Text>
    );

    const fetchBookingsPage = async () => {
        if (loadingMore || !hasMore) return;

        setLoadingMore(true);
        try {
            const params = new URLSearchParams({ limit: "10" });
            if (lastKey) params.append("lastKey", lastKey);

            const response = await axios.get(`${API_URL}?${params.toString()}`);
            const { bookings: newBookings, lastKey: newLastKey } = response.data;

            setBookings(prev => [...prev, ...newBookings]);
            setLastKey(newLastKey);
            setHasMore(Boolean(newLastKey));
        } catch (err) {
            Alert.alert("Error", "Failed to load bookings");
        } finally {
            setLoadingMore(false);
        }
    };

    const fetchBookingById = async (id: string) => {
        try {
            const response = await axios.get(`${API_URL}/${id}`);
            setSelectedBooking(response.data); // Triggers detail view
        } catch (err) {
            Alert.alert("Error", "Failed to load booking details");
        }
    };

    const generatePDFInvoice = async () => {
        if (!selectedBooking) return;
      
        const htmlContent = `
          <html>
            <body style="font-family: sans-serif; padding: 20px;">
              <h1 style="text-align:center;">Invoice</h1>
              <p><strong>Invoice ID:</strong> INV-${selectedBooking.bookingId.slice(0, 6)}</p>
              <p><strong>Customer:</strong> ${selectedBooking.customerName}</p>
              <p><strong>Phone:</strong> ${selectedBooking.contactNumber}</p>
              <p><strong>Email:</strong> ${selectedBooking.email || 'N/A'}</p>
              <p><strong>Date:</strong> ${selectedBooking.date}</p>
              <p><strong>Pickup:</strong> ${selectedBooking.pickup}</p>
              <p><strong>Dropoff:</strong> ${selectedBooking.dropoff}</p>
              <p><strong>Pickup Time:</strong> ${selectedBooking.pickupTime || 'N/A'}</p>
              <p><strong>Dropoff Time:</strong> ${selectedBooking.dropoffTime || 'N/A'}</p>
              <p><strong>Fare:</strong> £${selectedBooking.fare || 'TBD'}</p>
              <p><strong>Payment Method:</strong> ${selectedBooking.paymentMethod || 'N/A'}</p>
              <p><strong>Payment Status:</strong> ${selectedBooking.paymentStatus || 'Pending'}</p>
              <hr />
              <p style="text-align:center;">Thank you for choosing our service!</p>
            </body>
          </html>
        `;
      
        try {
          const { uri } = await Print.printToFileAsync({ html: htmlContent });
          await Sharing.shareAsync(uri);
        } catch (error) {
          alert("Failed to generate/share PDF");
          console.error(error);
        }
      };

    return (
        <View style={{ flex: 1 }}>
            <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
                {mode === 'list' ? (
                    selectedBooking ? (
                        <ScrollView contentContainerStyle={styles.detailContainer}>
                            <SectionHeader title="📄 Booking Details" />
                            <View style={styles.detailCard}>
                                <Text style={styles.detailTitle}>{selectedBooking.customerName}</Text>

                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>📞 Contact:</Text>
                                    <Pressable
                                        onPress={() =>
                                            Linking.openURL(`tel:${selectedBooking.contactNumber}`).catch(() =>
                                                Alert.alert('Error', 'Phone app not available')
                                            )
                                        }
                                    >
                                        <Text style={styles.detailValueLink}>{selectedBooking.contactNumber}</Text>
                                    </Pressable>
                                </View>

                                {selectedBooking.email ? (
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>📧 Email:</Text>
                                        <Pressable
                                            onPress={() =>
                                                Linking.openURL(`mailto:${selectedBooking.email}`).catch(() =>
                                                    Alert.alert('Error', 'Email app not available')
                                                )
                                            }
                                        >
                                            <Text style={styles.detailValueLink}>{selectedBooking.email}</Text>
                                        </Pressable>
                                    </View>
                                ) : null}

                                {selectedBooking.date ? (
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>📅 Date:</Text>
                                        <Text style={styles.detailValue}>{selectedBooking.date}</Text>
                                    </View>
                                ) : null}

                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>📍 Route:</Text>
                                    <Text style={styles.detailValue}>
                                        {selectedBooking.pickup} → {selectedBooking.dropoff}
                                    </Text>
                                </View>

                                {selectedBooking.pickupTime ? (
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>🕓 Pickup:</Text>
                                        <Text style={styles.detailValue}>{selectedBooking.pickupTime}</Text>
                                    </View>
                                ) : null}

                                {selectedBooking.dropoffTime ? (
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>🕓 Dropoff:</Text>
                                        <Text style={styles.detailValue}>{selectedBooking.dropoffTime}</Text>
                                    </View>
                                ) : null}

                                {selectedBooking.notes ? (
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>📝 Notes:</Text>
                                        <Text style={styles.detailValue}>{selectedBooking.notes}</Text>
                                    </View>
                                ) : null}

                                {selectedBooking.fare ? (
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>💷 Fare:</Text>
                                        <Text style={styles.detailValue}>£{selectedBooking.fare}</Text>
                                    </View>
                                ) : null}

                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>💳 Payment Method:</Text>
                                    <Text style={styles.detailValue}>{selectedBooking.paymentMethod || 'N/A'}</Text>
                                </View>

                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>📌 Payment Status:</Text>
                                    <Text style={styles.detailValue}>{selectedBooking.paymentStatus || 'pending'}</Text>
                                </View>

                            </View>

                            <Pressable style={styles.submitButton} onPress={generatePDFInvoice}>
  <Text style={styles.buttonText}>📄 Generate PDF Invoice</Text>
</Pressable>

                            <Pressable style={styles.backButton} onPress={() => setSelectedBooking(null)}>
                                <Text style={styles.buttonText}>Back to List</Text>
                            </Pressable>


                        </ScrollView>

                    ) : (

                        // ✅ Bookings List View
                        <>
                            <FlatList
                                style={{ backgroundColor: '#fff' }}
                                contentContainerStyle={{ padding: 20 }}
                                ListHeaderComponent={
                                    <>
                                        <SectionHeader title="📋 Bookings List" />
                                        <TextInput
                                            style={[styles.input, { backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderWidth: 1 }]}
                                            placeholder="Search by name, date, phone, etc..."
                                            value={searchQuery}
                                            onChangeText={setSearchQuery}
                                        />
                                    </>
                                }
                                data={bookings.filter(b => {
                                    const q = searchQuery.toLowerCase();
                                    return (
                                        b.customerName?.toLowerCase().includes(q) ||
                                        b.contactNumber?.includes(q) ||
                                        b.email?.toLowerCase().includes(q) ||
                                        b.date?.includes(q) ||
                                        b.pickup?.toLowerCase().includes(q) ||
                                        b.dropoff?.toLowerCase().includes(q)
                                    );
                                })}
                                keyExtractor={(item) => item.bookingId}
                                renderItem={({ item }) => (
                                    <Pressable onPress={() => fetchBookingById(item.bookingId)}>
                                        <View style={styles.bookingCard}>
                                            <Text style={styles.cardTitle}>{item.customerName}</Text>
                                            <Text>📅 {item.date}</Text>
                                        </View>
                                    </Pressable>
                                )}
                                onEndReachedThreshold={0.2}
                                onEndReached={fetchBookingsPage}
                                ListFooterComponent={
                                    loadingMore ? <Text style={{ textAlign: 'center', padding: 10 }}>Loading more...</Text> : null
                                }
                                keyboardShouldPersistTaps="handled"
                            />
                        </>
                    )
                ) : (
                    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                        <SectionHeader title="📝 Add Booking" />

                        {mode === 'none' && (
                            <View style={styles.buttonGroup}>
                                <Pressable style={styles.primaryButton} onPress={() => setMode('form')}>
                                    <Text style={styles.buttonText}>Add Booking</Text>
                                </Pressable>
                                <Pressable style={styles.secondaryButton} onPress={() => setMode('list')}>
                                    <Text style={styles.buttonText}>View Bookings</Text>
                                </Pressable>
                            </View>
                        )}
                        {mode === 'form' && (
                            <View style={styles.formWrapper}>
                                <View style={styles.form}>
                                    <TextInput
                                        placeholder="Customer Name"
                                        style={styles.input}
                                        value={customerName}
                                        onChangeText={setCustomerName}
                                    />
                                    <TextInput
                                        placeholder="Contact Number"
                                        keyboardType="phone-pad"
                                        style={styles.input}
                                        value={contactNumber}
                                        onChangeText={setContactNumber}
                                    />
                                    <TextInput
                                        placeholder="Email"
                                        keyboardType="email-address"
                                        style={styles.input}
                                        value={email}
                                        onChangeText={setEmail}
                                    />
                                    <TextInput
                                        placeholder="Booking Date (e.g. 2025-06-15)"
                                        style={styles.input}
                                        value={date}
                                        onChangeText={setDate}
                                    />
                                    <View style={styles.toggleRow}>
                                        <Text style={styles.label}>Pickup Location</Text>
                                        <Pressable
                                            style={useCustomPickup ? styles.toggleButtonActive : styles.toggleButton}
                                            onPress={() => setUseCustomPickup(prev => !prev)}
                                        >
                                            <Text style={styles.toggleButtonText}>
                                                {useCustomPickup ? 'Custom Address' : 'Use Map'}
                                            </Text>
                                        </Pressable>
                                    </View>
                                    {useCustomPickup ? (
                                        <TextInput
                                            placeholder="Enter Pickup Address"
                                            style={styles.input}
                                            value={pickup}
                                            onChangeText={setPickup}
                                        />
                                    ) : (
                                        <AutocompleteInput
                                            placeholder="Search Pickup"
                                            initialValue={pickup}
                                            onPlaceSelected={(place) => setPickup(place.address)}
                                            apiKey={GOOGLE_API_KEY}
                                        />
                                    )}

                                    <TextInput
                                        placeholder="Pickup Time (e.g. 14:30)"
                                        style={styles.input}
                                        value={pickupTime}
                                        onChangeText={setPickupTime}
                                    />

                                    <View style={styles.toggleRow}>
                                        <Text style={styles.label}>Dropoff Location</Text>
                                        <Pressable
                                            style={useCustomDropoff ? styles.toggleButtonActive : styles.toggleButton}
                                            onPress={() => setUseCustomDropoff(prev => !prev)}
                                        >
                                            <Text style={styles.toggleButtonText}>
                                                {useCustomDropoff ? 'Custom Address' : 'Use Map'}
                                            </Text>
                                        </Pressable>
                                    </View>
                                    {useCustomDropoff ? (
                                        <TextInput
                                            placeholder="Enter Dropoff Address"
                                            style={styles.input}
                                            value={dropoff}
                                            onChangeText={setDropoff}
                                        />
                                    ) : (
                                        <AutocompleteInput
                                            placeholder="Search Dropoff"
                                            initialValue={dropoff}
                                            onPlaceSelected={(place) => setDropoff(place.address)}
                                            apiKey={GOOGLE_API_KEY}
                                        />
                                    )}

                                    <TextInput
                                        placeholder="Dropoff Time (e.g. 15:00)"
                                        style={styles.input}
                                        value={dropoffTime}
                                        onChangeText={setDropoffTime}
                                    />

                                    <TextInput
                                        placeholder="Fare (e.g. 45.00)"
                                        keyboardType="decimal-pad"
                                        style={styles.input}
                                        value={fare}
                                        onChangeText={setFare}
                                    />

                                    <View style={styles.toggleRow}>
                                        <Text style={styles.label}>Payment Status</Text>
                                        <Pressable
                                            style={paymentStatus === 'paid' ? styles.toggleButtonActive : styles.toggleButton}
                                            onPress={() => setPaymentStatus(paymentStatus === 'paid' ? 'pending' : 'paid')}
                                        >
                                            <Text style={styles.toggleButtonText}>{paymentStatus === 'paid' ? 'Paid' : 'Pending'}</Text>
                                        </Pressable>
                                    </View>

                                    <View style={styles.toggleRow}>
                                        <Text style={styles.label}>Payment Method</Text>
                                        <Pressable
                                            style={paymentMethod === 'card' ? styles.toggleButtonActive : styles.toggleButton}
                                            onPress={() => setPaymentMethod(paymentMethod === 'card' ? 'cash' : 'card')}
                                        >
                                            <Text style={styles.toggleButtonText}>{paymentMethod === 'card' ? 'Card' : 'Cash'}</Text>
                                        </Pressable>
                                    </View>

                                    <TextInput
                                        placeholder="Notes (Optional)"
                                        style={[styles.input, styles.notesInput]}
                                        multiline
                                        value={notes}
                                        onChangeText={setNotes}
                                    />

                                    <Pressable style={styles.submitButton} onPress={handleAddBooking}>
                                        <Text style={styles.buttonText}>Submit Booking</Text>
                                    </Pressable>
                                    <Pressable style={styles.cancelButton} onPress={() => setMode('none')}>
                                        <Text style={styles.buttonText}>Cancel</Text>
                                    </Pressable>
                                </View>
                            </View>
                        )}
                    </ScrollView>
                )}
            </KeyboardAvoidingView>
        </View>
    );
}



const styles = StyleSheet.create({
    detailContainer: {
        flexGrow: 1,
        padding: 24,
        backgroundColor: '#f9fafb',
        alignItems: 'center',
    },

    detailCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 20,
        width: '100%',
        maxWidth: 600,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
        marginBottom: 20,
    },

    detailTitle: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 20,
        textAlign: 'center',
        color: '#111827',
    },

    detailRow: {
        flexDirection: 'row',
        marginBottom: 12,
        flexWrap: 'wrap',
    },

    detailLabel: {
        fontWeight: '600',
        fontSize: 16,
        color: '#374151',
        marginRight: 6,
    },

    detailValue: {
        fontSize: 16,
        color: '#1f2937',
        flexShrink: 1,
    },

    detailValueLink: {
        fontSize: 16,
        color: '#2563eb',
        textDecorationLine: 'underline',
        fontWeight: '600',
        flexShrink: 1,
    },

    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    buttonGroup: {
        gap: 12,
    },
    primaryButton: {
        backgroundColor: '#2563eb',
        paddingVertical: 12,
        borderRadius: 8,
        marginBottom: 10,
    },
    secondaryButton: {
        backgroundColor: '#1f2937',
        paddingVertical: 12,
        borderRadius: 8,
    },
    submitButton: {
        backgroundColor: '#16a34a',
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 10,
    },
    clickable: {
        color: '#2563eb',
        fontWeight: '600',
        textDecorationLine: 'underline',
        marginBottom: 4,
    },
    cancelButton: {
        backgroundColor: '#dc2626',
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 8,
    },
    backButton: {
        backgroundColor: '#6b7280',
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 12,
    },
    buttonText: {
        color: 'white',
        fontWeight: '600',
        textAlign: 'center',
    },
    formWrapper: {
        width: '100%',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 20, // ✅ add this
    },
    form: {
        width: '90%',
        maxWidth: 600,
        minWidth: 300,
        padding: 16,
        alignSelf: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        backgroundColor: '#f9fafb',
        padding: 12,
        borderRadius: 6,
        marginBottom: 10,
        width: '100%',
        zIndex: 0,
    },
    notesInput: {
        height: 80,
    },
    bookingCard: {
        backgroundColor: '#f3f4f6',
        padding: 12,
        marginBottom: 12,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 4,
    },
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    label: {
        fontWeight: '500',
        fontSize: 16,
    },
    toggleButton: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        backgroundColor: '#e5e7eb',
        borderRadius: 6,
    },
    toggleButtonActive: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        backgroundColor: '#2563eb',
        borderRadius: 6,
    },
    toggleButtonText: {
        color: 'white',
        fontWeight: '500',
    },
    sectionHeader: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        paddingBottom: 6,
        marginTop: 24,
        marginBottom: 16,
        borderBottomWidth: 1,
        borderColor: '#d1d5db',
    },
});
