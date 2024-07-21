const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port = process.env.PORT || 3000;

let gameRooms = {};

const disneyMovies = [
    "Snow White and the Seven Dwarfs (G)",
    "Snow White and the Seven Dwarfs (G)",
    "1940: Pinocchio (G)",
    "1940: Fantasia (G)",
    "1941: The Reluctant Dragon",
    "1941: Dumbo (G)",
    "1942: Bambi (G)",
    "1943: Saludos Amigos",
    "1943: Victory Through Air Power",
    "1945: The Three Caballeros (G)",
    "1946: Make Mine Music",
    "1946: Song of the South (G)",
    "1947: Fun and Fancy Free",
    "1948: Melody Time",
    "1949: So Dear to My Heart (G)",
    "1949: The Adventures of Ichabod and Mr. Toad (G)",
    "1950: Cinderella (G)",
    "1950: Treasure Island (PG)",
    "1951: Alice in Wonderland (G)",
    "1952: The Story of Robin Hood and His Merrie Men (PG)",
    "1953: Peter Pan (G)",
    "1953: The Sword and the Rose (PG)",
    "1953: The Living Desert",
    "1954: Rob Roy, the Highland Rogue",
    "1954: The Vanishing Prairie",
    "1954: 20,000 Leagues Under the Sea (G)",
    "1955: Davy Crockett, King of the Wild Frontier (PG)",
    "1955: Lady and the Tramp (G)",
    "1955: The African Lion",
    "1955: The Littlest Outlaw",
    "1956: The Great Locomotive Chase",
    "1956: Davy Crockett and the River Pirates",
    "1956: Secrets of Life",
    "1956: Westward Ho the Wagons!",
    "1957: Johnny Tremain",
    "1957: Perri (G)",
    "1957: Old Yeller (G)",
    "1958: The Light in the Forest",
    "1958: White Wilderness",
    "1958: Tonka",
    "1959: Sleeping Beauty (G)",
    "1959: The Shaggy Dog (G)",
    "1959: Darby O’Gill and the Little People (G)",
    "1959: Third Man on the Mountain (G)",
    "1960: Toby Tyler, or Ten Weeks with a Circus (G)",
    "1960: Kidnapped",
    "1960: Pollyanna (G)",
    "1960: The Sign of Zorro",
    "1960: Jungle Cat",
    "1960: Ten Who Dared",
    "1960: Swiss Family Robinson (G)",
    "1961: One Hundred and One Dalmatians (G)",
    "1961: The Absent-Minded Professor (G)",
    "1961: The Parent Trap",
    "1961: Nikki, Wild Dog of the North (G)",
    "1961: Greyfriars Bobby",
    "1961: Babes in Toyland",
    "1962: Moon Pilot",
    "1962: Bon Voyage",
    "1962: Big Red",
    "1962: Almost Angels",
    "1962: The Legend of Lobo (G)",
    "1962: In Search of the Castaways (G)",
    "1963: Son of Flubber (G)",
    "1963: Miracle of the White Stallions",
    "1963: Savage Sam",
    "1963: Summer Magic",
    "1963: The Incredible Journey (G)",
    "1963: The Sword in the Stone (G)",
    "1963: The Three Lives of Thomasina (PG)",
    "1964: The Misadventures of Merlin Jones (G)",
    "1964: A Tiger Walks",
    "1964: The Moon-Spinners (PG)",
    "1964: Mary Poppins (G)",
    "1964: Emil and the Detectives",
    "1965: Those Calloways (PG)",
    "1965: The Monkey’s Uncle",
    "1965: That Darn Cat! (G)",
    "1966: The Ugly Dachshund",
    "1966: Lt. Robin Crusoe U.S.N.(G)",
    "1966: The Fighting Prince of Donegal",
    "1966: Follow Me, Boys! (G)",
    "1967: Monkeys, Go Home!",
    "1967: The Adventures of Bullwhip Griffin",
    "1967: The Happiest Millionaire (G)",
    "1967: The Gnome-Mobile (G)",
    "1967: The Jungle Book (G)",
    "1967: Charlie, The Lonesome Cougar",
    "1968: Blackbeard’s Ghost (G)",
    "1968: The One and Only, Genuine, Original Family Band",
    "1968: Never a Dull Moment (G)",
    "1968: The Horse in the Gray Flannel Suit",
    "1969: The Love Bug (G)",
    "1969: Smith!",
    "1969: Rascal",
    "1969: The Computer Wore Tennis Shoes",
    "1970: King of the Grizzlies (G)",
    "1970: The Boatniks (G)",
    "1970: The Aristocats (G)",
    "1971: The Wild Country (G)",
    "1971: The Barefoot Executive (G)",
    "1971: Scandalous John (G)",
    "1971: The $1,000,000 Duck (G)",
    "1971: Bedknobs and Broomsticks (G)",
    "1972: The Biscuit Eater (G)",
    "1972: Napoleon and Samantha (G)",
    "1972: Now You See Him, Now You Don’t (G)",
    "1972: Run, Cougar, Run (G)",
    "1972: Snowball Express (G)",
    "1973: The World’s Greatest Athlete (G)",
    "1973: Charley and the Angel (G)",
    "1973: One Little Indian (G)",
    "1973: Robin Hood (G)",
    "1973: Superdad (G)",
    "1974: Herbie Rides Again (G)",
    "1974: The Bears and I (G)",
    "1974: The Castaway Cowboy (G)",
    "1974: The Island at the Top of the World (G)",
    "1975: The Strongest Man in the World (G)",
    "1975: Escape to Witch Mountain (G)",
    "1975: The Apple Dumpling Gang (G)",
    "1975: One of Our Dinosaurs is Missing (G)",
    "1975: The Best of Walt Disney’s True-Life Adventures (G)",
    "1976: Ride a Wild Pony (G)",
    "1976: No Deposit, No Return (G)",
    "1976: Gus (G)",
    "1976: Treasure of Matecumbe (G)",
    "1976: The Shaggy D.A. (G)",
    "1977: Freaky Friday (G)",
    "1977: The Littlest Horse Thieves (G)",
    "1977: The Many Adventures of Winnie the Pooh (G)",
    "1977: The Rescuers (G)",
    "1977: Herbie Goes to Monte Carlo (G)",
    "1977: Pete’s Dragon (G)",
    "1978: Candleshoe (G)",
    "1978: Return from Witch Mountain (G)",
    "1978: The Cat from Outer Space (G)",
    "1978: Hot Lead and Cold Feet (G)",
    "1979: The North Avenue Irregulars (G)",
    "1979: The Apple Dumpling Gang Rides Again (G)",
    "1979: Unidentified Flying Oddball (G)",
    "1979: The Black Hole (PG)",
    "1980: Midnight Madness (PG)",
    "1980: The Last Flight of Noah’s Ark (G)",
    "1980: Herbie Goes Bananas (G)",
    "1981: The Devil and Max Devlin (PG)"
    // Add more movies to make it up to 500
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
