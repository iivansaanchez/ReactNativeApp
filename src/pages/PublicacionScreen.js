import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, FlatList, ActivityIndicator, TouchableOpacity, Modal, TextInput,TouchableWithoutFeedback, Keyboard, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native'; 
import { auth } from '../utils/Firebase';
import { ScrollView } from 'react-native-gesture-handler';
import config from '../../config';

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

export function PublicacionScreen({ route }) {
  const [publicaciones, setPublicaciones] = useState([]);
  const [comentarios, setComentarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLikes, setUserLikes] = useState(new Set());
  const [modalVisible, setModalVisible] = useState(false);
  const [newComment, setNewComment] = useState('');
  const navigation = useNavigation(); 
  const [userName, setUserName] = useState('');

  //SelectedPostId es el id de la publicacion
  //Nick es el nick del usuario que ha añadido la publicacion
  //UserID es el id del usuario logueado en la app
  const userId = auth.currentUser.uid;
  const { selectedPostId, nick } = route.params;


  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUserName(currentUser.displayName || currentUser.email || 'Usuario');
    }
    fetchPublicaciones();
  }, []);  

  const fetchPublicaciones = async () => {
    try {
      const response = await fetch(`${config.API_URL}/publicaciones`);
      let publicaciones = await response.json();
      let likesSet = new Set();
      const currentUserID = auth.currentUser?.uid;
  
      for (let i = 0; i < publicaciones.length; i++) {
        const pubId = publicaciones[i].id;
        const comentariosResponse = await fetch(`${config.API_URL}/comentarios/${pubId}`);
        const comentarios = await comentariosResponse.json() || [];
  
        // Obtener los detalles de usuario para cada comentario
        for (let j = 0; j < comentarios.length; j++) {
          const userId = comentarios[j].user_id;
          if (userId) {
            const userResponse = await fetch(`${config.API_URL}/users/${userId}`);
            if (userResponse.ok) {
              const userData = await userResponse.json();
              comentarios[j].userNick = userData.nick;
              comentarios[j].userPhoto = userData.photo_url; // Asumiendo que la API devuelve la URL de la foto de perfil
            }
          }
        }
  
        publicaciones[i].comentarios = comentarios;
        
        const userId = publicaciones[i].user_id;
        if (userId) {
          const userResponse = await fetch(`${config.API_URL}/users/${userId}`);
          if (userResponse.ok) {
            const userData = await userResponse.json();
            publicaciones[i].userNick = userData.nick;
            publicaciones[i].userPhoto = userData.profile_picture;
          }
        }
  
        if (publicaciones[i].like.includes(currentUserID)) {
          likesSet.add(pubId);
        }
        publicaciones[i].likes = publicaciones[i].like ? publicaciones[i].like.length : 0;
      }
  
      setPublicaciones(publicaciones);
      setUserLikes(likesSet);
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener publicaciones:', error);
      setLoading(false);
    }
  };  

  const handleLike = async (id) => {
    try {
      const pubIndex = publicaciones.findIndex((pub) => pub.id === id);
      //... hace copia antes de modificar
      const updatedPublicaciones = [...publicaciones];
      const pub = updatedPublicaciones[pubIndex];
      let updatedLikes = [...pub.like];

      if (userLikes.has(id)) {
        updatedLikes = updatedLikes.filter((uid) => uid !== userId);
        setUserLikes((prev) => {
          const newLikes = new Set(prev);
          newLikes.delete(id);
          return newLikes;
        });
      } else {
        updatedLikes.push(userId);
        setUserLikes((prev) => new Set(prev).add(id));
      }

      pub.like = updatedLikes;
      pub.likes = updatedLikes.length;
      setPublicaciones(updatedPublicaciones);

      await fetch(`${config.API_URL}/publicaciones/put/${id}/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ like: updatedLikes }),
      });
    } catch (error) {
      console.error('Error al actualizar el like:', error);
    }
  };
  
  const handlePublishComment = async () => {
    if (newComment.trim() === '') return;

    try {
      const response = await fetch(`${config.API_URL}/comentarios/put`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          idPublicacion: selectedPostId,
          comentario: newComment,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al publicar el comentario');
      }

      setComentarios((prev) => [
        ...prev,
        { id: Date.now(), user: 'Tú', texto: newComment },
      ]);
      setNewComment('');
      setModalVisible(false);
      fetchPublicaciones();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const selectedPost = publicaciones.find((pub) => pub.id === selectedPostId);

  const flatListRef = React.useRef();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#23272A' }}>
      <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>  
            <Icon name="arrow-left" size={20} color="#9FC63B" />
          </TouchableOpacity>
          <View style={styles.userInfo}>
            <View style={styles.userDetails}>
              <Image
                source={require('../../assets/perfil.png')}
                style={styles.userPhoto}
              />
              <View>
                <Text style={styles.publishedBy}>Publicado por</Text>
                <Text style={styles.userName}>{nick}</Text>
              </View>
            </View>
          </View>
        </View>
  
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ffffff" />
          </View>
        ) : selectedPost ? (
          <View style={styles.publicacion}>
            <Image
              source={{ uri: selectedPost.image_url }}
              style={styles.image}
              onError={(e) =>
                console.log('Error al cargar la imagen:', e.nativeEvent.error)
              }
            />
            <View style={styles.likeContainer}>
              <TouchableOpacity onPress={() => handleLike(selectedPost.id)}>
                <Icon
                  name={userLikes.has(selectedPost.id) ? 'heart' : 'heart-o'}
                  size={24}
                  color={userLikes.has(selectedPost.id) ? '#9FC63B' : '#ffffff'}
                />
              </TouchableOpacity>
              <Text style={styles.likeCount}>{selectedPost.likes || 0} Me gusta</Text>
            </View>
            <Text style={styles.title}>{selectedPost.titulo}</Text>
            <Text style={styles.description}>{selectedPost.comentario}</Text>
            <Text style={styles.date}>{timeAgo(selectedPost.createdAt)}</Text>
  
            <Text style={styles.commentsTitle}>COMENTARIOS</Text>
  
            <FlatList
              ref={flatListRef}  // Asigna la referencia
              data={selectedPost.comentarios}
              renderItem={({ item }) => (
                <View style={styles.commentContainer}>
                  <View style={styles.commentHeader}>
                    <Image 
                      source={{ uri: selectedPost.userPhoto || '../../assets/perfil.png' }} 
                      style={styles.commentUserPhoto} 
                    />
                    <View>
                      <Text style={styles.commentUser}>{item.userNick || 'Usuario Anónimo'}</Text>
                      <Text style={styles.commentText}>{item.comentario}</Text>
                    </View>
                  </View>
                </View>
              )}
              keyExtractor={(item) => item.id.toString()}
              onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: true })}  // Desplaza hacia abajo
            />
          </View>
        ) : (
          <Text style={styles.noPublicaciones}>Publicación no encontrada.</Text>
        )}
  
      {/* Botón flotante de añadir comentario */}
      <TouchableOpacity 
        style={styles.floatingButton} 
        onPress={() => setModalVisible(true)}
      >
        <Image source={require("../../assets/botonComentarios.png")} style={styles.floatingImage} />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Comentario:</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Máx 500 caracteres"
                placeholderTextColor="#888"
                multiline
                maxLength={500}
                value={newComment}
                onChangeText={setNewComment}
                onSubmitEditing={() => Keyboard.dismiss()}
              />
              <View style={styles.modalButtonsContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>CANCELAR</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.publishButton} onPress={handlePublishComment}>
                <Text style={styles.publishButtonText}>PUBLICAR</Text>
              </TouchableOpacity>
            </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#23272A',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  likeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  likeCount: {
    color: '#ffffff',
    marginLeft: 10,
    fontSize: 14,
  },
  date: {
    color: '#888888',
    fontSize: 12,
    fontStyle: 'italic',
  },
  commentsTitle: {
    color: '#9FC63B',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
  userInfo: { marginLeft: 10, flex: 1 },
  userDetails: { flexDirection: 'row', alignItems: 'center' },
  publishedBy: { color: '#cccccc', fontSize: 12 },
  userName: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  userPhoto: { width: 60, height: 60, borderRadius: 30, marginRight: 10, borderWidth: 2, borderColor: '#9FC63B' },
  publicacion: { padding: 10 },
  image: { width: '100%', height: 350, marginBottom: 10 },
  title: { color: '#9FC63B', fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  description: { color: '#cccccc', fontSize: 14, marginBottom: 5 },
  commentContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2f353a', padding: 10, borderRadius: 5, marginTop: 10 },
  commentUserImage: { width: 60, height:60, borderRadius: 40, marginRight: 10 },
  commentUser: { color: '#9FC63B', fontWeight: 'bold', fontSize: 17 },
  commentText: { color: '#ffffff', fontSize: 14, marginTop: 5 },
  noPublicaciones: { color: '#ffffff', textAlign: 'center', fontSize: 16, marginTop: 20 },
  floatingButton: { position: 'absolute', bottom: 20, right: 20, backgroundColor: '#9FC63B', borderRadius: 50, padding: 10 },
  floatingImage: { width: 50, height: 50 },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)'
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#111',
    padding: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#9FC63B',
  },
  modalTitle: {
    color: '#9FC63B',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10
  },
  textInput: { height: 200, backgroundColor: '#333', color: '#fff', padding: 10, borderRadius: 5 },
  modalButtonsContainer: {
    flexDirection: 'row',  // Esto alinea los botones de manera horizontal
    justifyContent: 'space-between',  // Alinea los botones a los extremos
    width: '100%',  // Asegura que los botones ocupen todo el ancho disponible
    marginTop: 15,  // Añade algo de espacio entre el campo de texto y los botones
  },
  cancelButton: { 
    padding: 10, 
    borderRadius: 5, 
    marginRight: 5, 
    alignItems: 'left', 
    color: '#fff',
    width: '48%',  
  },
  cancelButtonText: { 
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',    
  },
  publishButton: { 
    padding: 10, 
    borderWidth: 2,
    borderColor: '#9FC63B',
    borderRadius: 5,
    marginLeft: 5, 
    alignItems: 'right', 
    width: '48%',
  },
  publishButtonText: { 
    color: '#fff', // Asegura que el texto sea blanco
    fontWeight: 'bold',
    textAlign: 'center',
  }
});