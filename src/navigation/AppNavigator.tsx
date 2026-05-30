import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import BottomTabBar from '../components/BottomTabBar';

// Tab screens
import HomeScreen from '../screens/HomeScreen';
import CalendarScreen from '../screens/CalendarScreen';
import ChatScreen from '../screens/ChatScreen';
// Auth screens
import SplashScreen from '../screens/auth/SplashScreen';
import StartScreen from '../screens/auth/StartScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import SignUpEmployeeScreen from '../screens/auth/SignUpEmployeeScreen';
import SignUpManagerScreen from '../screens/auth/SignUpManagerScreen';
import IdCheckScreen from '../screens/auth/IdCheckScreen';
import StoreCodeScreen from '../screens/auth/StoreCodeScreen';
import StoreConfirmScreen from '../screens/auth/StoreConfirmScreen';
import StoreRegisterScreen from '../screens/auth/StoreRegisterScreen';
import SignUpCompleteScreen from '../screens/auth/SignUpCompleteScreen';

// Schedule screens
import TodayScheduleScreen from '../screens/schedule/TodayScheduleScreen';
import FixedScheduleScreen from '../screens/schedule/FixedScheduleScreen';
import FixedScheduleBottomSheet from '../screens/schedule/FixedScheduleBottomSheet';

// ToDo screens
import ToDoListScreen from '../screens/todo/TodoListScreen';
import ToDoEditScreen from '../screens/todo/TodoEditScreen';
import ToDoAddSheet from '../screens/todo/TodoAddBottomSheet';

// Store screen
import StoreManagementScreen from '../screens/store/StoreManagementScreen';

// Substitute screens
import SubstituteRequestScreen from '../screens/substitute/SubstituteRequestScreen';
import SubstituteAvailableScreen from '../screens/substitute/SubstituteAvailableScreen';
import SubstituteFailScreen from '../screens/substitute/SubstituteFailScreen';
import AiSubstituteListScreen from '../screens/substitute/AiSubstituteListScreen';
import AiSubstituteScheduleScreen from '../screens/substitute/AiSubstituteScheduleScreen';
import AiSubstituteTimeScreen from '../screens/substitute/AiSubstituteTimeScreen';

// Chat screens
import PersonalChatScreen from '../screens/chat/PersonalChatScreen';
import GroupChatScreen from '../screens/chat/GroupChatScreen';

export type TabParamList = {
  Home: undefined;
  Calendar: undefined;
  Chat: undefined;
  Notification: undefined;
};

export type RootStackParamList = {
  // Auth flow
  Splash: undefined;
  Start: undefined;
  Login: undefined;
  SignUp: undefined;
  SignUpEmployee: undefined;
  SignUpManager: undefined;
  IdCheck: undefined;
  StoreCode: undefined;
  StoreConfirm: undefined;
  StoreRegister: undefined;
  SignUpComplete: undefined;
  // Main tabs
  Main: undefined;
  // Schedule
  TodaySchedule: undefined;
  FixedSchedule: undefined;
  FixedScheduleSheet: undefined;
  // ToDo
  ToDoList: undefined;
  ToDoEdit: undefined;
  ToDoAdd: undefined;
  // Store
  StoreManagement: undefined;
  // Substitute
  SubstituteRequest: undefined;
  SubstituteAvailable: undefined;
  SubstituteFail: undefined;
  AiSubstituteList: undefined;
  AiSubstituteSchedule: undefined;
  AiSubstituteTime: undefined;
  // Chat
  PersonalChat: undefined;
  GroupChat: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Notification" component={ToDoListScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false }}
      >
        {/* Auth */}
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Start" component={StartScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="SignUpEmployee" component={SignUpEmployeeScreen} />
        <Stack.Screen name="SignUpManager" component={SignUpManagerScreen} />
        <Stack.Screen name="IdCheck" component={IdCheckScreen} />
        <Stack.Screen name="StoreCode" component={StoreCodeScreen} />
        <Stack.Screen name="StoreConfirm" component={StoreConfirmScreen} />
        <Stack.Screen name="StoreRegister" component={StoreRegisterScreen} />
        <Stack.Screen name="SignUpComplete" component={SignUpCompleteScreen} />

        {/* Main tabs */}
        <Stack.Screen name="Main" component={MainTabs} />

        {/* Schedule */}
        <Stack.Screen name="TodaySchedule" component={TodayScheduleScreen} />
        <Stack.Screen name="FixedSchedule" component={FixedScheduleScreen} />
        <Stack.Screen name="FixedScheduleSheet" component={FixedScheduleBottomSheet} />

        {/* ToDo */}
        <Stack.Screen name="ToDoList" component={ToDoListScreen} />
        <Stack.Screen name="ToDoEdit" component={ToDoEditScreen} />
        <Stack.Screen
          name="ToDoAdd"
          component={ToDoAddSheet}
          options={{ presentation: 'transparentModal' }}
        />

        {/* Store */}
        <Stack.Screen name="StoreManagement" component={StoreManagementScreen} />

        {/* Substitute */}
        <Stack.Screen name="SubstituteRequest" component={SubstituteRequestScreen} />
        <Stack.Screen name="SubstituteAvailable" component={SubstituteAvailableScreen} />
        <Stack.Screen name="SubstituteFail" component={SubstituteFailScreen} />
        <Stack.Screen name="AiSubstituteList" component={AiSubstituteListScreen} />
        <Stack.Screen name="AiSubstituteSchedule" component={AiSubstituteScheduleScreen} />
        <Stack.Screen
          name="AiSubstituteTime"
          component={AiSubstituteTimeScreen}
          options={{ presentation: 'transparentModal' }}
        />

        {/* Chat */}
        <Stack.Screen name="PersonalChat" component={PersonalChatScreen} />
        <Stack.Screen name="GroupChat" component={GroupChatScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
