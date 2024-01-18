// React and react native imports
import { useState, useEffect, useRef } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { ScrollView } from 'react-native';

// Third party libraries
import { FIREBASE_AUTH, FIREBASE_DB } from '../firebaseConfig'
import { ref, onValue, push, update, remove } from 'firebase/database'
import DateTimePicker from '@react-native-community/datetimepicker';

// Local components and configs
import NavBar from './NavBar';

export default function FoodLog({navigation}) {
    const component = 'FoodLog'
    const [foods, setFoods] = useState([])
    const [calories, setCalories] = useState([])
    const [day, setDay] = useState(new Date().toDateString())
    const [dayMenuVisible, setDayMenuVisible] = useState(false)
    const [editVisible, setEditVisible] = useState(false)
    const [foodLogChanged, setFoodLogChanged] = useState(false)
    const [foodLogEditMode, setFoodLogEditMode] = useState(false)
    const [editedFoodName, setEditedFoodName] = useState('')
    const [editedCalories, setEditedCalories] = useState('')
    const editIndex = useRef(null)
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
          setFoods(tmpFoods)
          setCalories(tmpCalories)
        }
        else {
          setFoods(['No Log on\n' + day])
          setCalories([])
        }
      });
    }

    // Delete a food from the food log locally, but not from the database
    function deleteFoodLocally(index) {
      const newFoods = [...foods]
      newFoods.splice(index, 1)
      setFoods(newFoods)
      const newCalories = [...calories]
      newCalories.splice(index, 1)
      setCalories(newCalories)
      setFoodLogChanged(true)
    }

    // Display user edits for a food locally, but not from the database
    function editFoodLocally(index, foodEdit) {
      const newFoods = [...foods]
      newFoods.splice(index, 1, foodEdit)
      setFoods(newFoods)
      setFoodLogChanged(true)
      setFoodLogEditMode(false)
    }

    // Display user edits for a calorie count locally, but not the from database
    function editCaloriesLocally(index, caloriesEdit) {
      const newCalories = [...calories]
      newCalories.splice(index, 1, caloriesEdit)
      setCalories(newCalories)
      setFoodLogChanged(true)
      setFoodLogEditMode(false)
    }

    // Reflect changes locally (deletes and/or edits) in the database
    function updateDB() {
        const newRef = push(ref(FIREBASE_DB, 'users/' + FIREBASE_AUTH.currentUser.uid + '/logs/' + day + '/foods'));
        remove(ref(FIREBASE_DB, 'users/' + FIREBASE_AUTH.currentUser.uid + '/logs/' + day + '/foods'))
        foods.map((typeFood, index) => {
          const newRef = push(ref(FIREBASE_DB, 'users/' + FIREBASE_AUTH.currentUser.uid + '/logs/' + day + '/foods'))
          update(newRef, {
              food: typeFood,
              calories: calories[index]
          }).catch((error) => {
              alert(error);
          })
        })
        setFoodLogChanged(false)
    }

    // Confirm user edits on food log
    function confirmEdits() {
      if (editVisible && foodLogChanged) {
          updateDB()
      }
      if (!foods.includes('No Log on\n' + day)) {
          setEditVisible(!editVisible)
      }
    }

    // When the user slides the scroll wheel to a different date, update the state of day
    const setDate = (event, date) => {
      setDay(date.toDateString())
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
                <View style={styles.modalContainer}>
                  <DateTimePicker maximumDate={new Date()} dateFormat="dayofweek day month" mode="date" value={new Date(day)} display='spinner' onChange={setDate}/>
                  <View style={{flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center'}}>
                    <TouchableOpacity style={{marginHorizontal: 50}} onPress={() => {setDay(new Date().toDateString()); setDayMenuVisible(false)}}>
                      <Text style={{paddingBottom: 20, color: 'white', fontWeight: 'bold', fontSize: 16}}>Reset</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{marginHorizontal: 50}} onPress={() => setDayMenuVisible(false)}>
                      <Text style={{paddingBottom: 20, color: 'white', fontWeight: 'bold', fontSize: 16}}>Update</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            }
            {foodLogEditMode && 
              <Modal>
                <View style={styles.modalContainer}>
                  <View>
                    <TextInput placeholder='  New Food Name:' placeholderTextColor={'white'} autoCapitalize='none' onChangeText={newFood => setEditedFoodName(newFood)} defaultValue={editedFoodName}/>
                    <TextInput placeholder='  New Calorie Count:' placeholderTextColor={'white'} autoCapitalize='none' onChangeText={newCalories => setEditedCalories(newCalories)} defaultValue={editedCalories}/>
                  </View>
                  <TouchableOpacity style={styles.button} onPress={() => {editFoodLocally(editIndex, editedFoodName); editCaloriesLocally(editIndex, editedCalories)}}>
                    <Text style={styles.text}>Confirm Changes</Text>
                  </TouchableOpacity>
                </View>
              </Modal>
            }
            <ScrollView style={styles.log}>
              {foods.map((food, index) => {
                if (editVisible) {
                  return (
                    <View style={styles.editMode} key={index}>
                      <View>
                          <Text style={styles.food}>
                            {food}
                          </Text> 
                          <Text style={styles.calories}>
                            {!food.includes('No Log on') ? calories[index] + ' calories' : ''}
                          </Text> 
                      </View>
                      <View style={{flexDirection: 'row'}}>
                        <TouchableOpacity style={styles.editButton} onPress={() => {setFoodLogEditMode(true); editIndex.current = index}}>
                          <Text style={styles.editText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.editButton} onPress={() => deleteFoodLocally(index)}>
                          <Text style={styles.editText}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )
                }
                else {
                  return (
                    <View key={index}>
                      <Text style={styles.food}> 
                        {food}
                      </Text>
                      <Text style={styles.calories}> 
                        {!food.includes('No Log on') ? calories[index] + ' calories' : ''}
                      </Text>
                    </View>
                  )
                }
              })}
            </ScrollView>
            <View style={{marginTop: 20, alignItems: 'center'}}>
                <Text style={styles.text}>
                  Total Calories: {calories.reduce((partialSum, calorie) => Number(partialSum) + Number(calorie), 0)}
                </Text>
            </View>
            <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
              <TouchableOpacity style={styles.button} disabled={editVisible} onPress={() => setDayMenuVisible(true)}>
                <Text style={styles.text}>
                  Change day
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={() => confirmEdits()}>
                {editVisible &&
                  <Text style={styles.text}>
                    Confirm Changes
                  </Text>
                }
                {!editVisible && 
                  <Text style={styles.text}>
                    Edit Log
                  </Text>
                }
              </TouchableOpacity>
            </View>
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
        margin: 10,
        marginBottom: 10,
        backgroundColor: "#3A3B3C",
        borderRadius: 18,
        width: 150,
        height: 50,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    editButton: {
      margin: 5,
      backgroundColor: "#18191A",
      borderRadius: 18,
      width: 60,
      height: 40,
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
        width: '100%'
    },
    log: {
        backgroundColor: '#3A3B3C',
        borderRadius: 8,
        marginTop: 50,
    },
    food: {
        color: "white",
        fontSize: 20,
        marginTop: 20,
        marginLeft: 15,
        fontWeight: '400',        
    },
    calories: {
      color: "#B5B5B5",
      fontSize: 18,
      marginTop: 5,
      marginLeft: 15,
      fontWeight: '300'
  },
    modalContainer: {
        flex: 1,
        backgroundColor: '#18191A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    date: {
        color: 'white',
        fontSize: 22,
        fontWeight: 'bold',
    },
    editText: {
        fontWeight: 'bold',
        color: 'white'
    },
    editMode: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
});