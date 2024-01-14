// React and react native imports
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'

// Third party libraries
import { ref, update, push } from "firebase/database";
import { FIREBASE_AUTH, FIREBASE_DB } from '../firebaseConfig';

// Local components and configs
import NavBar from './NavBar';

export default function FoodLog({navigation}) {
    const [food, setFood] = useState(null);
    const [calories, setCalories] = useState(null);
    const component = 'Logger';
    const [day, setDay] = useState(new Date().toDateString())

    // Change the current day to log
    useEffect(() => {
        newDay = new Date().toDateString(); 
        if (day !== newDay) {
            setDay(newDay);
        }
    }, []);

    // Upload food to the database
    function uploadFoodToDB(typeFood, numCalories) {
        const newRef = push(ref(FIREBASE_DB, 'users/' + FIREBASE_AUTH.currentUser.uid + '/logs/' + day + '/foods'));
        update(newRef, {
            food: typeFood,
            calories: numCalories
        }).catch((error) => {
            alert(error);
        });
    }

    return (
        <View style={{flex: 1}}>
            <View style={styles.container}>
                <View style={styles.buttonContainer}>
                    <TextInput style={styles.input} placeholder='  Food: ' placeholderTextColor={'white'} autoCapitalize='none' onChangeText={newFood => setFood(newFood)} defaultValue={food}/>
                    <TextInput style={styles.input} placeholder='  Calories: ' placeholderTextColor={'white'} autoCapitalize='none' onChangeText={newCalories => setCalories(newCalories)} defaultValue={calories}/>
                    <TouchableOpacity style={styles.button} onPress={() => uploadFoodToDB(food, calories)}>
                        <Text style={styles.text}>
                            Log
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