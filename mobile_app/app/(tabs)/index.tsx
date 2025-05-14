import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const TestConnection: React.FC = () => {
  const [response, setResponse] = useState<string>('No response yet');

  const testBackendConnection = async () => {
    try {
      const res = await fetch('http://10.0.2.2:3001/test/ping'); 
      const text = await res.text();
      setResponse(text);
    } catch (error) {
      console.error('Error:', error);
      setResponse('Failed to connect to backend');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Backend Connection Test</Text>
      <Button title="Test Connection" onPress={testBackendConnection} />
      <Text style={styles.response}>{response}</Text>
    </View>
  );
};

export default TestConnection;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
  },
  response: {
    marginTop: 20,
    fontSize: 16,
    color: 'blue',
  },
});
