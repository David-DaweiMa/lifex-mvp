import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, Bot, User, Loader } from 'lucide-react-native';
import { darkTheme } from '../lib/theme';
import { chatService, Message } from '../lib/chatService';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  recommendations?: any[];
  followUpQuestions?: string[];
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "G'day! I'm LifeX, your AI companion for discovering amazing local services in New Zealand. What can I help you find today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const { user } = useAuth();

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = inputText.trim();
    setInputText('');
    setIsLoading(true);

    try {
      // 调用真实的AI服务
      const response = await chatService.sendMessage(messageText, user?.id);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.message,
        isUser: false,
        timestamp: new Date(),
        recommendations: response.recommendations,
        followUpQuestions: response.followUpQuestions,
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = (message: Message) => (
    <View
      key={message.id}
      style={[
        styles.messageContainer,
        message.isUser ? styles.userMessage : styles.aiMessage,
      ]}
    >
      <View style={styles.messageHeader}>
        {message.isUser ? (
          <User size={16} color={darkTheme.neon.purple} />
        ) : (
          <Bot size={16} color={darkTheme.neon.green} />
        )}
        <Text style={styles.messageSender}>
          {message.isUser ? 'You' : 'AI Assistant'}
        </Text>
        <Text style={styles.messageTime}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
      <Text style={[
        styles.messageText,
        message.isUser ? styles.userMessageText : styles.aiMessageText,
      ]}>
        {message.text}
      </Text>
    </View>
  );

  const renderLoadingIndicator = () => (
    <View style={[styles.messageContainer, styles.aiMessage]}>
      <View style={styles.messageHeader}>
        <Bot size={16} color={darkTheme.neon.green} />
        <Text style={styles.messageSender}>AI Assistant</Text>
      </View>
      <View style={styles.loadingContainer}>
        <Loader size={16} color={darkTheme.neon.green} />
        <Text style={styles.loadingText}>Thinking...</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Chat Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map(renderMessage)}
          {isLoading && renderLoadingIndicator()}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask me anything about places in NZ..."
            placeholderTextColor={darkTheme.text.muted}
            multiline
            maxLength={500}
            onSubmitEditing={handleSendMessage}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
            ]}
            onPress={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            <Send
              size={20}
              color={inputText.trim() && !isLoading ? darkTheme.text.primary : darkTheme.text.muted}
            />
          </TouchableOpacity>
        </View>
        
        {/* Quick Prompts */}
        <View style={styles.quickPromptsContainer}>
          <Text style={styles.quickPromptsTitle}>Quick Start</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickPromptsScroll}
          >
            {[
              "Where's the best flat white in Ponsonby?",
              "Kid-friendly restaurants with play areas",
              "Cheap eats under $15 near Queen Street",
              "24/7 plumber for blocked drains",
              "House cleaner for weekly visits",
              "Dog grooming with pickup service",
              "Indoor activities for rainy Auckland days",
              "Beginner-friendly hiking trails 1 hour from city",
              "Weekend markets with organic produce"
            ].map((prompt, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickPromptButton}
                onPress={() => {
                  setInputText(prompt);
                  setTimeout(() => {
                    handleSendMessage();
                  }, 100);
                }}
              >
                <Text style={styles.quickPromptText}>{prompt}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkTheme.background.primary,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: width * 0.8,
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  aiMessage: {
    alignSelf: 'flex-start',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  messageSender: {
    fontSize: 12,
    fontWeight: '600',
    color: darkTheme.text.secondary,
  },
  messageTime: {
    fontSize: 10,
    color: darkTheme.text.muted,
    marginLeft: 'auto',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    padding: 12,
    borderRadius: 16,
  },
  userMessageText: {
    color: darkTheme.text.primary,
    backgroundColor: darkTheme.neon.purple,
  },
  aiMessageText: {
    color: darkTheme.text.primary,
    backgroundColor: darkTheme.background.card,
    borderWidth: 1,
    borderColor: darkTheme.background.glass,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: darkTheme.background.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: darkTheme.background.glass,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: darkTheme.text.secondary,
    fontStyle: 'italic',
  },
  inputContainer: {
    padding: 16,
    paddingTop: 8,
    backgroundColor: darkTheme.background.card,
    borderTopWidth: 1,
    borderTopColor: darkTheme.background.glass,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: darkTheme.background.secondary,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: darkTheme.background.glass,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: darkTheme.text.primary,
    maxHeight: 100,
    minHeight: 40,
    textAlignVertical: 'top',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: darkTheme.neon.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: darkTheme.background.glass,
  },
  quickPromptsContainer: {
    marginTop: 12,
  },
  quickPromptsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: darkTheme.text.primary,
    marginBottom: 8,
  },
  quickPromptsScroll: {
    paddingHorizontal: 4,
    gap: 8,
  },
  quickPromptButton: {
    backgroundColor: darkTheme.background.card,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: darkTheme.background.glass,
  },
  quickPromptText: {
    fontSize: 12,
    color: darkTheme.text.primary,
    fontWeight: '500',
  },
});
