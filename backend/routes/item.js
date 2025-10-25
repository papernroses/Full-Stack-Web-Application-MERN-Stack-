const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const jwt = require('jsonwebtoken');

// Middleware to check token
const auth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if(!token) return res.status(401).json({ msg: 'No token, authorization denied' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch(err) {
        res.status(400).json({ msg: 'Token is not valid' });
    }
};

// CRUD Routes
router.post('/', auth, async (req, res) => {
    const { name, description } = req.body;
    const item = new Item({ name, description, userId: req.user.id });
    await item.save();
    res.json(item);
});

router.get('/', auth, async (req, res) => {
    const items = await Item.find({ userId: req.user.id });
    res.json(items);
});

router.put('/:id', auth, async (req, res) => {
    const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedItem);
});

router.delete('/:id', auth, async (req, res) => {
    await Item.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Item deleted' });
});

module.exports = router;
