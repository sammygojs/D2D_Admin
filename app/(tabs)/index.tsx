import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header-like block to match BookingsScreen layout */}
      <View style={styles.header}>
        <Text style={styles.title}>🚖 Welcome Back!</Text>
        <Text style={styles.subtitle}>Here’s what’s going on today:</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardText}>📅 2 Bookings Scheduled</Text>
        <Text style={styles.cardText}>💷 £120 Total Fare</Text>
      </View>

      <View style={styles.buttonGroup}>
        <Pressable style={styles.menuButton} onPress={() => router.push('/bookings')}>
          <Text style={styles.buttonText}>📋 View Bookings</Text>
        </Pressable>
      </View>
    </View>
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
  buttonGroup: {
    gap: 16,
    alignItems: 'center',
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
