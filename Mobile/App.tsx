import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/contexts/authContext';

import { LoginScreen } from './src/screens/Login/LoginScreen';
import { RegisterUserScreen } from './src/screens/RegisterUser/RegisterUserScreen';
import { OccurrencesFeedScreen } from './src/screens/Occurrence/OcurrenceFeedScreen';
import { OccurrenceEditorScreen } from './src/screens/Occurrence/OccurrenceEditorScreen';
import { MyOccurrencesScreen } from './src/screens/Occurrence/MyOccurrencesScreen';
import { OccurrenceManageScreen } from './src/screens/Occurrence/OccuranceManageScreen';
import { NotificationScreen } from './src/screens/Notification/NotificationScreen';
import { OccurrenceDetailsScreen } from './src/screens/Occurrence/OccurrenceDetailScreen';
import { UserManageScreen } from './src/screens/UserManager/UserManagerScreen';
import { View } from 'lucide-react-native';
import { ActivityIndicator } from 'react-native';

const Stack = createNativeStackNavigator();

const UserRole = {
  Citizen: 0,
  Reviewer: 1,
  Admin: 2
};

function RootNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' }}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      );
    }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterUserScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Feed" component={OccurrencesFeedScreen} />
            <Stack.Screen name="OccurrenceEditor" component={OccurrenceEditorScreen} />
            <Stack.Screen name="MyOccurrences" component={MyOccurrencesScreen} />
            <Stack.Screen name="OccurrenceManage" component={OccurrenceManageScreen} />
            <Stack.Screen name="Notifications" component={NotificationScreen} />
            <Stack.Screen name="OccurrenceDetails" component={OccurrenceDetailsScreen} />

            {user.role === UserRole.Admin && (
              <Stack.Screen name="UserManage" component={UserManageScreen} />
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}