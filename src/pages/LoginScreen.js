import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  ScrollView, 
  SafeAreaView,
  useWindowDimensions
} from 'react-native';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { app } from '../utils/Firebase';

export function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  
  const { width, height } = useWindowDimensions();

  const handleLogin = () => {
    const auth = getAuth(app);
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        navigation.navigate('TabScreen');
      })
      .catch((error) => {
        setMessage('Error de inicio de sesión: ' + error.message);
      });
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView 
        contentContainerStyle={styles.container} 
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View style={styles.logoSection}>
          <Image
            source={require('../../assets/vedrunaReact.png')}
            style={[styles.logo, { width: width * 0.5, height: width * 0.5 }]}
          />
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.title}>VEDRUNA</Text>
          <Text style={styles.title}>EDUCACIÓN</Text>
        </View>

        <View style={styles.formSection}>
          <TextInput
            style={styles.input}
            placeholder="Introduzca su correo o nick..."
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Introduzca su contraseña..."
            placeholderTextColor="#666"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <Text style={styles.forgotPassword}>¿Olvidaste la contraseña?</Text>
        </View>

        <View style={styles.buttonSection}>
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Log in</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.messageSection}>
          <Text style={styles.messageText}>{message}</Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.line}></View>
          <View style={styles.createAccountContainer}>
            <Text style={styles.createAccountText}>¿No tienes cuenta?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('RegisterScreen')}>
              <Text style={styles.createAccountLink}> Crear cuenta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#1C1F26',
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  logoSection: {
    marginBottom: 20,
  },
  logo: {
    resizeMode: 'contain',
  },
  titleSection: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  formSection: {
    width: '80%',
  },
  input: {
    backgroundColor: '#2A2D35',
    color: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  forgotPassword: {
    color: '#9FC63B',
    fontSize: 14,
    textAlign: 'right',
    marginBottom: 35,
  },
  buttonSection: {
    width: '80%',
    alignItems: 'center',
    marginBottom: 100,
  },
  loginButton: {
    backgroundColor: '#9FC63B',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    width: '100%',
  },
  loginButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  messageSection: {
    width: '80%',
    marginTop: 15,
    alignItems: 'center',
  },
  messageText: {
    color: '#ffffff',
    fontSize: 14,
    textAlign: 'center',
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 20,
  },
  line: {
    width: '100%',
    height: 1,
    backgroundColor: '#2A2D35',
    marginBottom: 30,
  },
  createAccountContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createAccountText: {
    color: '#ffffff',
    fontSize: 14,
  },
  createAccountLink: {
    color: '#9FC63B',
    textDecorationLine: 'underline',
  },
});
