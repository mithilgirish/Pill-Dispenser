import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, SafeAreaView } from 'react-native';

const PillDispenser = () => {
  const [ws, setWs] = useState<WebSocket | null>(null);  // WebSocket or null type
  const [rfidTag, setRfidTag] = useState('');
  const [pillData, setPillData] = useState([
    { name: '', count: 0 },
    { name: '', count: 0 },
    { name: '', count: 0 },
    { name: '', count: 0 },
    { name: '', count: 0 },
  ]);

  useEffect(() => {
    const socket = new WebSocket('ws://YOUR_ESP32_IP:8080');
    
    socket.onopen = () => {
      console.log('WebSocket connected');
      setWs(socket);  // Now TypeScript will not complain
    };
    
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'rfid') {
        setRfidTag(data.tag);
      } else if (data.type === 'pillData') {
        setPillData(data.pills);
      }
    };
    
    return () => {
      socket.close();
    };
  }, []);

  const handleServoToggle = (index: number, open: boolean) => {
    if (ws) {
      ws.send(JSON.stringify({
        type: 'servo',
        servo: index + 1,
        open: open
      }));
    }
  };

  const handlePillUpdate = (index: number) => {
    if (ws) {
      ws.send(JSON.stringify({
        type: 'updatePill',
        servo: index + 1,
        name: pillData[index].name,
        count: pillData[index].count
      }));
    }
  };

  const handleNameChange = (index: number, name: string) => {
    const newPillData = [...pillData];
    newPillData[index].name = name;
    setPillData(newPillData);
  };

  const handleCountChange = (index: number, count: string) => {
    const newPillData = [...pillData];
    newPillData[index].count = parseInt(count) || 0;
    setPillData(newPillData);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Pill Dispenser Control</Text>
        
        <View style={styles.rfidContainer}>
          <Text style={styles.rfidTitle}>RFID Tag</Text>
          <Text style={styles.rfidTag}>{rfidTag || 'No tag detected'}</Text>
        </View>
        
        {pillData.map((pill, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.cardTitle}>Dispenser {index + 1}</Text>
            <TextInput
              style={styles.input}
              placeholder="Pill Name"
              value={pill.name}
              onChangeText={(text) => handleNameChange(index, text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Pill Count"
              value={pill.count.toString()}
              onChangeText={(text) => handleCountChange(index, text)}
              keyboardType="numeric"
            />
            <View style={styles.buttonContainer}>
              <Button title="Update" onPress={() => handlePillUpdate(index)} />
              <Button title="Open" onPress={() => handleServoToggle(index, true)} />
              <Button title="Close" onPress={() => handleServoToggle(index, false)} />
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  rfidContainer: {
    backgroundColor: '#ffffff',
    padding: 15,
    marginHorizontal: 10,
    marginBottom: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rfidTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  rfidTag: {
    fontSize: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 15,
    marginHorizontal: 10,
    marginBottom: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default PillDispenser;
