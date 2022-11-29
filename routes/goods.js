const express = require('express');
const router = express.Router();

const Goods = require('../schemas/goods.js');
const Cart = require('../schemas/cart.js');

//상품 목록 조회 API
router.get('/goods', async (req, res) => {
    const goods = await Goods.find();
    res.status(200).json({ goods });
});

//상품 상세 조회 API
router.get('/goods/:goodsId/detail', async (req, res) => {
    const { goodsId } = req.params;
    const goods = await Goods.find();

    const [detail] = goods.filter((good) => good.goodsId === Number(goodsId));

    res.status(200).json({ detail });
})

//상품 등록 API
router.post('/goods', async (req, res) => {
    const { goodsId, name, thumbnailUrl, category, price } = req.body;

    const goods = await Goods.find({ goodsId });

    if (goods.length) {
        return res.status(400).json({
            success: false,
            errorMesage: '이미 존재하는 goodsId 입니다.'
        });
    }

    const createdGoods = await Goods.create({ goodsId, name, thumbnailUrl, category, price });

    res.json({ goods: createdGoods });

})

//상품 카트 목록 조회 API


router.get('/goods/carts', async (req, res) => {
    const carts = await Cart.find();
    const goodsIds = carts.map((cart) => cart.goodsId);
    const goods = await Goods.find({ goodsId: goodsIds });
    res.json({
        carts: carts.map((cart) => ({
            quantity: cart.quantity,
            goods: goods.find((item) => item.goodsId === cart.goodsId),
        })),
    });
});

//상품 카트에 등록 API
router.post('/goods/:goodsId/cart', async (req, res) => {
    const { goodsId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
        res.status(400).json({ errorMesage: '수량은 1 이상이어야 합니다.' });
        return;
    }

    const existsCarts = await Cart.find({ goodsId: Number(goodsId) });
    if (existsCarts.length) {
        return res.json({ success: false, errorMesage: '이미 장바구니 존재하는 상품입니다!' });
    }
    await Cart.create({ goodsId: Number(goodsId), quantity: quantity });

    res.json({ result: "success" });
})

//카트에 등록된 상품수량 수정 API
router.put('/goods/:goodsId/cart', async (req, res) => {
    const { goodsId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
        res.status(400).json({ errorMesage: '수량은 1 이상이어야 합니다.' });
        return;
    }

    const existsCarts = await Cart.find({ goodsId: Number(goodsId) });
    if (existsCarts.length) {
        await Cart.updateOne(
            { goodsId: Number(goodsId) },
            { $set: { quantity } }
        );
    }
    res.json({ success: true });
});

//장바구니 상품 삭제 API
router.delete('/goods/:goodsId/cart', async (req, res) => {
    const { goodsId } = req.params;

    const existsCarts = await Cart.find({ goodsId });
    if (existsCarts.length > 0) {
        await Cart.deleteOne({ goodsId });
    }
    res.json({ result: 'success' });
})

module.exports = router;