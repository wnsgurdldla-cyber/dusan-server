const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

// 기본 미션 목록 (목표 두산 : 미션 내용)
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

io.on('connection', (socket) => {
  socket.emit('updateData', dusanData);

  socket.on('addBalloons', (value) => {
    if (typeof value === 'number' && value > 0) {
      const prevDusan = dusanData.dusan;
      dusanData.totalBalloons += value;
      dusanData.history.push(value);
      
      const newDusan = Math.floor((-1 + Math.sqrt(1 + 8 * dusanData.totalBalloons)) / 2);
      dusanData.dusan = newDusan;

      io.emit('updateData', dusanData);

      // 설정된 모든 미션 중 이번에 돌파한 목표가 있는지 확인
      dusanData.missions.forEach(m => {
        if (prevDusan < m.target && newDusan >= m.target) {
          io.emit('triggerGoal', { target: m.target, title: m.text });
        }
      });
    }
  });

  socket.on('updateMissions', (newMissions) => {
    // 숫자가 높은 순서대로 오름차순 정렬
    dusanData.missions = newMissions.sort((a, b) => a.target - b.target);
    io.emit('updateData', dusanData);
  });

  socket.on('resetData', () => {
    dusanData.totalBalloons = 0;
    dusanData.dusan = 0;
    dusanData.history = [];
    io.emit('updateData', dusanData);
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log(`Server running on port ${PORT}`));
