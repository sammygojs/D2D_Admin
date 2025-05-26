import axios from 'axios';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';


export default function HomeScreen() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [totalFare, setTotalFare] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get('https://0izwka3sk3.execute-api.us-east-1.amazonaws.com/v1/bookings');
        const fetchedBookings = response.data.bookings || [];
        setBookings(fetchedBookings);

        const fareSum = fetchedBookings.reduce((acc, curr) => acc + (parseFloat(curr.fare) || 0), 0);
        setTotalFare(fareSum);
      } catch (err) {
        console.error('Error fetching bookings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const upcomingBookings = bookings
    .filter(b => {
      try {
        const pickupDateTime = new Date(`${b.date}T${new Date(b.pickupTime).toISOString().split('T')[1]}`);
        return pickupDateTime > new Date();
      } catch {
        return false;
      }
    })
    .sort((a, b) => {
      const aDate = new Date(`${a.date}T${new Date(a.pickupTime).toISOString().split('T')[1]}`);
      const bDate = new Date(`${b.date}T${new Date(b.pickupTime).toISOString().split('T')[1]}`);
      return aDate.getTime() - bDate.getTime();
    })
    .slice(0, 2);

  // Completed bookings (pickupTime is in the past)
  const completedBookings = bookings.filter(b => {
    try {
      const pickupDateTime = new Date(`${b.date}T${new Date(b.pickupTime).toISOString().split('T')[1]}`);
      return pickupDateTime < new Date();
    } catch {
      return false;
    }
  });
  const completedFare = completedBookings.reduce((acc, curr) => acc + (parseFloat(curr.fare) || 0), 0);

  // Scheduled bookings (pickupTime is in the future)
  const scheduledBookings = bookings.filter(b => {
    try {
      const pickupDateTime = new Date(`${b.date}T${new Date(b.pickupTime).toISOString().split('T')[1]}`);
      return pickupDateTime >= new Date();
    } catch {
      return false;
    }
  });
  const scheduledFare = scheduledBookings.reduce((acc, curr) => acc + (parseFloat(curr.fare) || 0), 0);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🚖 Welcome Back!</Text>
        <Text style={styles.subtitle}>Here’s what’s going on today:</Text>
      </View>

      {/* <View style={styles.card}>
        <Text style={styles.cardText}>📅 {bookings.length} Bookings Scheduled</Text>
        <Text style={styles.cardText}>💷 £{totalFare.toFixed(2)} Total Fare</Text>
      </View> */}

      <View style={styles.card}>
        <Text style={styles.cardText}>📅 {bookings.length} Bookings Scheduled</Text>
        <Text style={styles.cardText}>💷 £{totalFare.toFixed(2)} Total Fare</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardText}>✅ {completedBookings.length} Completed Rides</Text>
        <Text style={styles.cardText}>💷 £{completedFare.toFixed(2)} Earned</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardText}>🗓️ {scheduledBookings.length} Scheduled Rides</Text>
        <Text style={styles.cardText}>💷 £{scheduledFare.toFixed(2)} Expected</Text>
      </View>



      <View style={styles.nextSection}>
        <Text style={styles.sectionTitle}>🕑 Next Bookings</Text>

        {loading ? (
          <Text style={styles.cardText}>Loading...</Text>
        ) : upcomingBookings.length === 0 ? (
          <Text style={styles.cardText}>No upcoming bookings</Text>
        ) : (
          upcomingBookings.map((b, i) => {
            const day = new Date(b.date).toLocaleDateString('en-UK', { weekday: 'long' });
            const time = new Date(b.pickupTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return (
              <Pressable
                key={i}  // ✅ Move the key here
                onPress={() => router.push(`/bookings?bookingId=${b.bookingId}`)}
              >
                <View style={styles.bookingPreview}>
                  <Text style={styles.boldText}>{day} — {time}</Text>
                  <Text>{b.customerName}</Text>
                  <Text style={styles.smallText}>{b.pickup} → {b.dropoff}</Text>
                </View>
              </Pressable>
              // <View key={i} style={styles.bookingPreview}>
              //   <Text style={styles.boldText}>{day} — {time}</Text>
              //   <Text>{b.customerName}</Text>
              //   <Text style={styles.smallText}>{b.pickup} → {b.dropoff}</Text>
              // </View>
            );
          })
        )}
      </View>

      <View style={styles.buttonGroup}>
        <Pressable style={styles.menuButton} onPress={() => router.push('/bookings')}>
          <Text style={styles.buttonText}>📋 View Bookings</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
  },
  header: {
    paddingTop: 48,
    paddingBottom: 12,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 4,
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  cardText: {
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 8,
  },
  nextSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  bookingPreview: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  boldText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  smallText: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
  buttonGroup: {
    gap: 16,
    alignItems: 'center',
    paddingBottom: 50
  },
  menuButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    width: 220,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
