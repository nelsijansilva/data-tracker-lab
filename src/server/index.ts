import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from '../lib/db/client';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Facebook Ad Accounts endpoints
app.get('/api/facebook/accounts', async (req, res) => {
  try {
    const accounts = await prisma.facebookAdAccount.findMany();
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching accounts' });
  }
});

app.post('/api/facebook/accounts', async (req, res) => {
  try {
    const account = await prisma.facebookAdAccount.create({
      data: req.body
    });
    res.json(account);
  } catch (error) {
    res.status(500).json({ error: 'Error creating account' });
  }
});

// Campaigns endpoints
app.get('/api/facebook/campaigns', async (req, res) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      include: {
        account: true,
        adSets: true
      }
    });
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching campaigns' });
  }
});

// Metrics endpoints
app.get('/api/metrics', async (req, res) => {
  try {
    const metrics = await prisma.customMetric.findMany({
      include: {
        selected: true
      }
    });
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching metrics' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});