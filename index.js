const { default: axios } = require("axios");
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { /* options */ });
const port = 3000;

io.on("connection", (socket) => {
  console.log("user connected")
  socket.on("join",(arg)=>{
    socket.join(arg)
    console.log("join the room :"+arg)
  });
  socket.on("leaveRoom",(arg)=>{
    socket.leave(arg);
    console.log("user leave "+arg);
  })
  socket.on("comment",([idPost,idUser,comment])=>{
    // console.log("ok")
    // console.log([idPost,idUser,comment])
    axios.post("http://192.168.1.23:8080/api/commentApost",
    {
      idPost:idPost,
      idUser:idUser,
      comment:comment
    },
    {
      headers:{
        'Content-Type': 'application/json'
      }
    })
    .then((res)=>{
      if(res.status==200) {
        socket.broadcast.emit("newComment",{
          idPost:idPost,
          idUser:idUser,
          comment:comment
        })
      }
    })
  })
  socket.on("newStoryMade",(val)=>{
    console.log("new story!")
    socket.emit("newStory","test");
  })
  socket.on("sendTo",([idSrc,idDest,msg])=>{
    axios.post("http://192.168.1.23:8080/api/sendMessage",{
      idSrc:idSrc,
      idDest:idDest,
      message:msg
    },
    {
      headers:{
        'Content-Type': 'application/json',
        'Accept':'application/json'
      }
    })
    .then((res)=>{
      if(res.data) {
        const room = res.data;
        if(!socket.rooms.has(room)) {
          socket.join(room)
          console.log("join "+room)
        };
        socket.broadcast.emit("searchUser",{
          room:room,
          idDest:idDest,
          content:msg
        })
        // socket.to(room).emit("showMessage",{
        //   room:room,
        //   content:msg
        // });
        console.log("message send in room :"+room+" the content is :"+msg);
      }
    })
  })
});

httpServer.listen(port,()=>{
  console.log("port:"+port)
  })