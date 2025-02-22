const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const port = process.env.PORT || 3000;

app.use(cors());

// The rest of your server code...


let gameRooms = {};

const disneyMovies = [
    "The Lion King",
    "Beauty and the Beast",
    "Aladdin",
    "The Little Mermaid",
    "Moana",
    "Frozen",
    "Mulan",
    "Tangled",
    "Hercules",
    "Pocahontas",
    "The Princess and the Frog",
    "Lilo & Stitch",
    "Zootopia",
    "Tarzan",
    "Big Hero 6",
    "The Hunchback of Notre Dame",
    "Raya and the Last Dragon",
    "Encanto",
    "The Incredibles",
    "The Incredibles 2",
    "Ratatouille",
    "Brave",
    "Coco",
    "Finding Nemo",
    "Finding Dory",
    "Toy Story",
    "Toy Story 2",
    "Toy Story 3",
    "Toy Story 4",
    "Cars",
    "Cars 2",
    "Cars 3",
    "Monsters, Inc.",
    "Monsters University",
    "Inside Out",
    "Up",
    "A Bug's Life",
    "Wall-E",
    "Onward",
    "Soul",
    "The Good Dinosaur",
    "Luca",
    "Turning Red",
    "Lightyear",
    "Wreck-It Ralph",
    "Ralph Breaks the Internet",
    "Bolt",
    "Chicken Little",
    "Meet the Robinsons",
    "The Emperor's New Groove",
    "Atlantis: The Lost Empire",
    "Treasure Planet",
    "Brother Bear",
    "Home on the Range",
    "Dinosaur",
    "The Jungle Book",
    "The Jungle Book 2",
    "Peter Pan",
    "Return to Never Land",
    "Cinderella",
    "Cinderella III: A Twist in Time",
    "Sleeping Beauty",
    "Maleficent",
    "Alice in Wonderland",
    "Alice Through the Looking Glass",
    "Snow White and the Seven Dwarfs",
    "Pinocchio",
    "Fantasia",
    "Dumbo",
    "Bambi",
    "Saludos Amigos",
    "The Three Caballeros",
    "Make Mine Music",
    "Fun and Fancy Free",
    "Melody Time",
    "The Adventures of Ichabod and Mr. Toad",
    "Cinderella",
    "Peter Pan",
    "Lady and the Tramp",
    "Sleeping Beauty",
    "101 Dalmatians",
    "The Sword in the Stone",
    "The Jungle Book",
    "The Aristocats",
    "Robin Hood",
    "The Many Adventures of Winnie the Pooh",
    "The Rescuers",
    "The Fox and the Hound",
    "The Black Cauldron",
    "The Great Mouse Detective",
    "Oliver & Company",
    "The Little Mermaid",
    "DuckTales the Movie: Treasure of the Lost Lamp",
    "Beauty and the Beast",
    "Aladdin",
    "The Nightmare Before Christmas",
    "The Lion King",
    "Pocahontas",
    "Toy Story",
    "James and the Giant Peach"
];

// Function to generate a unique 5-digit room code
function generateRoomCode() {
    let roomCode;
    do {
        roomCode = Math.floor(10000 + Math.random() * 90000).toString();
    } while (gameRooms[roomCode]);
    return roomCode;
}

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Default route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('createRoom', () => {
        const roomId = generateRoomCode();
        gameRooms[roomId] = {
            players: [],
            gameState: {}
        };
        socket.join(roomId);
        socket.roomId = roomId; // Store room ID on socket object
        gameRooms[roomId].players.push(socket.id);
        socket.emit('roomCreated', roomId);
        console.log(`Room created with ID: ${roomId}`);
    });

    socket.on('joinRoom', (roomId) => {
        if (gameRooms[roomId]) {
            socket.join(roomId);
            socket.roomId = roomId; // Store room ID on socket object
            gameRooms[roomId].players.push(socket.id);
            socket.emit('roomJoined', roomId);
            console.log(`Player joined room with ID: ${roomId}`);
        } else {
            socket.emit('error', 'Room not found');
            console.log(`Attempted to join non-existent room with ID: ${roomId}`);
        }
    });

    socket.on('startGame', () => {
        const roomId = socket.roomId;
        console.log(`Start game requested in room: ${roomId}`);
        if (roomId && gameRooms[roomId]) {
            const players = gameRooms[roomId].players;
            const spyIndex = Math.floor(Math.random() * players.length);
            const movie = disneyMovies[Math.floor(Math.random() * disneyMovies.length)];
            console.log(`Players in room: ${players}`);
            players.forEach((player, index) => {
                if (index === spyIndex) {
                    io.to(player).emit('roleAssigned', 'Spy');
                    console.log(`Assigned Spy role to player: ${player}`);
                } else {
                    io.to(player).emit('roleAssigned', movie);
                    console.log(`Assigned movie "${movie}" to player: ${player}`);
                }
            });
        }
    });

    socket.on('leaveRoom', () => {
        const roomId = socket.roomId;
        if (roomId && gameRooms[roomId]) {
            socket.leave(roomId);
            gameRooms[roomId].players = gameRooms[roomId].players.filter(player => player !== socket.id);
            if (gameRooms[roomId].players.length === 0) {
                delete gameRooms[roomId];
                console.log(`Deleted empty room: ${roomId}`);
            }
        }
        socket.emit('roomLeft');
        console.log(`Player left room: ${roomId}`);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
        const roomId = socket.roomId;
        if (roomId && gameRooms[roomId]) {
            gameRooms[roomId].players = gameRooms[roomId].players.filter(player => player !== socket.id);
            if (gameRooms[roomId].players.length === 0) {
                delete gameRooms[roomId];
                console.log(`Deleted empty room due to disconnection: ${roomId}`);
            }
        }
    });
});

// Start the server
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
