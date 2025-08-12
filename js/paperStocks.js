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
  
  // Large Format Materials
  "RMPS002": {
    "brand": "Rite-Media",
    "type": "large_format_paper",
    "finish": "Matte",
    "size": "54\"x150ft",
    "thickness": "9mil",
    "costPerRoll": 162.65,
    "chargeRate": 6.00, // per sqft
    "displayName": "Paper - 9mil Matte"
  },
  "QMPFL501503": {
    "brand": "Generic",
    "type": "large_format_fabric",
    "finish": "Matte Coated Fabric",
    "size": "50\"x150ft", 
    "thickness": "8mil",
    "costPerRoll": 259.95,
    "chargeRate": 9.00, // per sqft
    "displayName": "Fabric - 8mil Matte Coated"
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = paperStocks;
}