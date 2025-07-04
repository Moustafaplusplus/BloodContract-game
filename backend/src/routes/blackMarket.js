// ─────────────────────────  Route: Black Market  ──────────────
// File: backend/src/routes/blackMarket.js
// -------------------------------------------------------------
import { Router } from 'express';
import authMiddleware from '../middlewares/auth.js';           // ✅ default import fixed
import MarketListing   from '../models/marketListing.js';
import Character       from '../models/character.js';

const router = Router();

// GET /black-market → list all active listings
router.get('/', async (_req, res) => {
  const listings = await MarketListing
    .find({ status: 'active' })
    .populate('seller', 'username');
  res.json(listings);
});

// POST /black-market/list → create a new listing
router.post('/list', authMiddleware, async (req, res) => {
  const { itemId, itemType, price } = req.body;

  const listing = await MarketListing.create({
    seller: req.user.id,
    itemId,
    itemType,
    price
  });

  res.status(201).json(listing);
});

// POST /black-market/buy/:listingId → purchase an item
router.post('/buy/:listingId', authMiddleware, async (req, res) => {
  const { listingId } = req.params;
  const listing = await MarketListing.findById(listingId);

  if (!listing || listing.status !== 'active') {
    return res.status(404).json({ message: 'Listing not available' });
  }

  const buyer = await Character.findById(req.user.id);
  if (buyer.cash < listing.price) {
    return res.status(400).json({ message: 'Insufficient cash' });
  }

  // Money transfer (simplified)
  buyer.cash -= listing.price;
  await buyer.save();

  const seller = await Character.findById(listing.seller);
  seller.cash += listing.price;
  await seller.save();

  listing.status = 'sold';
  listing.buyer  = buyer._id;
  await listing.save();

  res.json({ message: 'Purchase successful', listing });
});

// DELETE /black-market/cancel/:listingId → cancel own listing
router.delete('/cancel/:listingId', authMiddleware, async (req, res) => {
  const { listingId } = req.params;
  const listing = await MarketListing.findOne({ _id: listingId, seller: req.user.id });

  if (!listing || listing.status !== 'active') {
    return res.status(404).json({ message: 'Listing not active or not yours' });
  }

  listing.status = 'cancelled';
  await listing.save();

  res.json({ message: 'Listing cancelled', listing });
});

export default router;