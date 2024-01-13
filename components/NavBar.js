// React and react native imports
import React from 'react'
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'

// Third party libraries
import Icon from 'react-native-vector-icons/Entypo'

export default function NavBar({navigation, component}) {

  // Make sure that the current working component is not UploadPicture
  function navigateToUploadPicture() {
    if (component !== 'UploadPicture') {
        navigation.reset({index: 0, routes: [{name: 'Upload Picture'}]})
    }
  }

  // Make sure that the current working component is not FoodLog
  function navigateToFoodLog() {
    if (component !== 'FoodLog') {
        navigation.reset({index: 0, routes: [{name: 'Log'}]})
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigateToUploadPicture()} style={styles.iconContainer}>  
        <Icon name="camera" size={40} style={{color: '#18191A'}} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigateToFoodLog()} style={styles.iconContainer}>
        <Icon name="home" size={40} style={{color: '#18191A'}} />
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
    iconContainer: {
        color: "#18191A",
        marginHorizontal: '10%',
        marginBottom: 20
    },
});
