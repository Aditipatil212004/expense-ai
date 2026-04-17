import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const HelpSupportScreen = ({ navigation }) => {
  const emails = [
    { id: 1, email: 'aditipatil.skn.it@gmail.com', name: 'Aditi Patil' },
    { id: 2, email: 'ketanpatil.skn.it@gmail.com', name: 'Ketan Patil' },
  ];

  const sendEmail = (email) => {
    const url = `mailto:${email}`;
    Linking.openURL(url)
      .catch(() => Alert.alert('Error', 'Unable to open email app'));
  };

  const faqs = [
    {
      question: 'How to add expenses?',
      answer: 'Tap + button on Dashboard → Enter amount/category → Save',
    },
    {
      question: 'Categories not showing?',
      answer: 'Categories auto-create. Check Budget screen to manage.',
    },
    {
      question: 'SMS transactions not importing?',
      answer: 'Enable SMS permissions in app settings → Restart app',
    },
    {
      question: 'App crashing?',
      answer: 'Clear cache: Settings → Clear data → Restart',
    },
  ];

  const SectionHeader = ({ icon, title }) => (
    <View style={styles.sectionHeader}>
      <Ionicons name={icon} size={20} color="#8b5cf6" />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
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

          <Text style={styles.headerTitle}>Help&Support</Text>
          <View style={{ width: 44 }} />
        </LinearGradient>



        {/* FAQ */}
        <View style={styles.section}>
          <SectionHeader icon="help-circle-outline" title="Frequently Asked Questions" />
          {faqs.map((faq, index) => (
            <View key={index} style={styles.faqItem}>
              <Text style={styles.faqQuestion}>{faq.question}</Text>
              <Text style={styles.faqAnswer}>{faq.answer}</Text>
            </View>
          ))}
        </View>

        {/* CONTACT */}
        <View style={styles.section}>
          <SectionHeader icon="mail-outline" title="Contact Support" />
          <View style={styles.card}>
            {emails.map((contact) => (
              <TouchableOpacity
                key={contact.id}
                style={styles.contactCard}
                onPress={() => sendEmail(contact.email)}
                activeOpacity={0.9}
              >
                <View style={styles.contactAvatar}>
                  <Ionicons 
                    name={contact.id === 1 ? "woman-outline" : "man-outline"} 
                    size={32} 
                    color="#8b5cf6" 
                  />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <Text style={styles.contactEmail}>{contact.email}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* FEEDBACK */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.feedbackBtn} activeOpacity={0.8}>
            <LinearGradient colors={["#10b981", "#059669"]} style={styles.feedbackGradient}>
              <Ionicons name="star-outline" size={20} color="#fff" />
              <Text style={styles.feedbackText}>Send Feedback</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  backBtn: {
    padding: 12,
    position: 'absolute',
    left: 20,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
  },

  // Sections
  section: {
    marginHorizontal: 20,
    marginVertical: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    color: "#e2e8f0",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 12,
    letterSpacing: 0.3,
  },

  // Cards
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },

  // Quick Actions
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    marginBottom: 12,
  },
  actionText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 16,
  },

  // FAQ
  faqItem: {
    backgroundColor: "#111827",
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
  },
  faqQuestion: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
    lineHeight: 22,
  },
  faqAnswer: {
    color: "#cbd5e1",
    fontSize: 15,
    lineHeight: 22,
  },

  // Contact
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: "rgba(139, 92, 246, 0.05)",
    marginBottom: 12,
  },
  contactAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(139, 92, 246, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    color: "#f8fafc",
    fontSize: 17,
    fontWeight: "700",
  },
  contactEmail: {
    color: "#94a3b8",
    fontSize: 15,
    marginTop: 2,
  },

  // Feedback
  feedbackBtn: {
    marginTop: 8,
  },
  feedbackGradient: {
    flexDirection: "row",
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  feedbackText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 12,
  },
});

export default HelpSupportScreen;

