// React and react native imports
import { useEffect, useState } from 'react'
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native'

// Third party libraries
import { ref, update, push, onValue } from "firebase/database"
import { FIREBASE_AUTH, FIREBASE_DB } from '../firebaseConfig'

// Local components and configs
import NavBar from './NavBar'
import {FOOD_DB_API_KEY } from '@env'


export default function FoodLog({navigation}) {
    // NavBar prop
    const component = 'Logger'
    // For logging via user input
    const [food, setFood] = useState(null) 
    const [calories, setCalories] = useState(null) 
    const [protein, setProtein] = useState(null) 
    const [fat, setFat] = useState(null)
    const [carbs, setCarbs] = useState(null)
    // Day to log to
    const [day, setDay] = useState(new Date().toDateString()) 
    // Past food logs
    const [foodNames, setFoodNames] = useState([]) 
    const [calorieCounts, setCalorieCounts] = useState([]) 
    const [proteinCounts, setProteinCounts] = useState([])
    const [fatCounts, setFatCounts] = useState([])
    const [carbCounts, setCarbCounts] = useState([]) 
     // For changing visiblity of modals
    const [foodLogModal, setFoodLogModal] = useState(false)
    const [logNewMealVisible, setLogNewMealVisible] = useState(false)
    const [showSearchModal, setShowSearchModal] = useState(false)
    // For searching the database by HTTP request, updating, and displaying the results
    const [search, setSearch] = useState('') 
    const [searchFoodMacros, setSearchFoodMacros] = useState([]) 
    const [searchFoodNames, setSearchFoodNames] = useState([]) 
    
    // Search the food database by making a HTTP request
    const searchFoodDatabase = (searchParameter) => {
        // Make sure that the search is not empty
        if (searchParameter != '') {
            const tmpFoodNames = []
            const tmpMacrosList = []
            fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${FOOD_DB_API_KEY}&query=${searchParameter}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Store each food name for future indexing
                data.foods.map((food) => {
                    const foodName = food.description
                    const macros = []
                    // Map each macro and calories to the same index as their food name 
                    food.foodNutrients.map((tmp) => {
                        const tmpMacro = tmp.nutrientName
                        if (tmpMacro === 'Protein') {
                            macros.push(['Protein: ', tmp.value])
                        }
                        else if (tmpMacro === 'Total lipid (fat)') {
                            macros.push(['Fat: ', tmp.value])
                        }
                        else if (tmpMacro === 'Carbohydrate, by difference') {
                            macros.push(['Carbs: ', tmp.value])
                        }
                        else if ((tmpMacro === 'Energy' && tmp.unitName === 'KCAL')) {
                            macros.push(['Calories: ', tmp.value])
                        }
                    })
                    if (food.hasOwnProperty('brandName')) {
                        tmpFoodNames.push(food.brandName + ' ' + foodName)
                    }
                    else {
                        tmpFoodNames.push(foodName)
                    }
                    tmpMacrosList.push(macros)
                })
                setSearchFoodNames(tmpFoodNames)
                setSearchFoodMacros(tmpMacrosList)
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
    const fatsRef = ref(FIREBASE_DB, 'users/' + FIREBASE_AUTH.currentUser.uid + '/fatCounts')
    const carbsRef = ref(FIREBASE_DB, 'users/' + FIREBASE_AUTH.currentUser.uid + '/carbCounts')
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
        onValue(fatsRef, (snapshot) => {
            data = snapshot.val()
            tmpFats = []
            if (data) {
                for (let i = 0; i < Object.keys(data).length; i++) {
                    tmpFats.push(data[Object.keys(data)[i]]['fat'])
                }
                setFatCounts(tmpFats)
            }
        })  
        onValue(carbsRef, (snapshot) => {
            data = snapshot.val()
            tmpCarbs = []
            if (data) {
                for (let i = 0; i < Object.keys(data).length; i++) {
                    tmpCarbs.push(data[Object.keys(data)[i]]['carb'])
                }
                setCarbCounts(tmpCarbs)
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
    function uploadFoodToDB(typeFood, numCalories, gramsProtein, gramsFat, gramsCarb) {
        const newRef = push(ref(FIREBASE_DB, 'users/' + FIREBASE_AUTH.currentUser.uid + '/logs/' + day + '/foods'))
        update(newRef, {
            food: typeFood,
            calories: numCalories,
            protein: gramsProtein,
            fat: gramsFat,
            carb: gramsCarb
        }).catch((error) => {
            alert(error);
        });
        const foodsRef = push(ref(FIREBASE_DB, 'users/' + FIREBASE_AUTH.currentUser.uid + '/foodNames'))
        const caloriesRef = push(ref(FIREBASE_DB, 'users/' + FIREBASE_AUTH.currentUser.uid + '/calorieCounts'))
        const proteinRef = push(ref(FIREBASE_DB, 'users/' + FIREBASE_AUTH.currentUser.uid + '/proteinCounts'))
        const fatsRef = push(ref(FIREBASE_DB, 'users/' + FIREBASE_AUTH.currentUser.uid + '/fatCounts'))
        const carbsRef = push(ref(FIREBASE_DB, 'users/' + FIREBASE_AUTH.currentUser.uid + '/carbCounts'))
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

            update(fatsRef, {
                fat: gramsFat
            }).catch((error) => {
                alert(error);
            });

            update(carbsRef, {
                carb: gramsCarb
            }).catch((error) => {
                alert(error);
            });
        }
    }

    // When a user chooses a food from the import modal, switch back to the regular logging screen with the chosen food inside of the input
    function pickFoodToLog(foodName, numCalories, numProtein, gramsFat, gramsCarb) {
        setFood(foodName)
        setCalories(numCalories)
        setProtein(numProtein)
        setFat(gramsFat)
        setCarbs(gramsCarb)
        setFoodLogModal(false)
    }

    return (
        <View style={{flex: 1}}>
            <View style={styles.container}>
                <View style={styles.buttonContainer}>
                    <>
                        <TouchableOpacity style={styles.button} onPress={() =>setLogNewMealVisible(true)}>
                            <Text style={styles.text}>
                                Input a New Meal
                        </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={() => setFoodLogModal(true)}>
                            <Text style={styles.text}>Import meal from your food logs</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={() => setShowSearchModal(true)}>
                            <Text style={styles.text}>
                                Search For A Food
                            </Text>
                        </TouchableOpacity>
                    </>
                    <Modal visible={foodLogModal} animationType='fade' presentationStyle='overFullScreen'>
                        <View style={styles.modalContainer}>
                            <ScrollView style={styles.modalFoodLog} contentContainerStyle={{justifyContent: 'flex-start', alignItems: 'flex-start'}}>
                                {foodNames.length > 0 ? foodNames.map((food, index) => {
                                    return (
                                        <TouchableOpacity key={index} onPress={() => {uploadFoodToDB(food, calorieCounts[index][1], proteinCounts[index], fatCounts[index], carbCounts[index])}}>
                                            <Text style={styles.food}>
                                                {food}
                                            </Text> 
                                            <Text style={styles.calories}>
                                                {proteinCounts[index]} g Protein
                                            </Text>
                                            <Text style={styles.calories}>
                                                {calorieCounts[index]} calories
                                            </Text>
                                            <Text style={styles.calories}>
                                                {fatCounts[index]} g fat
                                            </Text>
                                            <Text style={styles.calories}>
                                                {carbCounts[index]} g carbs
                                            </Text>
                                        </TouchableOpacity>
                                    )
                                }) :
                                    <Text style={styles.text}>You have no foods logged!</Text>
                                }
                            </ScrollView>
                            <TouchableOpacity style={styles.backButton} onPress={() => setFoodLogModal(false)}>
                                <Text style={styles.text}>Back</Text>
                            </TouchableOpacity>
                        </View>
                    </Modal>
                    <Modal visible={showSearchModal} animationType='fade' presentationStyle='overFullScreen'>
                        <View style={styles.searchModalContainer}>
                            <TextInput style={styles.searchInput} placeholder='  Search for a Food: ' placeholderTextColor={'white'} autoCapitalize='none' onChangeText={newSearch => setSearch(newSearch)} defaultValue={search}/>
                            <TouchableOpacity style={styles.searchButton} onPress={() => searchFoodDatabase(search)}>
                                <Text style={styles.text}>Search Food Database</Text>
                            </TouchableOpacity>
                            <ScrollView style={styles.searchModalFoodLog} contentContainerStyle={{justifyContent: 'flex-start', alignItems: 'flex-start',}}>
                                {(searchFoodNames.length > 0 && searchFoodNames.length === searchFoodMacros.length) ? searchFoodNames.map((food, index) => {
                                    return (
                                        <TouchableOpacity style={{paddingBottom: 5, width: '100%'}} key={index} onPress={() => {uploadFoodToDB(food, searchFoodMacros[index][3][1].toString(), searchFoodMacros[index][0][1].toString(), searchFoodMacros[index][1][1].toString(), searchFoodMacros[index][2][1].toString())}}>
                                            <Text style={styles.food}>
                                                {food}
                                            </Text> 
                                            <View key={index}>
                                                <Text style={styles.calories}>
                                                    {searchFoodMacros[index][0]}
                                                </Text>
                                                <Text style={styles.calories}>
                                                    {searchFoodMacros[index][1]}
                                                </Text>
                                                <Text style={styles.calories}>
                                                    {searchFoodMacros[index][2]}
                                                </Text>
                                                <Text style={styles.calories}>
                                                    {searchFoodMacros[index][3]}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    )
                                }) :
                                    <Text style={styles.text}>You have no foods logged!</Text>
                                }
                            </ScrollView>
                            <TouchableOpacity style={styles.backButton} onPress={() => setShowSearchModal(false)}>
                                <Text style={styles.text}>Back</Text>
                            </TouchableOpacity>
                        </View>
                    </Modal>
                    <Modal visible={logNewMealVisible} animationType='fade'>
                        <View style={styles.modalContainer}>
                            <TextInput style={styles.input} placeholder='  Food: ' placeholderTextColor={'white'} autoCapitalize='none' onChangeText={newFood => setFood(newFood)} defaultValue={food}/>
                            <TextInput style={styles.input} placeholder='  Calories: ' placeholderTextColor={'white'} autoCapitalize='none' onChangeText={newCalories => setCalories(newCalories)} defaultValue={calories}/>
                            <TextInput style={styles.input} placeholder='  Protein: ' placeholderTextColor={'white'} autoCapitalize='none' onChangeText={newProtein => setProtein(newProtein)} defaultValue={protein}/>
                            <TextInput style={styles.input} placeholder='  Fat: ' placeholderTextColor={'white'} autoCapitalize='none' onChangeText={newFat => setFat(newFat)} defaultValue={fat}/>
                            <TextInput style={styles.input} placeholder='  Carbs: ' placeholderTextColor={'white'} autoCapitalize='none' onChangeText={newCarbs => setCarbs(newCarbs)} defaultValue={carbs}/>
                            <TouchableOpacity style={styles.button} onPress={() => {uploadFoodToDB(food, calories, protein, fat, carbs); setLogNewMealVisible(false)}}>
                                <Text style={styles.text}>
                                    Log this Meal
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.button} onPress={() => setLogNewMealVisible(false)}>
                                <Text style={styles.text}>
                                    Back
                                </Text>
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
        height: '7%',
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
    modal: {
        width: '90%',
        backgroundColor: '#3A3B3C',
        borderRadius: 18,
        marginTop: '25%',
        marginBottom: '10%'
    },
    searchInput: {
        marginTop: 10,
        backgroundColor: "#3A3B3C",
        borderRadius: 18,
        width: 320,
        paddingLeft: 20,
        height: '5%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        fontSize: 16,
        fontWeight: '100'
    },
    searchButton: {
        marginTop: 10,
        backgroundColor: "#3A3B3C",
        borderRadius: 18,
        width: 320,
        height: '5%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchModalContainer: {
        paddingTop: '30%',
        flex: 1,
        backgroundColor: '#18191A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchModalFoodLog: {
        width: '90%',
        backgroundColor: '#3A3B3C',
        borderRadius: 18,
        marginTop: '10%',
        marginBottom: '10%'
    },
});