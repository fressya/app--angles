import { router, Stack, useFocusEffect } from "expo-router";
import React, { useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useSQLiteContext } from "expo-sqlite";

export default function TabHome() {
  const [data, setData] = React.useState<{ id: number; title: string }[]>([]);
  const database = useSQLiteContext();

  useFocusEffect(
    useCallback(() => {
      loadData(); // Fetch data when the screen is focused
    }, [])
  );

  const headerRight = () => (
    <TouchableOpacity
      onPress={() => router.push("/modal")}
      style={{ marginRight: 10 }}
    >
      <FontAwesome name="plus-circle" size={28} color="#305496" />
    </TouchableOpacity>
  );

  const loadData = async () => {
    try {
      const query = "SELECT id, angles AS title FROM items";
      console.log("Executing query:", query);
      const result = await database.getAllAsync<{ id: number; title: string }>(query);
  
      // Procesar los datos para deserializar las cadenas JSON
      const parsedData = result.map(item => ({
        ...item,
        title: JSON.parse(item.title), // Deserializar JSON
      }));
  
      console.log("Parsed query result:", parsedData);
      setData(parsedData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };
  

  return (
    <View>
      <Stack.Screen options={{ headerRight }} />
      <FlatList
        data={data}
        renderItem={({ item }) => (
          <View style={{ padding: 10 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text>Detalle Ángulos</Text>
              <TouchableOpacity
                onPress={() => {
                  router.push(`/modal?id=${item.id}`);
                }}
                style={styles.button}
              >
                <Text style={styles.buttonText}>Editar</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 30,
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    backgroundColor: "#305496",
  },
  buttonText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "white",
  },
});
