import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import emailApi from './emailApi.js';
import databaseApi from './databaseApi.js';
import whatsappOauthRouter from './whatsappOauth.js';
import whatsappApiRouter from './whatsappApi.js';

const app = express();
const PORT = process.env.PORT || 4001;

app.use(cors());
app.use(express.json());

app.use('/api/email', emailApi);
app.use('/api/database', databaseApi);
app.use('/api/whatsapp', whatsappApiRouter);
app.use('/api/whatsapp/oauth', whatsappOauthRouter);

app.get('/', (req, res) => {
  res.send('PropAI Connect API is running');
});

app.listen(PORT, () => {
  console.log(`PropAI Connect API server running on port ${PORT}`);
});
