const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const app = express();
require("dotenv").config();

// Conectar ao MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB conectado!"))
  .catch((err) => {
    console.error("Erro ao conectar ao MongoDB", err);
  });

// Configurações do Express
app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Configurar multer para upload de imagens
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Importar o Modelo Post
const Post = require("./models/Post");

// Rotas
app.get("/", async (req, res) => {
  try {
    const posts = await Post.find();
    res.render("index", { posts });
  } catch (err) {
    console.error("Erro ao buscar posts", err);
    res.status(500).send("Erro ao buscar posts");
  }
});

app.get("/new-post", (req, res) => {
  res.render("new-post");
});

app.post("/posts", upload.single("image"), async (req, res) => {
  const { title, content } = req.body;
  const image = req.file ? "/uploads/" + req.file.filename : null;
  try {
    const newPost = new Post({ title, content, image });
    await newPost.save();
    res.redirect("/");
  } catch (err) {
    console.error("Erro ao salvar post", err);
    res.status(500).send("Erro ao salvar post");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
