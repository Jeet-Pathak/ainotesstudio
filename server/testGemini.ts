import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const key = process.env.GEMINI_API_KEY || '';

async function testModels() {
  try {
    const res = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    console.log('Available models:', res.data.models.map((m: any) => m.name));
  } catch (err: any) {
    console.error('Error fetching models:', err.response?.data || err.message);
  }
}

testModels();
