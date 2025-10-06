import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";
import multer from "multer";

import "dotenv/config";

// 1. inisialisasi express
const app = express();
const ai = new GoogleGenAI({});

// 2. middleware
app.use(cors());
// app.use(multer());
app.use(express.json());
app.use(express.static("public"));

// 3. inisialisasi endpoint
// [http method] : get, post, put,patch, delete
// get -> untuk mendapatkan data / mengambil data
// post -> untuk menambahkan data ke dalam server
// put -> untuk mengubah data secara keseluruhan
// patch -> untuk mengubah data secara parsial / sebagian / menambal
// delete -> untuk menghapus data

//endpoint -> chat

app.post(
  "/chat", // http://localhost:[PORT]/chat
  async (req, res) => {
    const { body } = req;
    const { conversation } = body;

    // guard clause -- satpam
    if (!conversation || !Array.isArray(conversation)) {
      res.status(400).json({
        message: "Percakapan harus valid!",
        data: null,
        success: false,
      });
      return;
    }

    // guard clause ke 2 --satpam ketat!
    const conversationIsValid = conversation.every((message) => {
      // kondisi pertama -- message harus truthy
      if (!message) return false;

      // kondisi kedua -- message harus object namun bukan array
      if (typeof message !== "object" || Array.isArray(message)) return false;

      // kondisi ketiga -- message harus memiliki properti 'role' dan 'text'
      const keys = Object.keys(message);
      const keyLenghtIsValid = keys.length === 2;
      const keyContainsIsValidName = keys.every((key) =>
        ["role", "text"].includes(key)
      );

      if (!keyLenghtIsValid || !keyContainsIsValidName) return false;

      // kondisi keempat -- properti 'role' harus berupa string dan memiliki nilai 'user' atau 'model'

      const { role, text } = message;
      const roleIsValid = ["user", "model"].includes(role);
      const textIsValid = typeof text === "string";

      if (!roleIsValid || !textIsValid) return false;

      // jika lolos semua kondisi, maka kembalikan true
      return true;
    });

    if (!conversationIsValid) {
      res.status(400).json({
        message: "Struktur percakapan tidak valid!",
        data: null,
        success: false,
      });
      return;
    }

    const contents = conversation.map(({ role, text }) => ({
      role,
      parts: [{ text }],
    }));

    // dagingnya (Isi nya ini)
    try {
      // 3rd party API -- Google AI
      const aiResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
      });

      res.status(200).json({
        success: true,
        data: aiResponse.text,
        message: "Berhasil ditanggapi oleh Google Gemini Flash!",
      });
    } catch (e) {
      console.log(e);
      res.status(500).json({
        success: false,
        data: null,
        message: e.message || "Ada masalah di server gan!",
      });
    }
  }
);

// entry point-nya
app.listen(3000, () => {
  console.log("Server berhasil berjalan gaes");
});
