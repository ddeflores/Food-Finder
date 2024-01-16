// React and react native imports
import { useState, useEffect } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { ScrollView } from 'react-native';

// Third party libraries
import { FIREBASE_AUTH, FIREBASE_DB } from '../firebaseConfig'
import { ref, onValue } from 'firebase/database'
import DateTimePicker from '@react-native-community/datetimepicker';

// Local components and configs
import NavBar from './NavBar';

export default function FoodLog({navigation}) {
    const component = 'FoodLog'
    const [foodLog, setFoodLog] = useState([])
    const [day, setDay] = useState(new Date().toDateString())
    const [dayMenuVisible, setDayMenuVisible] = useState(false)

    // Initially show the food log, and update it whenever the date changes
    useEffect(() => {
      updateFoodLog()
    }, [day])

    // Update the food log whenever a user wants to view it
    function updateFoodLog() {
      // Get the data snapshot for the selected day (defaults to today)
      const foodLogRef = ref(FIREBASE_DB, 'users/' + FIREBASE_AUTH.currentUser.uid + '/logs/' + day + '/foods');
      onValue(foodLogRef, (snapshot) => {
        const data = snapshot.val();
        let tmpFoods = []
        let tmpCalories = []
        // Traverse through each key and add the food and calories to their respective arrays if there is a log on that day
        if (data) {
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
        }
        else {
          setFoodLog(['No Log on ' + day])
        }
      });
    }

    const setDate = (event, date) => {
      setDay(date.toDateString())
      console.log(date.toDateString())
    };
    
    return (
      <View style={{flex: 1}}>
        <View style={styles.container}>
          <View style={styles.buttonContainer}>
            <View style={{justifyContent: 'center', alignItems: 'center', marginTop: 20}}>
              <Text style={styles.date}>{day}</Text>
            </View>
            {dayMenuVisible &&
              <Modal>
                <View style={styles.dayMenuContainer}>
                  <DateTimePicker maximumDate={new Date()} dateFormat="dayofweek day month" mode="date" value={new Date(day)} display='spinner' onChange={setDate}/>
                  <View style={{flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center'}}>
                    <TouchableOpacity style={{marginHorizontal: 50}} onPress={() => setDay(new Date().toDateString())}>
                      <Text style={{paddingBottom: 20, color: 'white', fontWeight: 'bold', fontSize: 16}}>Reset</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{marginHorizontal: 50}} onPress={() => setDayMenuVisible(false)}>
                      <Text style={{paddingBottom: 20, color: 'white', fontWeight: 'bold', fontSize: 16}}>Update</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            }
            <ScrollView style={styles.log}>
              {foodLog.map((pair, index) => {
                return (
                  <Text style={styles.logText} key={index}> 
                    {pair}
                  </Text>
                )
              })}
            </ScrollView>
            <TouchableOpacity style={styles.button} onPress={() => setDayMenuVisible(true)}>
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
        marginBottom: 20
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
        marginTop: 50,
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
        marginTop: 20,
        marginLeft: 15
    },
    dayMenuContainer: {
        flex: 1,
        backgroundColor: '#18191A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    date: {
        color: 'white',
        fontSize: 22,
        fontWeight: 'bold',
    }
});