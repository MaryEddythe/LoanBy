import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ClientsStackScreen, LoansStackScreen, ToolsStackScreen } from './src/navigation/Stacks';
import Ionicons from 'react-native-vector-icons/Ionicons';

export type RootTabParamList = {
  Clients: undefined;
  Loans: undefined;
  Tools: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const App = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: string;

            if (route.name === 'Clients') {
              iconName = focused ? 'people' : 'people-outline';
            } else if (route.name === 'Loans') {
              iconName = focused ? 'cash' : 'cash-outline';
            } else {
              iconName = focused ? 'hammer' : 'hammer-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#3b82f6',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
        })}
      >
        <Tab.Screen name="Clients" component={ClientsStackScreen} />
        <Tab.Screen name="Loans" component={LoansStackScreen} />
        <Tab.Screen name="Tools" component={ToolsStackScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;