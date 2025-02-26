import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  useWindowDimensions
} from 'react-native';

import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../utils/Firebase';

export function RegisterScreen({navigation}) {
  const { width } = useWindowDimensions();

  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nick: '',
    name: '',
    lastName1: '',
    lastName2: ''
  });

  const handleInputChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const generateMongoId = () => {
    return Math.floor(Math.random() * 10 ** 24).toString(16); // Genera un _id similar a MongoDB
  };

  const handleSubmit = async () => {
    const { email, password, confirmPassword, nick, name, lastName1, lastName2 } = form;

    if (!email || !password || !confirmPassword || !nick || !name || !lastName1 || !lastName2) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    try {
      // Crear usuario en Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid; // UID de Firebase

      // Construcción del objeto para MongoDB
      const data = {
        nick: nick,
        user_id: userId,
        nombre: name,
        apellidos: `${lastName1} ${lastName2}`, // Se concatenan los apellidos
        profile_picture: 'https://res.cloudinary.com/dr1zlgrdy/image/upload/v1737805087/ImagenDefectoPerfil_jqk3l7.webp'
      };

      // Enviar datos a la API
      const apiUrl = 'http://192.22.1.103:8080/proyecto01/users';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Error al registrar en la API');
      }

      Alert.alert('Registro exitoso', 'Usuario creado correctamente');
      navigation.navigate('LoginScreen');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={[styles.imageContainer, { width: width * 0.9 }]}>
        <Image
          source={require('../../assets/formulario.png')}
          style={styles.image}
        />
      </View>

      <Text style={styles.title}>Completar los siguientes campos:</Text>

      {['email', 'password', 'confirmPassword', 'nick', 'name', 'lastName1', 'lastName2'].map((field, index) => (
        <TextInput
          key={index}
          style={styles.input}
          placeholder={
            field === 'email' ? 'Introduzca su correo' :
            field === 'password' ? 'Introduzca contraseña' :
            field === 'confirmPassword' ? 'Repita contraseña' :
            field === 'nick' ? 'Introduzca su nick' :
            field === 'name' ? 'Introduzca su nombre' :
            field === 'lastName1' ? 'Introduzca su primer apellido' : 'Introduzca su segundo apellido'
          }
          placeholderTextColor="#aaa"
          value={form[field]}
          onChangeText={(value) => handleInputChange(field, value)}
          secureTextEntry={field.includes('password')}
          keyboardType={field === 'email' ? 'email-address' : 'default'}
        />
      ))}

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>FINALIZAR</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#2A2D35',
    alignItems: 'center'
  },
  image: {
    width: '100%',
    height: 350,
    resizeMode: 'contain'
  },
  title: {
    color: '#9FC63B',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20
  },
  input: {
    width: '80%',
    borderBottomWidth: 1,
    borderBottomColor: '#fff',
    color: '#fff',
    padding: 8,
    marginVertical: 5,
    fontSize: 16,
  },
  submitButton: {
    width: '50%',
    backgroundColor: '#2A2D35',
    borderWidth: 2,
    borderColor: '#9FC63B',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 50,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
