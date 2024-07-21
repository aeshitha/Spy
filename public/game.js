const socket = io();

document.getElementById('create-room').addEventListener('click', () => {
    socket.emit('createRoom');
});

document.getElementById('join-room').addEventListener('click', () => {
    const roomId = document.getElementById('room-id').value;
    socket.emit('joinRoom', roomId);
});

socket.on('roomCreated', (roomId) => {
    console.log(`Room created with ID: ${roomId}`);
    showGameRoom(roomId);
});

socket.on('roomJoined', (roomId) => {
    console.log(`Joined room with ID: ${roomId}`);
    showGameRoom(roomId);
});

document.getElementById('start-game').addEventListener('click', () => {
    console.log('Start button clicked');
    socket.emit('startGame');
});

document.getElementById('leave-room').addEventListener('click', () => {
    socket.emit('leaveRoom');
    showFrontPage();
});

socket.on('roleAssigned', (role) => {
    console.log(`Role assigned: ${role}`);
    document.getElementById('role').value = role;
});

function showGameRoom(roomId) {
    document.getElementById('front-page').style.display = 'none';
    document.getElementById('game-room').style.display = 'block';
    document.getElementById('room-id-display').textContent = `Room ID: ${roomId}`;
}

function showFrontPage() {
    document.getElementById('front-page').style.display = 'block';
    document.getElementById('game-room').style.display = 'none';
    document.getElementById('room-id').value = '';
}
