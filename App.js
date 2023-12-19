import { StatusBar } from 'expo-status-bar';
import { Button, Image, StyleSheet, Text, Touchable, TouchableOpacity, View } from 'react-native';
import {camera, cameraType} from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

export default function App() {
  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      console.log(result);
    }
  };
  
  return (
    <View style={styles.container}>
      <View styles={styles.imageContainer}>
        <Image source={require('./placeholder.png')} style={styles.img} accessibilityLabel="placeholder image" />
      </View>
      <TouchableOpacity style={styles.button} onPress={pickImageAsync}>
        <Text style={styles.text}>Upload Photo</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={pickImageAsync}>
        <Text style={styles.text}>Take Photo</Text>
      </TouchableOpacity>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18191A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    marginTop: 10,
    backgroundColor: "#3A3B3C",
    borderRadius: 18,
    width: 320,
    height: '6%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    flex: 1,
  },
  img : {
    width: 320,
    height: 440,
    borderRadius: 18,
  },
  text: {
    color: "white",
    fontSize: 'auto',
    fontSize: 16,
    fontWeight: 'bold'
  }
});
