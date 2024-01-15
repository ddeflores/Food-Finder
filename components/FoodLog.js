// React and react native imports
import { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { ScrollView } from 'react-native';

// Third party libraries
import { FIREBASE_AUTH, FIREBASE_DB } from '../firebaseConfig'
import { ref, onValue } from 'firebase/database'

// Local components and configs
import NavBar from './NavBar';

export default function FoodLog({navigation}) {
    const [food, setFood] = useState(null);
    const [calories, setCalories] = useState(null);
    const component = 'FoodLog';
    const [foodLog, setFoodLog] = useState([])
    const [day, setDay] = useState(new Date().toDateString())

    // Change the current day to log
    useEffect(() => {
        newDay = new Date().toDateString(); 
        if (day !== newDay) {
            setDay(newDay);
        }
    }, []);

    // Update the food log whenever a user wants to view it
    function updateFoodLog() {
      // Get the data snapshot for the selected day (defaults to today)
      const foodLogRef = ref(FIREBASE_DB, 'users/' + FIREBASE_AUTH.currentUser.uid + '/logs/' + day + '/foods');
      onValue(foodLogRef, (snapshot) => {
        const data = snapshot.val();
        let tmpFoods = []
        let tmpCalories = []
        // Traverse through each key and add the food and calories to their respective arrays
        for (let i = 0; i < Object.keys(data).length; i++) {
          tmpFoods.push((data[Object.keys(data)[i]]['food']))
          tmpCalories.push((data[Object.keys(data)[i]]['calories']))
        }
        // Map each food and calories pair to the new food log, and update the state of the current food log
        let newFoodLog = []
        tmpFoods.map((item, index) => {
          newFoodLog.push(item + ': ' + tmpCalories[index] + ' Calories')
        })
        setFoodLog(newFoodLog)
      });
    }

    return (
      <View style={{flex: 1}}>
        <View style={styles.container}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity  style={styles.button} onPress={() => updateFoodLog()}>
              <Text style={styles.text}>
                Show Food Log:
              </Text>
            </TouchableOpacity>
            <ScrollView contentContainerStyle={styles.logChildren} style={styles.log}>
                {foodLog.map((pair) => {
                  return (
                    <Text style={styles.logText}> 
                      {pair}
                    </Text>
                  )
                })}
            </ScrollView>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.text}>
                Change day:
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{height: '10%', backgroundColor: '#3A3B3C'}}>
          <NavBar navigation={navigation} component={component}/>
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
        paddingTop: '10%',
    },
    button: {
        marginTop: 10,
        marginBottom: 10,
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
    },
    log: {
      flex: 1,
      backgroundColor: '#3A3B3C',
      borderRadius: 8,
      marginTop: 10,
    },
    logChildren: {
      height: '90%',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      marginLeft: 30,
    },
    logText: {
      color: "white",
        fontSize: 'auto',
        fontSize: 16,
        marginTop: 20
    }
});