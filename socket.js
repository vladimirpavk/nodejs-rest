const io = require('socket.io');

let ioHandler;

exports.init = (httpServer)=>{
    ioHandler = io(httpServer);
    return ioHandler;
}

exports.getIo = () =>{
    if(!ioHandler) return new Error('Socket not initialized...');
    return ioHandler;
}