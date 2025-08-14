import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Application {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  user_type: 'homehero' | 'contractor';
  status: 'pending' | 'approved' | 'rejected';
  application_data: any;
  created_at: string;
  approved_at?: string;
  approved_by?: string;
}

interface DashboardStats {
  pending_applications: number;
  total_homeheros: number;
  total_contractors: number;
  approved_this_month: number;
}

export default function AdminDashboardScreen() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const handleBackNavigation = () => {
    // For web navigation
    if (Platform.OS === 'web') {
      window.dispatchEvent(new CustomEvent('navigate', {
        detail: { screen: 'Home' }
      }));
    } else {
      // For native navigation - would use navigation.goBack() if available
      // For now, navigate back to home
      // navigation?.goBack();
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadDashboardData();
    }
  }, [isAdmin]);

  const checkAdminStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .rpc('has_role', { 
          user_id: user.id, 
          role_name: 'admin' 
        });

      if (error) {
        console.error('Error checking admin status:', error);
        return;
      }

      setIsAdmin(data === true);
      
      if (data !== true) {
        Alert.alert('Access Denied', 'You do not have admin privileges.');
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load pending applications
      const { data: applicationsData, error: appsError } = await supabase
        .from('profiles')
        .select('*')
        .in('user_type', ['homehero', 'contractor'])
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (appsError) {
        console.error('Error loading applications:', appsError);
      } else {
        setApplications(applicationsData || []);
      }

      // Load dashboard stats
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_pending_applications_count');

      if (statsError) {
        console.error('Error loading stats:', statsError);
      } else {
        // For now, create basic stats. You can enhance this with the admin_dashboard_stats view
        const pendingCount = applicationsData?.length || 0;
        setStats({
          pending_applications: pendingCount,
          total_homeheros: 0, // TODO: Add these queries
          total_contractors: 0,
          approved_this_month: 0,
        });
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const approveApplication = async (applicationId: string, userType: 'homehero' | 'contractor') => {
    try {
      const { error } = await supabase
        .rpc('approve_homeheros_go_application', {
          application_user_id: applicationId,
          approver_role: userType
        });

      if (error) {
        console.error('Error approving application:', error);
        Alert.alert('Error', 'Failed to approve application. Please try again.');
        return;
      }

      Alert.alert('Success', 'Application approved successfully!');
      await loadDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error approving application:', error);
      Alert.alert('Error', 'Failed to approve application. Please try again.');
    }
  };

  const rejectApplication = async (applicationId: string) => {
    try {
      const { error } = await supabase
        .rpc('reject_homeheros_go_application', {
          application_user_id: applicationId,
          rejection_reason: rejectionReason || 'Application rejected by admin'
        });

      if (error) {
        console.error('Error rejecting application:', error);
        Alert.alert('Error', 'Failed to reject application. Please try again.');
        return;
      }

      Alert.alert('Success', 'Application rejected successfully!');
      setShowModal(false);
      setRejectionReason('');
      setSelectedApplication(null);
      await loadDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error rejecting application:', error);
      Alert.alert('Error', 'Failed to reject application. Please try again.');
    }
  };

  const showApplicationDetails = (application: Application) => {
    const details = application.application_data;
    let detailsText = `Name: ${application.name}\nEmail: ${application.email}\nPhone: ${application.phone}\nAddress: ${application.address}\nType: ${application.user_type}\n\n`;

    if (details) {
      if (application.user_type === 'homehero') {
        detailsText += `Eligibility: ${details.eligibility || 'N/A'}\n`;
        detailsText += `Service Interest: ${details.serviceInterest || 'N/A'}\n`;
        detailsText += `Documents: ${details.documents ? Object.keys(details.documents).join(', ') : 'None'}\n`;
      } else if (application.user_type === 'contractor') {
        detailsText += `Banking Info: ${details.bankingInfo || 'N/A'}\n`;
        detailsText += `Start Date: ${details.startDate || 'N/A'}\n`;
        detailsText += `Company Overview: ${details.companyOverview || 'N/A'}\n`;
        detailsText += `Privacy Agreement: ${details.privacyAgreement ? 'Accepted' : 'Not Accepted'}\n`;
      }
    }

    Alert.alert('Application Details', detailsText);
  };

  const handleRejectPress = (application: Application) => {
    setSelectedApplication(application);
    setShowModal(true);
  };

  if (!isAdmin) {
    return (
      <View style={styles.container}>
        <View style={styles.accessDenied}>
          <Text style={styles.accessDeniedText}>Access Denied</Text>
          <Text style={styles.accessDeniedSubtext}>
            You do not have admin privileges to access this dashboard.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackNavigation}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <Text style={styles.headerSubtitle}>HomeherosGo Applications</Text>
        </View>
      </View>

      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.pending_applications}</Text>
            <Text style={styles.statLabel}>Pending Applications</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.total_homeheros}</Text>
            <Text style={styles.statLabel}>Total Homeheros</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.total_contractors}</Text>
            <Text style={styles.statLabel}>Total Contractors</Text>
          </View>
        </View>
      )}

      <ScrollView
        style={styles.applicationsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.sectionTitle}>Pending Applications</Text>
        
        {loading ? (
          <Text style={styles.loadingText}>Loading applications...</Text>
        ) : applications.length === 0 ? (
          <Text style={styles.emptyText}>No pending applications</Text>
        ) : (
          applications.map((application) => (
            <View key={application.id} style={styles.applicationCard}>
              <View style={styles.applicationHeader}>
                <Text style={styles.applicationName}>{application.name}</Text>
                <View style={[
                  styles.typeTag,
                  application.user_type === 'homehero' ? styles.homeheroTag : styles.contractorTag
                ]}>
                  <Text style={styles.typeTagText}>
                    {application.user_type === 'homehero' ? 'Homehero' : 'Contractor'}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.applicationEmail}>{application.email}</Text>
              <Text style={styles.applicationPhone}>{application.phone}</Text>
              <Text style={styles.applicationDate}>
                Applied: {new Date(application.created_at).toLocaleDateString()}
              </Text>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.detailsButton}
                  onPress={() => showApplicationDetails(application)}
                >
                  <Text style={styles.detailsButtonText}>View Details</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.approveButton}
                  onPress={() => approveApplication(application.id, application.user_type)}
                >
                  <Text style={styles.approveButtonText}>Approve</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={() => handleRejectPress(application)}
                >
                  <Text style={styles.rejectButtonText}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Rejection Modal */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reject Application</Text>
            <Text style={styles.modalSubtitle}>
              {selectedApplication?.name} - {selectedApplication?.user_type}
            </Text>
            
            <TextInput
              style={styles.reasonInput}
              placeholder="Reason for rejection (optional)"
              value={rejectionReason}
              onChangeText={setRejectionReason}
              multiline
              numberOfLines={4}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowModal(false);
                  setRejectionReason('');
                  setSelectedApplication(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.confirmRejectButton}
                onPress={() => selectedApplication && rejectApplication(selectedApplication.id)}
              >
                <Text style={styles.confirmRejectButtonText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#FF6B35',
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 15,
    padding: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  applicationsList: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 20,
  },
  applicationCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  applicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  applicationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  typeTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  homeheroTag: {
    backgroundColor: '#E8F5E8',
  },
  contractorTag: {
    backgroundColor: '#E8F0FF',
  },
  typeTagText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  applicationEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  applicationPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  applicationDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 15,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailsButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    marginRight: 5,
  },
  detailsButtonText: {
    color: '#333',
    textAlign: 'center',
    fontSize: 14,
  },
  approveButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 5,
  },
  approveButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
  },
  rejectButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    marginLeft: 5,
  },
  rejectButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
  },
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  accessDeniedText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f44336',
    marginBottom: 10,
  },
  accessDeniedSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    marginBottom: 20,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    flex: 1,
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#333',
    textAlign: 'center',
    fontSize: 16,
  },
  confirmRejectButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    flex: 1,
  },
  confirmRejectButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
