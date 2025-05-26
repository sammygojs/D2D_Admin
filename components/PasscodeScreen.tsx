// screens/PasscodeScreen.tsx
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function PasscodeScreen({ onSuccess }: { onSuccess: () => void }) {
  const [code, setCode] = useState('');

  const handleUnlock = () => {
    const CORRECT_CODE = '1234'; // Replace with env var or SecureStore later
    if (code === CORRECT_CODE) {
      onSuccess();
    } else {
      Alert.alert('Incorrect', 'The passcode is wrong.');
      setCode('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔒 Enter Passcode</Text>
      <TextInput
        style={styles.input}
        keyboardType="number-pad"
        secureTextEntry
        maxLength={4}
        placeholder="Enter 4-digit code"
        value={code}
        onChangeText={setCode}
      />
      <Pressable style={styles.button} onPress={handleUnlock}>
        <Text style={styles.buttonText}>Unlock</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12,
    fontSize: 20, textAlign: 'center', width: 200, marginBottom: 20
  },
  button: { backgroundColor: '#2563eb', padding: 12, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 }
});
