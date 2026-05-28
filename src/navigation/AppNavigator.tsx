import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import BottomTabBar from '../components/BottomTabBar';

// Auth
import SplashScreen from '../screens/auth/SplashScreen';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import EmployeeSignUpScreen from '../screens/auth/EmployeeSignUpScreen';
import ManagerSignUpScreen from '../screens/auth/ManagerSignUpScreen';
import SignUpCompleteScreen from '../screens/auth/SignUpCompleteScreen';
import StartScreen from '../screens/auth/StartScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterEmployeeScreen from '../screens/auth/RegisterEmployeeScreen';
import RegisterManagerScreen from '../screens/auth/RegisterManagerScreen';
import IdCheckScreen from '../screens/auth/IdCheckScreen';
import CodeInputScreen from '../screens/auth/CodeInputScreen';
import StoreConfirmScreen from '../screens/auth/StoreConfirmScreen';
import StoreRegisterScreen from '../screens/auth/StoreRegisterScreen';
import RegisterCompleteScreen from '../screens/auth/RegisterCompleteScreen';

// Home
import HomeScreen from '../screens/home/HomeScreen';
import ScheduleChangeScreen from '../screens/home/ScheduleChangeScreen';

// Schedule
import TodayScheduleScreen from '../screens/schedule/TodayScheduleScreen';
import AllScheduleScreen from '../screens/schedule/AllScheduleScreen';
import FixedScheduleEditScreen from '../screens/schedule/FixedScheduleEditScreen';
import FullScheduleScreen from '../screens/schedule/FullScheduleScreen';
import FixedScheduleScreen from '../screens/schedule/FixedScheduleScreen';

// Todo
import TodoListScreen from '../screens/todo/TodoListScreen';
import TodoEditScreen from '../screens/todo/TodoEditScreen';
import TodoAddBottomSheet from '../screens/todo/TodoAddBottomSheet';

// Store
import StoreManageScreen from '../screens/store/StoreManageScreen';

// Substitute
import SubRequestScreen from '../screens/substitute/SubRequestScreen';
import SubAvailableScreen from '../screens/substitute/SubAvailableScreen';
import SubFailScreen from '../screens/substitute/SubFailScreen';
import AiSubListScreen from '../screens/substitute/AiSubListScreen';
import AiScheduleManageScreen from '../screens/substitute/AiScheduleManageScreen';
import AiTimeSetScreen from '../screens/substitute/AiTimeSetScreen';

// Chat
import ChatListScreen from '../screens/chat/ChatListScreen';
import PersonalChatScreen from '../screens/chat/PersonalChatScreen';
import GroupChatScreen from '../screens/chat/GroupChatScreen';
import ChatTypingScreen from '../screens/chat/ChatTypingScreen';

export type RootStackParamList = {
  // Auth
  Splash: undefined;
  Welcome: undefined;
  SignUp: undefined;
  EmployeeSignUp: undefined;
  ManagerSignUp: undefined;
  SignUpComplete: undefined;
  Start: undefined;
  Login: undefined;
  RegisterEmployee: undefined;
  RegisterManager: undefined;
  IdCheck: undefined;
  CodeInput: undefined;
  StoreConfirm: undefined;
  StoreRegister: undefined;
  RegisterComplete: undefined;
  // Main
  MainTabs: undefined;
  ScheduleChange: undefined;
  // Schedule
  TodaySchedule: undefined;
  AllSchedule: undefined;
  FixedScheduleEdit: undefined;
  FixedSchedule: undefined;
  FullSchedule: undefined;
  // Todo
  TodoList: undefined;
  TodoEdit: undefined;
  TodoAdd: undefined;
  // Store
  StoreManage: undefined;
  // Substitute
  SubRequest: undefined;
  SubAvailable: undefined;
  SubFail: undefined;
  AiSubList: undefined;
  AiScheduleManage: undefined;
  AiTimeSet: undefined;
  // Chat
  ChatList: undefined;
  PersonalChat: undefined;
  GroupChat: undefined;
  ChatTyping: undefined;
};

export type BottomTabParamList = {
  Home: undefined;
  Calendar: undefined;
  Chat: undefined;
  Notifications: undefined;
  Memo: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Calendar" component={AllScheduleScreen} />
      <Tab.Screen name="Chat" component={ChatListScreen} />
      <Tab.Screen name="Notifications" component={TodoListScreen} />
      <Tab.Screen name="Memo" component={StoreManageScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        {/* Auth */}
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="EmployeeSignUp" component={EmployeeSignUpScreen} />
        <Stack.Screen name="ManagerSignUp" component={ManagerSignUpScreen} />
        <Stack.Screen name="SignUpComplete" component={SignUpCompleteScreen} />
        <Stack.Screen name="Start" component={StartScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="RegisterEmployee" component={RegisterEmployeeScreen} />
        <Stack.Screen name="RegisterManager" component={RegisterManagerScreen} />
        <Stack.Screen name="IdCheck" component={IdCheckScreen} />
        <Stack.Screen name="CodeInput" component={CodeInputScreen} />
        <Stack.Screen name="StoreConfirm" component={StoreConfirmScreen} />
        <Stack.Screen name="StoreRegister" component={StoreRegisterScreen} />
        <Stack.Screen name="RegisterComplete" component={RegisterCompleteScreen} />
        {/* Main */}
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="ScheduleChange" component={ScheduleChangeScreen} />
        {/* Schedule */}
        <Stack.Screen name="FullSchedule" component={FullScheduleScreen} />
        <Stack.Screen name="FixedSchedule" component={FixedScheduleScreen} />
        <Stack.Screen name="TodaySchedule" component={TodayScheduleScreen} />
        <Stack.Screen name="AllSchedule" component={AllScheduleScreen} />
        <Stack.Screen name="FixedScheduleEdit" component={FixedScheduleEditScreen} />
        {/* Todo */}
        <Stack.Screen name="TodoList" component={TodoListScreen} />
        <Stack.Screen name="TodoEdit" component={TodoEditScreen} />
        <Stack.Screen name="TodoAdd" component={TodoAddBottomSheet} />
        {/* Store */}
        <Stack.Screen name="StoreManage" component={StoreManageScreen} />
        {/* Substitute */}
        <Stack.Screen name="SubRequest" component={SubRequestScreen} />
        <Stack.Screen name="SubAvailable" component={SubAvailableScreen} />
        <Stack.Screen name="SubFail" component={SubFailScreen} />
        <Stack.Screen name="AiSubList" component={AiSubListScreen} />
        <Stack.Screen name="AiScheduleManage" component={AiScheduleManageScreen} />
        <Stack.Screen name="AiTimeSet" component={AiTimeSetScreen} />
        {/* Chat */}
        <Stack.Screen name="ChatList" component={ChatListScreen} />
        <Stack.Screen name="PersonalChat" component={PersonalChatScreen} />
        <Stack.Screen name="GroupChat" component={GroupChatScreen} />
        <Stack.Screen name="ChatTyping" component={ChatTypingScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
