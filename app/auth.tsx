import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, User, ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import TextInput from '@/components/TextInput';
import { useAuthStore } from '@/store/auth-store';

export default function AuthScreen() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  
  // Form validation
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  
  const { login, register, isLoading, error, clearError } = useAuthStore();
  
  // Validate email
  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email');
      return false;
    }
    setEmailError('');
    return true;
  };
  
  // Validate password
  const validatePassword = () => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };
  
  // Validate username
  const validateUsername = () => {
    if (!isLogin && !username) {
      setUsernameError('Username is required');
      return false;
    }
    setUsernameError('');
    return true;
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    // Clear previous errors
    clearError();
    
    // Validate form
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    const isUsernameValid = validateUsername();
    
    if (!isEmailValid || !isPasswordValid || (!isLogin && !isUsernameValid)) {
      return;
    }
    
    try {
      if (isLogin) {
        await login({ email, password });
      } else {
        await register({ username, email, password });
      }
      
      // If successful, navigate to home
      router.replace('/');
    } catch (error) {
      // Error is handled by the store
      console.error('Auth error:', error);
    }
  };
  
  // Toggle between login and register
  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    clearError();
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={Colors.dark.text} />
          </TouchableOpacity>
          
          <View style={styles.header}>
            <Text style={styles.logoText}>HQ</Text>
            <Text style={styles.logoSubtext}>TRIVIA</Text>
          </View>
          
          <Text style={styles.title}>
            {isLogin ? 'Welcome Back!' : 'Create Account'}
          </Text>
          <Text style={styles.subtitle}>
            {isLogin 
              ? 'Sign in to continue to HQ Trivia' 
              : 'Join thousands of players in live trivia games'
            }
          </Text>
          
          <View style={styles.formContainer}>
            {!isLogin && (
              <TextInput
                label="Username"
                placeholder="Enter your username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                leftIcon={<User size={20} color={Colors.dark.subtext} />}
                error={usernameError}
              />
            )}
            
            <TextInput
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Mail size={20} color={Colors.dark.subtext} />}
              error={emailError}
            />
            
            <TextInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              leftIcon={<Lock size={20} color={Colors.dark.subtext} />}
              rightIcon={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword 
                    ? <EyeOff size={20} color={Colors.dark.subtext} /> 
                    : <Eye size={20} color={Colors.dark.subtext} />
                  }
                </TouchableOpacity>
              }
              error={passwordError}
            />
            
            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}
            
            <Button
              title={isLogin ? 'Sign In' : 'Create Account'}
              onPress={handleSubmit}
              variant="primary"
              loading={isLoading}
              style={styles.submitButton}
            />
            
            <TouchableOpacity 
              style={styles.toggleButton}
              onPress={toggleAuthMode}
            >
              <Text style={styles.toggleText}>
                {isLogin 
                  ? "Don't have an account? Sign Up" 
                  : "Already have an account? Sign In"
                }
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Demo credentials for testing */}
          {isLogin && (
            <View style={styles.demoCredentials}>
              <Text style={styles.demoTitle}>Demo Credentials</Text>
              <Text style={styles.demoText}>Email: demo@example.com</Text>
              <Text style={styles.demoText}>Password: password123</Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Background gradient */}
      <LinearGradient
        colors={[Colors.dark.primary, 'transparent']}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.dark.primary,
  },
  logoSubtext: {
    fontSize: 18,
    color: Colors.dark.text,
    letterSpacing: 4,
    marginTop: -10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark.subtext,
    marginBottom: 30,
  },
  formContainer: {
    width: '100%',
  },
  submitButton: {
    marginTop: 20,
  },
  toggleButton: {
    alignSelf: 'center',
    marginTop: 20,
    padding: 10,
  },
  toggleText: {
    color: Colors.dark.primary,
    fontSize: 14,
  },
  errorText: {
    color: Colors.dark.error,
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
    opacity: 0.2,
  },
  demoCredentials: {
    marginTop: 40,
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    alignItems: 'center',
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  demoText: {
    fontSize: 14,
    color: Colors.dark.subtext,
    marginBottom: 4,
  },
});