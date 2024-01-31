// React and react native imports
import { useEffect, useState } from 'react'
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'

// Third party libraries
import { ref, update, push, onValue } from "firebase/database"
import { FIREBASE_AUTH, FIREBASE_DB } from '../firebaseConfig'

// Local components and configs
import NavBar from './NavBar'
import {FOOD_DB_API_KEY } from '@env'


export default function FoodLog({navigation}) {
    const [food, setFood] = useState(null)
    const [calories, setCalories] = useState(null)
    const [protein, setProtein] = useState(null)
    const component = 'Logger'
    const [day, setDay] = useState(new Date().toDateString())
    const [foodNames, setFoodNames] = useState([])
    const [calorieCounts, setCalorieCounts] = useState([])
    const [proteinCounts, setProteinCounts] = useState([])
    const [foodLogModal, setFoodLogModal] = useState(false)
    const [showDatabase, setShowDatabase] = useState(false)
    const [search, setSearch] = useState('')

    const searchFoodDatabase = async (searchParameter) => {
        if (searchParameter != '') {
            fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${FOOD_DB_API_KEY}&query=${searchParameter}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                data.foods.map((food, index) => {
                    console.log(food.description)
                    if (food.hasOwnProperty('brandName')) {
                        console.log(food.brandName)
                    }
                    food.foodNutrients.map((tmp) => {
                        let macro = tmp.nutrientName
                        if (macro === 'Protein' || macro === 'Total Lipid (fat)' || macro === 'Carbohydrate, by difference' || (macro === 'Energy' && tmp.unitName === 'KCAL')) {
                            console.log(macro, ((tmp.value) + (tmp.unitName)))
                        }
                    })
                    console.log()
                })
            })
            .catch(error => {
                console.error('There was a problem with your search:', error);
            });
        }
    }

    // Fetch the list of foods and calories that the user has added
    const foodsRef = ref(FIREBASE_DB, 'users/' + FIREBASE_AUTH.currentUser.uid + '/foodNames')
    const caloriesRef = ref(FIREBASE_DB, 'users/' + FIREBASE_AUTH.currentUser.uid + '/calorieCounts')
    const proteinRef = ref(FIREBASE_DB, 'users/' + FIREBASE_AUTH.currentUser.uid + '/proteinCounts')
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
        onValue(caloriesRef, (snapshot) => {
            data = snapshot.val()
            tmpCalories = []
            if (data) {
                for (let i = 0; i < Object.keys(data).length; i++) {
                    tmpCalories.push(data[Object.keys(data)[i]]['calories'])
                }
                setCalorieCounts(tmpCalories)
            }
        })  
        onValue(proteinRef, (snapshot) => {
            data = snapshot.val()
            tmpProtein = []
            if (data) {
                for (let i = 0; i < Object.keys(data).length; i++) {
                    tmpProtein.push(data[Object.keys(data)[i]]['protein'])
                }
                setProteinCounts(tmpProtein)
            }
        })  
    }, [])

    // Change the current day to log
    useEffect(() => {
        newDay = new Date().toDateString(); 
        if (day !== newDay) {
            setDay(newDay);
        }
    }, []);

    // Upload food to the database
    function uploadFoodToDB(typeFood, numCalories, gramsProtein) {
        const newRef = push(ref(FIREBASE_DB, 'users/' + FIREBASE_AUTH.currentUser.uid + '/logs/' + day + '/foods'))
        update(newRef, {
            food: typeFood,
            calories: numCalories,
            protein: gramsProtein
        }).catch((error) => {
            alert(error);
        });
        const foodsRef = push(ref(FIREBASE_DB, 'users/' + FIREBASE_AUTH.currentUser.uid + '/foodNames'))
        const caloriesRef = push(ref(FIREBASE_DB, 'users/' + FIREBASE_AUTH.currentUser.uid + '/calorieCounts'))
        const proteinRef = push(ref(FIREBASE_DB, 'users/' + FIREBASE_AUTH.currentUser.uid + '/proteinCounts'))
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
        }
    }

    // When a user chooses a food from the import modal, switch back to the regular logging screen with the chosen food inside of the input
    function pickFoodToLog(foodName, numCalories, numProtein) {
        setFood(foodName)
        setCalories(numCalories)
        setProtein(numProtein)
        setFoodLogModal(false)
    }

    return (
        <View style={{flex: 1}}>
            <View style={styles.container}>
                <View style={styles.buttonContainer}>
                    <>
                    <TextInput style={styles.input} placeholder='  Search for a Food: ' placeholderTextColor={'white'} autoCapitalize='none' onChangeText={newSearch => setSearch(newSearch)} defaultValue={search}/>
                        <TouchableOpacity style={styles.button} onPress={() => searchFoodDatabase(search)}>
                            <Text style={styles.text}>Search Food Database</Text>
                        </TouchableOpacity>
                        <TextInput style={styles.input} placeholder='  Food: ' placeholderTextColor={'white'} autoCapitalize='none' onChangeText={newFood => setFood(newFood)} defaultValue={food}/>
                        <TextInput style={styles.input} placeholder='  Calories: ' placeholderTextColor={'white'} autoCapitalize='none' onChangeText={newCalories => setCalories(newCalories)} defaultValue={calories}/>
                        <TextInput style={styles.input} placeholder='  Protein: ' placeholderTextColor={'white'} autoCapitalize='none' onChangeText={newProtein => setProtein(newProtein)} defaultValue={protein}/>
                        <TouchableOpacity style={styles.button} onPress={() => uploadFoodToDB(food, calories, protein)}>
                            <Text style={styles.text}>
                                Log this Meal
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={() => setFoodLogModal(true)}>
                            <Text style={styles.text}>Import meal from your food logs</Text>
                        </TouchableOpacity>
                    </>
                    <Modal visible={foodLogModal} animationType='fade' presentationStyle='overFullScreen'>
                        <View style={styles.modalContainer}>
                            <ScrollView style={styles.modalFoodLog} contentContainerStyle={{justifyContent: 'flex-start', alignItems: 'flex-start',}}>
                                {foodNames.length > 0 ? foodNames.map((food, index) => {
                                    return (
                                        <TouchableOpacity key={index} onPress={() => pickFoodToLog(food, calorieCounts[index], proteinCounts[index])}>
                                            <Text style={styles.food}>
                                                {food}
                                            </Text> 
                                            <Text style={styles.calories}>
                                                {calorieCounts[index]}
                                            </Text>
                                        </TouchableOpacity>
                                    )
                                }) :
                                    <Text style={styles.text}>You have no foods logged!</Text>
                                }
                            </ScrollView>
                            <TouchableOpacity style={styles.backButton} onPress={() => navigation.reset({index: 0, routes: [{name: 'Logger'}]})}>
                                <Text style={styles.text}>Back</Text>
                            </TouchableOpacity>
                        </View>
                    </Modal>
                    <Modal visible={showDatabase} animationType='fade' presentationStyle='overFullScreen'>
                        <View style={styles.modalContainer}>
                            <ScrollView style={styles.modalFoodLog} contentContainerStyle={{justifyContent: 'flex-start', alignItems: 'flex-start',}}>
                                <TouchableOpacity onPress={() => setShowDatabase(false)}>
                                    <Text style={styles.text}> Back </Text>
                                </TouchableOpacity>
                            </ScrollView>
                            <TouchableOpacity style={styles.backButton} onPress={() => navigation.reset({index: 0, routes: [{name: 'Logger'}]})}>
                                <Text style={styles.text}>Back</Text>
                            </TouchableOpacity>
                        </View>
                    </Modal>
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
        backgroundColor: "#3A3B3C",
        borderRadius: 18,
        width: 200,
        height: '8%',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '20%',
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
    modalContainer: {
        flex: 1,
        backgroundColor: '#18191A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalFoodLog: {
        width: '90%',
        backgroundColor: '#3A3B3C',
        borderRadius: 18,
        marginTop: '25%',
        marginBottom: '10%'
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
});