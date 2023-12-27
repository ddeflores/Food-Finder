import React, { useState, useEffect, createElement } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import CameraDisplay from './components/CameraDisplay';
import { Camera, CameraType } from 'expo-camera';
import * as tf from '@tensorflow/tfjs';
import { bundleResourceIO, decodeJpeg } from '@tensorflow/tfjs-react-native';
import '@tensorflow/tfjs-react-native';
import * as FileSystem from 'expo-file-system';

export default function App() {
  const placeholder = require('./placeholder.png');
  const [cameraVisible, setCameraVisible] = useState(false);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [currentImg, setCurrentImg] = useState(placeholder);
  const [prediction, setPrediction] = useState(null);
  const [process, setProcess] = useState('');
  const food_labels = ['Meat', 'Fried Food', 'Dessert', 'Pasta', 'Soup', 'Dairy', 'Egg', 'Fruit/Vegetable', 'Seafood', 'Bread', 'Rice', 'Not Food'];

  const loadModel = async (jsonPath) => {
    setPrediction(null);
    setProcess('Analyzing');
    let modelJson = require('./assets/isFood.json');
    let modelWeights = require('./assets/isFoodBin.bin');
    if (jsonPath === 'classifier') {
      modelJson = require('./assets/classifier.json');
      modelWeights = require('./assets/classifierBin.bin');
    }
    const model = await tf.loadLayersModel(bundleResourceIO(modelJson, modelWeights));
    return model;
  }

  const transformImageToTensor = async (uri) => {
    const {uri: imageUri} = uri;
    const img64 = await FileSystem.readAsStringAsync(imageUri, {encoding: FileSystem.EncodingType.Base64});
    const imgBuffer =  tf.util.encodeString(img64, 'base64').buffer;
    let imgTensor = decodeJpeg(new Uint8Array(imgBuffer));
    imgTensor = tf.image.resizeNearestNeighbor(imgTensor, [128, 128]);
    const img = tf.reshape(imgTensor, [1,128,128,3]);
    return img;
  };

  function makePredictions(model, imagesTensor) {
    setProcess('Making predictions');
    const predictionsTensor = model.predict(imagesTensor);
    const predictions = predictionsTensor.argMax(-1).dataSync();
    const predictionsArray = Array.from(predictions);  
    return predictionsArray;
  };

  const getPredictions = async (image) => {
    await tf.ready();
    const model = await loadModel('classifier');
    const isFoodModel = await loadModel('isFood');
    const tensor_image = await transformImageToTensor(image);
    const isFood = await makePredictions(isFoodModel, tensor_image);
    if (isFood[0] === 1) {
      return 11;
    } 
    else {
      const predictions = await makePredictions(model, tensor_image);
      return predictions; 
    }   
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

  useEffect(() => {
    const fetchPredictions = async () => {
      if (currentImg !== placeholder) {
        const predictions = await getPredictions(currentImg);
        setPrediction(food_labels[predictions]);
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
            {(currentImg !== placeholder && !prediction) &&
              <View style={{marginTop: 10, flexDirection: 'row'}}>
                <Text style={styles.text}>{process}</Text>
                <ActivityIndicator size="small" style={{marginLeft: 5}}/>
              </View>
            }
            {prediction &&
              <View style={{marginTop: 10}}>
                <Text style={styles.text}>
                  Prediction: {prediction}
                </Text>
              </View>
            }
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
