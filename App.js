// React and react native imports
import React, { useEffect, useState } from 'react';
import { NavigationContainer, NavigationRouteContext } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Third party libraries
import { FIREBASE_AUTH, FIREBASE_APP, onAuthStateChanged } from './firebaseConfig.js';

// Local components 
import HomeScreen from './components/HomeScreen.js';
import Login from './components/Login.js';
import SignUp from './components/SignUp.js';
import UploadPicture from './components/UploadPicture.js';
import FoodLog from './components/FoodLog.js';
import Logger from './components/Logger.js';
import Settings from './components/Settings.js';

export default function App() {
  const [initialRoute, setInitialRoute] = useState('Home');

  // If a user is logged in, make sure they dont get directed to the login home page
  useEffect(() => {
    FIREBASE_AUTH.onAuthStateChanged(function(user) {
      if (user) {
        setInitialRoute('Logger');
      }
      else {
        setInitialRoute('Home');
      }
    });
  }, []);

  // Insert use effect hook to fetch light/dark mode from db for current user

  const Stack = createNativeStackNavigator();

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen name="Home" component={HomeScreen} options={{headerShown: false, animation: 'fade', animationDuration: 150}}/>
        <Stack.Screen name="Login" component={Login} options={{headerShown: false, animation: 'fade', animationDuration: 150}}/>
        <Stack.Screen name="SignUp" component={SignUp} options={{headerShown: false, animation: 'fade', animationDuration: 150}}/>
        <Stack.Screen name="Upload Picture" component={UploadPicture} options={{headerShown: false, animation: 'fade', animationDuration: 150}}/>
        <Stack.Screen name="Logger" component={Logger} options={{headerShown: false, animation: 'fade', animationDuration: 150}}/>
        <Stack.Screen name="FoodLog" component={FoodLog} options={{headerShown: false, animation: 'fade', animationDuration: 150}}/>
        <Stack.Screen name="Settings" component={Settings} options={{headerShown: false, animation: 'fade', animationDuration: 150}}/>
        {/*<Stack.Screen name="Workouts" component={FitnessPage} options={{headerShown: false}}/>*/}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
