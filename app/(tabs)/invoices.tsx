import { StyleSheet, Text, View } from 'react-native';

export default function InvoicesScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Invoices</Text>
            <Text>Your recent rides will appear here.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white', // ✅ Explicit background
    },
    text: {
        color: 'black',            // ✅ Explicit text color
        fontSize: 20,
        fontWeight: 'bold',
    },
});
