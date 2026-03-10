// backend/src/routes/farms.js
import { Router } from 'express';
import { prisma } from '../db/client.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const farmsRouter = Router();

// GET /api/farms — list with filtering, search, pagination
farmsRouter.get('/', async (req, res, next) => {
  try {
    const {
      type, region, bio, open, delivery, eshop, search,
      lat, lng, radius = 50,
      page = 1, limit = 30,
      sort = 'name',
    } = req.query;

    const where = {
      active: true,
      ...(type    && { type }),
      ...(region  && { region: { contains: region, mode: 'insensitive' } }),
      ...(bio     && { bio: bio === 'true' }),
      ...(delivery && { delivery: delivery === 'true' }),
      ...(eshop   && { eshop: eshop === 'true' }),
      ...(search  && {
        OR: [
          { name:        { contains: search, mode: 'insensitive' } },
          { city:        { contains: search, mode: 'insensitive' } },
          { region:      { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const orderBy = sort === 'rating'
      ? { reviews: { _count: 'desc' } }
      : { name: 'asc' };

    const skip = (Number(page) - 1) * Number(limit);

    const [farms, total] = await Promise.all([
      prisma.farm.findMany({
        where,
        orderBy,
        skip,
        take: Number(limit),
        include: {
          _count: { select: { reviews: true, favorites: true } },
          reviews: { select: { rating: true } },
          products: { where: { active: true }, select: { id: true, name: true, emoji: true, price: true, unit: true }, take: 6 },
          seasonalOffers: {
            where: { validTo: { gte: new Date() } },
            orderBy: { validFrom: 'asc' },
            take: 3,
          },
        },
      }),
      prisma.farm.count({ where }),
    ]);

    // Compute avg rating
    const farmsWithRating = farms.map(f => ({
      ...f,
      avgRating: f.reviews.length
        ? Math.round((f.reviews.reduce((s, r) => s + r.rating, 0) / f.reviews.length) * 10) / 10
        : null,
    }));

    res.json({
      farms: farmsWithRating,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) { next(err); }
});

// GET /api/farms/:id
farmsRouter.get('/:id', async (req, res, next) => {
  try {
    const farm = await prisma.farm.findUnique({
      where: { id: req.params.id },
      include: {
        owner: { select: { id: true, name: true, avatar: true } },
        products: { where: { active: true }, orderBy: { name: 'asc' } },
        reviews: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        seasonalOffers: {
          where: { validTo: { gte: new Date() } },
          orderBy: { validFrom: 'asc' },
        },
        _count: { select: { favorites: true } },
      },
    });
    if (!farm) return res.status(404).json({ error: 'Farma nenalezena' });

    const avgRating = farm.reviews.length
      ? Math.round((farm.reviews.reduce((s, r) => s + r.rating, 0) / farm.reviews.length) * 10) / 10
      : null;

    res.json({ ...farm, avgRating });
  } catch (err) { next(err); }
});

// POST /api/farms — create (FARMER only)
farmsRouter.post('/', requireAuth, requireRole('FARMER', 'ADMIN'), async (req, res, next) => {
  try {
    const existing = await prisma.farm.findUnique({ where: { ownerId: req.user.id } });
    if (existing)
      return res.status(409).json({ error: 'Již máte registrovanou farmu' });

    const { name, description, type, lat, lng, address, city, region,
            phone, email, website, hours, founded, hectares,
            bio, delivery, eshop } = req.body;

    const farm = await prisma.farm.create({
      data: {
        ownerId: req.user.id,
        name, description, type, lat, lng, address, city, region,
        phone, email, website, hours,
        founded: founded ? Number(founded) : null,
        hectares: hectares ? Number(hectares) : null,
        bio: Boolean(bio),
        delivery: Boolean(delivery),
        eshop: Boolean(eshop),
      },
    });
    res.status(201).json(farm);
  } catch (err) { next(err); }
});

// PUT /api/farms/:id
farmsRouter.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const farm = await prisma.farm.findUnique({ where: { id: req.params.id } });
    if (!farm) return res.status(404).json({ error: 'Farma nenalezena' });
    if (farm.ownerId !== req.user.id && req.user.role !== 'ADMIN')
      return res.status(403).json({ error: 'Nemáte oprávnění upravit tuto farmu' });

    const allowed = ['name','description','phone','email','website','hours',
                     'address','city','bio','delivery','eshop','coverImage','images'];
    const data = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) data[k] = req.body[k]; });

    const updated = await prisma.farm.update({ where: { id: req.params.id }, data });
    res.json(updated);
  } catch (err) { next(err); }
});

// POST /api/farms/:id/favorite
farmsRouter.post('/:id/favorite', requireAuth, async (req, res, next) => {
  try {
    const existing = await prisma.favorite.findUnique({
      where: { userId_farmId: { userId: req.user.id, farmId: req.params.id } },
    });
    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      return res.json({ favorited: false });
    }
    await prisma.favorite.create({ data: { userId: req.user.id, farmId: req.params.id } });
    res.json({ favorited: true });
  } catch (err) { next(err); }
});

// GET /api/farms/:id/favorite
farmsRouter.get('/:id/favorite', requireAuth, async (req, res, next) => {
  try {
    const fav = await prisma.favorite.findUnique({
      where: { userId_farmId: { userId: req.user.id, farmId: req.params.id } },
    });
    res.json({ favorited: !!fav });
  } catch (err) { next(err); }
});

// POST /api/farms/:id/review
farmsRouter.post('/:id/review', requireAuth, async (req, res, next) => {
  try {
    const { rating, text } = req.body;
    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ error: 'Hodnocení musí být 1-5' });

    const review = await prisma.review.upsert({
      where: { userId_farmId: { userId: req.user.id, farmId: req.params.id } },
      create: { userId: req.user.id, farmId: req.params.id, rating: Number(rating), text },
      update: { rating: Number(rating), text },
      include: { user: { select: { name: true, avatar: true } } },
    });
    res.json(review);
  } catch (err) { next(err); }
});

// GET /api/farms/:id/seasonal
farmsRouter.get('/:id/seasonal', async (req, res, next) => {
  try {
    const offers = await prisma.seasonalOffer.findMany({
      where: { farmId: req.params.id, validTo: { gte: new Date() } },
      include: { product: true },
      orderBy: { validFrom: 'asc' },
    });
    res.json(offers);
  } catch (err) { next(err); }
});

// POST /api/farms/:id/seasonal (FARMER only)
farmsRouter.post('/:id/seasonal', requireAuth, requireRole('FARMER','ADMIN'), async (req, res, next) => {
  try {
    const farm = await prisma.farm.findUnique({ where: { id: req.params.id } });
    if (!farm) return res.status(404).json({ error: 'Farma nenalezena' });
    if (farm.ownerId !== req.user.id && req.user.role !== 'ADMIN')
      return res.status(403).json({ error: 'Nemáte oprávnění' });

    const { title, description, emoji, validFrom, validTo, productId, discount } = req.body;
    const offer = await prisma.seasonalOffer.create({
      data: {
        farmId: req.params.id,
        title, description, emoji,
        validFrom: new Date(validFrom),
        validTo: new Date(validTo),
        productId: productId || null,
        discount: discount ? Number(discount) : null,
      },
    });
    res.status(201).json(offer);
  } catch (err) { next(err); }
});
