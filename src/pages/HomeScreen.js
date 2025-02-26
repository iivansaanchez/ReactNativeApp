import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, useWindowDimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useIsFocused } from '@react-navigation/native';
import { auth } from '../utils/Firebase';

const timeAgo = (date) => {
  const now = new Date();
  const diff = now - new Date(date);

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `Hace ${days} día${days > 1 ? 's' : ''}`;
  if (hours > 0) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
  if (minutes > 0) return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
  return `Hace ${seconds} segundo${seconds > 1 ? 's' : ''}`;
};

export function HomeScreen({ navigation }) {
  const { width, height } = useWindowDimensions();
  const [publicaciones, setPublicaciones] = useState([]);
  const [userLikes, setUserLikes] = useState(new Set());
  const [nick, setNick] = useState(null);
  const userId = auth.currentUser?.uid; 
  
  const isFocused = useIsFocused(); // Hook para saber si la pantalla está activa

  useEffect(() => {
    if (isFocused) {
      fetchPublicaciones(); // Recargar publicaciones cuando la pantalla esté en foco
    }
  }, [isFocused]);

  const fetchPublicaciones = async () => {
    try {
      // Obtener todas las publicaciones
      const response = await fetch('http://192.22.1.103:8080/proyecto01/publicaciones');
      let publicaciones = await response.json();
  
      let likesSet = new Set();
      const currentUserID = auth.currentUser?.uid; // ID del usuario actual
  
      // Recorrer las publicaciones para obtener los comentarios, el nick y verificar "Me gusta"
      for (let i = 0; i < publicaciones.length; i++) {
        const pubId = publicaciones[i].id;
  
        // Obtener los comentarios de la publicación
        const comentariosResponse = await fetch(`http://192.22.1.103:8080/proyecto01/comentarios/${pubId}`);
        publicaciones[i].comentarios = await comentariosResponse.json() || [];
  
        // Obtener el usuario relacionado con la publicación a través del user_id
        const userId = publicaciones[i].user_id;
        if (userId) {
          const userResponse = await fetch(`http://192.22.1.103:8080/proyecto01/users/${userId}`);
          if (userResponse.ok) {
            const userData = await userResponse.json();
            publicaciones[i].userNick = userData.nick; // Agregar el nick del usuario a la publicación
          }
        }
  
        // Verificar si el usuario actual ha dado "Me gusta" a esta publicación
        if (publicaciones[i].like.includes(currentUserID)) {
          likesSet.add(pubId);
        }
        // Asegurar que `likes` almacene la cantidad correcta de Me Gusta
        publicaciones[i].likes = publicaciones[i].like ? publicaciones[i].like.length : 0;
      }
  
      // Actualizar el estado con las publicaciones y los likes del usuario
      setPublicaciones(publicaciones);
      setUserLikes(likesSet);
  
    } catch (error) {
      console.error('Error al obtener publicaciones:', error);
    }
  };
  
  const handleLike = async (id) => {
    try {
      const pubIndex = publicaciones.findIndex((pub) => pub.id === id);
      const updatedPublicaciones = [...publicaciones];
      const pub = updatedPublicaciones[pubIndex];
  
      let updatedLikes = [...pub.like];
  
      if (userLikes.has(id)) {
        // Si ya ha dado "Me gusta", quitar el user_id
        updatedLikes = updatedLikes.filter((uid) => uid !== userId);
        setUserLikes((prev) => {
          const newLikes = new Set(prev);
          newLikes.delete(id);
          return newLikes;
        });
      } else {
        // Si no ha dado "Me gusta", añadir el user_id
        updatedLikes.push(userId);
        setUserLikes((prev) => new Set(prev).add(id));
      }
  
      // Actualizar el estado local
      pub.like = updatedLikes;
      pub.likes = updatedLikes.length; // Actualizar contador de "Me gusta"
      setPublicaciones(updatedPublicaciones);
  
      // Enviar la actualización al backend
      await fetch(`http://192.22.1.103:8080/proyecto01/publicaciones/put/${id}/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ like: updatedLikes }),
      });
    } catch (error) {
      console.error('Error al actualizar el like:', error);
    }
  };  


  const renderItem = ({ item }) => (
    <View key={item.id} style={styles.publicacion}>
      <TouchableOpacity onPress={() => navigation.navigate('PublicacionScreen', { selectedPostId: item.id, nick: item.userNick })}>
        <Image source={{ uri: item.image_url }} style={[styles.image, { height: height * 0.4 }]} />
      </TouchableOpacity>
      <View style={styles.overlay}>
        <View style={styles.userDetails}>
          <Image source={require('../../assets/perfil.png')} style={[styles.userPhoto, { width: width * 0.15, height: width * 0.15, borderRadius: width * 0.08, marginTop: 10 }]} />
          <View style={styles.userTextContainer}>
            <Text style={styles.publishedBy}>Publicado por</Text>
            <Text style={styles.userName}>{item.userNick || 'Cargando...'}</Text>
            <Text style={styles.date}>{timeAgo(item.createdAt)}</Text>
          </View>
        </View>
      </View>
      <View style={styles.likeContainer}>
        <TouchableOpacity onPress={() => handleLike(item.id)}>
          <Icon name={userLikes.has(item.id) ? 'heart' : 'heart-o'} size={width * 0.06} color={userLikes.has(item.id) ? '#9FC63B' : '#ffffff'} />
        </TouchableOpacity>
        <Text style={styles.likeCount}>{item.likes || 0} Me gusta</Text>
      </View>
      <Text style={[styles.title, { fontSize: width * 0.05 }]}>{item.titulo}</Text>
      <Text style={[styles.description, { fontSize: width * 0.04 }]}>{item.comentario}</Text>
      <Text style={[styles.commentCount, { fontSize: width * 0.035 }]}>
        {item.comentarios?.length ? `${item.comentarios.length} comentario${item.comentarios.length > 1 ? 's' : ''}` : 'Sin comentarios'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Image source={require("../../assets/cabecera.png")} style={[styles.logo, { height: height * 0.1 }]} />
      <FlatList
        data={publicaciones}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.imageContainer}
        ListEmptyComponent={<Text style={styles.noPublicaciones}>No hay publicaciones disponibles.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#23272A', paddingTop: 30 },
  imageContainer: { padding: 10, flexGrow: 1 },
  publicacion: { marginBottom: 20, backgroundColor: '#23272A', padding: 10, position: 'relative' },
  image: { width: '100%', borderRadius: 6 },
  overlay: { position: 'absolute', top: 10, left: 10, flexDirection: 'row', alignItems: 'center', zIndex: 1 },
  userDetails: { flexDirection: 'row', alignItems: 'center', marginLeft: 10 },
  userTextContainer: { marginLeft: 10 },
  publishedBy: { color: '#cccccc', fontSize: 12 },
  userName: { color: '#ffffff', fontWeight: 'bold' },
  likeContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  likeCount: { color: '#ffffff', marginLeft: 10, fontSize: 14 },
  title: { color: '#9FC63B', fontWeight: 'bold', marginBottom: 5 },
  description: { color: '#cccccc', marginBottom: 5 },
  date: { color: '#888888', fontSize: 12, fontStyle: 'italic' },
  logo: { width: '100%', marginBottom: 20 },
  noPublicaciones: { color: '#ffffff', textAlign: 'center', fontSize: 16, marginTop: 20 },
  commentCount: { color: '#888888', marginTop: 5, fontStyle: 'italic' },
});

export default HomeScreen;
