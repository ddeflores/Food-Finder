import { Camera, CameraType } from 'expo-camera';
import { useState, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

function CameraDisplay({ permission, requestionPermission, onPhotoTaken, onExit }) {
    const placeholder = require('../placeholder.png');
    const [cameraReady, setCameraReady] = useState(false);
    const cameraRef = useRef(null);
    const [type, setType] = useState(CameraType.back);

    // Use Expo Camera to access back camera and take a picture
    const takePicture = async () => {
        if (cameraRef.current && cameraReady) {
            const options = { quality: 0.5, base64: true };
            const photo = await cameraRef.current.takePictureAsync(options);
            onPictureSaved(photo);
        }
    };

    // When a picture is taken, pass it to the parent component to be uplaoded (App.js) 
    const onPictureSaved = photo => {
        console.log(photo);
        onPhotoTaken(photo.uri);
    };

    // Wait for device camera to load
    const onCameraReady = () => {
        setCameraReady(true);
    };
    // Make sure camera permissions have been allowed
    if (!permission || !permission.granted) {
        return (
            <View style={styles.permissionContainer}>
                <Text>No Camera Permission</Text>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.button} onPress={requestionPermission}>
                        <Text>Update Permissions</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Camera 
                style={styles.camera} 
                type={type}
                ref={cameraRef}
                onCameraReady={onCameraReady}>
                <View style={styles.exitButton}>
                    <TouchableOpacity style={styles.exitButton} onPress={onExit}>
                        <Text style={styles.text}>Exit</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.button} onPress={takePicture}>
                        <Text style={styles.text}>Take Photo</Text>
                    </TouchableOpacity>
                </View>
            </Camera>
        </View>
    );
}

const styles = StyleSheet.create({
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
      flex: 1,
      justifyContent: 'center',
    },
    camera: {
      flex: 1,
    },
    buttonContainer: {
      flex: 1,
      flexDirection: 'row',
      backgroundColor: 'transparent',
      margin: 64,
    },
    exitButton: {
        position: 'absolute',
        marginTop: 40,
        marginLeft: 20,
    },
    button: {
      flex: 1,
      alignSelf: 'flex-end',
      alignItems: 'center',
    },
    text: {
      fontSize: 24,
      fontWeight: 'bold',
      color: 'white',
    },
  });
  

export default CameraDisplay
