const createGame = (req, res) => {
    try {
        const { username, password } = req.body;
        
        res.status(201).json({ message: "Game created successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const joinGame = (req, res) => {
    try {
        // Game joining logic will go here
        res.status(200).json({ message: "Joined game successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createGame,
    joinGame
};
