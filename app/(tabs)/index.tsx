import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
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

  useFocusEffect(
    useCallback(() => {
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
    }, [])
  );

  const upcomingBookings = bookings
    .filter(b => {
      try {
        const pickupDateTime = new Date(`${b.date}T${b.pickupTime}:00`);
        return pickupDateTime > new Date();
      } catch {
        return false;
      }
    })
    .sort((a, b) => {
      const aDate = new Date(`${a.date}T${a.pickupTime}:00`);
      const bDate = new Date(`${b.date}T${b.pickupTime}:00`);
      return aDate.getTime() - bDate.getTime();
    })
    .slice(0, 2);

  // Completed bookings (pickupTime is in the past)
  const completedBookings = bookings.filter(b => {
    try {
      const [hour, minute] = b.pickupTime.split(':');
      const pickupDateTime = new Date(b.date);
      pickupDateTime.setHours(parseInt(hour), parseInt(minute), 0, 0);
      return pickupDateTime < new Date();
    } catch (err) {
      console.warn('Skipping invalid completed booking:', b, err);
      return false;
    }
  });
  const completedFare = completedBookings.reduce((acc, curr) => acc + (parseFloat(curr.fare) || 0), 0);

  // Scheduled bookings (pickupTime is in the future)
  const scheduledBookings = bookings.filter(b => {
    try {
      const pickupDateTime = new Date(`${b.date}T${b.pickupTime}:00`);
      return pickupDateTime >= new Date();
    } catch {
      return false;
    }
  });
  const scheduledFare = scheduledBookings.reduce((acc, curr) => acc + (parseFloat(curr.fare) || 0), 0);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome Back!</Text>
        <Text style={styles.subtitle}>Here’s what’s going on today:</Text>
      </View>

      {/* <View style={styles.card}>
        <Text style={styles.cardText}>📅 {bookings.length} Bookings Scheduled</Text>
        <Text style={styles.cardText}>💷 £{totalFare.toFixed(2)} Total Fare</Text>
      </View> */}

      <View style={styles.card}>
        {/* <Text style={styles.cardText}>📅 {bookings.length} Bookings Scheduled</Text>
        <Text style={styles.cardText}>💷 £{totalFare.toFixed(2)} Total Fare</Text> */}
        <Text style={styles.cardText}>{bookings.length} Bookings Scheduled</Text>
        <Text style={styles.description}>All bookings including past and upcoming.</Text>
        <Text style={styles.cardText}>£{totalFare.toFixed(2)} Total Fare</Text>
        <Text style={styles.description}>Total fare from all recorded bookings.</Text>

      </View>

      <View style={styles.card}>
        {/* <Text style={styles.cardText}>✅ {completedBookings.length} Completed Rides</Text>
        <Text style={styles.cardText}>💷 £{completedFare.toFixed(2)} Earned</Text> */}
        <Text style={styles.cardText}>{completedBookings.length} Completed Rides</Text>
        <Text style={styles.description}>Trips where pickup time has already passed.</Text>
        <Text style={styles.cardText}>£{completedFare.toFixed(2)} Earned</Text>
        <Text style={styles.description}>Sum of fares from completed trips.</Text>

      </View>

      <View style={styles.card}>
        {/* <Text style={styles.cardText}>🗓️ {scheduledBookings.length} Scheduled Rides</Text>
        <Text style={styles.cardText}>💷 £{scheduledFare.toFixed(2)} Expected</Text> */}
        <Text style={styles.cardText}>{scheduledBookings.length} Scheduled Rides</Text>
        <Text style={styles.description}>Upcoming trips with a future pickup time.</Text>
        <Text style={styles.cardText}>£{scheduledFare.toFixed(2)} Expected</Text>
        <Text style={styles.description}>Estimated fare from future bookings.</Text>

      </View>



      <View style={styles.nextSection}>
        <Text style={styles.sectionTitle}>Next Bookings</Text>

        {loading ? (
          <Text style={styles.cardText}>Loading...</Text>
        ) : upcomingBookings.length === 0 ? (
          <Text style={styles.cardText}>No upcoming bookings</Text>
        ) : (
          upcomingBookings.map((b, i) => {
            if (!b.pickupTime || !b.date) {
              console.warn('Missing pickupTime or date:', b);
              return null;
            }
            // console.log(b.pickupTime)
            // console.log(b.date)
            const pickupDateTime = new Date(`${b.date}T${b.pickupTime}:00`);
            
            if (isNaN(pickupDateTime.getTime())) return null;
          
            const day = pickupDateTime.toLocaleDateString('en-UK', {
              weekday: 'long',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });
          
            const time = pickupDateTime.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });
          
            return (
              <Pressable
                key={i}
                onPress={() => router.push(`/bookings?bookingId=${b.bookingId}`)}
              >
                <View style={styles.bookingPreview}>
                  <Text style={styles.boldText}>{day} : {time}</Text>
                  <Text>{b.customerName}</Text>
                  <Text style={styles.smallText}>{b.pickup} → {b.dropoff}</Text>
                </View>
              </Pressable>
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
    backgroundColor: '#f1f5f9', // light cool-gray background
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a', // slate-900
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b', // slate-500
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 6, // Sharper corners
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0', // slate-200
  },
  cardText: {
    fontSize: 15,
    color: '#1e293b', // slate-800
    fontWeight: '500',
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    color: '#64748b', // slate-500
    marginBottom: 12,
  },
  nextSection: {
    marginTop: 8,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 14,
  },
  bookingPreview: {
    backgroundColor: '#f8fafc', // slate-50
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#2563eb', // blue-600
  },
  boldText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b', // slate-800
    marginBottom: 4,
  },
  smallText: {
    fontSize: 13,
    color: '#64748b',
  },
  buttonGroup: {
    alignItems: 'center',
    paddingBottom: 60,
  },
  menuButton: {
    backgroundColor: '#2563eb', // blue-600
    borderRadius: 6,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: 220,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1d4ed8', // blue-700
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
