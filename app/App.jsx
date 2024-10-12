import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppStack from "./AppStack";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";
import { StripeProvider } from "@stripe/stripe-react-native";

const App = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StripeProvider publishableKey="pk_test_51PwNGE05CsRawMoqM7YEL8tcA6xpOuDUJJ1oRSImOq9ndmJxlWHlqvlYLIg7aXlxJCXAQqCHbWAOVakInuTx4ql100M5xx4oan">
        <NavigationContainer>
          <AppStack />
        </NavigationContainer>
      </StripeProvider>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // This ensures SafeAreaView takes up the entire screen
  },
});

export default App;
