import React, { Component, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  errorId: string;
}

function generateErrorId(): string {
  return `ERR-${Date.now().toString(36).toUpperCase()}`;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorId: '' };
  }

  static getDerivedStateFromError(): State {
    return {
      hasError: true,
      errorId: generateErrorId(),
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error without exposing secrets or stack traces to users
    console.error('[ErrorBoundary] Unhandled error:', error.message);
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
    // TODO: In production, send to crash reporting service (e.g., Sentry)
  }

  handleReload = (): void => {
    this.setState({ hasError: false, errorId: '' });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.card}>
            {/* Error Icon */}
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>⚠️</Text>
            </View>

            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.subtitle}>ஏதோ தவறு நடந்தது</Text>

            <Text style={styles.message}>
              {this.props.fallbackMessage ||
                'The application encountered an unexpected error. Your data is safe. Please try reloading.'}
            </Text>

            {/* Reference ID — safe to show, no sensitive info */}
            <Text style={styles.errorId}>Reference: {this.state.errorId}</Text>

            <TouchableOpacity style={styles.button} onPress={this.handleReload}>
              <Text style={styles.buttonText}>Try Again / மீண்டும் முயற்சிக்கவும்</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    minHeight: '100%',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconText: {
    fontSize: 36,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  errorId: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 24,
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: '#E65100',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
