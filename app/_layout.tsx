import React from "react"; 
import { Stack } from "expo-router";
import { SQLiteDatabase, SQLiteProvider } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";

interface TableColumn {
  name: string;
  type: string;
  notnull: number;
  dflt_value: any;
  pk: number;
}

const createTable = async (db: SQLiteDatabase) => {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        angles TEXT
      );
    `;
    await db.runAsync(createTableQuery);
    console.log("Tabla 'items' creada o ya existe.");

    const checkColumnQuery = `
      PRAGMA table_info(items);
    `;
    const tableInfo: TableColumn[] = db.getAllSync(checkColumnQuery);

    if (!tableInfo.some((col) => col.name === 'angles')) {
      await db.runAsync(`ALTER TABLE items ADD COLUMN angles TEXT;`);
      console.log("Columna 'angles' añadida exitosamente.");
    } else {
      console.log("La columna 'angles' ya existe.");
    }
  } catch (error) {
    console.error("Error al crear la tabla o añadir la columna 'angles':", error);
  }
};

export default function RootLayout() {
  return (
    <>
      <SQLiteProvider databaseName="test.db" onInit={createTable}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
          <Stack.Screen
            name="modal"
            options={{
              presentation: "modal",
            }}
          />
        </Stack>
      </SQLiteProvider>
      <StatusBar style="auto" />
    </>
  );
}
