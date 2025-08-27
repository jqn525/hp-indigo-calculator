// Inventory Structure - Static Data Source
// SFU Document Solutions Inventory Management
// This file defines the complete inventory hierarchy

export const inventoryStructure = {
  "Paper Products": {
    icon: "PAPER",
    subcategories: {
      "8.5x11 Paper": {
        icon: "PAPER",
        subcategories: {
          "Copy Paper": {
            items: [
              { id: "COPY_8511_20_WHT", name: "White 20lb", sku: "COPY-8511-20-WHT", unit: "ream", location: "Paper Storage A" },
              { id: "COPY_8511_20_CRM", name: "Cream 20lb", sku: "COPY-8511-20-CRM", unit: "ream", location: "Paper Storage A" },
              { id: "COPY_8511_24_WHT", name: "White 24lb", sku: "COPY-8511-24-WHT", unit: "ream", location: "Paper Storage A" }
            ]
          },
          "Text Weight": {
            items: [
              { id: "TEXT_8511_60_WHT", name: "White 60lb Text", sku: "TEXT-8511-60-WHT", unit: "ream", location: "Paper Storage B" },
              { id: "TEXT_8511_70_WHT", name: "White 70lb Text", sku: "TEXT-8511-70-WHT", unit: "ream", location: "Paper Storage B" },
              { id: "TEXT_8511_80_WHT", name: "White 80lb Text", sku: "TEXT-8511-80-WHT", unit: "ream", location: "Paper Storage B" }
            ]
          },
          "Cover Weight": {
            items: [
              { id: "COVER_8511_65_WHT", name: "White 65lb Cover", sku: "COVER-8511-65-WHT", unit: "ream", location: "Paper Storage C" },
              { id: "COVER_8511_80_WHT", name: "White 80lb Cover", sku: "COVER-8511-80-WHT", unit: "ream", location: "Paper Storage C" },
              { id: "COVER_8511_100_WHT", name: "White 100lb Cover", sku: "COVER-8511-100-WHT", unit: "ream", location: "Paper Storage C" }
            ]
          }
        }
      },
      "11x17 Paper": {
        icon: "PAPER",
        subcategories: {
          "Copy Paper": {
            items: [
              { id: "COPY_1117_20_WHT", name: "White 20lb", sku: "COPY-1117-20-WHT", unit: "ream", location: "Paper Storage A" },
              { id: "COPY_1117_24_WHT", name: "White 24lb", sku: "COPY-1117-24-WHT", unit: "ream", location: "Paper Storage A" }
            ]
          },
          "Text Weight": {
            items: [
              { id: "TEXT_1117_60_WHT", name: "White 60lb Text", sku: "TEXT-1117-60-WHT", unit: "ream", location: "Paper Storage B" },
              { id: "TEXT_1117_70_WHT", name: "White 70lb Text", sku: "TEXT-1117-70-WHT", unit: "ream", location: "Paper Storage B" },
              { id: "TEXT_1117_80_WHT", name: "White 80lb Text", sku: "TEXT-1117-80-WHT", unit: "ream", location: "Paper Storage B" }
            ]
          },
          "Cover Weight": {
            items: [
              { id: "COVER_1117_65_WHT", name: "White 65lb Cover", sku: "COVER-1117-65-WHT", unit: "ream", location: "Paper Storage C" },
              { id: "COVER_1117_80_WHT", name: "White 80lb Cover", sku: "COVER-1117-80-WHT", unit: "ream", location: "Paper Storage C" },
              { id: "COVER_1117_100_WHT", name: "White 100lb Cover", sku: "COVER-1117-100-WHT", unit: "ream", location: "Paper Storage C" }
            ]
          }
        }
      },
      "13x19 Paper": {
        icon: "PAPER",
        subcategories: {
          "Uncoated": {
            items: [
              { id: "UNC_1319_20_WHT", name: "White 20lb", sku: "UNC-1319-20-WHT", unit: "ream", location: "Large Format Storage" },
              { id: "UNC_1319_28_WHT", name: "White 28lb", sku: "UNC-1319-28-WHT", unit: "ream", location: "Large Format Storage" },
              { id: "UNC_1319_32_WHT", name: "White 32lb", sku: "UNC-1319-32-WHT", unit: "ream", location: "Large Format Storage" },
              { id: "UNC_1319_65_WHT", name: "White 65lb Cover", sku: "UNC-1319-65-WHT", unit: "ream", location: "Large Format Storage" },
              { id: "UNC_1319_80_WHT", name: "White 80lb Cover", sku: "UNC-1319-80-WHT", unit: "ream", location: "Large Format Storage" }
            ]
          },
          "Coated": {
            items: [
              { id: "COAT_1319_80_GLS", name: "Gloss 80lb Text", sku: "COAT-1319-80-GLS", unit: "ream", location: "Large Format Storage" },
              { id: "COAT_1319_100_GLS", name: "Gloss 100lb Text", sku: "COAT-1319-100-GLS", unit: "ream", location: "Large Format Storage" },
              { id: "COAT_1319_80_MAT", name: "Matte 80lb Text", sku: "COAT-1319-80-MAT", unit: "ream", location: "Large Format Storage" }
            ]
          },
          "Specialty": {
            items: [
              { id: "SPEC_1319_LINEN", name: "Linen Finish", sku: "SPEC-1319-LINEN", unit: "ream", location: "Specialty Storage" },
              { id: "SPEC_1319_FELT", name: "Felt Finish", sku: "SPEC-1319-FELT", unit: "ream", location: "Specialty Storage" }
            ]
          }
        }
      }
    }
  },
  "Wide Format Media": {
    icon: "MEDIA",
    subcategories: {
      "Roll Media": {
        icon: "ROLL",
        subcategories: {
          "Photo Paper": {
            items: [
              { id: "WF_PHOTO_24_GLS", name: "24\" Glossy Photo", sku: "WF-PHOTO-24-GLS", unit: "roll", location: "Wide Format Area" },
              { id: "WF_PHOTO_36_GLS", name: "36\" Glossy Photo", sku: "WF-PHOTO-36-GLS", unit: "roll", location: "Wide Format Area" },
              { id: "WF_PHOTO_42_GLS", name: "42\" Glossy Photo", sku: "WF-PHOTO-42-GLS", unit: "roll", location: "Wide Format Area" },
              { id: "WF_PHOTO_24_MAT", name: "24\" Matte Photo", sku: "WF-PHOTO-24-MAT", unit: "roll", location: "Wide Format Area" },
              { id: "WF_PHOTO_36_MAT", name: "36\" Matte Photo", sku: "WF-PHOTO-36-MAT", unit: "roll", location: "Wide Format Area" }
            ]
          },
          "Vinyl": {
            items: [
              { id: "WF_VINYL_24_ADH", name: "24\" Adhesive Vinyl", sku: "WF-VINYL-24-ADH", unit: "roll", location: "Wide Format Area" },
              { id: "WF_VINYL_36_ADH", name: "36\" Adhesive Vinyl", sku: "WF-VINYL-36-ADH", unit: "roll", location: "Wide Format Area" },
              { id: "WF_VINYL_54_ADH", name: "54\" Adhesive Vinyl", sku: "WF-VINYL-54-ADH", unit: "roll", location: "Wide Format Area" }
            ]
          },
          "Banner Material": {
            items: [
              { id: "WF_BANNER_36", name: "36\" Banner Material", sku: "WF-BANNER-36", unit: "roll", location: "Wide Format Area" },
              { id: "WF_BANNER_54", name: "54\" Banner Material", sku: "WF-BANNER-54", unit: "roll", location: "Wide Format Area" }
            ]
          }
        }
      },
      "Rigid Substrates": {
        icon: "BOARD",
        items: [
          { id: "WF_FOAM_2040", name: "Foam Core 20x30", sku: "WF-FOAM-2030", unit: "sheet", location: "Wide Format Area" },
          { id: "WF_FOAM_3240", name: "Foam Core 32x40", sku: "WF-FOAM-3240", unit: "sheet", location: "Wide Format Area" },
          { id: "WF_GATOR_2030", name: "Gator Board 20x30", sku: "WF-GATOR-2030", unit: "sheet", location: "Wide Format Area" },
          { id: "WF_GATOR_3240", name: "Gator Board 32x40", sku: "WF-GATOR-3240", unit: "sheet", location: "Wide Format Area" },
          { id: "WF_CORR_2440", name: "Corrugated 24x36", sku: "WF-CORR-2436", unit: "sheet", location: "Wide Format Area" }
        ]
      }
    }
  },
  "Wide Format Inks": {
    icon: "INK",
    subcategories: {
      "Epson Inks": {
        icon: "EPSON",
        items: [
          { id: "INK_EPS_T5961_BLK", name: "T5961 Photo Black", sku: "INK-EPS-T5961", unit: "cartridge", location: "Ink Storage" },
          { id: "INK_EPS_T5962_CYN", name: "T5962 Cyan", sku: "INK-EPS-T5962", unit: "cartridge", location: "Ink Storage" },
          { id: "INK_EPS_T5963_MAG", name: "T5963 Magenta", sku: "INK-EPS-T5963", unit: "cartridge", location: "Ink Storage" },
          { id: "INK_EPS_T5964_YEL", name: "T5964 Yellow", sku: "INK-EPS-T5964", unit: "cartridge", location: "Ink Storage" },
          { id: "INK_EPS_T5965_LCY", name: "T5965 Light Cyan", sku: "INK-EPS-T5965", unit: "cartridge", location: "Ink Storage" },
          { id: "INK_EPS_T5966_LMG", name: "T5966 Light Magenta", sku: "INK-EPS-T5966", unit: "cartridge", location: "Ink Storage" }
        ]
      },
      "Mutoh Inks": {
        icon: "MUTOH",
        items: [
          { id: "INK_MUT_ECO_BLK", name: "Eco-Ultra Black", sku: "INK-MUT-ECO-BLK", unit: "cartridge", location: "Ink Storage" },
          { id: "INK_MUT_ECO_CYN", name: "Eco-Ultra Cyan", sku: "INK-MUT-ECO-CYN", unit: "cartridge", location: "Ink Storage" },
          { id: "INK_MUT_ECO_MAG", name: "Eco-Ultra Magenta", sku: "INK-MUT-ECO-MAG", unit: "cartridge", location: "Ink Storage" },
          { id: "INK_MUT_ECO_YEL", name: "Eco-Ultra Yellow", sku: "INK-MUT-ECO-YEL", unit: "cartridge", location: "Ink Storage" }
        ]
      }
    }
  },
  "Toners & Cartridges": {
    icon: "TONER",
    subcategories: {
      "HP Toners": {
        items: [
          { id: "TON_HP_BLK_85A", name: "HP 85A Black Toner", sku: "TON-HP-85A-BLK", unit: "cartridge", location: "Toner Storage" },
          { id: "TON_HP_CYN_85A", name: "HP 85A Cyan Toner", sku: "TON-HP-85A-CYN", unit: "cartridge", location: "Toner Storage" },
          { id: "TON_HP_MAG_85A", name: "HP 85A Magenta Toner", sku: "TON-HP-85A-MAG", unit: "cartridge", location: "Toner Storage" },
          { id: "TON_HP_YEL_85A", name: "HP 85A Yellow Toner", sku: "TON-HP-85A-YEL", unit: "cartridge", location: "Toner Storage" }
        ]
      },
      "Canon Toners": {
        items: [
          { id: "TON_CAN_BLK_051", name: "Canon 051 Black", sku: "TON-CAN-051-BLK", unit: "cartridge", location: "Toner Storage" },
          { id: "TON_CAN_CYN_051", name: "Canon 051 Cyan", sku: "TON-CAN-051-CYN", unit: "cartridge", location: "Toner Storage" },
          { id: "TON_CAN_MAG_051", name: "Canon 051 Magenta", sku: "TON-CAN-051-MAG", unit: "cartridge", location: "Toner Storage" },
          { id: "TON_CAN_YEL_051", name: "Canon 051 Yellow", sku: "TON-CAN-051-YEL", unit: "cartridge", location: "Toner Storage" }
        ]
      }
    }
  },
  "Binding Supplies": {
    icon: "BIND",
    items: [
      { id: "BIND_COIL_6MM", name: "6mm Binding Coils", sku: "BIND-COIL-6MM", unit: "box (100)", location: "Finishing Area" },
      { id: "BIND_COIL_8MM", name: "8mm Binding Coils", sku: "BIND-COIL-8MM", unit: "box (100)", location: "Finishing Area" },
      { id: "BIND_COIL_10MM", name: "10mm Binding Coils", sku: "BIND-COIL-10MM", unit: "box (100)", location: "Finishing Area" },
      { id: "BIND_COIL_12MM", name: "12mm Binding Coils", sku: "BIND-COIL-12MM", unit: "box (100)", location: "Finishing Area" },
      { id: "BIND_WIRE_6MM", name: "6mm Wire-O Binding", sku: "BIND-WIRE-6MM", unit: "box (100)", location: "Finishing Area" },
      { id: "BIND_WIRE_8MM", name: "8mm Wire-O Binding", sku: "BIND-WIRE-8MM", unit: "box (100)", location: "Finishing Area" },
      { id: "BIND_WIRE_10MM", name: "10mm Wire-O Binding", sku: "BIND-WIRE-10MM", unit: "box (100)", location: "Finishing Area" },
      { id: "BIND_COVERS_CLR", name: "Clear Binding Covers", sku: "BIND-COVERS-CLR", unit: "pack (100)", location: "Finishing Area" },
      { id: "BIND_COVERS_BLK", name: "Black Binding Covers", sku: "BIND-COVERS-BLK", unit: "pack (100)", location: "Finishing Area" }
    ]
  },
  "Shipping Supplies": {
    icon: "SHIP",
    items: [
      { id: "SHIP_BOX_SM", name: "Small Shipping Box", sku: "SHIP-BOX-SM", unit: "box", location: "Shipping Area" },
      { id: "SHIP_BOX_MD", name: "Medium Shipping Box", sku: "SHIP-BOX-MD", unit: "box", location: "Shipping Area" },
      { id: "SHIP_BOX_LG", name: "Large Shipping Box", sku: "SHIP-BOX-LG", unit: "box", location: "Shipping Area" },
      { id: "SHIP_TAPE", name: "Packing Tape", sku: "SHIP-TAPE", unit: "roll", location: "Shipping Area" },
      { id: "SHIP_BUBBLE", name: "Bubble Wrap", sku: "SHIP-BUBBLE", unit: "roll", location: "Shipping Area" },
      { id: "SHIP_LABELS", name: "Shipping Labels", sku: "SHIP-LABELS", unit: "sheet", location: "Shipping Area" }
    ]
  }
};

// Function to get all items as a flat array for searching
export function getAllInventoryItems() {
  const items = [];
  
  function extractItems(obj, categoryPath = []) {
    if (obj.items) {
      // Direct items
      obj.items.forEach(item => {
        items.push({
          ...item,
          category: categoryPath.join(' > '),
          categoryPath: categoryPath
        });
      });
    }
    
    if (obj.subcategories) {
      // Recurse into subcategories
      Object.entries(obj.subcategories).forEach(([key, subcat]) => {
        extractItems(subcat, [...categoryPath, key]);
      });
    }
  }
  
  Object.entries(inventoryStructure).forEach(([categoryName, category]) => {
    extractItems(category, [categoryName]);
  });
  
  return items;
}

// Function to search items
export function searchInventoryItems(query) {
  const allItems = getAllInventoryItems();
  const lowercaseQuery = query.toLowerCase();
  
  return allItems.filter(item => 
    item.name.toLowerCase().includes(lowercaseQuery) ||
    item.sku.toLowerCase().includes(lowercaseQuery) ||
    item.category.toLowerCase().includes(lowercaseQuery) ||
    item.location.toLowerCase().includes(lowercaseQuery)
  );
}

// Function to get item by ID
export function getItemById(itemId) {
  const allItems = getAllInventoryItems();
  return allItems.find(item => item.id === itemId);
}