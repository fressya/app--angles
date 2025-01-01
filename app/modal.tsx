  import { router, Stack, useLocalSearchParams } from "expo-router";
  import { useSQLiteContext } from "expo-sqlite";
  import React, { useState } from "react";
  import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    FlatList,
    Platform,
    Keyboard,
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
  } from "react-native";
  import { SafeAreaView } from "react-native-safe-area-context";
  import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

  export default function ItemModal() {
    const { id } = useLocalSearchParams();
    type AngleKeys = "A" | "B" | "C";
    type Angle = { item: number } & Record<AngleKeys, string>;

    const [angles, setAngles] = useState<Angle[]>([]);
    const [editMode, setEditMode] = useState(false);
    const database = useSQLiteContext();

    React.useEffect(() => {
      if (id) {
        setEditMode(true);
        loadData();
      }
    }, [id]);

    const loadData = async () => {
      const result = await database.getFirstAsync<{
        id: number;
        angles: string;
      }>(`SELECT * FROM items WHERE id = ?`, [parseInt(id as string)]);
      setAngles(JSON.parse(result?.angles || "[]"));
    };

    const handleSave = async () => {
      try {
        await database.runAsync(
          `INSERT INTO items (angles) VALUES (?)`,
          [JSON.stringify(angles)]
        );
        router.back(); // Regresar al home
      } catch (error) {
        console.error("Error saving item:", error);
      }
    };

    const handleUpdate = async () => {
      try {
        if (!id) return;
        await database.runAsync(
          `UPDATE items SET angles = ? WHERE id = ?`,
          [JSON.stringify(angles), parseInt(id as string)]
        );
        router.back();
      } catch (error) {
        console.error("Error updating item:", error);
      }
    };

    const updateAngle = (index: number, key: AngleKeys, value: string) => {
      const newAngles = [...angles];
      newAngles[index][key] = value;
      setAngles(newAngles);
    };

    const addAngleRow = () => {
      if (angles.length < 10) {
        const newItem = {
          item: angles.length + 1,
          A: "",
          B: "",
          C: "",
        };
        setAngles([...angles, newItem]);
      } else {
        alert("No puedes agregar más de 10 filas.");
      }
    };

    const icon = require("../assets/imagen.png");

    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
        <SafeAreaView style={styles.container}>
          <Stack.Screen options={{ title: "Detalle Ángulos" }} />
          <View style={styles.imageContainer}>
            <Image source={icon} style={styles.image} resizeMode="contain" />
          </View>
          <View style={styles.header}>
          <Text style={styles.sectionTitle}>ÁNGULOS DE MEDICIÓN(mm)</Text>
            <TouchableOpacity onPress={addAngleRow} style={styles.plusButton}>
              <Text style={styles.buttonText}>+</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={angles}
            keyExtractor={(item) => item.item.toString()}
            renderItem={({ item, index }) => (
              <View style={styles.row}>
                <Text style={styles.cell}>{item.item}</Text>
                {(["A", "B", "C"] as const).map((key) => (
                  <TextInput
                    key={key}
                    placeholder={key}
                    value={angles[index][key]}
                    keyboardType="numeric"
                    returnKeyType="done"
                    onChangeText={(text) => updateAngle(index, key, text)}
                    style={styles.cellInput}
                  />
                ))}
              </View>
            )}
          />
          <View style={styles.footerContainer}>
            <View style={styles.footer}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={[styles.button, { backgroundColor: "#9e9e9e" }]}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  editMode ? handleUpdate() : handleSave();
                }}
                style={[styles.button, { backgroundColor: "#305496" }]}
              >
                <Text style={styles.buttonText}>{editMode ? "Actualizar" : "Guardar"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "flex-start",
      justifyContent: "center",
      backgroundColor: "white",
      padding: 5,
    },
    imageContainer: {
      marginVertical: 0, 
      padding: 0, 
    },
    image: {
      width: 388,
      height: 388,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
      marginLeft: 15,
    },
    sectionTitle: {
      fontWeight: "bold",
      fontSize: 18,
      marginRight: 10,
    },
    plusButton: {
      height: 20,
      width: 20,
      backgroundColor: "green",
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    buttonText: {
      fontWeight: "bold",
      color: "white",
    },
    row: {
      flexDirection: "row",
      marginBottom: 10,
      alignItems: "center",
    },
    cell: {
      width: 30,
      textAlign: "center",
    },
    cellInput: {
      borderWidth: 1,
      borderColor: "slategray",
      borderRadius: 5,
      padding: 5,
      textAlign: "center",
      width: 70,
      marginHorizontal: 5,
    },
    footer: {
      flexDirection: "row",
      gap: 20,
    },
    button: {
      height: 40,
      width: 120,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 5,
    },
    footerContainer: {
      width: '100%',
      alignItems: 'center',
    },
  });
