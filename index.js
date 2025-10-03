import express from 'express';
import cors from 'cors';
import {GoogleGenAI} from '@google/genai';
import multer from 'multer';

import 'dotenv/config';



// 1. inisialisasi express
const app = express();
const ai = new GoogleGenAI({});

// 2. middleware
app.use(cors());
// app.use(multer());
app.use(express.json());


// 3. inisialisasi endpoint
// [http method] : get, post, put,patch, delete
// get -> untuk mendapatkan data / mengambil data
// post -> untuk menambahkan data ke dalam server
// put -> untuk mengubah data secara keseluruhan
// patch -> untuk mengubah data secara parsial / sebagian / menambal
// delete -> untuk menghapus data

//endpoint -> chat

app.post(
  '/chat', // http://localhost:[PORT]/chat
  async (req, res) => {
    const { body } = req;
    const { prompt } = body;

    // guard clause -- satpam
    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({
        message: "Prompt harus diisi dan berupa string!",
        data: null,
        success: false
      });
      return;
    }
    // dagingnya (Isi nya ini)
    try {
      // 3rd party API -- Google AI
      const aiResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ]
      });

      res.status(200).json({
        success: true,
        data: aiResponse.text,
        message: "Berhasil ditanggapi oleh Google Gemini Flash!"
      });
    } catch (e) {
      console.log(e);
      res.status(500).json({
        success: false,
        data: null,
        message: e.message || "Ada masalah di server gan!"
      })
    }
  }
);

// entry point-nya
app.listen(3000, () => {
  console.log("Server berhasil berjalan gaes");
});