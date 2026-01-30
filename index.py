import requests

URL = "https://dds-piyou.onrender.com/api/delivery-areas"

HEADERS = {
    "Content-Type": "application/json",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MjBmNjM0NGIzZTg..."
}

# Choose company & store
COMPANY = "zr-Express"  # 'yalidine' or 'zr-Express'
STORE = "AB-Zone"       # 'DDS.Piyou' | 'AB-Zone' | 'Tchingo Mima 2'

data = [
    # 01 → 10
    {"wilaya": "Adrar", "priceHome": 1400, "priceDesk": 970},                 # 01
    {"wilaya": "Chlef", "priceHome": 800, "priceDesk": 520 ,
        "desks": [{"name": "Chlef"}, {"name": "Tenes"}]},                  # 02
    {"wilaya": "Laghouat", "priceHome": 950, "priceDesk": 670},               # 03
    {"wilaya": "Oum El Bouaghi", "priceHome": 700, "priceDesk": 520 ,
     "desks": [{"name": "Ain El Beida"}, {"name": "Oum El Bouaghi Ville livereur"}]},          # 04
    {"wilaya": "Batna", "priceHome": 500, "priceDesk": 370},                  # 05
    {"wilaya": "Bejaia", "priceHome": 750, "priceDesk": 520,
     "desks": [{"name": "Bejaia"}, {"name": "Akbou"}]},                 # 06
    {"wilaya": "Biskra", "priceHome": 800, "priceDesk": 570},                 # 07
    {"wilaya": "Bechar", "priceHome": 1100, "priceDesk": 720},                # 08
    {"wilaya": "Blida", "priceHome": 750, "priceDesk": 520 ,
     "desks": [{"name": "Blida"}, {"name": "Bougara"} , {"name": "Mouzaia"}]},                  # 09
    {"wilaya": "Bouira", "priceHome": 750, "priceDesk": 520},                 # 10

    # 11 → 20
    {"wilaya": "Tamanrasset", "priceHome": 1600, "priceDesk": 1120},           # 11
    {"wilaya": "Tebessa", "priceHome": 800, "priceDesk": 520},                # 12
    {"wilaya": "Tlemcen", "priceHome": 950, "priceDesk": 620},                # 13
    {"wilaya": "Tiaret", "priceHome": 800, "priceDesk": 520},                 # 14
    {"wilaya": "Tizi Ouzou", "priceHome": 800, "priceDesk": 520},              # 15
    {"wilaya": "Alger", "priceHome": 600, "priceDesk": 520 ,
     "desks": [{"name": "Bir Khadem"}, {"name": "Lidou"} , {"name" : "Ouled Fayet"} , {"name" : "Hub Reghaia"} , {"name" : "BirTouta"}, {"name" : "ElJomhoria"} , {"name" : "Baraki"}]},                  # 16
    {"wilaya": "Djelfa", "priceHome": 950, "priceDesk": 670},                 # 17
    {"wilaya": "Jijel", "priceHome": 850, "priceDesk": 520 ,
     "desks": [{"name": "Jijel"}, {"name": "Taher"}]},                  # 18
    {"wilaya": "Setif", "priceHome": 750, "priceDesk": 520,                   # 19
     "desks": [{"name": "Setif"}, {"name": "El Eulma"}]},
    {"wilaya": "Saida", "priceHome": 0, "priceDesk": 0},                      # 20

    # 21 → 30
    {"wilaya": "Skikda", "priceHome": 750, "priceDesk": 520},                 # 21
    {"wilaya": "Sidi Bel Abbès", "priceHome": 800, "priceDesk": 520},          # 22
    {"wilaya": "Annaba", "priceHome": 750, "priceDesk": 520 ,
     "desks": [{"name": "Annaba"}, {"name": "Annaba El Bouni"}]},                 # 23
    {"wilaya": "Guelma", "priceHome": 750, "priceDesk": 520},                 # 24
    {"wilaya": "Constantine", "priceHome": 750, "priceDesk": 520 ,
     "desks": [{"name": "Zouaghi"}, {"name": "Nouvelle ville"} , {"name" : "Belle vue"}]},            # 25
    {"wilaya": "Medea", "priceHome": 800, "priceDesk": 520},                  # 26
    {"wilaya": "Mostaganem", "priceHome": 800, "priceDesk": 520},             # 27
    {"wilaya": "M'Sila", "priceHome": 800, "priceDesk": 570 , 
     "desks": [{"name": "Msila"}, {"name": "Bousaada"}]},                 # 28
    {"wilaya": "Mascara", "priceHome": 800, "priceDesk": 520},                # 29
    {"wilaya": "Ouargla", "priceHome": 950, "priceDesk": 670 ,
     "desks": [{"name": "Ouargla"}, {"name": "Hassi Messaoud"}]},                # 30

    # 31 → 40
    {"wilaya": "Oran", "priceHome": 800, "priceDesk": 520 , 
     "desks": [{"name": "El Morchid"}, {"name": "Millenium"} , {"name" : "Maraval"}]},                   # 31
    {"wilaya": "El Bayadh", "priceHome": 1100, "priceDesk": 670},              # 32
    {"wilaya": "Illizi", "priceHome": 0, "priceDesk": 0},                     # 33
    {"wilaya": "Bordj Bou Arreridj", "priceHome": 750, "priceDesk": 520},      # 34
    {"wilaya": "Boumerdes", "priceHome": 750, "priceDesk": 520 ,
     "desks": [{"name": "Boumerdes"}, {"name": "Bordj Menaiel"}]},               # 35
    {"wilaya": "El Tarf", "priceHome": 750, "priceDesk": 520},                # 36
    {"wilaya": "Tindouf", "priceHome": 0, "priceDesk": 0},                    # 37
    {"wilaya": "Tissemsilt", "priceHome": 800, "priceDesk": 590},              # 38
    {"wilaya": "El Oued", "priceHome": 950, "priceDesk": 670},                # 39
    {"wilaya": "Khenchela", "priceHome": 600, "priceDesk": 0},                # 40

    # 41 → 48
    {"wilaya": "Souk Ahras", "priceHome": 700, "priceDesk": 520},              # 41
    {"wilaya": "Tipaza", "priceHome": 800, "priceDesk": 520 ,
     "desks": [{"name": "Tipaza"}, {"name": "Tipaza Kolea"}]},                 # 42
    {"wilaya": "Mila", "priceHome": 700, "priceDesk": 520},                   # 43
    {"wilaya": "Ain Defla", "priceHome": 800, "priceDesk": 520},              # 44
    {"wilaya": "Naama", "priceHome": 1100, "priceDesk": 670},                 # 45
    {"wilaya": "Ain Temouchent", "priceHome": 800, "priceDesk": 520},          # 46
    {"wilaya": "Ghardaia", "priceHome": 950, "priceDesk": 670},               # 47
    {"wilaya": "Relizane", "priceHome": 800, "priceDesk": 520},               # 48

    # 49 → 58 (new wilayas)
    {"wilaya": "Timimoun", "priceHome": 1400, "priceDesk": 0},                # 49
    {"wilaya": "Bordj Badji Mokhtar", "priceHome": 0, "priceDesk": 0},         # 50
    {"wilaya": "Ouled Djellal", "priceHome": 950, "priceDesk": 570},           # 51
    {"wilaya": "Béni Abbès", "priceHome": 1000, "priceDesk": 970},             # 52
    {"wilaya": "In Salah", "priceHome": 1600, "priceDesk": 0},                # 53
    {"wilaya": "In Guezzam", "priceHome": 1600, "priceDesk": 0},              # 54
    {"wilaya": "Touggourt", "priceHome": 950, "priceDesk": 670},              # 55
    {"wilaya": "Djanet", "priceHome": 0, "priceDesk": 0},                     # 56
    {"wilaya": "M'Ghair", "priceHome": 950, "priceDesk": 0},                  # 57
    {"wilaya": "Meniaa", "priceHome": 1000, "priceDesk": 0},                  # 58
]

for item in data:
    payload = {
    "wilaya": item["wilaya"],
    "company": COMPANY,
    "store": STORE,
    "priceHome": item["priceHome"],
    "priceDesk": item["priceDesk"],
    "desks": item.get("desks", [])
}


    res = requests.post(URL, json=payload, headers=HEADERS)

    if res.status_code in (200, 201):
        print(f"✅ {item['wilaya']} added")
    else:
        print(f"❌ {item['wilaya']} failed: {res.status_code} | {res.text}")
