// React and react native imports
import { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, Pressable, View } from 'react-native'

// Local components and configs
import { FIREBASE_AUTH } from '../firebaseConfig.js';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';

export default function SignUp({navigation}) {
  const [email, setEmail] = useState(null);
  const [password, setPassword] = useState(null);
  const [confirmedPassword, setConfirmedPassword] = useState(null);

  // Use Firebase auth to sign up, and then redirect to the upload page
  function handleSignUp() {
    if (password === confirmedPassword) {
      createUserWithEmailAndPassword(FIREBASE_AUTH, email, password).then((userCredential) => {
        const user = userCredential.user;
        navigation.reset({index: 0, routes: [{name: 'Logger'}]});
      }).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        alert(errorMessage);
      });
    }
    else {
      alert('Passwords do not match!');
    }
  }
  

  return (
    <View style={{flex: 1}}>
      <View style={styles.container}>
        <Text style={styles.title}>
          FoodFinder
        </Text>
        <View style={styles.buttonContainer}>
          <TextInput style={styles.input} placeholder='  Email: ' placeholderTextColor={'white'} onChangeText={newEmail => setEmail(newEmail)} defaultValue={email} autoCapitalize='none' />
          <TextInput style={styles.input} secureTextEntry={true} placeholder='  Password: ' placeholderTextColor={'white'} onChangeText={newPassword => setPassword(newPassword)} defaultValue={password} autoCapitalize='none'/>
          <TextInput style={styles.input} secureTextEntry={true} placeholder='  Confirm Password: ' placeholderTextColor={'white'} onChangeText={newPassword => setConfirmedPassword(newPassword)} defaultValue={confirmedPassword} autoCapitalize='none'/>
          <Pressable style={styles.button} onPress={() => handleSignUp(FIREBASE_AUTH, email, password)}>
            <Text style={styles.text}>
              Sign Up
            </Text>
          </Pressable>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.text}>Back</Text>
          </Pressable>
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
    backButton: {
      marginTop: 10,
      backgroundColor: "#18191A",
      borderRadius: 18,
      width: 320,
      height: '10%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    input: {
      marginTop: 10,
      backgroundColor: "#3A3B3C",
      borderRadius: 18,
      width: 320,
      paddingLeft: 20,
      height: '10%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white',
      fontSize: 16,
      fontWeight: '100'
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