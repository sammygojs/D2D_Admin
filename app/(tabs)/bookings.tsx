import { useState } from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
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
  const [bookings, setBookings] = useState<{
    id: string;
    customerName: string;
    contactNumber: string;
    pickup: string;
    dropoff: string;
    pickupTime?: string;
    dropoffTime?: string;
    notes?: string;
  }[]>([]);

  const handleAddBooking = () => {
    if (!customerName || !contactNumber || !pickup || !dropoff) {
      alert('Please fill all required fields');
      return;
    }

    setBookings(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        customerName,
        contactNumber,
        pickup,
        dropoff,
        pickupTime,
        dropoffTime,
        notes,
      },
    ]);

    setCustomerName('');
    setContactNumber('');
    setPickup('');
    setDropoff('');
    setPickupTime('');
    setDropoffTime('');
    setNotes('');
    setMode('list');
  };

  return (
    <View style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        {mode === 'list' ? (
          <FlatList
            ListHeaderComponent={<Text style={styles.title}>Bookings</Text>}
            data={bookings}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.bookingCard}>
                <Text style={styles.cardTitle}>{item.customerName}</Text>
                <Text>📞 {item.contactNumber}</Text>
                <Text>📍 {item.pickup} → {item.dropoff}</Text>
                {item.pickupTime ? <Text>🕓 Pickup: {item.pickupTime}</Text> : null}
                {item.dropoffTime ? <Text>🕓 Dropoff: {item.dropoffTime}</Text> : null}
                {item.notes ? <Text>📝 {item.notes}</Text> : null}
              </View>
            )}
            ListFooterComponent={
              <Pressable style={styles.backButton} onPress={() => setMode('none')}>
                <Text style={styles.buttonText}>Back</Text>
              </Pressable>
            }
            contentContainerStyle={{ padding: 20 }}
            keyboardShouldPersistTaps="handled"
          />
        ) : (
          <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.title}>Bookings</Text>

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
  listContainer: {
    width: '100%',
    marginTop: 20,
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
});
