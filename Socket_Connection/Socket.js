module.exports = async (io) => {
    io.on("connection", (socket) => {
        console.log("a user conncted")

        console.log(socket.handshake.query)
        console.log(socket.handshake.headers)

        if (socket.handshake.auth.token === 8888) {
            socket.on("disconnect", (value) => {
                console.log("a user disconenct")
                console.log({ value })
            })


            socket.on("sendMessage", (value) => {
                io.emit("getMessages", value)
            })
        }
        else {
            socket.emit("invalidToken", "Invalid token")
        }


    })

    // console.log(io)

}