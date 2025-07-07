// =======================================================
//  backend/src/features/blackMarket.js
//  One-file feature barrel:
//    - MarketListing model
//    - Black market routes
// =======================================================

import mongoose from 'mongoose';
import express  from 'express';

import { Character } from './character.js';
import { auth }      from './user.js';

const { Schema, Types } = mongoose;

/* ───────────────────────────────────────────────
 * 1) Mongoose Schema + Model
 * ─────────────────────────────────────────────── */
const marketListingSchema = new Schema({
  seller:   { type: Schema.Types.ObjectId, ref: 'Character', required: true },
  itemId:   { type: Schema.Types.ObjectId, required: true },
  itemType: { type: String, enum: ['weapon', 'armor', 'consumable'], required: true },
  price:    { type: Number, required: true },
  status:   { type: String, enum: ['active', 'sold', 'cancelled'], default: 'active' },
  buyer:    { type: Schema.Types.ObjectId, ref: 'Character' },
  createdAt:{ type: Date, default: Date.now }
});

export const MarketListing = mongoose.model('MarketListing', marketListingSchema);

/* ───────────────────────────────────────────────
 * 2) Express Router
 * ─────────────────────────────────────────────── */
export const router = express.Router();

// GET /black-market → all active listings
router.get('/', async (_req, res) => {
  try {
    const listings = await MarketListing
      .find({ status: 'active' })
      .populate('seller', 'username');
    res.json(listings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load listings' });
  }
});

// POST /black-market/list → create listing
router.post('/list', auth, async (req, res) => {
  const { itemId, itemType, price } = req.body;

  if (!itemId || !['weapon', 'armor', 'consumable'].includes(itemType) || isNaN(price) || price <= 0) {
    return res.status(400).json({ message: 'Invalid input' });
  }

  try {
    const listing = await MarketListing.create({
      seller: new Types.ObjectId(req.user.id),
      itemId,
      itemType,
      price
    });
    res.status(201).json(listing);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to list item' });
  }
});

// POST /black-market/buy/:listingId → purchase
router.post('/buy/:listingId', auth, async (req, res) => {
  const { listingId } = req.params;
  try {
    const listing = await MarketListing.findById(listingId);
    if (!listing || listing.status !== 'active') {
      return res.status(404).json({ message: 'Listing not available' });
    }

    const buyer = await Character.findById(req.user.id);
    if (!buyer || buyer.cash < listing.price) {
      return res.status(400).json({ message: 'Insufficient cash or buyer not found' });
    }

    const seller = await Character.findById(listing.seller);
    if (!seller) {
      return res.status(500).json({ message: 'Seller not found' });
    }

    buyer.cash -= listing.price;
    seller.cash += listing.price;

    await buyer.save();
    await seller.save();

    listing.status = 'sold';
    listing.buyer  = buyer._id;
    await listing.save();

    res.json({ message: 'Purchase successful', listing });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Transaction failed' });
  }
});

// DELETE /black-market/cancel/:listingId → cancel own listing
router.delete('/cancel/:listingId', auth, async (req, res) => {
  const { listingId } = req.params;
  try {
    const listing = await MarketListing.findOne({
      _id: listingId,
      seller: new Types.ObjectId(req.user.id),
    });

    if (!listing || listing.status !== 'active') {
      return res.status(404).json({ message: 'Listing not active or not yours' });
    }

    listing.status = 'cancelled';
    await listing.save();

    res.json({ message: 'Listing cancelled', listing });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Cancellation failed' });
  }
});

/* ───────────────────────────────────────────────
 * 3) Barrel export
 * ─────────────────────────────────────────────── */
export default { MarketListing, router };
