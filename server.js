const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

let dusanData = { 
  dusan: 0, 
  totalBalloons: 0, 
  history: [], 
  m300: "300두산 미션 달성!", 
  m400: "400두산 미션 달성!" 
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

      // 돌파 체킹 (300두산, 400두산 진입 시 이펙트 신호 발송)
      if (prevDusan < 300 && newDusan >= 300) {
        io.emit('triggerGoal', { target: 300, title: dusanData.m300 });
      } else if (prevDusan < 400 && newDusan >= 400) {
        io.emit('triggerGoal', { target: 400, title: dusanData.m400 });
      }
    }
  });

  socket.on('updateMissions', (missions) => {
    dusanData.m300 = missions.m300;
    dusanData.m400 = missions.m400;
    io.emit('updateData', dusanData);
  });

  socket.on('resetData', () => {
    dusanData = { dusan: 0, totalBalloons: 0, history: [], m300: dusanData.m300, m400: dusanData.m400 };
    io.emit('updateData', dusanData);
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log(`Server running on port ${PORT}`));
