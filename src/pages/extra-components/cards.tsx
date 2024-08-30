import { Card, CardBody, CardHeader, CardFooter } from '@paljs/ui/Card';
import Row from '@paljs/ui/Row';
import Col from '@paljs/ui/Col';
import React, { useEffect, useState } from 'react';
import Layout from 'Layouts';
import axios from 'axios';
import router from 'next/router';
import jwtDecode from 'jwt-decode';
import { Button } from '@paljs/ui';

interface Chat {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

interface DecodedToken {
  uuid: string;
  roles: string[];
}

export default function ChatHistory() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isEmployee, setIsEmployee] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    const decodedToken: DecodedToken = jwtDecode(token);
    setIsEmployee(decodedToken.roles.includes('employee'));

    axios
      .get('http://localhost:3001/chat', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setChats(response.data);
      })
      .catch((error) => {
        console.error('Error fetching chat history:', error);
      });
  }, []);

  const handleAccessChat = (chatId: string) => {
    router.push(`/extra-components/chat?id=${chatId}`);
  };

  const handleCloseChat = async (chatId: string) => {
    try {
      await axios.post(
        `http://localhost:3001/chat/${chatId}/close`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        },
      );

      // Remove chat from the list
      setChats((prevChats) => prevChats.filter((chat) => chat.id !== chatId));

      // Optionally redirect or update the UI
      router.push('/chat');
    } catch (error) {
      console.error('Error closing chat:', error);
    }
  };

  return (
    <Layout title="Chat History">
      <Row>
        {Array.isArray(chats) && chats.length > 0 ? (
          chats.map((chat) => (
            <Col key={chat.id} breakPoint={{ xs: 12, md: 6 }}>
              <Card>
                <CardHeader>{chat.name}</CardHeader>
                <CardBody>
                  Última mensagem: {new Date(chat.createdAt).toDateString()} :{' '}
                  {new Date(chat.createdAt).toLocaleTimeString()}
                  <br />
                </CardBody>
                <CardFooter>
                  {isEmployee ? (
                    <>
                      <Button onClick={() => handleAccessChat(chat.id)}>Acessar Chat</Button>
                      <Button
                        onClick={() => handleCloseChat(chat.id)}
                        style={{ marginLeft: '10px', background: 'red', border: 'none' }}
                      >
                        Encerrar Chat
                      </Button>
                    </>
                  ) : chat.isActive ? (
                    <>
                      {' '}
                      <Button onClick={() => handleAccessChat(chat.id)}>Acessar Chat</Button>
                      <span>Chat aberto</span>
                    </>
                  ) : (
                    <span>Chat encerrado</span>
                  )}
                </CardFooter>
              </Card>
            </Col>
          ))
        ) : (
          <p>Não há chats disponíveis.</p>
        )}
      </Row>
    </Layout>
  );
}
