import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ScrollView, SafeAreaView, Platform, useColorScheme } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';

// ESP32 IP Address (Replace with the actual ESP32 IP)
const ESP32_IP = 'http://172.20.10.4'; // Replace with your ESP32's IP address

interface PillBox {
  id: number;
  name: string;
  count: number;
}

const PillDispenser = () => {
  const [message, setMessage] = useState('');
  const [pillBoxes, setPillBoxes] = useState<PillBox[]>([
    { id: 1, name: 'Pill 1', count: 10 },
    { id: 2, name: 'Pill 2', count: 15 },
    { id: 3, name: 'Pill 3', count: 20 },
    { id: 4, name: 'Pill 4', count: 25 },
    { id: 5, name: 'Pill 5', count: 30 },
  ]);
  const [editingBox, setEditingBox] = useState<PillBox | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newName, setNewName] = useState('');

  const colorScheme = useColorScheme(); // Detect system theme (light or dark)

  const moveServo = async (servoNumber: number, angle: number) => {
    try {
      const response = await fetch(`${ESP32_IP}/servo?number=${servoNumber}&angle=${angle}`);
      const data = await response.text();
      setMessage(data);
      // Decrease pill count
      setPillBoxes(pillBoxes.map(box => 
        box.id === servoNumber ? { ...box, count: Math.max(0, box.count - 1) } : box
      ));
    } catch (error) {
      setMessage('Error: Could not connect to ESP32');
    }
  };

  const handleEdit = (box: PillBox) => {
    setEditingBox(box);
    setNewName(box.name);
    setIsModalVisible(true);
  };

  const handleNameChange = () => {
    if (editingBox) {
      setPillBoxes(pillBoxes.map(box => 
        box.id === editingBox.id ? { ...box, name: newName } : box
      ));
    }
    setIsModalVisible(false);
  };

  const isDarkMode = colorScheme === 'dark';

  // Apply styles based on the current theme
  const currentStyles = isDarkMode ? stylesDark : stylesLight;

  return (
  <SafeAreaView style={currentStyles.safeArea}>
    <BlurView intensity={80} style={currentStyles.headerBlur}>
      <View style={currentStyles.header}>
        <Text style={currentStyles.title}>Pill Dispenser</Text>
        <Text style={currentStyles.message}>{message}</Text>
      </View>
    </BlurView>
    <ScrollView style={currentStyles.scrollView} contentContainerStyle={currentStyles.scrollViewContent}>
      {pillBoxes.map((box) => (
        <BlurView 
          key={box.id} 
          intensity={40} 
          style={[
            currentStyles.pillBoxBlur, 
            box.id === 1 ? { marginTop: 20 } : null // Add marginTop conditionally for id === 1
          ]}
        >
          <View style={currentStyles.pillBox}>
            <View style={currentStyles.nameContainer}>
              <Text style={currentStyles.pillName}>{box.name}</Text>
              <TouchableOpacity onPress={() => handleEdit(box)}>
                <Icon name="edit" size={24} color={isDarkMode ? "#FFF" : "#000"} /> 
                {/* Adjust icon color for dark and light mode */}
              </TouchableOpacity>
            </View>
            <Text style={currentStyles.pillCount}>Count: {box.count}</Text>
            <TouchableOpacity 
              style={currentStyles.dispenseButton} 
              onPress={() => moveServo(box.id, 90)}
            >
              <Text style={currentStyles.dispenseButtonText}>Dispense</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      ))}
    </ScrollView>
    <Modal
      visible={isModalVisible}
      transparent={true}
      animationType="fade"
    >
      <BlurView intensity={20} style={StyleSheet.absoluteFill}>
        <View style={currentStyles.modalContainer}>
          <View style={currentStyles.modalView}>
            <TextInput
              style={currentStyles.modalInput}
              value={newName}
              onChangeText={setNewName}
              placeholder="Enter new name"
              placeholderTextColor={isDarkMode ? "#FFF" : "#000"} // Adjust placeholder text color
            />
            <TouchableOpacity style={currentStyles.modalButton} onPress={handleNameChange}>
              <Text style={currentStyles.modalButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={currentStyles.modalButton} onPress={() => setIsModalVisible(false)}>
              <Text style={currentStyles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </Modal>
  </SafeAreaView>
);

};

// Light Mode Styles
const stylesLight = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingTop: 100,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    padding: 20,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 20,
    textAlign: 'center',
    color: '#000',
  },
  message: {
    fontSize: 16,
    color: 'green',
    textAlign: 'center',
  },
  pillBoxBlur: {
    marginBottom: 15,
    borderRadius: 10,
    overflow: 'hidden',
  },
  pillBox: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    padding: 20,
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  pillName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  pillCount: {
    fontSize: 16,
    marginBottom: 10,
    color: '#000',
  },
  dispenseButton: {
    backgroundColor: '#007AFF',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
  },
  dispenseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
  },
  modalInput: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: 200,
  },
  modalButton: {
    backgroundColor: "#2196F3",
    borderRadius: 20,
    padding: 10,
    marginTop: 10,
    width: 100,
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});

// Dark Mode Styles
const stylesDark = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212',
  },
  headerBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingTop: 100,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    padding: 15,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 25,
    textAlign: 'center',
    color: '#FFF',
  },
  message: {
    fontSize: 16,
    color: 'green',
    textAlign: 'center',
  },
  pillBoxBlur: {
    marginBottom: 15,
    borderRadius: 10,
    overflow: 'hidden',
  },
  pillBox: {
    marginStart: 10,
    backgroundColor: 'transparent',
    padding: 20,
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  pillName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  pillCount: {
    fontSize: 16,
    marginBottom: 10,
    color: '#FFF',
  },
  dispenseButton: {
    backgroundColor: '#007AFF',
    borderRadius: 5,
    padding: 10,
    alignItems: 'center',
  },
  dispenseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    backgroundColor: "#121212",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
  },
  modalInput: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: 200,
    borderColor: '#FFF',
    color: '#FFF',
  },
  modalButton: {
    backgroundColor: "#2196F3",
    borderRadius: 20,
    padding: 10,
    marginTop: 10,
    width: 100,
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default PillDispenser;
