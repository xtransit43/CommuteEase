import { Text, View, StyleSheet } from 'react-native';

export default function AboutScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>
        About Our Mission:
      </Text>
      <Text style={styles.descriptionText}>
        We are CommuteEase, a mobile and web app built with React Native and Expo Go. We are dedicated to helping ease the strain of long commutes for commuters.
        {"\n\n"}
        With a responsive navigation tab bar, this app provides an integrated OpenGIS map app that offers GPS tracking and truck stop information for commuters.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 28,
    paddingVertical: 32,
  },
  headerText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
    lineHeight: 36,
    letterSpacing: 0.5,
  },
  descriptionText: {
    fontSize: 18,
    color: '#d1d1d6',
    lineHeight: 28,
    letterSpacing: 0.2,
  },
});