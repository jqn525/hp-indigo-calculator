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
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = paperStocks;
}