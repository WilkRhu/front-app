import io from 'socket.io-client';

const socket = io('http://localhost:3002');

socket.on('connect', () => {
  console.log('Conectado ao servidor');
});

socket.on('disconnect', () => {
  console.log('Desconectado do servidor');
});

export default socket;
