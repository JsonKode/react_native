// App.js
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ImageBackground, 
  FlatList 
} from 'react-native';
import { Audio } from 'expo-av';
import { MaterialIcons } from '@expo/vector-icons';

const songs = [
  {
    id: 1,
    title: 'y2mate.com - Grease',
    artist: 'Artist A',
    file: require('./assets/y2mate.com - Grease  Greased Lightning 1080p Lyrics.mp3'),
  },
  {
    id: 2,
    title: 'Lisa',
    artist: 'Artist B',
    file: require('./assets/y2mate.com - LISA  MONEY EXCLUSIVE PERFORMANCE VIDEO.mp3'),
  }
  // Add more songs as needed
];

export default function App() {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(null);

  useEffect(() => {
    if (currentSongIndex !== null) {
      loadSound(currentSongIndex);
    }

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [currentSongIndex]);

  const loadSound = async (index) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        songs[index].file,
        { shouldPlay: false }
      );
      setSound(newSound);

      newSound.setOnPlaybackStatusUpdate(async status => {
        if (status.didJustFinish && !status.isLooping) {
          handleNext(); // Trigger next song
        }
      });

      if (isPlaying) {
        await newSound.playAsync();
      }
    } catch (error) {
      console.error('Error loading sound:', error);
    }
  };

  const handlePlayPause = async () => {
    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
    }
  };

  const handleNext = async () => {
    if (currentSongIndex !== null) {
      const nextIndex = (currentSongIndex + 1) % songs.length;
      setCurrentSongIndex(nextIndex);
      setIsPlaying(false);
      await loadSound(nextIndex); // Load the next song
      setIsPlaying(true); // Automatically play the next song
      await sound.playAsync();
    }
  };

  const handlePrevious = async () => {
    if (currentSongIndex !== null) {
      const prevIndex = (currentSongIndex - 1 + songs.length) % songs.length;
      setCurrentSongIndex(prevIndex);
      setIsPlaying(false);
      await loadSound(prevIndex); // Load the previous song
      setIsPlaying(true); // Automatically play the previous song
      await sound.playAsync();
    }
  };

  // Automatically play the selected song from the playlist
  const selectSong = async (index) => {
    setCurrentSongIndex(index);
    setIsPlaying(true); // Set playing to true to automatically play the selected song
    await loadSound(index); // Load and play the selected song
    await sound.playAsync(); // Start playing the selected song
  };

  const renderItem = ({ item, index }) => (
    <TouchableOpacity onPress={() => selectSong(index)} style={styles.songItem}>
      <Text style={styles.songTitle}>{item.title}</Text>
      <Text style={styles.songArtist}>{item.artist}</Text>
    </TouchableOpacity>
  );

  return (
    <ImageBackground 
      source={require('./assets/pexels-chrisfotope-28226737.jpg')} 
      style={styles.background}
    >
      <View style={styles.container}>
        {currentSongIndex !== null ? (
          <>
            <Text style={styles.title}>{songs[currentSongIndex].title}</Text>
            <Text style={styles.artist}>{songs[currentSongIndex].artist}</Text>

            <View style={styles.controls}>
              <TouchableOpacity onPress={handlePrevious}>
                <MaterialIcons name="skip-previous" size={48} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity onPress={handlePlayPause}>
                <MaterialIcons 
                  name={isPlaying ? "pause-circle-filled" : "play-circle-filled"} 
                  size={64} 
                  color="#fff" 
                />
              </TouchableOpacity>

              <TouchableOpacity onPress={handleNext}>
                <MaterialIcons name="skip-next" size={48} color="#fff" />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <Text style={styles.prompt}>Select a song to play</Text>
        )}

        <FlatList
          data={songs}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.playlist}
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    width: '90%',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 20,
    borderRadius: 20,
    marginTop: 40,
  },
  title: {
    fontSize: 28,
    color: '#fff',
    marginBottom: 5,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  artist: {
    fontSize: 20,
    color: '#ddd',
    marginBottom: 20,
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 30,
  },
  prompt: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
  },
  playlist: {
    marginTop: 10,
  },
  songItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#555',
  },
  songTitle: {
    fontSize: 18,
    color: '#fff',
  },
  songArtist: {
    fontSize: 14,
    color: '#aaa',
  },
});
