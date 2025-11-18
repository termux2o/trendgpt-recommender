import re
import json
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

# Your existing dictionaries (categories_tags and brands)
categories_tags = {
    "All Electronics": ["mobile", "smartphone", "laptop", "tablet", "camera", "headphones", "audio", "speaker", "charger", "accessories"],
    "AMAZON FASHION": ["men's wear", "women's wear", "kids wear", "ethnic wear", "casual wear", "formal wear", "t-shirts", "jeans", "shirts", "dresses", "sarees", "kurta","shoes", "sneakers", "sandals", "boots", "bags", "watches", "belts", "caps", "wallets", "sunglasses", "backpacks"],
    "Appliances": ["microwave", "refrigerator", "washing machine", "air conditioner", "fan", "heater", "vacuum cleaner", "kettle", "chimney", "iron"],
    "Amazon Home": ["cookware", "pressure cooker", "blender", "mixer", "juicer", "gas stove", "knife set", "tupperware", "coffee maker", "grinder"],
    "All Beauty": ["skincare", "haircare", "makeup", "cosmetics", "fragrance", "soap", "shampoo", "toothpaste", "lotions"],
    "Toys & Games": ["puzzles", "board games", "action figures", "lego", "dolls", "toy cars", "educational toys"],
    "Sports & Outdoors": ["fitness", "gym equipment", "bicycles", "sports shoes", "treadmill", "cricket", "football", "yoga mat"],
    "Books": ["books", "novels", "comics", "magazines", "audiobooks", "music", "digital music", "movies", "video games"],
    "Grocery": ["snacks", "beverages", "spices", "dairy", "oil", "flour", "sugar", "pulses", "instant foods"]
}

brands = {
    # Electronics / Mobiles / Computers
    'samsung': 'Samsung', 'apple': 'Apple', 'iphone': 'Apple', 'asus': 'Asus', 'dell': 'Dell',
    'lenovo': 'Lenovo', 'hp': 'HP', 'sony': 'Sony', 'lg': 'LG', 'xiaomi': 'Xiaomi', 'oneplus': 'OnePlus',
    'google': 'Google', 'micromax': 'Micromax', 'lava': 'Lava', 'infinix': 'Infinix', 'itel': 'Itel',
    'realme': 'Realme', 'oppo': 'Oppo', 'vivo': 'Vivo', 'iqoo': 'iQOO', 'redmi': 'Redmi', 'poco': 'Poco', 'honor': 'Honor',

    # Clothing / Fashion / Apparel
    'fabindia': 'FabIndia', 'westside': 'Westside', 'pantaloons': 'Pantaloons', 'myntra': 'Myntra',
    'ajio': 'Ajio', 'allen solly': 'Allen Solly', 'van heusen': 'Van Heusen', 'levis': "Levi's",
    'zara': 'Zara', 'h&m': 'H&M', 'roadster': 'Roadster', 'wrogn': 'Wrogn', 'here&now': 'Here&Now',

    # Footwear / Accessories
    'fastrack': 'Fastrack', 'titan': 'Titan', 'sonata': 'Sonata', 'bata': 'Bata', 'woodland': 'Woodland',
    'nike': 'Nike', 'adidas': 'Adidas', 'puma': 'Puma', 'reebok': 'Reebok', 'wildcraft': 'Wildcraft',
    'sparx': 'Sparx', 'fila': 'Fila', 'skechers': 'Skechers',

    # Home Appliances / Kitchen
    'whirlpool': 'Whirlpool', 'bosch': 'Bosch', 'ifb': 'IFB',
    'prestige': 'Prestige', 'pigeon': 'Pigeon', 'butterfly': 'Butterfly', 'kenstar': 'Kenstar',
    'havells': 'Havells', 'bajaj': 'Bajaj', 'philips': 'Philips', 'panasonic': 'Panasonic',

    # FMCG / Grocery / Beauty / Personal Care
    'dabur': 'Dabur', 'patanjali': 'Patanjali', 'vicco': 'Vicco', 'himalaya': 'Himalaya',"dove":"Dove",
    'parle': 'Parle', 'surf excel': 'Surf Excel', 'amul': 'Amul', 'nestle': 'Nestle', 'britannia': 'Britannia'
}

class QueryFormatter:
    def __init__(self, query, model_name="google/flan-t5-small", device="cpu"):
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForSeq2SeqLM.from_pretrained(model_name).to(device)
        self.query = query
        self.prompt_template = """Convert this query into a JSON with fields: category, price_max, brand, tags.

Query: {query}
JSON: """

    def generate_json(self, max_tokens=100):
        prompt = self.prompt_template.format(query=self.query)
        inputs = self.tokenizer(prompt, return_tensors="pt", max_length=512, truncation=True)
        outputs = self.model.generate(
            **inputs,
            max_new_tokens=max_tokens,
            do_sample=False,
            num_beams=3,
            early_stopping=True
        )
        raw_output = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
        print(f"Debug - Raw model output: {repr(raw_output)}")

        # Try to extract JSON from model output
        json_text = raw_output.replace(prompt, "").strip()
        try:
            match = re.search(r'\{.*\}', json_text)
            if match:
                return json.loads(match.group())
        except:
            pass

        # Fallback parsing
        return self.fallback_parse()

    def fallback_parse(self):
        query_lower = self.query.lower()
        category = None
        subcategories = []

        for cat, keywords in categories_tags.items():
            matched_keywords = [kw for kw in keywords if kw in query_lower]
            if matched_keywords:
                category = cat
                subcategories.extend(matched_keywords)

        if not category:
            category = "All Electronics"

        price_max = None
        patterns = [
            r'\$(\d+(?:,\d{3})*)',
            r'under \$?(\d+)',
            r'less than \$?(\d+)',
            r'\$?(\d+)\s*(?:dollars|bucks)'
        ]
        for p in patterns:
            match = re.search(p, query_lower)
            if match:
                try:
                    price_max = int(match.group(1).replace(',', ''))
                    break
                except:
                    continue

        brand = None
        for k, v in brands.items():
            if k in query_lower:
                brand = v
                break

        tags = []
        tag_keywords = {
            'cheap': ['cheap','budget','affordable','inexpensive'],
            'gaming': ['gaming','game','gamer'],
            'lightweight': ['lightweight','light','slim','thin','portable'],
            'premium': ['premium','luxury','high-end','flagship'],
            'used': ['used','refurbished','secondhand']
        }
        for tag, keywords in tag_keywords.items():
            if any(word in query_lower for word in keywords):
                tags.append(tag)

        return {
            "category": category,
            "subcategories": list(set(subcategories)),
            "price_max": price_max,
            "brand": brand,
            "tags": tags
        }

# Example test
if __name__ == "__main__":
    queries = [
        "I want a lightweight gaming laptop under $1500, ASUS preferred",
        "Show me a cheap Samsung phone",
        "Find me an iPhone for less than $800",
        "i want Redmi Notepad under 500$",
        "Skincare Dove shampoo under 200INR"
    ]

    for q in queries:
        converter = QueryFormatter(q)
        result = converter.generate_json()
        print("Query:", q)
        print("Generated JSON:", json.dumps(result, indent=2))
        print("-"*50)