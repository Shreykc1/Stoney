import { socket } from '@/services/socketService';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";

const Game = () => {
    const { roomId } = useParams();
    const [gameState, setGameState] = useState({
        players: [],
        currentPlayer: '',
        opponentPlayer: '',
        playerChoice: '',
        opponentChoice: '',
        result: '',
        gameStarted: false,
        waitingForOpponent: true,
        roundComplete: false
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Listen for a second player joining
        socket.on('player_joined', (data) => {
            setMessage(`Player joined the room: ${data}`);
            setGameState(prev => ({
                ...prev,
                waitingForOpponent: false,
                gameStarted: true
            }));
        });

        // Listen for game updates
        socket.on('game_update', (data) => {
            setGameState(prev => ({
                ...prev,
                players: data.players,
                currentPlayer: data.currentPlayer,
                opponentPlayer: data.opponentPlayer
            }));
        });

        // Listen for opponent's choice
        socket.on('opponent_choice', (data) => {
            setGameState(prev => ({
                ...prev,
                opponentChoice: data.choice,
                roundComplete: true
            }));
            determineWinner(gameState.playerChoice, data.choice);
        });

        // Listen for game results
        socket.on('game_result', (data) => {
            setGameState(prev => ({
                ...prev,
                result: data.result
            }));
        });

        // Notify server that player has joined the game room
        socket.emit('join_game_room', { roomId });

        return () => {
            socket.off('player_joined');
            socket.off('game_update');
            socket.off('opponent_choice');
            socket.off('game_result');
        };
    }, [roomId]);

    // Function to determine the winner
    const determineWinner = (playerChoice, opponentChoice) => {
        if (playerChoice === opponentChoice) {
            setGameState(prev => ({ ...prev, result: 'Draw!' }));
        } else if (
            (playerChoice === 'rock' && opponentChoice === 'scissors') ||
            (playerChoice === 'paper' && opponentChoice === 'rock') ||
            (playerChoice === 'scissors' && opponentChoice === 'paper')
        ) {
            setGameState(prev => ({ ...prev, result: 'You Win!' }));
        } else {
            setGameState(prev => ({ ...prev, result: 'You Lose!' }));
        }
    };

    // Function to handle player's choice
    const handleChoice = (choice) => {
        setGameState(prev => ({
            ...prev,
            playerChoice: choice
        }));

        // Send player's choice to the server
        socket.emit('player_choice', {
            roomId,
            choice
        });
    };

    // Function to start a new round
    const startNewRound = () => {
        setGameState(prev => ({
            ...prev,
            playerChoice: '',
            opponentChoice: '',
            result: '',
            roundComplete: false
        }));
        socket.emit('new_round', { roomId });
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-yellow-300 to-yellow-400 flex flex-col items-center p-4 sm:p-6 md:p-10">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-800 text-center">Stone Paper Scissors</h1>
            <h2 className="text-xl sm:text-2xl mb-6 text-gray-700 text-center">Room: {roomId}</h2>

            {gameState.waitingForOpponent ? (
                <div className="w-full max-w-md mx-auto text-xl mt-8 p-6 bg-white/90 backdrop-blur rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl">
                    <p className="text-gray-800">Waiting for an opponent to join...</p>
                    <p className="mt-4 text-gray-700">Share this room ID with a friend: <strong className="text-gray-900 select-all">{roomId}</strong></p>
                </div>
            ) : (
                <div className="w-full max-w-4xl mx-auto px-4">
                    {message && <p className="text-green-700 mb-4 text-center bg-green-100 py-2 px-4 rounded-lg">{message}</p>}

                    {!gameState.roundComplete ? (
                        <div className="mt-6 sm:mt-8">
                            <h3 className="text-xl text-center mb-6 text-gray-800">Make your choice:</h3>
                            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
                                <Button
                                    onClick={() => handleChoice('rock')}
                                    className="bg-gray-800 text-yellow-300 text-lg sm:text-xl p-4 sm:p-6 rounded-xl hover:bg-gray-700 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg w-full sm:w-auto"
                                >
                                    Rock ✊
                                </Button>
                                <Button
                                    onClick={() => handleChoice('paper')}
                                    className="bg-gray-800 text-yellow-300 text-lg sm:text-xl p-4 sm:p-6 rounded-xl hover:bg-gray-700 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg w-full sm:w-auto"
                                >
                                    Paper ✋
                                </Button>
                                <Button
                                    onClick={() => handleChoice('scissors')}
                                    className="bg-gray-800 text-yellow-300 text-lg sm:text-xl p-4 sm:p-6 rounded-xl hover:bg-gray-700 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg w-full sm:w-auto"
                                >
                                    Scissors ✌️
                                </Button>
                            </div>

                            {gameState.playerChoice && (
                                <div className="mt-6 text-center bg-white/90 backdrop-blur p-4 rounded-xl shadow-md">
                                    <p className="text-xl text-gray-800">You chose: <strong className="text-2xl">{gameState.playerChoice}</strong></p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="mt-8 p-6 bg-white/90 backdrop-blur rounded-xl shadow-lg">
                            <h3 className="text-2xl sm:text-3xl text-center mb-6 text-gray-800 font-semibold">Round Complete!</h3>
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-8">
                                <div className="text-center w-full sm:w-1/3">
                                    <p className="text-lg text-gray-700">Your choice:</p>
                                    <p className="text-4xl sm:text-5xl mt-3">
                                        {gameState.playerChoice === 'rock' && '✊'}
                                        {gameState.playerChoice === 'paper' && '✋'}
                                        {gameState.playerChoice === 'scissors' && '✌️'}
                                    </p>
                                </div>
                                <div className="text-3xl sm:text-4xl font-bold text-gray-700">VS</div>
                                <div className="text-center w-full sm:w-1/3">
                                    <p className="text-lg text-gray-700">Opponent's choice:</p>
                                    <p className="text-4xl sm:text-5xl mt-3">
                                        {gameState.opponentChoice === 'rock' && '✊'}
                                        {gameState.opponentChoice === 'paper' && '✋'}
                                        {gameState.opponentChoice === 'scissors' && '✌️'}
                                    </p>
                                </div>
                            </div>

                            <div className="text-center">
                                <h4 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-800">{gameState.result}</h4>
                                <Button
                                    onClick={startNewRound}
                                    className="bg-gray-800 text-yellow-300 text-xl p-4 rounded-xl hover:bg-gray-700 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
                                >
                                    Play Again
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Game;
