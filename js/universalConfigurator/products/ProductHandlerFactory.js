import { FlatPrintHandler } from './FlatPrintHandler.js';
import { FoldedPrintHandler } from './FoldedPrintHandler.js';
import { BookletHandler } from './BookletHandler.js';
import { PosterHandler } from './PosterHandler.js';
import { StickerHandler } from './StickerHandler.js';

export class ProductHandlerFactory {
  constructor(pricingManager) {
    this.pricingManager = pricingManager;
    this.handlers = new Map();
    this.initializeHandlers();
  }

  initializeHandlers() {
    this.handlers.set('flat-prints', new FlatPrintHandler());
    this.handlers.set('folded-prints', new FoldedPrintHandler());
    this.handlers.set('booklets', new BookletHandler());
    this.handlers.set('posters', new PosterHandler(this.pricingManager));
    this.handlers.set('stickers', new StickerHandler(this.pricingManager));
  }

  getHandler(productType) {
    return this.handlers.get(productType);
  }

  hasHandler(productType) {
    return this.handlers.has(productType);
  }

  getAllProductTypes() {
    return Array.from(this.handlers.keys());
  }
}
