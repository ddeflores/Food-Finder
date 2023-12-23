import React, { useState, useEffect, createElement } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import CameraDisplay from './components/CameraDisplay';
import { Camera, CameraType } from 'expo-camera';
import * as tf from '@tensorflow/tfjs';
import { bundleResourceIO, decodeJpeg } from '@tensorflow/tfjs-react-native';
import '@tensorflow/tfjs-react-native';
import { manipulateAsync, FlipType, SaveFormat } from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

export default function App() {
  const placeholder = require('./placeholder.png');
  const [cameraVisible, setCameraVisible] = useState(false);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [currentImg, setCurrentImg] = useState(placeholder);
  const [prediction, setPrediction] = useState(null);

  const loadModel = async() => {
    const modelJson = require('./assets/model.json');
    const modelWeights = require('./assets/group1-shard1of1.bin');
    const model = await tf.loadLayersModel(
        bundleResourceIO(modelJson, modelWeights)
    );
    return model;
  }

  const transformImageToTensor = async (uri) => {
    const {uri: imageUri} = uri;
    const img64 = await FileSystem.readAsStringAsync(imageUri, {encoding: FileSystem.EncodingType.Base64})
    const imgBuffer =  tf.util.encodeString(img64, 'base64').buffer;
    const raw = new Uint8Array(imgBuffer);
    let imgTensor = decodeJpeg(raw)
    const scalar = tf.scalar(255)
    imgTensor = tf.image.resizeNearestNeighbor(imgTensor, [128, 128])
    const tensorScaled = imgTensor.div(scalar)
    const img = tf.reshape(tensorScaled, [1,128,128,3])
    return img
  };


  
  const makePredictions = async ( batch, model, imagesTensor ) => {
    const predictionsdata= model.predict(imagesTensor);
    const {id: pred} = predictionsdata;
    return pred;
  }

  const getPredictions = async (image) => {
    await tf.ready();
    const model = await loadModel();
    const tensor_image = await transformImageToTensor(image);
    const predictions = await makePredictions(1, model, tensor_image);
    return predictions;    
}

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

  useEffect(() => {
    const fetchPredictions = async () => {
      if (currentImg !== placeholder) {
        const predictions = await getPredictions(currentImg);
        console.log(predictions);
        setPrediction(predictions.id);
      }
    };
    fetchPredictions();
  }, [currentImg]);

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
        {prediction &&
          <View>
            <Text>Prediction: {prediction}</Text>
          </View>
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
