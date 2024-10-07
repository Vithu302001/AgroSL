// app/AppStack.jsx
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { MaterialIcons } from "@expo/vector-icons";
import Sign_In from "./pages/Login";
import Sign_Up_Buyer from "./pages/Sign_Up_Buyer";
import Sign_Up_Seller from "./pages/Sign_Up_Seller";
import Home from "./pages/Home";
import Cart_Items_Page from "./pages/Cart_Items_Page";
import Profile from "./pages/Profile";
import Item_View from "./pages/Item_View";
import BuyerOrders from "./pages/Orders";
import ComplaintPage from "./pages/Complaint_Orders";
import Tracking from "./pages/Tracking";
import CheckoutPage from "./pages/CheckOut";
import colors from "../constants/colors";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const HomeTabs = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "Home") {
            iconName = "home";
          } else if (route.name === "Cart") {
            iconName = "shopping-cart";
          } else if (route.name === "Profile") {
            iconName = "person";
          } else if (route.name === "Orders") {
            iconName = "shopping-bag";
          }
          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "black",
        tabBarInactiveTintColor: "black",
        tabBarActiveBackgroundColor: colors.lightGreen,
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Cart" component={Cart_Items_Page} />
      <Tab.Screen name="Profile" component={Profile} />
      <Tab.Screen name="Orders" component={BuyerOrders} />
    </Tab.Navigator>
  );
};

const AppStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Sign_In" component={Sign_In} />
      <Stack.Screen name="Sign_Up_Buyer" component={Sign_Up_Buyer} />
      <Stack.Screen name="Sign_Up_Seller" component={Sign_Up_Seller} />
      <Stack.Screen name="Item" component={Item_View} />
      <Stack.Screen name="Cart" component={Cart_Items_Page} />
      <Stack.Screen name="HomeTabs" component={HomeTabs} />
      <Stack.Screen name="Complaint" component={ComplaintPage} />
      <Stack.Screen name="Tracking" component={Tracking} />
      <Stack.Screen name="CheckOut" component={CheckoutPage} />
    </Stack.Navigator>
  );
};

export default AppStack;
