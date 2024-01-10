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
import OpenAI from 'openai';
import 'react-native-url-polyfill/auto';
import { OPENAI_API_KEY } from '@env';

export default function App() {
  const placeholder = require('./placeholder.png');
  const [cameraVisible, setCameraVisible] = useState(false);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [currentImg, setCurrentImg] = useState(placeholder);
  const [prediction, setPrediction] = useState(null);
  const [process, setProcess] = useState('');
  const openai = new OpenAI({apiKey: OPENAI_API_KEY});

  // Loading the binary classifier model
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

  // Preprocessing images for the model to classify
  const transformImageToTensor = async (uri) => {
    // Convert URI to base64 string, and then into a tensor
    const {uri: imageUri} = uri;
    const img64 = await FileSystem.readAsStringAsync(imageUri, {encoding: FileSystem.EncodingType.Base64});
    const imgBuffer =  tf.util.encodeString(img64, 'base64').buffer;
    let imgTensor = decodeJpeg(new Uint8Array(imgBuffer));
    // Change the tensor to BGR format, instead of RGB
    imgTensor = imgTensor.reverse(2);
    // Resize and normalize the tensor
    imgTensor = tf.image.resizeBilinear(imgTensor, [128, 128]);
    imgTensor = imgTensor.div(255.0);
    const img = tf.reshape(imgTensor, [1, 128, 128, 3]);
    return img;
  };

  // Use the model to classify the image as food/nonfood
  function makePredictions(model, imagesTensor) {
    setProcess('Making predictions');
    const predictionsTensor = model.predict(imagesTensor);
    // Return the most probable instance
    const predictions = predictionsTensor.argMax(-1).dataSync();
    const predictionsArray = Array.from(predictions);  
    return predictionsArray;
  };

  // Gather results from the model, and if the image is of food send an API request for a detailed prediction
  const getPredictions = async (image) => {
    await tf.ready();
    const model = await loadModel('classifier');
    const isFoodModel = await loadModel('isFood');
    const tensor_image = await transformImageToTensor(image);
    const isFood = await makePredictions(isFoodModel, tensor_image);
    if (isFood[0] === 1) {
      return 'Not Food';
    } 
    else {
      const predictions = await openai_prediction(image);
      return predictions;
    }
  }

  // Send an API request to determine what kind of food the image is, and how many calories are in it  (from OpenAI docs)
  const openai_prediction = async (uri) => {
    const {uri: imageUri} = uri;
    const base64string = await FileSystem.readAsStringAsync(imageUri, {encoding: FileSystem.EncodingType.Base64});
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "What kind of food is in this image? Roughly how many calories are in it? Respond with only the type of food (do not exceed 8 words) and its corresponding number of calories (only the number). Format it like this: Food: \nCalories: \n" },
            {
              type: "image_url",
              image_url: {
                "url": `data:image/jpeg;base64,${base64string}`,
              },
            },
          ],
        },
      ],
    });
    return response.choices[0].message.content;
  }

  // Expo ImagePicker: allow the user to select an image from their photo library
  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setCurrentImg({ uri: result.assets[0].uri });
    }
  };

  // Set the view back to upload page when a user exits the camera
  const handleExit = () => {
    setCameraVisible(false);
  }

  // When a photo is taken by a user, upload it to the view
  const handlePhotoTaken = (photoUri) => {
    setCurrentImg({ uri: photoUri });
    setCameraVisible(false);
  };

  // If the current image in view changes, make a prediction on it
  useEffect(() => {
    const fetchPredictions = async () => {
      if (currentImg !== placeholder) {
        const predictions = await getPredictions(currentImg);
        setPrediction(predictions);
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
                  {prediction}
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
            onExit={handleExit}
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
