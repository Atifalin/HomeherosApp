import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

interface PersonalDetails {
  name: string;
  phone: string;
  address: string;
  email: string;
}

export default function HomeherosGoOnboardingScreen({ navigation }: { navigation?: any }) {
  const { signUpHomeherosGo } = useAuth();
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<'homehero' | 'contractor' | null>(null);
  const [personalDetails, setPersonalDetails] = useState<PersonalDetails>({
    name: '',
    phone: '',
    address: '',
    email: ''
  });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePersonalDetailsSubmit = () => {
    if (!personalDetails.name || !personalDetails.phone || !personalDetails.address || !personalDetails.email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    setStep(2);
  };

  const handleUserTypeSelection = (type: 'homehero' | 'contractor') => {
    setUserType(type);
    setStep(3);
  };

  const goBack = () => {
    if (step === 1) {
      if (Platform.OS === 'web') {
        // Use custom navigation event to go back to login
        console.log('Going back to Login from HomeherosGo');
        window.dispatchEvent(new CustomEvent('navigate', { 
          detail: { screen: 'Login' } 
        }));
      } else if (navigation) {
        navigation.goBack();
      }
    } else {
      setStep(step - 1);
    }
  };

  const renderPersonalDetailsForm = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Join HomeherosGo</Text>
        <Text style={styles.subtitle}>Let's start with your personal details</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={personalDetails.name}
          onChangeText={(text) => setPersonalDetails({...personalDetails, name: text})}
          placeholderTextColor="#888"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={personalDetails.phone}
          onChangeText={(text) => setPersonalDetails({...personalDetails, phone: text})}
          keyboardType="phone-pad"
          placeholderTextColor="#888"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Address"
          value={personalDetails.address}
          onChangeText={(text) => setPersonalDetails({...personalDetails, address: text})}
          multiline
          numberOfLines={3}
          placeholderTextColor="#888"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={personalDetails.email}
          onChangeText={(text) => setPersonalDetails({...personalDetails, email: text})}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#888"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#888"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          placeholderTextColor="#888"
        />

        <TouchableOpacity style={styles.primaryButton} onPress={handlePersonalDetailsSubmit}>
          <Text style={styles.primaryButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderUserTypeSelection = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Choose Your Path</Text>
        <Text style={styles.subtitle}>Are you applying as a contractor or a Homehero?</Text>
      </View>

      <View style={styles.userTypeContainer}>
        <TouchableOpacity 
          style={styles.userTypeCard} 
          onPress={() => handleUserTypeSelection('homehero')}
        >
          <Text style={styles.userTypeTitle}>🏠 Homehero</Text>
          <Text style={styles.userTypeDescription}>
            Provide services directly to customers. Perfect for skilled individuals looking to offer their expertise.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.userTypeCard} 
          onPress={() => handleUserTypeSelection('contractor')}
        >
          <Text style={styles.userTypeTitle}>🔧 Contractor</Text>
          <Text style={styles.userTypeDescription}>
            Partner with us as a business entity. Ideal for established companies and service providers.
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderApplicationForm = () => {
    if (userType === 'homehero') {
      return <HomeheroApplicationForm 
        personalDetails={personalDetails}
        password={password}
        onBack={goBack}
        onSubmit={() => setStep(4)}
      />;
    } else {
      return <ContractorApplicationForm 
        personalDetails={personalDetails}
        password={password}
        onBack={goBack}
        onSubmit={() => setStep(4)}
      />;
    }
  };

  const renderConfirmation = () => (
    <View style={styles.container}>
      <View style={styles.confirmationContainer}>
        <Text style={styles.confirmationIcon}>✅</Text>
        <Text style={styles.confirmationTitle}>Application Submitted!</Text>
        <Text style={styles.confirmationText}>
          Thanks for applying! Someone from our team will reach out to you shortly.
        </Text>
        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={() => {
            if (Platform.OS === 'web') {
              window.location.href = '/';
            } else if (navigation) {
              navigation.navigate('Login');
            }
          }}
        >
          <Text style={styles.primaryButtonText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  switch (step) {
    case 1:
      return renderPersonalDetailsForm();
    case 2:
      return renderUserTypeSelection();
    case 3:
      return renderApplicationForm();
    case 4:
      return renderConfirmation();
    default:
      return renderPersonalDetailsForm();
  }
}

// Homehero Application Form Component
function HomeheroApplicationForm({ personalDetails, password, onBack, onSubmit }: any) {
  const { signUpHomeherosGo } = useAuth();
  const [eligibleToWork, setEligibleToWork] = useState<boolean | null>(null);
  const [serviceInterest, setServiceInterest] = useState('');
  const [documents, setDocuments] = useState({
    companyRegistration: null,
    businessLicense: null,
    taxFiling: null,
    workBcCertificate: null,
    businessInsurance: null
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (submitting) return;
    
    console.log('[DEBUG] HomeherosGo Homehero form submission started');
    setSubmitting(true);
    try {
      const applicationData = {
        eligibleToWork,
        serviceInterest,
        documents: [] // Placeholder for document uploads
      };

      console.log('[DEBUG] Submitting HomeherosGo application with data:', {
        email: personalDetails.email,
        name: personalDetails.name,
        phone: personalDetails.phone,
        address: personalDetails.address,
        userType: 'homehero',
        applicationData
      });

      const { error } = await signUpHomeherosGo({
        email: personalDetails.email,
        password: password,
        name: personalDetails.name,
        phone: personalDetails.phone,
        address: personalDetails.address,
        userType: 'homehero',
        applicationData
      });

      if (error) {
        console.error('[DEBUG] HomeherosGo signup error:', error);
        Alert.alert('Error', error.message || 'Failed to submit application');
        return;
      }

      console.log('[DEBUG] HomeherosGo signup successful, calling onSubmit');
      onSubmit();
    } catch (error) {
      console.error('[DEBUG] HomeherosGo submission unexpected error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Homehero Application</Text>
        <Text style={styles.subtitle}>Tell us about your qualifications</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Eligibility</Text>
        <Text style={styles.question}>Are you eligible to work in Canada?</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity 
            style={[styles.radioOption, eligibleToWork === true && styles.radioSelected]}
            onPress={() => setEligibleToWork(true)}
          >
            <Text style={styles.radioText}>Yes</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.radioOption, eligibleToWork === false && styles.radioSelected]}
            onPress={() => setEligibleToWork(false)}
          >
            <Text style={styles.radioText}>No</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Service Interest</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="What kind of service are you interested in providing?"
          value={serviceInterest}
          onChangeText={setServiceInterest}
          multiline
          numberOfLines={4}
          placeholderTextColor="#888"
        />

        <Text style={styles.sectionTitle}>Required Documents</Text>
        <Text style={styles.documentNote}>Please upload the following documents:</Text>
        
        <View style={styles.documentList}>
          <Text style={styles.documentItem}>• Company Registration</Text>
          <Text style={styles.documentItem}>• Business License</Text>
          <Text style={styles.documentItem}>• Previous year tax filing (if applicable)</Text>
          <Text style={styles.documentItem}>• Work BC Certificate</Text>
          <Text style={styles.documentItem}>• Business Insurance ($2 Million)</Text>
        </View>

        <TouchableOpacity style={styles.uploadButton}>
          <Text style={styles.uploadButtonText}>📎 Upload Documents</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit}>
          <Text style={styles.primaryButtonText}>Submit Application</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// Contractor Application Form Component
function ContractorApplicationForm({ personalDetails, password, onBack, onSubmit }: any) {
  const { signUpHomeherosGo } = useAuth();
  const [bankingInfo, setBankingInfo] = useState({
    bankName: '',
    accountNumber: '',
    routingNumber: ''
  });
  const [startDate, setStartDate] = useState('');
  const [companyOverview, setCompanyOverview] = useState('');
  const [privacyActAgreement, setPrivacyActAgreement] = useState(false);
  const [viewedPresentation, setViewedPresentation] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (submitting) return;
    
    console.log('[DEBUG] HomeherosGo Contractor form submission started');
    setSubmitting(true);
    try {
      const applicationData = {
        bankingInfo,
        startDate,
        companyOverview,
        privacyActAgreement,
        submittedAt: new Date().toISOString()
      };

      console.log('[DEBUG] Submitting HomeherosGo contractor application with data:', {
        email: personalDetails.email,
        name: personalDetails.name,
        phone: personalDetails.phone,
        address: personalDetails.address,
        userType: 'contractor',
        applicationData
      });

      const { error } = await signUpHomeherosGo({
        email: personalDetails.email,
        password: password,
        name: personalDetails.name,
        phone: personalDetails.phone,
        address: personalDetails.address,
        userType: 'contractor',
        applicationData
      });

      if (error) {
        console.error('[DEBUG] HomeherosGo contractor signup error:', error);
        Alert.alert('Error', error.message || 'Failed to submit application');
        return;
      }

      console.log('[DEBUG] HomeherosGo contractor signup successful, calling onSubmit');
      onSubmit();
    } catch (error) {
      console.error('[DEBUG] HomeherosGo contractor submission unexpected error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Contractor Application</Text>
        <Text style={styles.subtitle}>Complete your contractor setup</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Banking Information</Text>
        <TextInput
          style={styles.input}
          placeholder="Bank Name"
          value={bankingInfo.bankName}
          onChangeText={(text) => setBankingInfo({...bankingInfo, bankName: text})}
          placeholderTextColor="#888"
        />
        <TextInput
          style={styles.input}
          placeholder="Account Number"
          value={bankingInfo.accountNumber}
          onChangeText={(text) => setBankingInfo({...bankingInfo, accountNumber: text})}
          placeholderTextColor="#888"
        />
        <TextInput
          style={styles.input}
          placeholder="Routing Number"
          value={bankingInfo.routingNumber}
          onChangeText={(text) => setBankingInfo({...bankingInfo, routingNumber: text})}
          placeholderTextColor="#888"
        />

        <Text style={styles.sectionTitle}>Start Date</Text>
        <TextInput
          style={styles.input}
          placeholder="Preferred Start Date (MM/DD/YYYY)"
          value={startDate}
          onChangeText={setStartDate}
          placeholderTextColor="#888"
        />

        <Text style={styles.sectionTitle}>Company Overview</Text>
        <TouchableOpacity 
          style={[styles.presentationButton, viewedPresentation && styles.presentationViewed]}
          onPress={() => setViewedPresentation(true)}
        >
          <Text style={styles.presentationButtonText}>
            {viewedPresentation ? '✅ Presentation Viewed' : '📋 View Company Overview'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Terms & Conditions</Text>
        <TouchableOpacity 
          style={styles.checkboxContainer}
          onPress={() => setAgreedToTerms(!agreedToTerms)}
        >
          <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
            {agreedToTerms && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>
            I agree to the Privacy Act and Terms & Conditions
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit}>
          <Text style={styles.primaryButtonText}>Submit Application</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#f8f9fa',
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    color: '#3B5323',
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3B5323',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    padding: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  primaryButton: {
    backgroundColor: '#3B5323',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  homeherosGoSubtext: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.9,
  },
  primaryButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  userTypeContainer: {
    padding: 20,
    gap: 20,
  },
  userTypeCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  userTypeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3B5323',
    marginBottom: 8,
  },
  userTypeDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B5323',
    marginBottom: 12,
    marginTop: 20,
  },
  question: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
  },
  radioOption: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    backgroundColor: '#f9f9f9',
  },
  radioSelected: {
    backgroundColor: '#3B5323',
    borderColor: '#3B5323',
  },
  radioText: {
    fontSize: 14,
    color: '#333',
  },
  documentNote: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  documentList: {
    marginBottom: 20,
  },
  documentItem: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  uploadButton: {
    backgroundColor: '#e9ecef',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  uploadButtonText: {
    color: '#666',
    fontSize: 16,
  },
  presentationButton: {
    backgroundColor: '#e9ecef',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  presentationViewed: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
  },
  presentationButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#3B5323',
    borderColor: '#3B5323',
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  confirmationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  confirmationIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  confirmationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B5323',
    marginBottom: 16,
    textAlign: 'center',
  },
  confirmationText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
});
