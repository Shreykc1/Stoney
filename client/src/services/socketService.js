import { io } from 'socket.io-client';

const SOCKET_URL = 'https://stoney.onrender.com';

export const socket = io(SOCKET_URL);

export const connectSocket = () => {
    socket.on('connect', () => {
        console.log('Connected to server with ID:', socket.id);
    });

    socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
    });
};


export const createRoom = (values) => {
    socket.emit('create_room', values);

    socket.on('room_created', (roomId) => {
        console.log('Room created with ID:', roomId);
    });
};

export const joinRoom = (values) => {
    socket.emit('join_room', values);

    socket.on('player_joined', (roomId) => {
        console.log('Joined room, player ID:', roomId);
        if (roomId) return roomId;
        return false;
    });
};
