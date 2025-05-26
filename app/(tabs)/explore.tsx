// import React, { useState } from 'react';
// import { Platform, StyleSheet, Text, View } from 'react-native';
// import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

// const GOOGLE_MAPS_API_KEY = 'AIzaSyDnFzMr6sqgcsWUrMaS5fa8ooi7-A9EAWw';

// // Conditionally import MapView only on native
// // let MapView, Marker;
// if (Platform.OS !== 'web') {
//   const Maps = require('react-native-maps');
//   MapView = Maps.default;
//   Marker = Maps.Marker;
// }

// export default function QuoteEstimatorScreen() {
//   const [startLocation, setStartLocation] = useState(null);
//   const [endLocation, setEndLocation] = useState(null);

//   const region = {
//     latitude: startLocation?.lat || 51.509865,
//     longitude: startLocation?.lng || -0.118092,
//     latitudeDelta: 0.1,
//     longitudeDelta: 0.1,
//   };

//   return (
//     <View style={styles.container}>
//       <GooglePlacesAutocomplete
//         placeholder="Start Location"
//         fetchDetails={true}
//         onPress={(data, details = null) => {
//           const location = details.geometry.location;
//           setStartLocation({ lat: location.lat, lng: location.lng });
//         }}
//         query={{
//           key: GOOGLE_MAPS_API_KEY,
//           language: 'en',
//           components: 'country:gb',
//         }}
//         styles={{
//           container: styles.autocomplete,
//           textInput: styles.input,
//         }}
//       />

//       <GooglePlacesAutocomplete
//         placeholder="End Location"
//         fetchDetails={true}
//         onPress={(data, details = null) => {
//           const location = details.geometry.location;
//           setEndLocation({ lat: location.lat, lng: location.lng });
//         }}
//         query={{
//           key: GOOGLE_MAPS_API_KEY,
//           language: 'en',
//           components: 'country:gb',
//         }}
//         styles={{
//           container: styles.autocomplete,
//           textInput: styles.input,
//         }}
//       />

//       {Platform.OS !== 'web' ? (
//         <MapView style={styles.map} region={region}>
//           {startLocation && (
//             <Marker
//               coordinate={{
//                 latitude: startLocation.lat,
//                 longitude: startLocation.lng,
//               }}
//               title="Start"
//             />
//           )}
//           {endLocation && (
//             <Marker
//               coordinate={{
//                 latitude: endLocation.lat,
//                 longitude: endLocation.lng,
//               }}
//               title="End"
//             />
//           )}
//         </MapView>
//       ) : (
//         <Text style={styles.webFallback}>Map is not available on web preview. Please use a mobile device.</Text>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   map: {
//     flex: 1,
//   },
//   autocomplete: {
//     position: 'absolute',
//     top: 40,
//     width: '100%',
//     zIndex: 1,
//   },
//   input: {
//     backgroundColor: '#fff',
//     borderColor: '#ccc',
//     borderWidth: 1,
//     borderRadius: 5,
//     padding: 10,
//     margin: 10,
//   },
//   webFallback: {
//     marginTop: 200,
//     textAlign: 'center',
//     fontSize: 16,
//     color: 'gray',
//   },
// });