import { SafeAreaView, StyleSheet, Text, View } from "react-native";

export function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Breach Android App</Text>
        <Text style={styles.text}>This is the dedicated Android frontend codebase.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b1020",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#111827",
    borderRadius: 12,
    padding: 16,
  },
  title: {
    color: "#e2e8f0",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  text: {
    color: "#94a3b8",
    fontSize: 16,
  },
});
