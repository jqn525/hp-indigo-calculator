import math
from .imposition import ImpositionCalculator
from config.pricing_config import PRICING_CONFIG
from config.paper_stocks import PAPER_STOCKS


class PricingCalculator:
    """
    Core pricing calculator that ports all 7 pricing functions from calculator.js
    Base Formula: C(Q) = (S + F_setup + S_total^e * k + Q * v + Q * f) * r
    """

    def __init__(self):
        self.imposition_calc = ImpositionCalculator()
        self.config = PRICING_CONFIG
        self.paper_stocks = PAPER_STOCKS

    def _get_rush_multiplier(self, rush_type):
        """Get rush multiplier from config"""
        return self.config['rush_multipliers'].get(rush_type, {}).get('multiplier', 1.0)

    def _parse_size_string(self, size_str):
        """Parse size strings like '4x6' or '8.5x11'"""
        parts = size_str.replace('"', '').replace("'", '').split('x')
        return float(parts[0]), float(parts[1])

    def calculate_flat_print_price(self, quantity, width, height, paper_code,
                                   printing_sides='double-sided', hole_punch=False,
                                   lanyard=False, rush_type='standard'):
        """
        Calculate price for flat prints (postcards, flyers, bookmarks, name tags)
        """
        paper = self.paper_stocks.get(paper_code)
        if not paper:
            return {'error': 'Invalid paper selection'}

        constraints = self.config['product_constraints']['flat-prints']
        if quantity < constraints['min_quantity'] or quantity > constraints['max_quantity']:
            return {'error': f"Quantity must be between {constraints['min_quantity']} and {constraints['max_quantity']}"}

        formula = self.config['formula']
        S = formula['setup_fee']
        k = formula['base_production_rate']
        e = formula['efficiency_exponent']

        clicks_per_piece = 0.10 if printing_sides == 'double-sided' else 0.05
        paper_cost = paper['cost_per_sheet']

        imposition_result = self.imposition_calc.calculate_imposition(width, height)
        if imposition_result.get('error'):
            return {'error': imposition_result['error']}

        imposition = imposition_result['copies']
        if imposition == 0:
            return {'error': 'Unable to calculate imposition for given dimensions'}

        v = (paper_cost + clicks_per_piece) * 1.5 / imposition

        is_adhesive = paper_code == 'PAC51319WP'
        f = 0
        if not is_adhesive:
            if hole_punch:
                f += 0.05
            if lanyard:
                f += 1.25
        needs_finishing = f > 0

        rush_multiplier = self._get_rush_multiplier(rush_type)

        printing_setup_cost = S
        finishing_setup_cost = 0
        S_total = math.ceil(quantity / imposition)
        production_cost = (S_total ** e) * k
        material_cost = quantity * v
        finishing_cost = quantity * f

        subtotal = printing_setup_cost + finishing_setup_cost + production_cost + material_cost + finishing_cost
        total_cost = subtotal * rush_multiplier
        unit_price = total_cost / quantity

        return {
            'printing_setup_cost': round(printing_setup_cost, 2),
            'finishing_setup_cost': round(finishing_setup_cost, 2),
            'needs_finishing': needs_finishing,
            'production_cost': round(production_cost, 2),
            'material_cost': round(material_cost, 2),
            'finishing_cost': round(finishing_cost, 2),
            'subtotal': round(subtotal, 2),
            'rush_multiplier': rush_multiplier,
            'total_cost': round(total_cost, 2),
            'unit_price': round(unit_price, 3),
            'sheets_required': S_total,
            'paper_used': paper['display_name'],
            'imposition': imposition,
            'size': f'{width}"x{height}"'
        }

    def calculate_folded_print_price(self, quantity, size, paper_code,
                                      fold_type='none', printing_sides='double-sided',
                                      rush_type='standard'):
        """
        Calculate price for folded prints (brochures, table tents)
        """
        paper = self.paper_stocks.get(paper_code)
        if not paper:
            return {'error': 'Invalid paper selection'}

        constraints = self.config['product_constraints']['folded-prints']
        if quantity < constraints['min_quantity'] or quantity > constraints['max_quantity']:
            return {'error': f"Quantity must be between {constraints['min_quantity']} and {constraints['max_quantity']}"}

        formula = self.config['formula']
        S = formula['setup_fee']
        F_setup = formula['finishing_setup_fee']
        k = formula['base_production_rate']
        e = formula['efficiency_exponent']

        clicks_per_piece = 0.10 if printing_sides == 'double-sided' else 0.05
        paper_cost = paper['cost_per_sheet']

        width, height = self._parse_size_string(size)

        if fold_type == 'table-tent':
            material_height = height * 2.5
            imposition_result = self.imposition_calc.calculate_imposition(width, material_height)
        else:
            imposition_result = self.imposition_calc.calculate_imposition(width, height)

        if imposition_result.get('error'):
            return {'error': imposition_result['error']}

        imposition = imposition_result['copies']
        if imposition == 0:
            return {'error': 'Unable to calculate imposition for given size'}

        v = (paper_cost + clicks_per_piece) * 1.5 / imposition

        f = self.config['finishing_costs']['folding'].get(fold_type, 0)
        needs_finishing = fold_type and fold_type != 'none' and f > 0

        rush_multiplier = self._get_rush_multiplier(rush_type)

        printing_setup_cost = S
        finishing_setup_cost = F_setup if needs_finishing else 0
        S_total = math.ceil(quantity / imposition)
        production_cost = (S_total ** e) * k
        material_cost = quantity * v
        finishing_cost = quantity * f

        subtotal = printing_setup_cost + finishing_setup_cost + production_cost + material_cost + finishing_cost
        total_cost = subtotal * rush_multiplier
        unit_price = total_cost / quantity

        return {
            'printing_setup_cost': round(printing_setup_cost, 2),
            'finishing_setup_cost': round(finishing_setup_cost, 2),
            'needs_finishing': needs_finishing,
            'production_cost': round(production_cost, 2),
            'material_cost': round(material_cost, 2),
            'finishing_cost': round(finishing_cost, 2),
            'subtotal': round(subtotal, 2),
            'rush_multiplier': rush_multiplier,
            'total_cost': round(total_cost, 2),
            'unit_price': round(unit_price, 3),
            'sheets_required': S_total,
            'paper_used': paper['display_name'],
            'imposition': imposition,
            'fold_type': fold_type
        }

    def calculate_booklet_price(self, quantity, size, pages, cover_paper_code,
                                 text_paper_code, printing_sides='double-sided',
                                 rush_type='standard'):
        """
        Calculate price for booklets (8-48 pages, saddle stitch)
        """
        constraints = self.config['product_constraints']['booklets']

        if quantity < constraints['min_quantity'] or quantity > constraints['max_quantity']:
            return {'error': f"Quantity must be between {constraints['min_quantity']} and {constraints['max_quantity']}"}

        if pages < constraints['min_pages'] or pages > constraints['max_pages']:
            return {'error': f"Page count must be between {constraints['min_pages']} and {constraints['max_pages']}"}

        if pages % constraints['page_multiple'] != 0:
            return {'error': f"Page count must be a multiple of {constraints['page_multiple']}"}

        is_self_cover = cover_paper_code == 'SELF_COVER'

        if is_self_cover:
            text_paper = self.paper_stocks.get(text_paper_code)
            cover_paper = text_paper
            if not text_paper:
                return {'error': 'Invalid text paper selection'}
        else:
            cover_paper = self.paper_stocks.get(cover_paper_code)
            text_paper = self.paper_stocks.get(text_paper_code)
            if not cover_paper or not text_paper:
                return {'error': 'Invalid paper selection'}

        clicks_cost = 0.10 if printing_sides == 'double-sided' else 0.05

        if is_self_cover:
            cover_sheets_per_booklet = 0
            text_sheets_per_booklet = pages / 4
        else:
            cover_sheets_per_booklet = 1
            text_sheets_per_booklet = (pages - 4) / 4

        width, height = self._parse_size_string(size)
        imposition_result = self.imposition_calc.calculate_imposition(width, height)
        imposition = imposition_result.get('copies', 4)

        multi_up_factor = 2 if (width <= 6.5 and height <= 9) else 1

        sheets_per_booklet = cover_sheets_per_booklet + text_sheets_per_booklet
        clicks_per_booklet = sheets_per_booklet / multi_up_factor

        cover_cost = (cover_sheets_per_booklet * cover_paper['cost_per_sheet']) / multi_up_factor
        text_cost = (text_sheets_per_booklet * text_paper['cost_per_sheet']) / multi_up_factor
        click_cost = clicks_per_booklet * clicks_cost
        materials_cost_per_unit = (cover_cost + text_cost + click_cost) * 1.25

        booklet_finishing = self.config['finishing_costs']['booklet_finishing']
        cover_creasing = 0 if is_self_cover else booklet_finishing['cover_creasing']
        finishing_per_unit = booklet_finishing['base_labor'] + cover_creasing + (booklet_finishing['binding_per_sheet'] * text_sheets_per_booklet)

        formula = self.config['formula']
        base_setup = (formula['setup_fee'] * 2) + (2 * pages)
        S_total = quantity * sheets_per_booklet / multi_up_factor
        k = formula['base_production_rate']
        e = formula['efficiency_exponent']
        production = (S_total ** e) * k
        materials = quantity * materials_cost_per_unit
        finishing_setup = formula['finishing_setup_fee']
        finishing = quantity * finishing_per_unit

        rush_multiplier = self._get_rush_multiplier(rush_type)

        subtotal = base_setup + production + materials + finishing_setup + finishing
        total_cost = subtotal * rush_multiplier
        unit_price = total_cost / quantity

        cover_sheets_required = math.ceil(quantity * cover_sheets_per_booklet)
        text_sheets_required = math.ceil(quantity * text_sheets_per_booklet)
        total_sheets_required = cover_sheets_required + text_sheets_required

        return {
            'printing_setup_cost': round(base_setup, 2),
            'finishing_setup_cost': round(finishing_setup, 2),
            'needs_finishing': True,
            'production_cost': round(production, 2),
            'material_cost': round(materials, 2),
            'finishing_cost': round(finishing, 2),
            'subtotal': round(subtotal, 2),
            'rush_multiplier': rush_multiplier,
            'total_cost': round(total_cost, 2),
            'unit_price': round(unit_price, 3),
            'sheets_required': total_sheets_required,
            'cover_paper_used': 'Self Cover' if is_self_cover else cover_paper['display_name'],
            'text_paper_used': text_paper['display_name'],
            'pages': pages,
            'imposition': imposition
        }

    def calculate_notebook_price(self, quantity, width, height, pages, binding_type,
                                  cover_paper_code, text_paper_code, page_content='blank',
                                  printing_sides='double-sided', rush_type='standard'):
        """
        Calculate price for notebooks (20-200 pages, various bindings)
        """
        constraints = self.config['product_constraints']['notebooks']

        if quantity < constraints['min_quantity'] or quantity > constraints['max_quantity']:
            return {'error': f"Quantity must be between {constraints['min_quantity']} and {constraints['max_quantity']}"}

        cover_paper = self.paper_stocks.get(cover_paper_code)
        text_paper = self.paper_stocks.get(text_paper_code)

        if not cover_paper or not text_paper:
            return {'error': 'Invalid paper selection'}

        base_setup = 0 if page_content == 'blank' else self.config['formula']['setup_fee']
        finishing_setup = self.config['formula']['finishing_setup_fee']
        total_setup = base_setup + finishing_setup

        imposition_result = self.imposition_calc.calculate_imposition(width, height)
        imposition = imposition_result.get('copies', 2)

        sides_multiplier = 2 if printing_sides == 'double-sided' else 1
        clicks_cost = 0.10 if printing_sides == 'double-sided' else 0.05

        cover_sheets_per_notebook = 1 / imposition
        text_sheets_per_notebook = pages / (imposition * sides_multiplier)

        cover_clicks = 1
        text_clicks = round(text_sheets_per_notebook * sides_multiplier)
        total_clicks = cover_clicks + text_clicks

        cover_cost = cover_sheets_per_notebook * cover_paper['cost_per_sheet']
        text_cost = text_sheets_per_notebook * text_paper['cost_per_sheet']
        click_cost = total_clicks * clicks_cost
        materials_cost_per_unit = (cover_cost + text_cost + click_cost) * 1.25

        binding_hardware = self.config['finishing_costs']['notebook_binding'].get(binding_type, 0)
        labor_cost = self.config['finishing_costs']['notebook_labor'].get(binding_type, 2.50)

        sheets_per_notebook = cover_sheets_per_notebook + text_sheets_per_notebook
        S_total = quantity * sheets_per_notebook
        formula = self.config['formula']
        k = formula['base_production_rate']
        e = formula['efficiency_exponent']
        production_cost = (S_total ** e) * k
        materials_cost_total = quantity * materials_cost_per_unit
        labor_cost_total = quantity * labor_cost
        binding_cost_total = quantity * binding_hardware

        subtotal = total_setup + production_cost + materials_cost_total + labor_cost_total + binding_cost_total

        rush_multiplier = self._get_rush_multiplier(rush_type)
        total = subtotal * rush_multiplier

        return {
            'quantity': quantity,
            'width': width,
            'height': height,
            'pages': pages,
            'binding_type': binding_type,
            'cover_paper': cover_paper['display_name'],
            'text_paper': text_paper['display_name'],
            'page_content': page_content,
            'unit_price': round(total / quantity, 2),
            'total_cost': round(total, 2),
            'printing_setup_cost': round(base_setup, 2),
            'finishing_setup_cost': round(finishing_setup, 2),
            'total_setup_cost': round(total_setup, 2),
            'production_cost': round(production_cost, 2),
            'material_cost': round(materials_cost_total, 2),
            'labor_cost': round(labor_cost_total, 2),
            'binding_cost': round(binding_cost_total, 2),
            'subtotal': round(subtotal, 2),
            'rush_multiplier': rush_multiplier,
            'imposition': imposition
        }

    def calculate_notepad_price(self, quantity, width, height, sheets, text_paper_code,
                                 backing_paper_code, page_content='blank',
                                 printing_sides='single-sided', rush_type='standard'):
        """
        Calculate price for notepads (25-100 sheets, glue-bound)
        """
        constraints = self.config['product_constraints']['notepads']

        if quantity < constraints['min_quantity'] or quantity > constraints['max_quantity']:
            return {'error': f"Quantity must be between {constraints['min_quantity']} and {constraints['max_quantity']}"}

        text_paper = self.paper_stocks.get(text_paper_code)
        backing_paper = self.paper_stocks.get(backing_paper_code)

        if not text_paper or not backing_paper:
            return {'error': 'Invalid paper selection'}

        base_setup = self.config['formula']['setup_fee'] if page_content == 'custom' else 0
        finishing_setup = self.config['formula']['finishing_setup_fee']
        total_setup = base_setup + finishing_setup

        imposition_result = self.imposition_calc.calculate_imposition(width, height)
        imposition = imposition_result.get('copies')

        if not imposition:
            return {'error': 'Unable to calculate imposition for given dimensions'}

        clicks_cost = 0.10 if printing_sides == 'double-sided' else 0.05

        backing_sheets_per_pad = 1 / imposition
        press_sheets_needed = (quantity * sheets) / imposition

        text_cost_per_unit = (press_sheets_needed * text_paper['cost_per_sheet']) / quantity
        backing_cost = backing_sheets_per_pad * backing_paper['cost_per_sheet']
        click_cost_per_unit = (press_sheets_needed * clicks_cost) / quantity
        materials_cost_per_unit = (text_cost_per_unit + backing_cost + click_cost_per_unit) * 1.25

        padding_labor_per_sheet = 0.01
        padding_labor = sheets * padding_labor_per_sheet

        S_total = press_sheets_needed
        formula = self.config['formula']
        k = formula['base_production_rate']
        e = formula['efficiency_exponent']
        production_cost = (S_total ** e) * k
        materials_cost_total = quantity * materials_cost_per_unit
        labor_cost_total = quantity * padding_labor

        subtotal = total_setup + production_cost + materials_cost_total + labor_cost_total

        rush_multiplier = self._get_rush_multiplier(rush_type)
        total = subtotal * rush_multiplier

        return {
            'quantity': quantity,
            'size': f'{width}" x {height}"',
            'sheets': sheets,
            'text_paper': text_paper['display_name'],
            'backing_paper': backing_paper['display_name'],
            'page_content': page_content,
            'unit_price': round(total / quantity, 2),
            'total_cost': round(total, 2),
            'printing_setup_cost': round(base_setup, 2),
            'finishing_setup_cost': round(finishing_setup, 2),
            'total_setup_cost': round(total_setup, 2),
            'production_cost': round(production_cost, 2),
            'material_cost': round(materials_cost_total, 2),
            'labor_cost': round(labor_cost_total, 2),
            'finishing_cost': round(labor_cost_total, 2),
            'subtotal': round(subtotal, 2),
            'rush_multiplier': rush_multiplier,
            'sheets_required': math.ceil(press_sheets_needed),
            'imposition': imposition
        }

    def calculate_poster_price(self, quantity, material_code, width=None, height=None,
                                preset_size=None, rush_type='standard'):
        """
        Calculate price for posters/large format (material cost only with volume discounts)
        """
        material = self.paper_stocks.get(material_code)
        if not material:
            return {'error': f'Material {material_code} not found'}

        constraints = self.config['product_constraints']['posters']
        if quantity < constraints['min_quantity'] or quantity > constraints['max_quantity']:
            return {'error': f"Quantity must be between {constraints['min_quantity']} and {constraints['max_quantity']}"}

        if preset_size:
            size_data = self.config['imposition_data']['posters'].get(preset_size)
            if not size_data:
                return {'error': f'Size {preset_size} not found for posters'}
            square_footage = size_data['sqft']
        else:
            if not width or not height:
                return {'error': 'Width and height required for custom size'}
            if width < 6 or height < 6:
                return {'error': 'Custom dimensions must be at least 6 inches'}

            max_width = material.get('max_width', 54)
            if width > max_width:
                return {'error': f'Width cannot exceed {max_width} inches for this material'}

            if height > 120:
                return {'error': 'Height cannot exceed 120 inches'}

            square_footage = (width * height) / 144

            if square_footage > 50:
                return {'error': 'Total area cannot exceed 50 square feet'}

        charge_rate = material['charge_rate']
        total_square_footage = square_footage * quantity

        volume_discount = {'discount': 0, 'multiplier': 1.00}
        for tier in self.config['large_format_volume_discounts']:
            if tier['min_sqft'] <= total_square_footage <= tier['max_sqft']:
                volume_discount = tier
                break

        material_cost_per_poster = square_footage * charge_rate * volume_discount['multiplier']
        total_material_cost = material_cost_per_poster * quantity

        rush_multiplier = self._get_rush_multiplier(rush_type)

        subtotal = total_material_cost
        total_cost = subtotal * rush_multiplier
        unit_price = total_cost / quantity

        original_material_cost = square_footage * charge_rate * quantity
        volume_savings = original_material_cost - total_material_cost

        return {
            'printing_setup_cost': 0,
            'finishing_setup_cost': 0,
            'needs_finishing': False,
            'production_cost': 0,
            'material_cost': round(total_material_cost, 2),
            'finishing_cost': 0,
            'subtotal': round(subtotal, 2),
            'rush_multiplier': rush_multiplier,
            'total_cost': round(total_cost, 2),
            'unit_price': round(unit_price, 2),
            'square_footage': round(square_footage, 1),
            'total_square_footage': round(total_square_footage, 1),
            'material_rate': round(charge_rate, 2),
            'material_used': material['display_name'],
            'volume_discount': volume_discount['discount'],
            'volume_savings': round(volume_savings, 2)
        }

    def calculate_perfect_bound_price(self, quantity, width, height, pages,
                                       text_paper_code, cover_paper_code,
                                       printing_sides='double-sided', rush_type='standard'):
        """
        Calculate price for perfect bound books (4-500 pages)
        """
        constraints = self.config['product_constraints']['perfect-bound-books']

        if quantity < constraints['min_quantity'] or quantity > constraints['max_quantity']:
            return {'error': f"Quantity must be between {constraints['min_quantity']} and {constraints['max_quantity']}"}

        if pages < constraints['min_pages'] or pages > constraints['max_pages']:
            return {'error': f"Page count must be between {constraints['min_pages']} and {constraints['max_pages']}"}

        if pages % constraints['page_multiple'] != 0:
            return {'error': f"Page count must be in multiples of {constraints['page_multiple']}"}

        text_paper = self.paper_stocks.get(text_paper_code)
        cover_paper = self.paper_stocks.get(cover_paper_code)

        if not text_paper or text_paper['type'] != 'text_stock':
            return {'error': 'Please select a valid text paper'}

        if not cover_paper or cover_paper['type'] != 'cover_stock':
            return {'error': 'Please select a valid cover paper (cover stock required)'}

        cover_weight = int(cover_paper['weight'].replace('#', ''))
        if cover_weight < 80:
            return {'error': 'Cover stock must be 80# or heavier for perfect binding'}

        imposition_result = self.imposition_calc.calculate_imposition(width, height)
        if imposition_result.get('error'):
            return {'error': imposition_result['error']}

        sides_multiplier = 2 if printing_sides == 'double-sided' else 1
        clicks_per_sheet = 0.10 if printing_sides == 'double-sided' else 0.05

        pages_per_sheet = imposition_result['copies'] * sides_multiplier

        interior_pages = pages - 4
        interior_sheets = math.ceil(interior_pages / pages_per_sheet)
        cover_sheets = 1
        total_sheets = interior_sheets + cover_sheets

        formula = self.config['formula']
        product_formula = self.config['product_formulas']['perfect-bound-books']

        S = formula['setup_fee'] * product_formula['setup_fee_multiplier']
        F_setup = product_formula['finishing_setup_fee']
        k = formula['base_production_rate']
        e = formula['efficiency_exponent']

        interior_cost = interior_sheets * text_paper['cost_per_sheet']
        cover_cost = cover_sheets * cover_paper['cost_per_sheet']
        interior_clicks = interior_sheets * clicks_per_sheet
        cover_clicks = cover_sheets * 0.10
        click_cost = interior_clicks + cover_clicks
        material_cost = (interior_cost + cover_cost + click_cost) * 1.25

        v = material_cost
        f = self.config['finishing_costs']['perfect_binding']['base_labor']

        S_total = quantity * total_sheets
        production_cost = (S_total ** e) * k
        materials_cost = quantity * v
        finishing_cost = quantity * f

        subtotal = S + F_setup + production_cost + materials_cost + finishing_cost

        rush_multiplier = self._get_rush_multiplier(rush_type)
        total_cost = subtotal * rush_multiplier
        unit_price = total_cost / quantity

        return {
            'printing_setup_cost': round(S, 2),
            'finishing_setup_cost': round(F_setup, 2),
            'production_cost': round(production_cost, 2),
            'material_cost': round(materials_cost, 2),
            'finishing_cost': round(finishing_cost, 2),
            'subtotal': round(subtotal, 2),
            'rush_multiplier': rush_multiplier,
            'total_cost': round(total_cost, 2),
            'unit_price': round(unit_price, 3),
            'sheets_required': total_sheets,
            'size': f'{width}" x {height}"',
            'text_paper': text_paper['display_name'],
            'cover_paper': cover_paper['display_name'],
            'pages': pages,
            'quantity': quantity,
            'interior_sheets': interior_sheets,
            'cover_sheets': cover_sheets
        }
