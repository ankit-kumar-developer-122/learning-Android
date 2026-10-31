import { useState, useEffect, useRef } from 'react'
import { chatbotAPI } from '../services/api'
import '../styles/ChatbotPage.css'

function ChatbotPage() {
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [conversationId, setConversationId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [language, setLanguage] = useState('en')
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)

  useEffect(() => {
    startNewConversation()
    initializeSpeechRecognition()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const startNewConversation = async () => {
    try {
      const response = await chatbotAPI.startConversation(language)
      setConversationId(response.conversationId)
      setMessages([
        {
          id: Date.now(),
          text: response.greeting || 'Hello! I am your AI health assistant. How can I help you today?',
          sender: 'bot',
          timestamp: new Date().toISOString()
        }
      ])
    } catch (error) {
      console.error('Error starting conversation:', error)
    }
  }

  const initializeSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US'

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setInputText(transcript)
        setIsListening(false)
      }

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
    }
  }

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : 'en-US'
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const handleSendMessage = async () => {
    if (!inputText.trim() || loading) return

    const userMessage = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setLoading(true)

    try {
      const response = await chatbotAPI.sendMessage(inputText, language, conversationId)
      
      const botMessage = {
        id: Date.now() + 1,
        text: response.reply,
        sender: 'bot',
        timestamp: new Date().toISOString(),
        suggestions: response.suggestions
      }

      setMessages(prev => [...prev, botMessage])
      
      if (response.conversationId) {
        setConversationId(response.conversationId)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Sorry, I am having trouble responding right now. Please try again.',
        sender: 'bot',
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSuggestionClick = (suggestion) => {
    setInputText(suggestion)
  }

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage)
    startNewConversation()
    if (recognitionRef.current) {
      recognitionRef.current.lang = newLanguage === 'hi' ? 'hi-IN' : 'en-US'
    }
  }

  const getGreeting = () => {
    if (language === 'hi') {
      return 'नमस्ते! मैं आपका एआई स्वास्थ्य सहायक हूं।'
    }
    return 'Hello! I am your AI health assistant.'
  }

  return (
    <div className="chatbot-page">
      <div className="chatbot-container">
        <div className="chatbot-header">
          <div>
            <h1>💬 AI Health Assistant</h1>
            <p>Symptom checker & health advice</p>
          </div>
          <div className="language-selector">
            <button
              className={`lang-btn ${language === 'en' ? 'active' : ''}`}
              onClick={() => handleLanguageChange('en')}
            >
              English
            </button>
            <button
              className={`lang-btn ${language === 'hi' ? 'active' : ''}`}
              onClick={() => handleLanguageChange('hi')}
            >
              हिंदी
            </button>
          </div>
        </div>

        <div className="messages-container">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.sender}`}>
              <div className="message-bubble">
                <p>{message.text}</p>
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="suggestions">
                    {message.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        className="suggestion-chip"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <span className="message-time">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
          {loading && (
            <div className="message bot">
              <div className="message-bubble typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-container">
          <div className="quick-actions">
            <button
              className="quick-action-btn"
              onClick={() => setInputText('I have a fever')}
            >
              🤒 {language === 'hi' ? 'बुखार' : 'Fever'}
            </button>
            <button
              className="quick-action-btn"
              onClick={() => setInputText('I have a cough')}
            >
              😷 {language === 'hi' ? 'खांसी' : 'Cough'}
            </button>
            <button
              className="quick-action-btn"
              onClick={() => setInputText('I have a headache')}
            >
              🤕 {language === 'hi' ? 'सिरदर्द' : 'Headache'}
            </button>
          </div>

          <div className="input-box">
            <button
              className={`voice-btn ${isListening ? 'listening' : ''}`}
              onClick={toggleListening}
              title="Voice input"
            >
              {isListening ? '🔴' : '🎤'}
            </button>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                language === 'hi'
                  ? 'अपने लक्षण बताएं...'
                  : 'Describe your symptoms...'
              }
              rows="2"
              disabled={loading}
            />
            <button
              className="send-btn"
              onClick={handleSendMessage}
              disabled={!inputText.trim() || loading}
            >
              ➤
            </button>
          </div>
        </div>

        <div className="chatbot-footer">
          <p>
            ⚠️ {language === 'hi' 
              ? 'यह केवल सूचना के लिए है। आपातकालीन स्थिति में डॉक्टर से संपर्क करें।'
              : 'For informational purposes only. Consult a doctor in emergency.'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default ChatbotPage
