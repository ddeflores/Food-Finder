// React and react native imports
import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Image, Modal, StyleSheet, Text, TextInput, Pressable, View } from 'react-native';
import { ScrollView } from 'react-native';

// Third party libraries
import { Camera } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as tf from '@tensorflow/tfjs';
//import '@tensorflow/tfjs-react-native';
//import { bundleResourceIO, decodeJpeg } from '@tensorflow/tfjs-react-native';
import OpenAI from 'openai';
import 'react-native-url-polyfill/auto';
import { ref, update, push, onValue} from 'firebase/database'

// Local components and configurations
import CameraDisplay from './CameraDisplay';
import NavBar from './NavBar';
import { OPENAI_API_KEY } from '@env';
import { FIREBASE_DB, FIREBASE_AUTH } from '../firebaseConfig';

export default function UploadPicture({navigation}) {
  const placeholder = require('../placeholder.png');
  const [cameraVisible, setCameraVisible] = useState(false);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [currentImg, setCurrentImg] = useState(placeholder);
  const [prediction, setPrediction] = useState(null);
  const [process, setProcess] = useState('');
  const openai = new OpenAI({apiKey: OPENAI_API_KEY});
  const [correction, setCorrection] = useState('')
  const component = 'UploadPicture';
  const [modalVisible, setModalVisible] = useState(false)
  const [foodNames, setFoodNames] = useState([])
  const [day, setDay] = useState(new Date().toDateString())

  // Change the current day to log
  useEffect(() => {
    newDay = new Date().toDateString(); 
    if (day !== newDay) {
        setDay(newDay);
    }
  }, []);

  // Fetch the list of foods and calories that the user has added
  const foodsRef = ref(FIREBASE_DB, 'users/' + FIREBASE_AUTH.currentUser.uid + '/foodNames')
  useEffect(() => {
      onValue(foodsRef, (snapshot) => {
          data = snapshot.val()
          tmpFoods = []
          if (data) {
              for (let i = 0; i < Object.keys(data).length; i++) {
                  tmpFoods.push(data[Object.keys(data)[i]]['food'])
              }
              setFoodNames(tmpFoods)
          }
      })  
  }, [])

  // Loading the binary classifier model
  const loadModel = async () => {
    setPrediction(null);
    setProcess('Processing image, this may take a moment');
    let modelJson = require('../assets/isFood.json');
    let modelWeights = require('../assets/isFoodBin.bin');
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
    setProcess('Checking if Picture is of Food')
    const predictionsTensor = model.predict(imagesTensor);
    // Return the most probable instance
    const predictions = predictionsTensor.argMax(-1).dataSync();
    const predictionsArray = Array.from(predictions);  
    return predictionsArray;
  };

  // Gather results from the model, and if the image is of food send an API request for a detailed prediction
  const getPredictions = async (image) => {
    await tf.ready();
    const isFoodModel = await loadModel();
    const tensor_image = await transformImageToTensor(image).catch((error) => {
      alert('Image Processing ' + error)
      throw new Error(error)
    });
    const isFood = makePredictions(isFoodModel, tensor_image);
    if (isFood[0] === 1) {
      return 'Not Food';
    } 
    else {
      setProcess('Fetching results')
      const predictions = await openai_prediction(image, '');
      return predictions;
    }
  }

  // Send an API request to determine what kind of food the image is, and how many calories are in it  (from OpenAI docs)
  // If the correctFood param is not equal to the empty string, send the request assuming the type of food 
  const openai_prediction = async (uri, correctFood) => {
    setPrediction(null)
    setProcess('Analyzing')
    const {uri: imageUri} = uri;
    const base64string = await FileSystem.readAsStringAsync(imageUri, {encoding: FileSystem.EncodingType.Base64});
    if (correctFood === '') {
      const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "What kind of food is in this image? Roughly how many calories are in it? Respond with only the type of food (do not exceed 5 words) and its corresponding number of calories (only the number). Do not under any circumstance respond without an estimate of calories, or a guess on what the food is. Format your response like this: Food: \nCalories: " },
              {
                type: "image_url",
                image_url: {
                  "url": `data:image/jpeg;base64,${base64string}`,
                  detail: 'low'
                },
              },
            ],
          },
        ],
      });
      const img_prediction = response.choices[0].message.content
      const protein_prediction = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: `Estimate how many grams of protein are in ${img_prediction}. Format your response like this, and do not include the word "grams": Protein: \n`},
            ],
          },
        ],
      });
      protein = protein_prediction.choices[0].message.content
      return img_prediction + '\n' + protein
    }
    else {
      const response = await openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: `This image is of ${correctFood}. Roughly how many calories are in it? Respond with only the type of food and its corresponding number of calories (only the number). Do not under any circumstance respond without an estimate of calories, or a guess on what the food is. Format your response like this: Food: ${correctFood}\nCalories: ` },
              {
                type: "image_url",
                image_url: {
                  "url": `data:image/jpeg;base64,${base64string}`,
                  detail: 'low'
                },
              },
            ],
          },
        ],
      });
      const img_prediction = response.choices[0].message.content
      const protein_prediction = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: `Estimate how many grams of protein are in ${img_prediction}. Format your response like this, and do not include the word "grams": Protein: \n`},
            ],
          },
        ],
      });
      protein = protein_prediction.choices[0].message.content
      setPrediction(img_prediction + '\n' + protein)
      setCorrection('')
    }
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
        setProcess('')
      }
    };
    fetchPredictions();
  }, [currentImg]);

  // Upload food to the database
  function uploadFoodToDB(typeFood, numCalories, gramsProtein) {
    const newRef = push(ref(FIREBASE_DB, 'users/' + FIREBASE_AUTH.currentUser.uid + '/logs/' + day + '/foods'));
    update(newRef, {
        food: typeFood,
        calories: numCalories,
        protein: gramsProtein,
        fat: 'N/A',
        carb: 'N/A'
    }).catch((error) => {
        alert(error);
    });
    const foodsRef = push(ref(FIREBASE_DB, 'users/' + FIREBASE_AUTH.currentUser.uid + '/foodNames'))
    const caloriesRef = push(ref(FIREBASE_DB, 'users/' + FIREBASE_AUTH.currentUser.uid + '/calorieCounts'))
    const proteinRef = push(ref(FIREBASE_DB, 'users/' + FIREBASE_AUTH.currentUser.uid + '/proteinCounts'))
    const fatsRef = push(ref(FIREBASE_DB, 'users/' + FIREBASE_AUTH.currentUser.uid + '/fatCounts'))
    const carbsRef = push(ref(FIREBASE_DB, 'users/' + FIREBASE_AUTH.currentUser.uid + '/carbCounts'))
    // If the food is not already stored in any of the users logs, add it to the comprehensive list 
    if (!foodNames.includes(typeFood)) {
        update(foodsRef, {
            food: typeFood
        }).catch((error) => {
            alert(error);
        });

        update(caloriesRef, {
            calories: numCalories
        }).catch((error) => {
            alert(error);
        });

        update(proteinRef, {
          protein: gramsProtein
        }).catch((error) => {
            alert(error);
        });

        update(fatsRef, {
          fat: 'N/A'
        }).catch((error) => {
            alert(error);
        });

        update(carbsRef, {
          carb: 'N/A'
        }).catch((error) => {
            alert(error);
        });
    }
}

  // Upload food to database when a user confirms a prediction
  function logFood(pred) {
    predArr = pred.split('\n')
    foodName = predArr[0].split(' ')
    calorieCount = predArr[1].split(' ')
    proteinCount = predArr[2].split(' ')

    food = ''
    for (i = 1; i < foodName.length; i++) {
      food += foodName[i] + ' '
    }
    calorie = ''
    for (i = 1; i < calorieCount.length; i++) {
      calorie += calorieCount[i]
    }

    protein = ''
    for (i = 1; i < proteinCount.length; i++) {
      protein += proteinCount[i]
    }
    uploadFoodToDB(food, calorie, protein)
  }

  return (
    <View style={{flex: 1}}>
        {/* When the camera isnt visible, show the menu to upload pictures */}
        {!cameraVisible &&
        <ScrollView style={styles.container}>
          <View>
            <View style={{justifyContent: 'center', alignItems: 'center',}}>
              <View style={styles.imageContainer}>
                <Image source={currentImg} style={styles.img} accessibilityLabel="placeholder image" />
              </View>
              <Pressable style={styles.button} onPress={pickImageAsync}>
                <Text style={styles.text}>Upload Photo</Text>
              </Pressable>
              <Pressable style={styles.button} onPress={() => setCameraVisible(true)}>
                <Text style={styles.text}>Take Photo</Text>
              </Pressable>
              {/* When a picture is uploaded and no prediction has been made yet, display the loading symbol and current process */}
              {(currentImg !== placeholder && !prediction) &&
                <View style={{marginTop: 10, flexDirection: 'row'}}>
                  <Text style={styles.text}>{process}</Text>
                  <ActivityIndicator size="small" style={{marginLeft: 5}}/>
                </View>
              }
              {/* When a prediction has been made, display it */}
              {prediction &&
                <View style={{marginTop: 10}}>
                  <Text style={styles.text}>
                    {prediction}
                  </Text>
                </View>
              }
              {prediction &&
                <Pressable style={styles.button} onPress={() => setModalVisible(true)}>
                  <Text style={{color: 'white', fontSize: 16, fontWeight: '200',}}>Mistake? Click here to correct it</Text>
                </Pressable>
              }
              {prediction && prediction !== 'Not Food' &&
                <Pressable style={styles.button} onPress={() => logFood(prediction)}>
                  <Text style={styles.text}>Log Food</Text>
                </Pressable>
              }
              <Modal visible={modalVisible}>
                  <View style={styles.modalContainer}>
                      <TextInput style={styles.input} placeholder={'Type in the correct food here!'} placeholderTextColor={'white'} value={correction} onChangeText={(newCorrection) => setCorrection(newCorrection)}/>
                      <Pressable style={styles.button} onPress={() => {openai_prediction(currentImg, correction); setModalVisible(false)}}>
                        <Text style={styles.text}>
                          Confirm
                        </Text>
                      </Pressable>
                      <Pressable style={styles.button} onPress={() => setModalVisible(false)}>
                        <Text style={styles.text}>
                          Back
                        </Text>
                      </Pressable>
                      <Pressable style={styles.button} onPress={() => {setModalVisible(false); openai_prediction(currentImg, '')}}>
                          <Text style={styles.text}>
                            Retry with Same Image
                          </Text>
                      </Pressable>
                  </View>
              </Modal>
            </View>
          </View>
        </ScrollView>
        }
        {/* Camera is visible */}
        {cameraVisible &&
          <CameraDisplay 
            permission={permission}
            requestionPermission={requestPermission}
            onPhotoTaken={handlePhotoTaken}
            onExit={handleExit}
          />
        }
        <View style={{height: '10%', backgroundColor: '#3A3B3C'}}>
          <NavBar navigation={navigation} component={component}/>
        </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18191A',
    paddingTop: 80,
  },
  modalContainer: {
    backgroundColor: '#18191A',
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center'
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
    paddingTop: 20
  },
  img : {
    width: 320,
    height: 400,
    borderRadius: 18,
  },
  text: {
    color: "white",
    fontSize: 'auto',
    fontSize: 16,
    fontWeight: 'bold'
  },
  input: {
    marginTop: 20,
    backgroundColor: "#3A3B3C",
    borderRadius: 18,
    width: 320,
    paddingLeft: 24,
    height: '7%',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    fontSize: 16,
    fontWeight: '100',
  },
});
