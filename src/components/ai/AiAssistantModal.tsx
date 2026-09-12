import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../../theme';
import { voiceService } from '../../services/voiceService';
import {
  aiService,
  AssistantContext,
  AssistantResponse,
} from '../../services/aiService';
import { BalajiNamam } from '../ui';
import { Member, CommunityFunction } from '../../types';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
  action?: AssistantResponse;
}

interface AiAssistantModalProps {
  visible: boolean;
  onClose: () => void;
  context: AssistantContext;
}

export function AiAssistantModal({ visible, onClose, context }: AiAssistantModalProps) {
  const { colors, spacing, borderRadius, fontSize, fontWeight, shadow } = useTheme();

  const [inputCommand, setInputCommand] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTtsEnabled, setIsTtsEnabled] = useState(true);

  const scrollViewRef = useRef<ScrollView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse effect when listening
  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening]);

  // Initial welcome message
  useEffect(() => {
    if (visible && messages.length === 0) {
      const activeName = context.activeFunction?.name || 'Community';
      setMessages([
        {
          id: 'welcome-1',
          sender: 'assistant',
          text: `Govinda Govinda! 🙏 I am your Namo Community Assistant for ${activeName}.\n\nYou can speak or type to:\n• Record expenses (e.g. "Spent 1500 for flowers cash")\n• Record income (e.g. "Received 5000 donation via UPI")\n• Add members (e.g. "Add member Suresh 9845012345")\n• Check balances (e.g. "What is our balance?")`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [visible, context.activeFunction]);

  // Scroll to bottom when messages update
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, isProcessing]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend ?? inputCommand).trim();
    if (!text) return;

    // Stop listening if active
    if (isListening) {
      voiceService.stopListening();
      setIsListening(false);
    }

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputCommand('');
    setIsProcessing(true);

    try {
      const response = await aiService.processAssistantCommand(text, context);

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: response.text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: response.actionType !== 'query' ? response : undefined,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Read aloud if enabled
      if (isTtsEnabled) {
        voiceService.speak(response.text);
      }
    } catch (e) {
      console.warn('AI Assistant error:', e);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: 'Sorry, I encountered an issue processing that request. Please try again.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const startVoiceInput = () => {
    setIsListening(true);
    voiceService.startListening({
      onStart: () => setIsListening(true),
      onResult: (transcript, isFinal) => {
        setInputCommand(transcript);
        if (isFinal && transcript.trim().length > 3) {
          voiceService.stopListening();
          setIsListening(false);
          handleSend(transcript);
        }
      },
      onError: (err) => {
        console.warn('Voice error:', err);
        setIsListening(false);
      },
      onEnd: () => {
        setIsListening(false);
      },
    });
  };

  const stopVoiceInput = () => {
    voiceService.stopListening();
    setIsListening(false);
  };

  const handleToggleListening = () => {
    if (isListening) {
      stopVoiceInput();
      if (inputCommand.trim()) {
        handleSend();
      }
    } else {
      startVoiceInput();
    }
  };

  const handleExecuteAction = (action?: AssistantResponse) => {
    if (!action || !action.route) return;
    onClose();

    // Navigate with query params
    const query = new URLSearchParams(action.routeParams || {}).toString();
    const targetUrl = query ? `${action.route}?${query}` : action.route;
    router.push(targetUrl as any);
  };

  const quickPrompts = [
    'What is our financial balance?',
    'Total expenses so far',
    'Spent ₹1,500 for flowers cash',
    'Received ₹5,000 contribution UPI',
    'Add new member',
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}
      >
        <View
          style={[
            styles.container,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          {/* Header */}
          <View
            style={[
              styles.header,
              {
                backgroundColor: colors.surface,
                borderBottomColor: colors.border,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <View
                style={{
                  padding: 4,
                  backgroundColor: colors.primary,
                  borderRadius: 10,
                }}
              >
                <BalajiNamam size={20} variant="colored" />
              </View>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ color: colors.textPrimary, fontSize: fontSize.md, fontWeight: fontWeight.bold }}>
                    Namo AI Assistant
                  </Text>
                  <View style={[styles.aiBadge, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }]}>
                    <Ionicons name="sparkles" size={10} color="#D97706" />
                    <Text style={{ fontSize: 9, color: '#B45309', fontWeight: 'bold' }}>AI</Text>
                  </View>
                </View>
                <Text style={{ color: colors.textSecondary, fontSize: 10 }}>
                  Voice & Financial Assistant • நமோ உதவியாளர்
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              {/* TTS Audio Toggle */}
              <TouchableOpacity
                onPress={() => {
                  const next = !isTtsEnabled;
                  setIsTtsEnabled(next);
                  if (!next) voiceService.stopSpeaking();
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={[
                  styles.headerBtn,
                  {
                    backgroundColor: isTtsEnabled ? colors.primary + '18' : colors.surfaceVariant || '#F1F5F9',
                  },
                ]}
              >
                <Ionicons
                  name={isTtsEnabled ? 'volume-high' : 'volume-mute'}
                  size={18}
                  color={isTtsEnabled ? colors.primary : colors.textTertiary}
                />
              </TouchableOpacity>

              {/* Close Button */}
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Chat Messages */}
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={{ padding: spacing.md, gap: spacing.md }}
            style={{ flex: 1 }}
          >
            {messages.map((msg) => {
              const isAssistant = msg.sender === 'assistant';
              return (
                <View
                  key={msg.id}
                  style={[
                    styles.messageRow,
                    isAssistant ? styles.messageRowAssistant : styles.messageRowUser,
                  ]}
                >
                  {isAssistant && (
                    <View
                      style={[
                        styles.avatar,
                        {
                          backgroundColor: colors.primary,
                        },
                      ]}
                    >
                      <BalajiNamam size={14} variant="colored" />
                    </View>
                  )}

                  <View
                    style={[
                      styles.bubble,
                      isAssistant
                        ? [
                            styles.bubbleAssistant,
                            {
                              backgroundColor: colors.surfaceVariant || '#F8FAFC',
                              borderColor: colors.border,
                            },
                          ]
                        : [
                            styles.bubbleUser,
                            {
                              backgroundColor: colors.primary,
                            },
                          ],
                    ]}
                  >
                    <Text
                      style={{
                        color: isAssistant ? colors.textPrimary : '#FFFFFF',
                        fontSize: fontSize.sm,
                        lineHeight: 20,
                      }}
                    >
                      {msg.text}
                    </Text>

                    {/* Interactive Action Card if Assistant prepared a transaction */}
                    {msg.action && (
                      <View
                        style={[
                          styles.actionCard,
                          {
                            backgroundColor: colors.surface,
                            borderColor: colors.primary + '40',
                            borderRadius: borderRadius.md,
                          },
                        ]}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <Ionicons
                            name={
                              msg.action.actionType === 'create_expense'
                                ? 'trending-down'
                                : msg.action.actionType === 'create_income'
                                ? 'trending-up'
                                : 'person-add'
                            }
                            size={16}
                            color={colors.primary}
                          />
                          <Text
                            style={{
                              color: colors.primary,
                              fontSize: 11,
                              fontWeight: fontWeight.bold,
                              textTransform: 'uppercase',
                            }}
                          >
                            Ready to Confirm
                          </Text>
                        </View>

                        <TouchableOpacity
                          onPress={() => handleExecuteAction(msg.action)}
                          activeOpacity={0.8}
                          style={[
                            styles.actionBtn,
                            {
                              backgroundColor: colors.primary,
                              borderRadius: borderRadius.md,
                            },
                          ]}
                        >
                          <Ionicons name="open-outline" size={16} color="#FFFFFF" />
                          <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: fontWeight.bold }}>
                            {msg.action.actionLabel || 'Review & Submit'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    <Text
                      style={{
                        color: isAssistant ? colors.textTertiary : 'rgba(255, 255, 255, 0.7)',
                        fontSize: 9,
                        marginTop: 4,
                        alignSelf: isAssistant ? 'flex-start' : 'flex-end',
                      }}
                    >
                      {msg.time}
                    </Text>
                  </View>
                </View>
              );
            })}

            {isProcessing && (
              <View style={[styles.messageRow, styles.messageRowAssistant]}>
                <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                  <BalajiNamam size={14} variant="colored" />
                </View>
                <View
                  style={[
                    styles.bubble,
                    styles.bubbleAssistant,
                    { backgroundColor: colors.surfaceVariant || '#F8FAFC', borderColor: colors.border },
                  ]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={{ color: colors.textSecondary, fontSize: fontSize.xs }}>Thinking...</Text>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Quick Prompts Bar */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: spacing.md, gap: 6, paddingBottom: 6 }}
          >
            {quickPrompts.map((q, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => handleSend(q)}
                style={[
                  styles.quickPromptChip,
                  {
                    backgroundColor: colors.surfaceVariant || '#F1F5F9',
                    borderColor: colors.border,
                    borderRadius: borderRadius.full,
                  },
                ]}
              >
                <Text style={{ color: colors.textSecondary, fontSize: 11 }}>{q}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Bottom Input Section */}
          <View style={[styles.inputBar, { borderTopColor: colors.border }]}>
            {/* Pulsing Mic Button */}
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity
                onPress={handleToggleListening}
                activeOpacity={0.8}
                style={[
                  styles.micBtn,
                  {
                    backgroundColor: isListening ? '#EF4444' : colors.primary,
                  },
                ]}
              >
                <Ionicons name={isListening ? 'stop' : 'mic'} size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </Animated.View>

            <TextInput
              value={inputCommand}
              onChangeText={setInputCommand}
              placeholder={isListening ? 'Listening to voice...' : 'Ask or speak a command...'}
              placeholderTextColor={colors.textTertiary}
              returnKeyType="send"
              onSubmitEditing={() => handleSend()}
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.background,
                  borderColor: isListening ? '#EF4444' : colors.border,
                  color: colors.textPrimary,
                  borderRadius: borderRadius.full,
                },
              ]}
            />

            <TouchableOpacity
              onPress={() => handleSend()}
              disabled={!inputCommand.trim()}
              style={[
                styles.sendBtn,
                {
                  backgroundColor: inputCommand.trim() ? colors.primary : colors.border,
                  borderRadius: borderRadius.full,
                },
              ]}
            >
              <Ionicons name="arrow-up" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  container: {
    width: '100%',
    maxWidth: 580,
    height: '88%',
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 8,
    borderWidth: 0.5,
  },
  headerBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginVertical: 2,
  },
  messageRowAssistant: {
    justifyContent: 'flex-start',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  bubble: {
    maxWidth: '82%',
    padding: 12,
    borderRadius: 16,
  },
  bubbleAssistant: {
    borderTopLeftRadius: 4,
    borderWidth: 1,
  },
  bubbleUser: {
    borderTopRightRadius: 4,
  },
  actionCard: {
    marginTop: 8,
    padding: 10,
    borderWidth: 1,
    gap: 6,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  quickPromptChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderTopWidth: 1,
  },
  micBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
  },
  sendBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
