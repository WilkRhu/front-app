import React, { useEffect, useRef, useState } from 'react';
import jwtDecode from 'jwt-decode';
import { Chat, ChatForm, AttachedFile } from '@paljs/ui/Chat';
import Row from '@paljs/ui/Row';
import Col from '@paljs/ui/Col';
import Layout from 'Layouts';
import router from 'next/router';
import socket from '../../utils/socket';
import axios from 'axios';

interface DecodedToken {
  uuid: string;
  roles: string[];
}

interface MessageProps {
  message: string;
  date: string;
  reply: boolean;
  sender: string;
  senderName: string;
}

interface ChatInfo {
  id: string;
  name: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const [replyToMessageId, setReplyToMessageId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [chats, setChats] = useState<ChatInfo[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [isEmployee, setIsEmployee] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    try {
      const decodedToken: DecodedToken = jwtDecode(token);
      setUserId(decodedToken.uuid);
      setIsEmployee(decodedToken.roles.includes('employee'));

      const chatIdFromUrl = typeof router.query.id === 'string' ? router.query.id : null;
      if (chatIdFromUrl) {
        setChatId(chatIdFromUrl);
        setSelectedChat(chatIdFromUrl);
      }

      axios
        .get(`http://localhost:3001/users/${decodedToken.uuid}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          setUserName(response.data.name);
        })
        .catch((error) => {
          console.error('Error fetching user data:', error);
          router.push('/auth/login');
        });

      if (isEmployee) {
        axios
          .get(`http://localhost:3001/chat`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then((response) => {
            setChats(response.data);
            if (chatIdFromUrl) {
              setSelectedChat(chatIdFromUrl);
            } else if (response.data.length > 0) {
              setSelectedChat(response.data[0].id);
            }
          })
          .catch((error) => {
            console.error('Error fetching active chats:', error);
          });
      }

      return () => {
        socket.off('message');
        socket.off('chatJoined');
      };
    } catch (error) {
      console.error('Token decoding error:', error);
      router.push('/auth/login');
    }
  }, [router, userId, isEmployee]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (selectedChat) {
      axios
        .get(`http://localhost:3001/message?chatId=${selectedChat}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })
        .then((response) => {
          const fetchedMessages: MessageProps[] = response.data.map((msg: any) => ({
            message: msg.content,
            date: new Date(msg.createdAt).toLocaleTimeString(),
            sender: msg.senderId,
            senderName: msg.senderName,
          }));
          console.log(fetchedMessages, 'teste', messages);
          setMessages(fetchedMessages);
        })
        .catch((error) => {
          console.error('Error fetching chat messages:', error);
        });
    }
  }, [selectedChat]);

  useEffect(() => {
    if (selectedChat) {
      socket.emit('joinChat', selectedChat);
    }
  }, [selectedChat]);

  const onSendHandle = (v: { message: string; files: AttachedFile[] }) => {
    if (!userId) return;

    const files = v.files
      ? v.files.map((file) => ({
          url: file.src as string,
          type: file.type,
          icon: 'document',
        }))
      : [];

    const payload = {
      content: v.message,
      senderId: userId,
      senderName: userName,
      chatId: selectedChat,
      files,
      chatName: `ChatUser_${userId}`,
    };

    socket.emit('message', payload);

    setReplyToMessageId(null);
  };

  useEffect(() => {
    socket.on('message', (payload: any) => {
      const newMessage: MessageProps = {
        message: payload.content,
        date: new Date().toLocaleTimeString(),
        reply: payload.replyToMessageId !== null && payload.replyToMessageId !== userId,
        sender: payload.senderId,
        senderName: payload.senderName,
      };

      setMessages((prevMessages) => {
        const messageExists = prevMessages.some(
          (msg) => msg.date === newMessage.date && msg.sender === newMessage.sender,
        );
        if (!messageExists) {
          return [...prevMessages, newMessage];
        }
        return prevMessages;
      });

      if (payload.chatId) {
        setChatId(payload.chatId);
        if (!selectedChat) {
          setSelectedChat(payload.chatId);
        }
      }
    });

    return () => {
      socket.off('message');
    };
  }, [selectedChat, userId]);

  return (
    <Layout title="Chat">
      <Row>
        <Col breakPoint={{ xs: 12, md: 12 }} style={{ marginBottom: '1rem' }}>
          {isEmployee && (
            <div>
              <h2>Chat Open</h2>
            </div>
          )}
          <Chat title="OAH Technology">
            <div
              style={{
                height: '400px',
                overflowY: 'auto',
                padding: '1rem',
                border: '1px solid #ccc',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {messages.map((message, index) => {
                const isUserMessage = message.sender === userId;
                return (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      justifyContent: isUserMessage ? 'flex-end' : 'flex-start',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <div
                      style={{
                        padding: '10px',
                        borderRadius: '5px',
                        backgroundColor: isUserMessage ? '#e1ffc7' : '#f1f0f0',
                        display: 'inline-block',
                        maxWidth: '70%',
                      }}
                    >
                      <div style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>
                        {message.senderName} <i style={{ color: 'gray' }}>{message.date}</i>
                      </div>
                      <div style={{ marginTop: '0.25rem', fontSize: '18px' }}>{message.message}</div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            <ChatForm onSend={onSendHandle} dropFiles filesIcon="document" />
          </Chat>
        </Col>
      </Row>
    </Layout>
  );
}
