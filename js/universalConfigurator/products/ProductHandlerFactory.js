import { FlatPrintHandler } from './FlatPrintHandler.js';
import { FoldedPrintHandler } from './FoldedPrintHandler.js';
import { BookletHandler } from './BookletHandler.js';
import { PosterHandler } from './PosterHandler.js';
import { StickerHandler } from './StickerHandler.js';
import { PerfectBoundHandler } from './PerfectBoundHandler.js';
import { NotebookHandler } from './NotebookHandler.js';
import { NotepadHandler } from './NotepadHandler.js';

export class ProductHandlerFactory {
  constructor(pricingManager, configManager) {
    this.pricingManager = pricingManager;
    this.configManager = configManager;
    this.handlers = new Map();
    this.initializeHandlers();
  }

  initializeHandlers() {
    this.handlers.set('flat-prints', new FlatPrintHandler());
    this.handlers.set('folded-prints', new FoldedPrintHandler());
    this.handlers.set('booklets', new BookletHandler());
    this.handlers.set('posters', new PosterHandler(this.pricingManager, this.configManager));
    this.handlers.set('stickers', new StickerHandler(this.pricingManager));
    this.handlers.set('perfect-bound-books', new PerfectBoundHandler());
    this.handlers.set('notebooks', new NotebookHandler());
    this.handlers.set('notepads', new NotepadHandler());
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
