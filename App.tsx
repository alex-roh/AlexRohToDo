import React from "react";
import { SafeAreaView } from "react-native";
import TodoScreen from "./src/screens/TodoScreen";

const App = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TodoScreen />
    </SafeAreaView>
  );
};

export default App;
