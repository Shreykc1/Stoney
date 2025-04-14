const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const gameRoutes = require('./routes/gameRoutes');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/game', gameRoutes);

// Basic Express route
app.get('/', (req, res) => {
    res.send('Server is running');
});


// Store game rooms and their states
const gameRooms = {};

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('create_room', (data) => {
        console.log('create_room', data);
        const userId = socket.id;
        const username = data.username;
        const password = data.password;
        const roomId = `${username}-${password}`;

        // Initialize game room
        gameRooms[roomId] = {
            players: [{
                id: socket.id,
                username: username,
                choice: ''
            }],
            currentRound: 1
        };

        socket.join(roomId);
        io.to(socket.id).emit('room_created', roomId);
    });

    socket.on('join_room', (data) => {
        const { username, password } = data;
        const roomId = `${username}-${password}`;

        // Check if room exists
        if (gameRooms[roomId]) {
            // Add player to the room
            gameRooms[roomId].players.push({
                id: socket.id,
                username: username,
                choice: ''
            });

            socket.join(roomId);

            // Notify all players in the room
            io.to(roomId).emit('player_joined', roomId);

            // Send game update to all players
            io.to(roomId).emit('game_update', {
                players: gameRooms[roomId].players.map(p => ({ id: p.id, username: p.username })),
                currentRound: gameRooms[roomId].currentRound
            });
        } else {
            // Room doesn't exist
            io.to(socket.id).emit('error', { message: 'Room not found' });
        }
    });

    // Handle player joining a game room
    socket.on('join_game_room', (data) => {
        const { roomId } = data;
        if (gameRooms[roomId]) {
            // Player is already in the room from create_room or join_room
            // Just send the current game state
            io.to(socket.id).emit('game_update', {
                players: gameRooms[roomId].players.map(p => ({ id: p.id, username: p.username })),
                currentRound: gameRooms[roomId].currentRound
            });
        }
    });

    // Handle player choice
    socket.on('player_choice', (data) => {
        const { roomId, choice } = data;

        if (gameRooms[roomId]) {
            // Update player's choice
            const playerIndex = gameRooms[roomId].players.findIndex(p => p.id === socket.id);
            if (playerIndex !== -1) {
                gameRooms[roomId].players[playerIndex].choice = choice;

                // Check if all players have made their choices
                const allPlayersChosen = gameRooms[roomId].players.every(p => p.choice !== '');

                if (allPlayersChosen && gameRooms[roomId].players.length > 1) {
                    // Determine the winner
                    const player1 = gameRooms[roomId].players[0];
                    const player2 = gameRooms[roomId].players[1];

                    let result;
                    if (player1.choice === player2.choice) {
                        result = 'draw';
                    } else if (
                        (player1.choice === 'rock' && player2.choice === 'scissors') ||
                        (player1.choice === 'paper' && player2.choice === 'rock') ||
                        (player1.choice === 'scissors' && player2.choice === 'paper')
                    ) {
                        result = player1.id;
                    } else {
                        result = player2.id;
                    }

                    // Send the result to all players
                    io.to(roomId).emit('game_result', { result });

                    // Send opponent's choice to each player
                    io.to(player1.id).emit('opponent_choice', { choice: player2.choice });
                    io.to(player2.id).emit('opponent_choice', { choice: player1.choice });
                }
            }
        }
    });

    // Handle new round
    socket.on('new_round', (data) => {
        const { roomId } = data;

        if (gameRooms[roomId]) {
            // Reset player choices
            gameRooms[roomId].players.forEach(p => p.choice = '');
            gameRooms[roomId].currentRound++;

            // Notify all players
            io.to(roomId).emit('new_round', {
                currentRound: gameRooms[roomId].currentRound
            });
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);

        // Remove player from all game rooms
        Object.keys(gameRooms).forEach(roomId => {
            const playerIndex = gameRooms[roomId].players.findIndex(p => p.id === socket.id);
            if (playerIndex !== -1) {
                gameRooms[roomId].players.splice(playerIndex, 1);

                // If no players left, remove the room
                if (gameRooms[roomId].players.length === 0) {
                    delete gameRooms[roomId];
                } else {
                    // Notify remaining players
                    io.to(roomId).emit('player_left', { playerId: socket.id });
                }
            }
        });
    });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
