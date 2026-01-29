import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';

const GameControls = ({ onHint, onAddRow, onReset, hintsRemaining, rowsRemaining, disabled }) => {
  return (
    <View style={styles.controls}>
      <TouchableOpacity 
        style={[styles.button, (hintsRemaining === 0 || disabled) && styles.disabledButton]} 
        onPress={onHint}
        disabled={disabled || hintsRemaining === 0}
      >
        <Text style={styles.buttonText}>💡 Hint ({hintsRemaining})</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.button, (rowsRemaining === 0 || disabled) && styles.disabledButton]} 
        onPress={onAddRow}
        disabled={disabled || rowsRemaining === 0}
      >
        <Text style={styles.buttonText}>➕ Row ({rowsRemaining})</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={onReset}>
        <Text style={styles.buttonText}>🔄 Reset</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 15,
    marginBottom: 10,
    gap: 8,
  },
  button: {
    flex: 1,
    backgroundColor: '#595984ff',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default GameControls;