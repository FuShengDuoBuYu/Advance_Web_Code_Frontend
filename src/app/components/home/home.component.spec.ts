const socket = require('socket.io-client');
let opts = {
  query: 'roomId=' + 10 + '&userName=teacher'+ '-' + "test_user",
  transports: ['websocket']
};
let socketPrefix = 'http://106.14.140.55:10088';

let test_userName = "teacher-test_user";
let test_roomId = 10;
// 测试连接
describe("Test the socket connect ", () => {
  const io = socket(socketPrefix, opts);
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

// 测试发送消息
// describe("Test the socket chat text", () => {
//   const io = socket(socketPrefix, opts);
//   beforeEach(() => {
//     io.connect();
//   });
//   afterEach(() => {
//     io.disconnect();
//   });
//
//   //发送文本消息
//   it("chat:success for send text message", (done) => {
//     //@ts-ignore
//     io.on('chat', (data) => {
//       expect(data.userName).toEqual(jsonObject.userName);
//       expect(data.message).toEqual(jsonObject.message);
//       expect(data.type).toEqual(jsonObject.type);
//       done();
//     });
//     const jsonObject = {
//       userName: test_userName,
//       message: "hello world",
//       roomId: test_roomId,
//       type: 'text'
//     };
//     io.emit('chat', jsonObject);
//   });
// });

// 测试用户的移动
describe("Test the socket move ", () => {
  const io = socket(socketPrefix, opts);
  beforeEach(() => {
    io.connect();
  });
  afterEach(() => {
    io.disconnect();
  });

  //发送文本消息
  it("move:success for user move", (done) => {
    //@ts-ignore
    io.on('remoteData', (data) => {
      expect(data[0].x).toEqual(jsonObject.x);
      expect(data[0].y).toEqual(jsonObject.y);
      expect(data[0].z).toEqual(jsonObject.z);
      expect(data[0].r).toEqual(jsonObject.r);
      done();
    });
    const jsonObject = {
      roleName: test_userName.split('-')[0],
      userName: test_userName,
      x: 1,
      y: 2,
      z: 3,
      r: 4,
    };
    io.emit('move', jsonObject);


  });
});

// 测试语音通话
describe("Test the socket speech ", () => {
  const io = socket(socketPrefix, opts);
  beforeEach(() => {
    io.connect();
  });
  afterEach(() => {
    io.disconnect();
  });

  //发送语音消息
  it("speech:success for speech", (done) => {
    const jsonObject = {
      userName: test_userName,
      roomId: test_roomId,
      message: "speech blob"
    };
    io.emit('speech', jsonObject);
    done();
  });
});

// 测试发送图片
describe("Test the socket chat image", () => {

  const io = socket(socketPrefix, opts);
  beforeEach(() => {
    io.connect();
  });
  afterEach(() => {
    io.disconnect();
  });
  //发送图片消息
  it("chat:success for send image message", (done) => {
    //@ts-ignore
    io.on('chat', (data) => {
      expect(data.userName).toEqual(jsonObject.userName);
      expect(data.message).toEqual(jsonObject.message);
      expect(data.type).toEqual(jsonObject.type);
      done();
    });
    const jsonObject = {
      userName: test_userName,
      message: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAYCAYAAAD3Va0xAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAFiUAABYlAUlSJPAAAAAtSURBVDhPY7QP3PqfgQqACUpTDEYNIgxGDSIMRg0iDEYNIgxGDSIMBptBDAwAJmwCdJQzxVQAAAAASUVORK5CYII=",
      roomId: test_roomId,
      type: 'image'
    };
    io.emit('chat', jsonObject);
  });
});
