const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

let dusanData = { dusan: 0, totalBalloons: 0, history: [] };

app.use(express.static(__dirname));

io.on('connection', (socket) => {
  // 스트리머/매니저 접속 시 현재 데이터 전송
  socket.emit('updateData', dusanData);

  // 매니저가 숫자 입력 시 수치 계산 후 방송 오버레이에 전송
  socket.on('addBalloons', (value) => {
    if (typeof value === 'number' && value > 0) {
      dusanData.totalBalloons += value;
      dusanData.history.push(value);
      dusanData.dusan = Math.floor((-1 + Math.sqrt(1 + 8 * dusanData.totalBalloons)) / 2);
      io.emit('updateData', dusanData);
    }
  });

  // 전체 리셋
  socket.on('resetData', () => {
    dusanData = { dusan: 0, totalBalloons: 0, history: [] };
    io.emit('updateData', dusanData);
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log(`Server running on port ${PORT}`));