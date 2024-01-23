// React and react native imports
import { useEffect, useState } from 'react';
import { StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native'

// Third party libraries
import { FIREBASE_AUTH } from '../firebaseConfig';
import { signOut } from 'firebase/auth';
import * as SMS from 'expo-sms';

// Local components and configs
import NavBar from './NavBar';

function Settings({navigation}) {
    const component = 'Settings'

    function handleLogout() {
        signOut(FIREBASE_AUTH)
        navigation.reset({index: 0, routes: [{name: 'Home'}]})
    }

    async function handleReferral() {
        const { result } = SMS.sendSMSAsync(
            [],
            'Reach your fitness goals with me on FoodFinder!\nhttps://github.com/ddeflores/Food-Finder'
        );
    }

    return (
        <View style={{flex: 1}}>
            <View style={styles.container}>
                <Text style={styles.text}>Account Email:</Text>
                <Text style={styles.infoText}>{FIREBASE_AUTH.currentUser.email}</Text>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.button} onPress={() => handleLogout()}>
                        <Text style={styles.text}>
                            Logout
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={() => handleReferral()}>
                        <Text style={styles.text}>
                            Tell a Friend
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
    infoText: {
        color: "white",
        fontSize: 'auto',
        fontSize: 18,
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
    information: {
        flexDirection: 'row'
    }
});


export default Settings