// React and react native imports
import React from 'react'
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'

export default function NavBar({navigation, component}) {
  function navigateToUploadPicture() {
    if (component !== 'UploadPicture') {
        navigation.reset({index: 0, routes: [{name: 'Upload Picture'}]})
    }
  }

  function navigateToFoodLog() {
    if (component !== 'FoodLog') {
        navigation.reset({index: 0, routes: [{name: 'Log'}]})
    }
  }
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigateToUploadPicture()}>  
        <Text style={styles.text}>Log with Pic</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigateToFoodLog()}>
        <Text style={styles.text}>Regular</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#3A3B3C',
    },
    text: {
        color: "white",
        fontSize: 'auto',
        fontSize: 16,
        fontWeight: 'bold',
        marginHorizontal: '10%',
        marginBottom: 20
    },
});
