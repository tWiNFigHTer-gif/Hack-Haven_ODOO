import { Router } from 'express';
import {
  createProduct,
  createProductVariant,
} from './catalog.controller';

const router = Router();

// POST /api/products - Create a base product
router.post('/products', createProduct);

// POST /api/products/:id/variants - Add a variant to a product
router.post('/products/:id/variants', createProductVariant);

export default router;

