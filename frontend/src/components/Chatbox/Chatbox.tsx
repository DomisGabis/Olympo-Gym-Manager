import React, { useState, useEffect, useRef, type FormEvent } from 'react';
import styles from './Chatbox.module.css';
import { apiClient } from '../../services/apiClient'; // Dopasuj ścieżkę do swojego projektu

interface Message {
  id: string;
  relationId: string;
  senderId: string;
  content: string;
  createdAt: string | Date;
}

interface PaginationMeta {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

interface Props {
  receiverId: string;
  receiverName: string;
}

export function ChatBox({ receiverId, receiverName }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatPage, setChatPage] = useState<number>(1);
  const [hasMoreMessages, setHasMoreMessages] = useState<boolean>(false);
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [chatLoadingMore, setChatLoadingMore] = useState<boolean>(false);
  const [newMessage, setNewMessage] = useState<string>('');
  const [sendingMessage, setSendingMessage] = useState<boolean>(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const previousScrollHeightRef = useRef<number>(0);

  // Pierwsze, pełne załadowanie czatu dla nowego odbiorcy
  const fetchInitialMessages = async () => {
    try {
      setChatLoading(true);
      setChatPage(1);
      const response = await apiClient.get(`/messages/${receiverId}?page=1&limit=20`);
      // console.log(response.data);
      if (response.data.success) {
        const fetchedMessages = response.data.data;
        const meta: PaginationMeta = response.data.meta || { totalPages: 1, currentPage: 1 };
        
        setMessages(fetchedMessages);
        setHasMoreMessages(1 < meta.totalPages);

        // Zjazd na sam dół historii po załadowaniu
        setTimeout(() => {
          if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
          }
        }, 50);
      }
    } catch (err) {
      console.error('Błąd pobierania historii czatu:', err);
    } finally {
      setChatLoading(false);
    }
  };

  // Doładowywanie starszych wiadomości (Paginacja wsteczna)
  const fetchMoreMessages = async (pageToFetch: number) => {
    try {
      setChatLoadingMore(true);
      if (chatContainerRef.current) {
        previousScrollHeightRef.current = chatContainerRef.current.scrollHeight;
      }

      const response = await apiClient.get(`/messages/${receiverId}?page=${pageToFetch}&limit=20`);
      if (response.data.success) {
        const fetchedMessages = response.data.data;
        const meta: PaginationMeta = response.data.meta || { totalPages: 1, currentPage: 1 };

        setMessages((prev) => [...fetchedMessages, ...prev]);
        setHasMoreMessages(pageToFetch < meta.totalPages);
      }
    } catch (err) {
      console.error('Błąd podczas doładowywania wiadomości:', err);
    } finally {
      setChatLoadingMore(false);
    }
  };

  // Wywołaj pobieranie za każdym razem, gdy zmienia się rozmówca
  useEffect(() => {
    if (receiverId) {
      fetchInitialMessages();
    }
  }, [receiverId]);

  // Utrzymanie pozycji scrolla po wstrzyknięciu starszych wiadomości na górę
  useEffect(() => {
    if (chatLoadingMore === false && previousScrollHeightRef.current && chatContainerRef.current) {
      const currentHeight = chatContainerRef.current.scrollHeight;
      chatContainerRef.current.scrollTop = currentHeight - previousScrollHeightRef.current;
      previousScrollHeightRef.current = 0;
    }
  }, [messages, chatLoadingMore]);

  // Wykrywanie przewinięcia na samą górę w celu wyzwolenia kolejnej strony
  const handleChatScroll = () => {
    if (!chatContainerRef.current || chatLoadingMore || !hasMoreMessages) return;

    if (chatContainerRef.current.scrollTop === 0) {
      const nextPage = chatPage + 1;
      setChatPage(nextPage);
      fetchMoreMessages(nextPage);
    }
  };

  // Wysyłanie nowej wiadomości
  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sendingMessage) return;

    try {
      setSendingMessage(true);
      const response = await apiClient.post(`/messages`, {
        receiverId,
        content: newMessage.trim(),
      });

      if (response.data.success) {
        setMessages((prev) => [...prev, response.data.data]);
        setNewMessage('');

        // Płynny zjazd na dół po wysłaniu swojej wiadomości
        setTimeout(() => {
          if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({
              top: chatContainerRef.current.scrollHeight,
              behavior: 'smooth',
            });
          }
        }, 50);
      }
    } catch (err) {
      console.error('Nie udało się wysłać wiadomości:', err);
    } finally {
      setSendingMessage(false);
    }
  };

  const initials = receiverName
    .split(' ')
    .map((n) => n.charAt(0))
    .join('')
    .toUpperCase();

  return (
    <div className={styles.chatWindow}>
      {/* Nagłówek czatuboxa */}
      <div className={styles.chatHeader}>
        <div className={styles.chatHeaderAvatar}>{initials}</div>
        <div>
          <h3 className={styles.chatHeaderName}>{receiverName}</h3>
          <span className={styles.chatStatusIndicator}>Konwersacja</span>
        </div>
      </div>

      {/* Kontener wiadomości */}
      <div 
        className={styles.chatMessagesContainer} 
        ref={chatContainerRef}
        onScroll={handleChatScroll}
      >
        {chatLoadingMore && (
          <div className={styles.chatLoader}>Ładowanie starszych wiadomości...</div>
        )}

        {chatLoading ? (
          <div className={styles.chatLoader} style={{ margin: 'auto' }}>Wczytywanie rozmowy...</div>
        ) : messages.length === 0 ? (
          <div className={styles.chatEmptyState}>
            <p>Brak historii wiadomości.</p>
            <span>Napisz pierwszą wiadomość poniżej, aby rozpocząć konwersację.</span>
          </div>
        ) : (
          messages.map((msg) => {
            // Jeśli msg.senderId === receiverId -> wiadomość od trenera (lewa strona)
            // Jeśli msg.senderId !== receiverId -> Twoja wiadomość (prawa strona)
            const isIncoming = msg.senderId === receiverId;
            
            return (
              <div 
                key={msg.id} 
                className={`${styles.messageBubbleRow} ${isIncoming ? styles.incomingRow : styles.outgoingRow}`}
              >
                <div className={styles.messageBubble}>
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Panel dolny wpisywania tekstu */}
      <form onSubmit={handleSendMessage} className={styles.chatInputBar}>
        <input
          type="text"
          placeholder="Napisz wiadomość..."
          className={styles.chatInputField}
          value={newMessage}
          disabled={chatLoading}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button 
          type="submit" 
          className={styles.chatSendBtn}
          disabled={!newMessage.trim() || sendingMessage || chatLoading}
        >
          ➔
        </button>
      </form>
    </div>
  );
}