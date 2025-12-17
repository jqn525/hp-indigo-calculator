const paperStocks = {
  "LYNODI312FSC": {
    "brand": "Lynx",
    "type": "text_stock",
    "finish": "Uncoated",
    "size": "13x19",
    "weight": "60#",
    "costPerSheet": 0.08548,
    "displayName": "60# Text Uncoated"
  },
  "LYNO416FSC": {
    "brand": "Lynx",
    "type": "text_stock",
    "finish": "Uncoated",
    "size": "13x19",
    "weight": "80#",
    "costPerSheet": 0.11397,
    "displayName": "80# Text Uncoated"
  },
  "LYNO52FSC": {
    "brand": "Lynx",
    "type": "text_stock",
    "finish": "Uncoated",
    "size": "13x19",
    "weight": "100#",
    "costPerSheet": 0.1425,
    "displayName": "100# Text Uncoated"
  },
  "LYNOC76FSC": {
    "brand": "Lynx",
    "type": "cover_stock",
    "finish": "Uncoated",
    "size": "13x19",
    "weight": "80#",
    "costPerSheet": 0.22408,
    "displayName": "80# Cover Uncoated"
  },
  "LYNOC95FSC": {
    "brand": "Lynx",
    "type": "cover_stock",
    "finish": "Uncoated",
    "size": "13x19",
    "weight": "100#",
    "costPerSheet": 0.28010,
    "displayName": "100# Cover Uncoated"
  },
  "LYNODIC11413FSC": {
    "brand": "Lynx",
    "type": "cover_stock",
    "finish": "Uncoated",
    "size": "13x19",
    "weight": "120#",
    "costPerSheet": 0.38147,
    "displayName": "120# Cover Uncoated"
  },
  "COUDCCDIC123513FSC": {
    "brand": "Cougar",
    "type": "cover_stock",
    "finish": "Uncoated",
    "size": "13x19",
    "weight": "130#",
    "costPerSheet": 0.53800,
    "displayName": "130# Cover Uncoated"
  },
  "PACDIS42FSC": {
    "brand": "Pacesetter",
    "type": "text_stock",
    "finish": "Silk",
    "size": "13x19",
    "weight": "80#",
    "costPerSheet": 0.07702,
    "displayName": "80# Text Silk"
  },
  "PACDIS52FSC": {
    "brand": "Pacesetter",
    "type": "text_stock",
    "finish": "Silk",
    "size": "13x19",
    "weight": "100#",
    "costPerSheet": 0.09536,
    "displayName": "100# Text Silk"
  },
  "PACDISC7613FSC": {
    "brand": "Pacesetter",
    "type": "cover_stock",
    "finish": "Silk",
    "size": "13x19",
    "weight": "80#",
    "costPerSheet": 0.14204,
    "displayName": "80# Cover Silk"
  },
  "PACDISC9513FSC": {
    "brand": "Pacesetter",
    "type": "cover_stock",
    "finish": "Silk",
    "size": "13x19",
    "weight": "100#",
    "costPerSheet": 0.17756,
    "displayName": "100# Cover Silk"
  },
  "PACDISC12413FSC": {
    "brand": "Pacesetter",
    "type": "cover_stock",
    "finish": "Silk",
    "size": "13x19",
    "weight": "130#",
    "costPerSheet": 0.23176,
    "displayName": "130# Cover Silk"
  },
  "PAC51319WP": {
    "brand": "Pacesetter",
    "type": "adhesive_stock",
    "finish": "Adhesive",
    "size": "13x19",
    "weight": "Adhesive",
    "costPerSheet": 3.705,
    "displayName": "Adhesive Stock"
  },
  
  // Large Format Materials - Roll Media
  "LARGE_FORMAT_BOND": {
    "brand": "Generic",
    "type": "large_format_paper",
    "finish": "Bond",
    "size": "36\"x150ft",
    "thickness": "20lb",
    "chargeRate": 3.00, // per sqft
    "displayName": "Bond Paper",
    "maxWidth": 54
  },
  "LARGE_FORMAT_PAPER": {
    "brand": "Generic",
    "type": "large_format_paper",
    "finish": "Matte",
    "size": "54\"x150ft",
    "thickness": "9mil",
    "chargeRate": 6.00, // per sqft
    "displayName": "Paper",
    "maxWidth": 54
  },
  "LARGE_FORMAT_FABRIC": {
    "brand": "Generic",
    "type": "large_format_fabric",
    "finish": "Matte Coated Fabric",
    "size": "50\"x150ft",
    "thickness": "8mil",
    "chargeRate": 9.00, // per sqft
    "displayName": "Fabric",
    "maxWidth": 50
  },
  "LARGE_FORMAT_PET_VINYL": {
    "brand": "Generic",
    "type": "large_format_vinyl",
    "finish": "Matte",
    "size": "54\"x150ft",
    "thickness": "4mil",
    "chargeRate": 12.00, // per sqft
    "displayName": "PET Vinyl",
    "maxWidth": 36
  },
  "LARGE_FORMAT_SCRIM_VINYL": {
    "brand": "Generic",
    "type": "large_format_vinyl",
    "finish": "Matte",
    "size": "54\"x150ft",
    "thickness": "13mil",
    "chargeRate": 10.00, // per sqft
    "displayName": "Scrim Vinyl",
    "maxWidth": 54
  },
  "LARGE_FORMAT_VINYL_ADHESIVE": {
    "brand": "Generic",
    "type": "large_format_vinyl",
    "finish": "Adhesive",
    "size": "54\"x150ft",
    "thickness": "3mil",
    "chargeRate": 12.00, // per sqft
    "displayName": "Vinyl Adhesive",
    "maxWidth": 54
  },

  // Large Format Materials - Rigid Substrates
  "LARGE_FORMAT_COROPLAST": {
    "brand": "Generic",
    "type": "large_format_rigid",
    "finish": "Corrugated Plastic",
    "size": "48\"x96\"",
    "thickness": "4mm",
    "chargeRate": 10.00, // per sqft
    "displayName": "Corrugated Plastic",
    "fixedWidth": 48,
    "fixedHeight": 96
  },
  "LARGE_FORMAT_FOAMCORE": {
    "brand": "Generic",
    "type": "large_format_rigid",
    "finish": "Foam Core",
    "size": "48\"x96\"",
    "thickness": "3/16\"",
    "chargeRate": 12.00, // per sqft
    "displayName": "Foam Core Board",
    "fixedWidth": 48,
    "fixedHeight": 96
  },
  "LARGE_FORMAT_CARDBOARD": {
    "brand": "Generic",
    "type": "large_format_rigid",
    "finish": "Corrugated Cardboard",
    "size": "48\"x96\"",
    "thickness": "3/16\"",
    "chargeRate": 10.00, // per sqft
    "displayName": "Corrugated Cardboard",
    "fixedWidth": 48,
    "fixedHeight": 96
  },
  "LARGE_FORMAT_PVC": {
    "brand": "Generic",
    "type": "large_format_rigid",
    "finish": "PVC",
    "size": "48\"x96\"",
    "thickness": "3mm",
    "chargeRate": 14.00, // per sqft
    "displayName": "PVC Board",
    "fixedWidth": 48,
    "fixedHeight": 96
  },
  "LARGE_FORMAT_DIBOND": {
    "brand": "Generic",
    "type": "large_format_rigid",
    "finish": "Aluminum Composite",
    "size": "48\"x96\"",
    "thickness": "3mm",
    "chargeRate": 16.00, // per sqft
    "displayName": "Aluminum Composite",
    "fixedWidth": 48,
    "fixedHeight": 96
  },

  // Envelope Stock - SupremeX/Spicers Pre-made Envelopes
  // #10 Business Envelopes (4-1/8 × 9-1/2)
  "SUPX10WSFSC-S": {
    "brand": "SupremeX",
    "type": "envelope_stock",
    "category": "business",
    "envelopeSize": "#10",
    "dimensions": "4-1/8 x 9-1/2",
    "color": "white",
    "feature": "plain",
    "paperWeight": "24#",
    "costPerUnit": 0.0362,
    "displayName": "#10 Business White (4-1/8\" × 9-1/2\")"
  },
  "SUPX10ASFSCNL": {
    "brand": "SupremeX",
    "type": "envelope_stock",
    "category": "business",
    "envelopeSize": "#10",
    "dimensions": "4-1/8 x 9-1/2",
    "color": "artline",
    "feature": "security",
    "paperWeight": "24#",
    "costPerUnit": 0.0692,
    "displayName": "#10 Business Artline/Security (4-1/8\" × 9-1/2\")"
  },
  "SUPX10WWSFSCDNL": {
    "brand": "SupremeX",
    "type": "envelope_stock",
    "category": "business",
    "envelopeSize": "#10",
    "dimensions": "4-1/8 x 9-1/2",
    "color": "white",
    "feature": "window",
    "paperWeight": "24#",
    "costPerUnit": 0.0529,
    "displayName": "#10 Business Window (4-1/8\" × 9-1/2\")"
  },

  // Invitation Envelopes
  "SUPX2IWSDSSFSCNL": {
    "brand": "SupremeX",
    "type": "envelope_stock",
    "category": "invitation",
    "envelopeSize": "#2",
    "dimensions": "4-1/8 x 6-1/8",
    "color": "white",
    "feature": "plain",
    "paperWeight": "24#",
    "costPerUnit": 0.1174,
    "displayName": "#2 Invitation White (4-1/8\" × 6-1/8\")"
  },
  "SUPX4IWSDSSFSCNL": {
    "brand": "SupremeX",
    "type": "envelope_stock",
    "category": "invitation",
    "envelopeSize": "#4",
    "dimensions": "5 x 6-1/2",
    "color": "white",
    "feature": "plain",
    "paperWeight": "24#",
    "costPerUnit": 0.1224,
    "displayName": "#4 Invitation White (5\" × 6-1/2\")"
  },
  "SUPXA6WSFSCNL": {
    "brand": "SupremeX",
    "type": "envelope_stock",
    "category": "invitation",
    "envelopeSize": "A6",
    "dimensions": "4-3/4 x 6-1/2",
    "color": "white",
    "feature": "plain",
    "paperWeight": "24#",
    "costPerUnit": 0.0881,
    "displayName": "A6 Invitation White (4-3/4\" × 6-1/2\")"
  },
  "SUPXT41WASFSCNL": {
    "brand": "SupremeX",
    "type": "envelope_stock",
    "category": "invitation",
    "envelopeSize": "T-4",
    "dimensions": "5-3/4 x 9",
    "color": "artline",
    "feature": "window",
    "paperWeight": "24#",
    "costPerUnit": 0.1918,
    "displayName": "T-4 Window Artline (5-3/4\" × 9\")"
  },

  // Booklet Envelopes (Side Opening)
  "SUPX3BWSFSCNL": {
    "brand": "SupremeX",
    "type": "envelope_stock",
    "category": "booklet",
    "envelopeSize": "#3",
    "dimensions": "6-1/2 x 9-1/2",
    "color": "white",
    "feature": "plain",
    "paperWeight": "24#",
    "costPerUnit": 0.1686,
    "displayName": "#3 Booklet White (6-1/2\" × 9-1/2\")"
  },
  "SUPX7BWSFSC-S": {
    "brand": "SupremeX",
    "type": "envelope_stock",
    "category": "booklet",
    "envelopeSize": "#7",
    "dimensions": "9 x 12",
    "color": "white",
    "feature": "plain",
    "paperWeight": "24#",
    "costPerUnit": 0.1363,
    "displayName": "#7 Booklet White (9\" × 12\")"
  },
  "SUPX7BNKRSFSCNL": {
    "brand": "SupremeX",
    "type": "envelope_stock",
    "category": "booklet",
    "envelopeSize": "#7",
    "dimensions": "9 x 12",
    "color": "kraft",
    "feature": "plain",
    "paperWeight": "24#",
    "costPerUnit": 0.2262,
    "displayName": "#7 Booklet Kraft (9\" × 12\")"
  },
  "SUPX8BWSFSCNL": {
    "brand": "SupremeX",
    "type": "envelope_stock",
    "category": "booklet",
    "envelopeSize": "#8",
    "dimensions": "10 x 13",
    "color": "white",
    "feature": "plain",
    "paperWeight": "24#",
    "costPerUnit": 0.1743,
    "displayName": "#8 Booklet White (10\" × 13\")"
  },
  "SUPX8BNKRSFSCNL": {
    "brand": "SupremeX",
    "type": "envelope_stock",
    "category": "booklet",
    "envelopeSize": "#8",
    "dimensions": "10 x 13",
    "color": "kraft",
    "feature": "plain",
    "paperWeight": "24#",
    "costPerUnit": 0.2619,
    "displayName": "#8 Booklet Kraft (10\" × 13\")"
  },

  // Catalogue Envelopes (End Opening)
  "SUPX69WEFSCNL": {
    "brand": "SupremeX",
    "type": "envelope_stock",
    "category": "catalogue",
    "envelopeSize": "#3",
    "dimensions": "6-1/2 x 9-1/2",
    "color": "white",
    "feature": "plain",
    "paperWeight": "24#",
    "costPerUnit": 0.1601,
    "displayName": "#3 Catalogue White (6-1/2\" × 9-1/2\")"
  },
  "SUPX710WEFSCNL": {
    "brand": "SupremeX",
    "type": "envelope_stock",
    "category": "catalogue",
    "envelopeSize": "#5",
    "dimensions": "7-1/2 x 10-1/2",
    "color": "white",
    "feature": "plain",
    "paperWeight": "24#",
    "costPerUnit": 0.2058,
    "displayName": "#5 Catalogue White (7-1/2\" × 10-1/2\")"
  },
  "SUPX912WEFSC-S": {
    "brand": "SupremeX",
    "type": "envelope_stock",
    "category": "catalogue",
    "envelopeSize": "#7",
    "dimensions": "9 x 12",
    "color": "white",
    "feature": "plain",
    "paperWeight": "24#",
    "costPerUnit": 0.1349,
    "displayName": "#7 Catalogue White (9\" × 12\")"
  },
  "SUPX912NKEFSC-S": {
    "brand": "SupremeX",
    "type": "envelope_stock",
    "category": "catalogue",
    "envelopeSize": "#7",
    "dimensions": "9 x 12",
    "color": "kraft",
    "feature": "plain",
    "paperWeight": "24#",
    "costPerUnit": 0.1357,
    "displayName": "#7 Catalogue Kraft (9\" × 12\")"
  },
  "SUPX912WAEFSCNL": {
    "brand": "SupremeX",
    "type": "envelope_stock",
    "category": "catalogue",
    "envelopeSize": "#7",
    "dimensions": "9 x 12",
    "color": "white",
    "feature": "artline",
    "paperWeight": "24#",
    "costPerUnit": 0.2745,
    "displayName": "#7 Catalogue White Artline (9\" × 12\")"
  },

  // Premium Envelopes (Classic Crest 80#)
  "CLACCNWA6FSC": {
    "brand": "Classic Crest",
    "type": "envelope_stock",
    "category": "premium",
    "envelopeSize": "A6",
    "dimensions": "4-3/4 x 6-1/2",
    "color": "natural white",
    "feature": "premium",
    "paperWeight": "80#",
    "costPerUnit": 0.3931,
    "displayName": "A6 Classic Crest Natural White (4-3/4\" × 6-1/2\")"
  },
  "CLACCNWA7FSC": {
    "brand": "Classic Crest",
    "type": "envelope_stock",
    "category": "premium",
    "envelopeSize": "A7",
    "dimensions": "5-1/4 x 7-1/4",
    "color": "natural white",
    "feature": "premium",
    "paperWeight": "80#",
    "costPerUnit": 0.4428,
    "displayName": "A7 Classic Crest Natural White (5-1/4\" × 7-1/4\")"
  },
  "CLACSRWA6FSC": {
    "brand": "Classic Crest",
    "type": "envelope_stock",
    "category": "premium",
    "envelopeSize": "A6",
    "dimensions": "4-3/4 x 6-1/2",
    "color": "solar white",
    "feature": "premium",
    "paperWeight": "80#",
    "costPerUnit": 0.3980,
    "displayName": "A6 Classic Crest Solar White (4-3/4\" × 6-1/2\")"
  },
  "CLACSRWA7FSC": {
    "brand": "Classic Crest",
    "type": "envelope_stock",
    "category": "premium",
    "envelopeSize": "A7",
    "dimensions": "5-1/4 x 7-1/4",
    "color": "solar white",
    "feature": "premium",
    "paperWeight": "80#",
    "costPerUnit": 0.4486,
    "displayName": "A7 Classic Crest Solar White (5-1/4\" × 7-1/4\")"
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = paperStocks;
}