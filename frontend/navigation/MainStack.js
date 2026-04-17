import { createNativeStackNavigator } from "@react-navigation/native-stack";

import DrawerNavigator from "./DrawerNavigator";
import EditProfileScreen from "../screens/EditProfileScreen";

import HelpSupportScreen from "../screens/HelpSupportScreen";

const Stack = createNativeStackNavigator();

export default function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DrawerHome" component={DrawerNavigator} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    
     
      
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
    </Stack.Navigator>
  );
}
