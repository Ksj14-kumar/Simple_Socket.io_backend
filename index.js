const express = require("express")
require("dotenv").config()
const FrontendURL = process.env.FrontendURL
const app = express()
const httpProxy = require("http-proxy")
const server = require("http").createServer(app)
const { Server } = require("socket.io")
const io = new Server(server, {
    path: "/chats",
    cors: {
        origin: FrontendURL,
        credentials: true,
    }
})
require("./Socket_Connection/Socket")(io)

const router = require("./router.js")
const cors = require("cors");
const bodyParser = require("body-parser");
const { default: mongoose } = require("mongoose");

const PORT = process.env.PORT || 5000
const URI = process.env.URL


mongoose.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
    if (err) {
        console.log(err)
        throw Error(err)
    }
    else {
        console.log("connected to db")
    }
})
app.use(cors({
    origin: "*"
}))

httpProxy.createProxyServer({
    target: FrontendURL,
    ws: true,
}).listen(80)
app.use(bodyParser.json({ limit: "50mb " }))
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }))

app.use("/api/v1", router)


server.listen(PORT, (err) => {
    if (err) throw Error(err)
    console.log(`server is runing at port ${PORT}`)
})