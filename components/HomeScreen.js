import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FIREBASE_AUTH, FIREBASE_PROVIDER } from '../firebaseConfig';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export default function HomeScreen({navigation}) {

  const onGoogleSignIn = async () => {
    try {
      const response = await signInWithPopup(FIREBASE_AUTH, FIREBASE_PROVIDER);
      console.log(response);
      const credential = GoogleAuthProvider.credentialFromResult(response);
      const token = credential.accessToken;
      const user = response.user;
    } catch (error) {
      console.log(error);
      alert('Sign in failed: ' + error.message);
    }
  };

  return (
    <View style={{flex: 1}}>
      <View style={styles.container}>
        <Text style={styles.title}>
          FoodFinder
        </Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.text}>
              Login
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.text}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#18191A',
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: '80%',
    },
    button: {
      marginTop: 10,
      backgroundColor: "#3A3B3C",
      borderRadius: 18,
      width: 320,
      height: '10%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      color: "white",
      fontSize: 'auto',
      fontSize: 16,
      fontWeight: 'bold'
    },
    title: {
      color: "white",
      fontSize: 'auto',
      fontSize: 28,
      fontWeight: 'bold',
    },
    buttonContainer: {
      flex: 1,
      paddingTop: '10%',
    }
});