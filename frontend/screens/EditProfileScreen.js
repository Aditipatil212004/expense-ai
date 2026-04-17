import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from "react-native";
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function EditProfileScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUri, setAvatarUri] = useState("");
  const [saving, setSaving] = useState(false);
  const [fieldFocus, setFieldFocus] = useState('');

  useEffect(() => {
    (async () => {
      const data = await AsyncStorage.getItem("user");
      if (data) {
        const u = JSON.parse(data);
        setName(u.name || "");
        setEmail(u.email || "");
        setPhone(u.phone || "");
        setBio(u.bio || "");
        setAvatarUri(u.avatarUrl || "");
      }
    })();
  }, []); 

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // All logic unchanged
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'This app needs access to your camera and gallery to select profile picture.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Grant Permission', onPress: () => pickImage() }
          ]
        );
        return;
      }

      Alert.alert(
        'Profile Photo',
        'Choose a photo for your profile',
        [
          { text: 'Take Photo', onPress: () => takePhoto() },
          { text: 'Choose from Gallery', onPress: () => selectFromGallery() },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } catch (error) {
      console.error('Permission check failed:', error);
      Alert.alert('Error', 'Failed to check permissions. Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required", "Camera access is needed");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        await processImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Camera failed:", error);
      Alert.alert("Error", "Camera not working");
    }
  };

  const selectFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        await processImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Gallery failed:', error);
      Alert.alert('Error', 'Failed to select image. Please check gallery permissions.');
    }
  };

  const processImage = async (uri) => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (fileInfo.size > 2 * 1024 * 1024) {
        Alert.alert('File too large', 'Please choose a smaller image.');
        return;
      }

      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      setAvatarUri(`data:image/jpeg;base64,${base64}`);
    } catch (error) {
      console.error('Image processing failed:', error);
      Alert.alert('Error', 'Failed to process image.');
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Validation", "Name cannot be empty");
      return;
    }

    setSaving(true);
    try {
      const data = await AsyncStorage.getItem("user");
      const current = data ? JSON.parse(data) : {};
      const updated = { ...current, name, email, phone, bio, avatarUrl: avatarUri };

      await AsyncStorage.setItem("user", JSON.stringify(updated));

      Alert.alert("Success", "Profile updated successfully!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const Field = ({ label, icon, multiline, value, onChangeText, placeholder }) => (
    <TouchableOpacity activeOpacity={1} onPress={() => setFieldFocus(icon)}>
      <View style={styles.fieldWrap}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <View style={[
          styles.inputWrap, 
          multiline && { minHeight: 120 },
          fieldFocus === icon && styles.inputWrapFocused
        ]}>
          <Ionicons name={icon} size={22} color="#8b5cf6" />
          <TextInput
            style={styles.input}
            placeholderTextColor="#64748b"
            multiline={multiline}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            onFocus={() => setFieldFocus(icon)}
            onBlur={() => setTimeout(() => setFieldFocus(''), 200)}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* HEADER */}
          <LinearGradient
            colors={["#8b5cf6", "#7c3aed", "#6d28d9"]}
            style={styles.header}
          >
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Edit Profile</Text>

            <View style={{ width: 44 }} />
          </LinearGradient>

          {/* AVATAR */}
          <View style={styles.avatarSection}>
            <LinearGradient
              colors={["rgba(139, 92, 246, 0.3)", "rgba(139, 92, 246, 0.1)"]}
              style={styles.avatarRing}
            >
              <View style={styles.avatarContainer}>
                <Image
                  source={{ uri: avatarUri || "https://i.pravatar.cc/150?u=" + Date.now() }}
                  style={styles.avatar}
                />
                <TouchableOpacity style={styles.cameraBtn} onPress={pickImage}>
                  <Ionicons name="camera" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </LinearGradient>
            <Text style={styles.avatarLabel}>Profile Photo</Text>
          </View>

          {/* FORM */}
          <View style={styles.form}>
            <Field
              label="Full Name"
              icon="person-outline"
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
            />

            <Field
              label="Email Address"
              icon="mail-outline"
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              keyboardType="email-address"
            />

            <Field
              label="Phone Number"
              icon="call-outline"
              value={phone}
              onChangeText={setPhone}
              placeholder="+1 (555) 000-0000"
              keyboardType="phone-pad"
            />

            <Field
              label="Bio"
              icon="document-text-outline"
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself..."
              multiline
            />

            <TouchableOpacity
              style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={saving ? ["#64748b", "#475569"] : ["#8b5cf6", "#7c3aed"]}
                style={styles.saveGradient}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark-sharp" size={20} color="#fff" />
                    <Text style={styles.saveText}>
                      Save Changes
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  scrollContent: {
    paddingBottom: 60,
    flexGrow: 1,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  backBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 12,
    borderRadius: 20,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
  },

  // Avatar
  avatarSection: {
    alignItems: "center",
    marginVertical: 8,
    paddingHorizontal: 24,
  },
  avatarRing: {
    padding: 6,
    borderRadius: 60,
  },
  avatarContainer: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: "#1e293b",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 16,
    position: "relative",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  cameraBtn: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "#8b5cf6",
    padding: 10,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarLabel: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 12,
    letterSpacing: 0.5,
  },

  // Form
  form: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  fieldWrap: {
    marginBottom: 20,
  },
  fieldLabel: {
    color: "#e2e8f0",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e293b",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  inputWrapFocused: {
    backgroundColor: "#253549",
    borderWidth: 1.5,
    borderColor: "#8b5cf6",
    shadowColor: "#8b5cf6",
    shadowOpacity: 0.3,
  },
  input: {
    flex: 1,
    color: "#f8fafc",
    fontSize: 16,
    paddingVertical: 2,
    marginLeft: 12,
    fontWeight: "500",
  },

  // Save Button
  saveBtn: {
    marginTop: 32,
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveGradient: {
    flexDirection: "row",
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 16,
  },
  saveText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.2,
    marginLeft: 8,
  },
});
