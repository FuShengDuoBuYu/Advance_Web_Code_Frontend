const classroom_socket = require('socket.io-client');
let classroom_opts = {
  query: 'roomId=' + 1 + '&userName=student'+ '-' + "gzt",
  transports: ['websocket']
};
let classroom_socketPrefix = 'http://106.14.140.55:10088';

let classroom_test_userName = "student-gzt";
let classroom_test_roomId = 2;

// 测试连接
describe("Test the socket connect ", () => {
  const io = classroom_socket(classroom_socketPrefix, classroom_opts);
  beforeEach(() => {
    io.connect();
  });
  afterEach(() => {
    io.disconnect();
  });

  //成功连接
  it("connect:success for connect server", (done) => {
    io.on('connect', () => {
      // 这里设置的延迟时间为5s,如果5s后还没有收到服务端发送的消息，那么就认为测试失败
      done();
    });
  });

  //成功断开连接
  it("disconnect:success for disconnect server", (done) => {
    io.on('disconnect', () => {
      done();
    });
  });
});

// 测试创建方块
describe("Test the socket create block", () => {
  const io = classroom_socket(classroom_socketPrefix, classroom_opts);
  beforeEach(() => {
    io.connect();
  });
  afterEach(() => {
    io.disconnect();
  });

  it("block:success for create block", (done) => {
    //@ts-ignore
    // io.on('addBlock', (data) => {
    //   console.log(data);
    //   done();
    // });
    let jsonObject = {
      roomId: classroom_test_roomId,
      x1: 1,
      y1: 2,
      z1: 3,
      x2: 4,
      y2: 5,
      z2: 6
    };
    io.emit('addBlock', jsonObject);
    done();
  });
});

// 测试删除方块
describe("Test the socket delete block", () => {
  const io = classroom_socket(classroom_socketPrefix, classroom_opts);
  beforeEach(() => {
    io.connect();
  });
  afterEach(() => {
    io.disconnect();
  });

  it("block:success for delete block", (done) => {
    //@ts-ignore
    // io.on('deleteBlock', (data) => {
    //   console.log(data);
    //   done();
    // });
    let jsonObject = {
      roomId: classroom_test_roomId,
      x1: 1,
      y1: 2,
      z1: 3,
      x2: 4,
      y2: 5,
      z2: 6
    };
    io.emit('deleteBlock', jsonObject);
    done();
  });
});
