import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import CameraDisplay from './components/CameraDisplay';
import { Camera, CameraType } from 'expo-camera';

export default function App() {
  const placeholder = require('./placeholder.png');
  const [cameraVisible, setCameraVisible] = useState(false);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [currentImg, setCurrentImg] = useState(placeholder);

  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setCurrentImg({ uri: result.assets[0].uri });
    }
  };

  const handlePhotoTaken = (photoUri) => {
    setCurrentImg({ uri: photoUri });
    setCameraVisible(false);
  };

  function switchToCamera() {
    if (permission) {
      setCameraVisible(true);
    }
    else {
      requestPermission();
    }
  }
  const isPermissionGranted = permission?.granted;

  return (
    <View style={{flex: 1}}>
        {!cameraVisible &&
          <View style={styles.container}>
            <View style={styles.imageContainer}>
              <Image source={currentImg} style={styles.img} accessibilityLabel="placeholder image" />
            </View>
            <TouchableOpacity style={styles.button} onPress={pickImageAsync}>
              <Text style={styles.text}>Upload Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => setCameraVisible(true)}>
              <Text style={styles.text}>Take Photo</Text>
            </TouchableOpacity>
            <StatusBar style="auto" />
          </View>
        }
        {cameraVisible &&
          <CameraDisplay 
            permission={permission}
            requestionPermission={requestPermission}
            onPhotoTaken={handlePhotoTaken}
          />
        }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18191A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 70
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
    padding: 10
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
