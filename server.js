const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

let dusanData = { 
  dusan: 0, 
  totalBalloons: 0, 
  history: [], 
  missions: [
    { target: 100, text: "100두산 미션" },
    { target: 300, text: "300두산 미션" },
    { target: 500, text: "500두산 미션" },
    { target: 1000, text: "1000두산 미션" }
  ]
};

app.use(express.static(__dirname));

function getNextMission(currentDusan) {
  const sorted = [...dusanData.missions].sort((a, b) => a.target - b.target);
  return sorted.find(m => m.target > currentDusan) || sorted[sorted.length - 1] || null;
}

io.on('connection', (socket) => {
  socket.emit('updateData', { ...dusanData, nextMission: getNextMission(dusanData.dusan) });

  socket.on('addBalloons', (value) => {
    if (typeof value === 'number' && value > 0) {
      const prevDusan = dusanData.dusan;
      dusanData.totalBalloons += value;
      dusanData.history.push(value);
      
      const newDusan = Math.floor((-1 + Math.sqrt(1 + 8 * dusanData.totalBalloons)) / 2);
      dusanData.dusan = newDusan;

      const nextMission = getNextMission(newDusan);
      io.emit('updateData', { ...dusanData, nextMission });

      dusanData.missions.forEach(m => {
        if (prevDusan < m.target && newDusan >= m.target) {
          io.emit('triggerGoal', { target: m.target, title: m.text });
        }
      });
    }
  });

  socket.on('updateMissions', (newMissions) => {
    dusanData.missions = newMissions.sort((a, b) => a.target - b.target);
    io.emit('updateData', { ...dusanData, nextMission: getNextMission(dusanData.dusan) });
  });

  socket.on('resetData', () => {
    dusanData.totalBalloons = 0;
    dusanData.dusan = 0;
    dusanData.history = [];
    io.emit('updateData', { ...dusanData, nextMission: getNextMission(0) });
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log(`Server running on port ${PORT}`));
