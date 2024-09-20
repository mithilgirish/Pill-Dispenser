// SplashScreen.
import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

const SplashScreenComponent = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const hideSplashScreen = async () => {
      await SplashScreen.preventAutoHideAsync();
      // Simulate a loading period
      setTimeout(async () => {
        await SplashScreen.hideAsync();
        setIsVisible(false);
      }, 3000); // Change to desired duration
    };

    hideSplashScreen();
  }, []);

  if (!isVisible) {
    return null; // Hide the splash screen when done
  }

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/logo.png')} 
        style={styles.logo}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff', // Change to your desired background color
  },
  logo: {
    width: 200, // Adjust as necessary
    height: 200, // Adjust as necessary
  },
});

export default SplashScreenComponent;
