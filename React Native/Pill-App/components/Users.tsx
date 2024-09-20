import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Modal, useColorScheme,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ESP32_IP = 'http://192.168.0.107';

// Define a type for the User
type User = {
  name: string;
};

const Users = () => {
    const colorScheme = useColorScheme(); // Detect the color scheme (light or dark)
    const isDarkMode = colorScheme === 'dark'; // Check if dark mode is active
  
    // State variables
    const [users, setUsers] = useState<User[]>([]);
    const [name, setName] = useState('');
    const [selectedServos, setSelectedServos] = useState<boolean[]>([false, false, false, false, false]); // Track selected servos
    const [modalVisible, setModalVisible] = useState(false);
    const [editIndex, setEditIndex] = useState<number | null>(null); // Track the user being edited
    const [message, setMessage] = useState('');
  
    // Key for AsyncStorage
    const STORAGE_KEY = 'users_data';
  
    // Retrieve users from AsyncStorage when the app loads
    useEffect(() => {
      const loadUsers = async () => {
        try {
          const storedUsers = await AsyncStorage.getItem(STORAGE_KEY);
          if (storedUsers) {
            setUsers(JSON.parse(storedUsers));
          }
        } catch (error) {
          console.log('Error loading users from AsyncStorage:', error);
        }
      };
  
      loadUsers();
    }, []);
  
    // Function to save users in AsyncStorage
    const saveUsers = async (usersToSave: User[]) => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(usersToSave));
      } catch (error) {
        console.log('Error saving users to AsyncStorage:', error);
      }
    };
  
    // Function to handle adding or updating a user
    const handleUser = () => {
      let updatedUsers = [...users];
  
      if (editIndex !== null) {
        // Update existing user
        updatedUsers[editIndex] = { name };
        setEditIndex(null); // Reset edit index
      } else {
        // Add new user
        const newUser: User = { name };
        updatedUsers = [...users, newUser];
      }
  
      setUsers(updatedUsers);
      saveUsers(updatedUsers); // Save updated users to AsyncStorage
      resetForm(); // Reset form and close modal
    };
  
    // Function to move selected servos
    const moveServo = async (servoNumber: number, angle: number) => {
      try {
        const response = await axios.get(`${ESP32_IP}/servo?number=${servoNumber}&angle=${angle}`);
        setMessage(response.data.message);
        console.log(response.data.message);
      } catch (error) {
        setMessage('Error: Could not connect to ESP32');
      }
    };
  
    const resetForm = () => {
      setName('');
      setModalVisible(false);
    };
  
    // Function to dispense pills (activating servos)
    const handleDispense = () => {
      selectedServos.forEach((isSelected, index) => {
        if (isSelected) {
          moveServo(index + 1, 90);
        }
      });
    };
  
    // Function to delete a user
    const deleteUser = (index: number) => {
      const updatedUsers = users.filter((_, i) => i !== index);
      setUsers(updatedUsers);
      saveUsers(updatedUsers); // Save updated users to AsyncStorage
    };
  
    // Function to set up edit mode
    const editUser = (index: number) => {
      const userToEdit = users[index];
      setName(userToEdit.name);
      setEditIndex(index);
      setModalVisible(true);
    };
  
    const toggleServoSelection = (index: number) => {
      const updatedSelections = [...selectedServos];
      updatedSelections[index] = !updatedSelections[index];
      setSelectedServos(updatedSelections);
    };
  
    const styles = isDarkMode ? darkStyles : lightStyles; // Choose styles based on color scheme
  
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Icon name="person-add" size={30} color="white" />
        <Text style={styles.addButtonText}>Add User</Text>
      </TouchableOpacity>

      <ScrollView>
        {users.map((user, index) => (
          <View key={index} style={styles.userCard}>
            <Text style={styles.userText}>Name: {user.name}</Text>
            <TouchableOpacity
              style={styles.dispenseButton}
              onPress={handleDispense}
            >
              <Text style={styles.buttonText}>Dispense</Text>
            </TouchableOpacity>
            <View style={styles.actionButtons}>
              <TouchableOpacity onPress={() => editUser(index)} style={styles.editButton}>
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteUser(index)} style={styles.deleteButton}>
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Modal for adding or editing user */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => resetForm()}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>{editIndex !== null ? 'Edit User' : 'Add New User'}</Text>
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={name}
            onChangeText={setName}
          />

          {/* Checkbox selection for servos */}
          <Text style={styles.servosTitle}>Select Servos:</Text>
          {selectedServos.map((isSelected, index) => (
            <TouchableOpacity
              key={index}
              style={styles.checkboxContainer}
              onPress={() => toggleServoSelection(index)}
            >
              <View style={isSelected ? styles.checkboxChecked : styles.checkboxUnchecked}>
                {isSelected && <Text style={styles.checkboxText}>✔</Text>}
              </View>
              <Text style={styles.checkboxLabel}>Servo {index + 1}</Text>
            </TouchableOpacity>
          ))}

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.saveButton} onPress={handleUser}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={resetForm}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Display message after servo operation */}
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
};

// Light mode styles
const lightStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: 'white',
    fontSize: 18,
    marginLeft: 10,
  },
  userCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  userText: {
    color: 'black',
    fontSize: 40,
    marginBottom: 20,
  },
  dispenseButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  editButton: {
    backgroundColor: '#ffc107',
    padding: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 5,
  },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'white',
  },
  input: {
    backgroundColor: 'white',
    width: 300,
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
  },
  servosTitle: {
    color: 'black',
    fontSize: 18,
    marginVertical: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkboxChecked: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxUnchecked: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxText: {
    color: '#007bff',
    fontSize: 14,
  },
  checkboxLabel: {
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  message: {
    marginTop: 20,
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
  },
});

// Dark mode styles
const darkStyles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: 'black',
      },
      addButton: {
        flexDirection: 'row',
        backgroundColor: '#007bff',
        padding: 15,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
      },
      addButtonText: {
        color: 'white',
        fontSize: 18,
        marginLeft: 10,
      },
      userCard: {
        backgroundColor: '#f8f9fa',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        alignItems: 'center',
      },
      userText: {
        color: 'black',
        fontSize: 40,
        marginBottom: 20,
      },
      dispenseButton: {
        backgroundColor: '#28a745',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
      },
      actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
      },
      editButton: {
        backgroundColor: '#ffc107',
        padding: 10,
        borderRadius: 5,
        marginRight: 5,
      },
      deleteButton: {
        backgroundColor: '#dc3545',
        padding: 10,
        borderRadius: 5,
      },
      modalView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
      },
      modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        color: 'white',
      },
      input: {
        backgroundColor: 'white',
        width: 300,
        padding: 10,
        marginVertical: 10,
        borderRadius: 5,
      },
      servosTitle: {
        color: 'white',
        fontSize: 18,
        marginVertical: 10,
      },
      checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
      },
      checkboxChecked: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: '#007bff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
      },
      checkboxUnchecked: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
      },
      checkboxText: {
        color: '#007bff',
        fontSize: 14,
      },
      checkboxLabel: {
        color: 'white',
        fontSize: 16,
      },
      modalButtons: {
        flexDirection: 'row',
        marginTop: 20,
      },
      saveButton: {
        backgroundColor: '#28a745',
        padding: 10,
        borderRadius: 5,
        marginRight: 10,
      },
      cancelButton: {
        backgroundColor: '#dc3545',
        padding: 10,
        borderRadius: 5,
      },
      buttonText: {
        color: 'white',
        fontSize: 16,
      },
      message: {
        marginTop: 20,
        fontSize: 16,
        color: 'white',
        textAlign: 'center',
      },
});

export default Users;
