import React, { useEffect, useState } from 'react';
import { FIREBASE_AUTH, FIREBASE_APP, onAuthStateChanged } from './firebaseConfig.js';
import { NavigationContainer, NavigationRouteContext } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './components/HomeScreen.js';
import Login from './components/Login.js'
import SignUp from './components/SignUp.js'
import CameraDisplay from './components/CameraDisplay.js'
import UploadPicture from './components/UploadPicture.js'

export default function App() {
  const [initialRoute, setInitialRoute] = useState('Home');

  // If a user is logged in, make sure they dont get directed to the login home page
  useEffect(() => {
    FIREBASE_AUTH.onAuthStateChanged(function(user) {
      if (user) {
        setInitialRoute('Upload Picture')
      }
    });
  }, []);

  const Stack = createNativeStackNavigator();

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen name="Home" component={HomeScreen} options={{headerShown: false}}/>
        <Stack.Screen name="Login" component={Login} options={{headerShown: false}}/>
        <Stack.Screen name="SignUp" component={SignUp} options={{headerShown: false}}/>
        <Stack.Screen name="Upload Picture" component={UploadPicture} options={{headerShown: false}}/>
        <Stack.Screen name="Camera" component={CameraDisplay} options={{headerShown: false}}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
