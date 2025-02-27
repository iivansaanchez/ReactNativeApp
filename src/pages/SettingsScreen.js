import React, { useState } from "react";
import {View,Text,StyleSheet,TouchableOpacity,TextInput,Image,Alert} from "react-native";

export function SettingsScreen() {
  const [numeroEquipo, setnumeroEquipo] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [showIncidentForm, setShowIncidentForm] = useState(false);

  const handleSubmit = async () => {
    if (!numeroEquipo || !titulo || !descripcion) {
      Alert.alert("Error", "Todos los campos son obligatorios");
      return;
    }

    const incidencia = {
      numeroEquipo,
      titulo,
      descripcion,
      fecha: new Date().toISOString(),
      estado: "Pendiente",
    };

    try {
      const response = await fetch(
        `${config.API_URL}/incidencias/post`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(incidencia),
        }
      );

      if (!response.ok) {
        throw new Error(`Error al procesar la incidencia: ${response.status}`);
      }

      Alert.alert(
        "Incidencia enviada",
        "La incidencia se ha guardado correctamente en la base de datos y enviado el correo",
        [
          {
            text: "Aceptar",
            onPress: () => {
              setnumeroEquipo("");
              setTitulo("");
              setDescripcion("");
              setShowIncidentForm(false);
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error al procesar la incidencia:", error);
      Alert.alert("Error", error.message);
    }
  };

  const handleAddIncident = () => {
    setShowIncidentForm(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>INCIDENCIAS</Text>

      <View style={styles.incidentContainer}>
        <View style={styles.incidentItem}>
          <Text style={styles.incidentTitle}>TÍTULO DE INCIDENCIA</Text>
          <Text style={[styles.incidentStatus, styles.solucionado]}>
            SOLUCIONADO
          </Text>
        </View>
        <View style={styles.incidentItem}>
          <Text style={styles.incidentTitle}>TÍTULO DE INCIDENCIA</Text>
          <Text style={[styles.incidentStatus, styles.tramite]}>EN TRÁMITE</Text>
        </View>
        <View style={styles.incidentItem}>
          <Text style={styles.incidentTitle}>TÍTULO DE INCIDENCIA</Text>
          <Text style={[styles.incidentStatus, styles.denegado]}>DENEGADA</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.addButton} onPress={handleAddIncident}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      {showIncidentForm && (
        <View style={styles.incidentFormContainer}>
          <Text style={styles.incidentTitleForm}>INCIDENCIA</Text>

          <View style={styles.imageContainer}>
            <Image
              source={require("../../assets/imageAdd.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.label}>Nº del equipo:</Text>
          <TextInput
            style={styles.input}
            maxLength={40}
            placeholderTextColor="#888"
            value={numeroEquipo}
            onChangeText={setnumeroEquipo}
          />

          <Text style={styles.label}>Título:</Text>
          <TextInput
            style={styles.input}
            placeholder="Máx. 40 Caracteres"
            maxLength={40}
            placeholderTextColor="#888"
            value={titulo}
            onChangeText={setTitulo}
          />

          <Text style={styles.label}>Descripción del problema:</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Máx. 250 Caracteres"
            maxLength={250}
            multiline
            placeholderTextColor="#888"
            value={descripcion}
            onChangeText={setDescripcion}
            blurOnSubmit={false}
            returnKeyType="default"
          />

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>ENVIAR</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#23272A",
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 20,
    color: "#9FC63B",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
  },
  incidentContainer: {
    marginTop: 10,
  },
  incidentItem: {
    backgroundColor: "#323639",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: "#555",
  },
  incidentTitle: {
    color: "#9FC63B",
    fontSize: 16,
    fontWeight: "bold",
  },
  incidentStatus: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 5,
  },
  solucionado: {
    color: "#9FC63B",
  },
  tramite: {
    color: "#F19100",
  },
  denegado: {
    color: "#F10000",
  },
  addButton: {
    backgroundColor: "#9FC63B",
    width: 55,
    height: 55,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 25,
    right: 25,
    elevation: 5,
  },
  addButtonText: {
    color: "#23272A",
    fontSize: 30,
    fontWeight: "bold",
  },
  incidentFormContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#23272A",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  incidentTitleForm: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#9FC63B",
    marginBottom: 10,
  },
  imageContainer: {
    borderWidth: 2,
    borderColor: "#9FC63B",
    borderRadius: 12,
    padding: 10,
    marginBottom: 15,
  },
  logo: {
    width: 100,
    height: 100,
  },
  label: {
    fontSize: 16,
    color: "#9FC63B",
    marginBottom: 5,
  },
  input: {
    width: 320,
    height: 50,
    backgroundColor: "#323639",
    color: "#fff",
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#555",
  },
  textArea: {
    height: 220,
    textAlignVertical: "top",
  },
  submitButton: {
    marginTop: 30,
    backgroundColor: "transparent",
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#9FC63B",
  },
  submitButtonText: {
    color: "#DFDFDF",
    fontWeight: "bold",
    fontSize: 22,
  },
});
