import React, { useState, useEffect } from "react";
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, TextInput, Image, Alert, FlatList } from "react-native";
import config from "../../config";

export function SettingsScreen() {
  const [incidencias, setIncidencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [numeroEquipo, setNumeroEquipo] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [estado, setEstado] = useState("");
  const [showIncidentForm, setShowIncidentForm] = useState(false);

  useEffect(() => {
    fetchIncidencias();
  }, []);

  const fetchIncidencias = async () => {
    try {
      const response = await fetch(`${config.API_URL}/incidencias`);
      if (!response.ok) {
        throw new Error(`Error al obtener las incidencias: ${response.status}`);
      }
      const data = await response.json();
      setIncidencias(data);
    } catch (error) {
      console.error("Error al obtener incidencias:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!numeroEquipo || !titulo || !descripcion) {
      Alert.alert("Error", "Todos los campos son obligatorios");
      return;
    }

    const incidencia = {
      numeroEquipo,
      titulo,
      descripcion,
      estado: "Pendiente",
      fecha: new Date().toISOString(),
    };

    try {
      const response = await fetch(`${config.API_URL}/incidencias/post`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(incidencia),
      });

      if (!response.ok) {
        throw new Error(`Error al procesar la incidencia: ${response.status}`);
      }

      Alert.alert("Incidencia enviada", "Se ha guardado correctamente.", [
        {
          text: "Aceptar",
          onPress: () => {
            setNumeroEquipo("");
            setTitulo("");
            setDescripcion("");
            setEstado("");
            setShowIncidentForm(false);
            fetchIncidencias(); // Recargar incidencias después de enviar una nueva
          },
        },
      ]);
    } catch (error) {
      console.error("Error al procesar la incidencia:", error);
      Alert.alert("Error", error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>INCIDENCIAS</Text>

      <View style={styles.incidentContainer}>
        {loading ? (
          <Text style={styles.loadingText}>Cargando incidencias...</Text>
        ) : incidencias.length === 0 ? (
          <Text style={styles.noIncidentsText}>No hay incidencias registradas.</Text>
        ) : (
          <FlatList
            data={incidencias}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.incidentItem}>
                <Text style={styles.incidentTitle}>{item.titulo}</Text>
                <Text
                  style={[
                    styles.incidentStatus,
                    item.estado === "Solucionado"
                      ? styles.solucionado
                      : item.estado === "En trámite"
                      ? styles.tramite
                      : styles.denegado,
                  ]}
                >
                  {item.estado}
                </Text>
              </View>
            )}
          />
        )}
      </View>

      <TouchableOpacity style={styles.addButton} onPress={() => setShowIncidentForm(true)}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      {showIncidentForm && (
        <View style={styles.incidentFormContainer}>
          <Text style={styles.incidentTitleForm}>Nueva Incidencia</Text>

          <View style={styles.imageContainer}>
            <Image source={require("../../assets/imageAdd.png")} style={styles.logo} resizeMode="contain" />
          </View>

          <Text style={styles.label}>Nº del equipo:</Text>
          <TextInput style={styles.input} maxLength={40} placeholderTextColor="#888" value={numeroEquipo} onChangeText={setNumeroEquipo} />

          <Text style={styles.label}>Título:</Text>
          <TextInput style={styles.input} placeholder="Máx. 40 Caracteres" maxLength={40} placeholderTextColor="#888" value={titulo} onChangeText={setTitulo} />

          <Text style={styles.label}>Descripción del problema:</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Máx. 250 Caracteres"
            maxLength={250}
            multiline
            placeholderTextColor="#888"
            value={descripcion}
            onChangeText={setDescripcion}
          />

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>ENVIAR</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
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
    flex: 1,
  },
  loadingText: {
    color: "#FFF",
    textAlign: "center",
  },
  noIncidentsText: {
    color: "#FFF",
    textAlign: "center",
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
    height: 120,
    textAlignVertical: "top",
  },
  submitButton: {
    marginTop: 30,
    borderWidth: 2,
    borderColor: "#9FC63B",
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#DFDFDF",
    fontWeight: "bold",
    fontSize: 22,
  },
});
