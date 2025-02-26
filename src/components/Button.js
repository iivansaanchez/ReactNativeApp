import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
const Button = ({ label, onPress }) => {
    return (
        <TouchableOpacity style={styles.button} onPress={onPress}>
        <Text style={styles.buttonText}>{label}</Text>
        </TouchableOpacity>
    )

}

const styles = StyleSheet.create({
    button: {
        width: '40%',
        height: 40,
        backgroundColor: '#23272A',
        borderRadius: 8,
        borderWidth : 2,
        borderColor: '#9FC63B',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
      },
      buttonText: {
        color: '#DFDFDF',
        fontSize: 12,
        fontWeight: 'bold',
      },
});

export default Button;