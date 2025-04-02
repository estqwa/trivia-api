import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  Image, 
  TouchableOpacity, 
  TextInput,
  ScrollView,
  Alert
} from 'react-native';
import { 
  User, 
  Trophy, 
  CheckCircle, 
  XCircle, 
  Percent, 
  Clock, 
  Edit3, 
  Save,
  DollarSign,
  LogOut
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuthStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.username || '');
  
  // Calculate stats
  const gamesPlayed = user?.games_played || 0;
  const totalScore = user?.total_score || 0;
  const highScore = user?.highest_score || 0;
  
  // Placeholder stats for demo
  const totalCorrect = Math.round(gamesPlayed * 0.7);
  const totalQuestions = gamesPlayed * 10;
  const totalWinnings = Math.round(totalScore * 0.1);
  
  const accuracy = totalQuestions > 0 
    ? Math.round((totalCorrect / totalQuestions) * 100) 
    : 0;
  
  const handleSaveProfile = () => {
    if (editName.trim().length === 0) {
      Alert.alert('Invalid Name', 'Please enter a valid name');
      return;
    }
    
    // In a real app, this would update the user's profile
    // For this demo, we'll just update the local state
    setIsEditing(false);
    Alert.alert('Profile Updated', 'Your profile has been updated successfully.');
  };
  
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          onPress: async () => {
            await logout();
            router.replace('/');
          }
        }
      ]
    );
  };
  
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notAuthenticatedContainer}>
          <Text style={styles.notAuthenticatedText}>
            Please sign in to view your profile.
          </Text>
          <Button
            title="Sign In"
            onPress={() => router.push('/auth')}
            variant="primary"
            style={styles.signInButton}
          />
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <User size={30} color={Colors.dark.text} />
          <Text style={styles.headerTitle}>Your Profile</Text>
        </View>
        
        <View style={styles.profileCard}>
          <Image 
            source={{ uri: user.profile_picture || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=100&h=100&fit=crop' }} 
            style={styles.avatar} 
          />
          
          {isEditing ? (
            <View style={styles.editNameContainer}>
              <TextInput
                style={styles.nameInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter your name"
                placeholderTextColor={Colors.dark.subtext}
              />
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSaveProfile}
              >
                <Save size={20} color={Colors.dark.text} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.nameContainer}>
              <Text style={styles.nameText}>{user.username}</Text>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => setIsEditing(true)}
              >
                <Edit3 size={16} color={Colors.dark.text} />
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Trophy size={24} color={Colors.dark.warning} />
            <Text style={styles.statValue}>{highScore}</Text>
            <Text style={styles.statLabel}>High Score</Text>
          </View>
          
          <View style={styles.statCard}>
            <DollarSign size={24} color={Colors.dark.success} />
            <Text style={styles.statValue}>${totalWinnings}</Text>
            <Text style={styles.statLabel}>Winnings</Text>
          </View>
          
          <View style={styles.statCard}>
            <CheckCircle size={24} color={Colors.dark.success} />
            <Text style={styles.statValue}>{totalCorrect}</Text>
            <Text style={styles.statLabel}>Correct</Text>
          </View>
        </View>
        
        <View style={styles.detailedStatsContainer}>
          <Text style={styles.sectionTitle}>Detailed Stats</Text>
          
          <View style={styles.detailedStatRow}>
            <View style={styles.statIconContainer}>
              <Percent size={20} color={Colors.dark.primary} />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statName}>Accuracy</Text>
              <Text style={styles.statDescription}>
                Percentage of correct answers
              </Text>
            </View>
            <Text style={styles.statValueText}>{accuracy}%</Text>
          </View>
          
          <View style={styles.detailedStatRow}>
            <View style={styles.statIconContainer}>
              <Clock size={20} color={Colors.dark.secondary} />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statName}>Games Played</Text>
              <Text style={styles.statDescription}>
                Total number of games
              </Text>
            </View>
            <Text style={styles.statValueText}>{gamesPlayed}</Text>
          </View>
          
          <View style={styles.detailedStatRow}>
            <View style={styles.statIconContainer}>
              <Trophy size={20} color={Colors.dark.warning} />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statName}>Total Score</Text>
              <Text style={styles.statDescription}>
                Sum of all game scores
              </Text>
            </View>
            <Text style={styles.statValueText}>{totalScore}</Text>
          </View>
          
          <View style={styles.detailedStatRow}>
            <View style={styles.statIconContainer}>
              <XCircle size={20} color={Colors.dark.error} />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statName}>Incorrect</Text>
              <Text style={styles.statDescription}>
                Total incorrect answers
              </Text>
            </View>
            <Text style={styles.statValueText}>{totalQuestions - totalCorrect}</Text>
          </View>
        </View>
        
        <View style={styles.actionsContainer}>
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="outline"
            loading={isLoading}
            icon={<LogOut size={18} color={Colors.dark.primary} style={{ marginRight: 8 }} />}
            style={styles.logoutButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginLeft: 10,
  },
  profileCard: {
    alignItems: 'center',
    marginVertical: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: Colors.dark.primary,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  editButton: {
    marginLeft: 10,
    padding: 5,
  },
  editNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  nameInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 10,
    color: Colors.dark.text,
    width: 200,
  },
  saveButton: {
    marginLeft: 10,
    padding: 10,
    backgroundColor: Colors.dark.primary,
    borderRadius: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 15,
    width: '30%',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.dark.subtext,
  },
  detailedStatsContainer: {
    marginHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 15,
  },
  detailedStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  statInfo: {
    flex: 1,
  },
  statName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  statDescription: {
    fontSize: 12,
    color: Colors.dark.subtext,
  },
  statValueText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  actionsContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  logoutButton: {
    marginTop: 10,
  },
  notAuthenticatedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notAuthenticatedText: {
    fontSize: 18,
    color: Colors.dark.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  signInButton: {
    width: '80%',
  },
});