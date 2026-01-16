// Socket.IO singleton to share across services
let io = null;

module.exports = {
  setIO: (socketIO) => {
    io = socketIO;
    console.log('✅ Socket.IO instance registered globally');
  },

  getIO: () => {
    if (!io) {
      console.warn('⚠️ Socket.IO not initialized yet');
    }
    return io;
  },
};
