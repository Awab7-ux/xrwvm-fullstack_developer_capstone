const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Dealer, Review } = require('./models');

const app = express();
const port = Number(process.env.PORT || 3030);
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cars_dealership';

app.use(cors());
app.use(express.json());

app.get('/health', (request, response) => response.json({ status: 'ok' }));

app.get('/fetchDealers', async (request, response) => {
  try {
    response.json(await Dealer.find().sort({ _id: 1 }).lean());
  } catch (error) {
    response.status(503).json({ error: 'Dealer service unavailable' });
  }
});

app.get('/fetchDealers/:state', async (request, response) => {
  try {
    const state = new RegExp(`^${request.params.state}$`, 'i');
    response.json(await Dealer.find({ state }).sort({ _id: 1 }).lean());
  } catch (error) {
    response.status(503).json({ error: 'Dealer service unavailable' });
  }
});

app.get('/fetchDealer/:id', async (request, response) => {
  try {
    const dealer = await Dealer.findById(Number(request.params.id)).lean();
    if (!dealer) return response.status(404).json({ error: 'Dealer not found' });
    return response.json(dealer);
  } catch (error) {
    return response.status(400).json({ error: 'Invalid dealer id' });
  }
});

app.get('/fetchReviews', async (request, response) => {
  try {
    response.json(await Review.find().sort({ createdAt: -1 }).lean());
  } catch (error) {
    response.status(503).json({ error: 'Review service unavailable' });
  }
});

app.get('/fetchReviews/dealer/:id', async (request, response) => {
  try {
    response.json(await Review.find({ dealerId: Number(request.params.id) }).sort({ createdAt: -1 }).lean());
  } catch (error) {
    response.status(503).json({ error: 'Review service unavailable' });
  }
});

app.post('/insert_review', async (request, response) => {
  const review = request.body;
  const dealerId = Number(review.dealerId || review.dealer_id);
  if (!dealerId || !review.review || !review.name) {
    return response.status(400).json({ error: 'dealerId, name, and review are required' });
  }
  try {
    const created = await Review.create({ ...review, dealerId });
    return response.status(201).json(created.toObject());
  } catch (error) {
    return response.status(400).json({ error: 'Review could not be saved' });
  }
});

mongoose.connect(mongoUri)
  .then(() => app.listen(port, '0.0.0.0', () => console.log(`Database service listening on ${port}`)))
  .catch((error) => {
    console.error('Could not connect to MongoDB:', error.message);
    process.exit(1);
  });