var CACHE = "suez-store-v2";
var FILES = ["./index.html", "./manifest.json"];

self.addEventListener("install", function (e) {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request, { cache: "no-cache" }).then(function (res) {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
      return res;
    }).catch(function () { return caches.match(e.request); })
  );
});
<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Suez Store</title><link rel="manifest" href="manifest.json">
  <meta name="theme-color" content="#0f6b53">
  <style>
    body { font-family: sans-serif; background: #f1f4f1; margin: 0; padding: 16px; }
    h1 { color: #0f6b53; }
    input { width: 100%; padding: 10px; font-size: 16px; margin-bottom: 12px; box-sizing: border-box; }
    .card { display: flex; gap: 12px; align-items: center; background: white; border-radius: 10px; padding: 12px; margin-bottom: 12px; border: 1px solid #d9e0dc; }
    .pic { position: relative; width: 88px; height: 88px; flex: none; border-radius: 8px; background: #e3ece8; overflow: hidden; display: flex; align-items: center; justify-content: center; color: #0f6b53; font-size: 30px; font-weight: bold; }
    .pic img { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
    .info { min-width: 0; flex: 1; }
    .name { overflow-wrap: anywhere; }
    .price { font-size: 20px; font-weight: bold; }
    .out { color: #a3302a; }
  </style>
</head>
<body>
  <h1>Suez Store</h1>
  <input id="search" placeholder="دوّر على منتج">
  <div id="list"></div>

  <script>
    // img = اسم ملف الصورة اللي هترفعها على GitHub جنب index.html
    var products = [
        { name: "لمبات فينوس وسبرينت ليد (من 45 إلى 276 جنيه حسب النوع)", price: 45, qty: 10, img: "lamps-venus.jpg" },
        { name: "مفتاح سخان جي فينوس 20 أمبير", price: 149, qty: 10, img: "switch-heater.jpg" },
        { name: "مفتاح تكييف باللمبة 45 أمبير", price: 444, qty: 10, img: "switch-ac.jpg" },
        { name: "مفتاح ثلاثي عادي باللمبة 16 أمبير", price: 151, qty: 10, img: "switch-triple.jpg" },
        { name: "مفتاح مروحة جي فينوس", price: 781, qty: 10, img: "switch-fan.jpg" },
        { name: "بريزة شوكو بمفتاح وفصل ولمبة إشارة 16A", price: 260, qty: 10, img: "socket-choco.jpg" },
        { name: "بريزة قوة سمارت واي فاي", price: 1060, qty: 10, img: "socket-smart.jpg" },
        { name: "بريزة USB مجوز 2A", price: 788, qty: 10, img: "socket-usb.jpg" },
        { name: "بريزة أرضي والأمان (بيج) 16A", price: 59, qty: 10, img: "socket-earth.jpg" },
        { name: "بريزة إنترنت CAT6", price: 195, qty: 10, img: "socket-cat6.jpg" },
        { name: "وشوش جي فينوس كلاسيك / جلاكسي / سكاي (من 28 إلى 72 جنيه حسب المقاس)", price: 28, qty: 10, img: "faceplates.jpg" },
        { name: "سبوت لايت مدور متحرك 6 وات", price: 140, qty: 10, img: "spotlight.jpg" },
        { name: "سبوت لايت مدور متحرك 9 وات", price: 165, qty: 10, img: "spotlight.jpg" },
        { name: "سبوت لايت مدور متحرك 20 وات", price: 390, qty: 10, img: "spotlight.jpg" },
        { name: "سبوت لايت مدور متحرك 30 وات", price: 550, qty: 10, img: "spotlight.jpg" },
        { name: "بانيل مدور 6 وات", price: 125, qty: 10, img: "panel-round.jpg" },
        { name: "بانيل مدور 9 وات", price: 145, qty: 10, img: "panel-round.jpg" },
        { name: "بانيل مدور 12 وات", price: 175, qty: 10, img: "panel-round.jpg" },
        { name: "بانيل مدور 18 وات", price: 225, qty: 10, img: "panel-round.jpg" },
        { name: "بانيل مدور 24 وات", price: 310, qty: 10, img: "panel-round.jpg" },
        { name: "بانيل مربع 16 وات", price: 210, qty: 10, img: "panel-square.jpg" },
        { name: "لمبة إليوس ليد بلحة / شمعة 5 وات (أبيض مصنفر)", price: 59, qty: 10, img: "bulb-candle.jpg" },
        { name: "لمبة إليوس MR16 كاس 3.5 وات (ليد أصفر دافئ)", price: 70, qty: 10, img: "bulb-mr16.jpg" },
        { name: "لمبة إليوس ليد تيوب 120 سم (20 وات)", price: 158, qty: 10, img: "tube-120.jpg" },
        { name: "لمبة إليوس ليد 12 وات (عبوة متعددة)", price: 400, qty: 10, img: "bulb-12w.jpg" },
        { name: "إنرجايزر قلم (AA) قلوي - كارت 2 حجر", price: 85, qty: 10, img: "bat-aa.jpg" },
        { name: "إنرجايزر ريموت (AAA) قلوي - كارت 2 حجر", price: 85, qty: 10, img: "bat-aaa.jpg" },
        { name: "إنرجايزر ماكس برومو (AA) - عبوة 6 حجارة", price: 220, qty: 10, img: "bat-aa.jpg" },
        { name: "إنرجايزر طورش (D) قلوي ماكس - كارت 2 حجر", price: 293, qty: 10, img: "bat-d.jpg" },
        { name: "إنرجايزر مربع (9V) قلوي", price: 250, qty: 10, img: "bat-9v.jpg" },
        { name: "إنرجايزر عملة (CR2032) ليثيوم 3 فولت", price: 75, qty: 10, img: "bat-cr2032.jpg" },
        { name: "إنرجايزر شحن قلم (AA) 2300mAh - كارت 2 حجر", price: 450, qty: 10, img: "bat-rechargeable.jpg" },
        { name: "إنرجايزر شحن ريموت (AAA) 800mAh - كارت 2 حجر", price: 450, qty: 10, img: "bat-rechargeable.jpg" },
        { name: "شاحن ماكسي + 4 حجارة (AA) 2000mAh", price: 1033, qty: 10, img: "charger-maxi.jpg" }
    ];

    function show() {
      var word = document.getElementById("search").value.toLowerCase();
      var html = "";
      for (var i = 0; i < products.length; i++) {
        var p = products[i];
        if (p.name.toLowerCase().indexOf(word) >= 0) {
          var pic = '<div class="pic">' + p.name.charAt(0) +
            (p.img ? '<img src="' + p.img + '" alt="" loading="lazy" onerror="this.remove()">' : '') +
            '</div>';
          html += '<div class="card">' + pic +
            '<div class="info">' +
            '<div class="name">' + p.name + '</div>' +
            '<div class="price">' + p.price + ' جنيه</div>' +
            '<div' + (p.qty > 0 ? '>متوفر: ' + p.qty : ' class="out">خلصان') + '</div>' +
            '</div></div>';
        }
      }
      document.getElementById("list").innerHTML = html;
    }

    document.getElementById("search").addEventListener("input", show);
    show();
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("sw.js");
    }
  </script>
</body>
</html>
<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Suez Store</title><link rel="manifest" href="manifest.json">
  <meta name="theme-color" content="#0f6b53">
  <style>
    body { font-family: sans-serif; background: #f1f4f1; margin: 0; padding: 16px; }
    h1 { color: #0f6b53; }
    input { width: 100%; padding: 10px; font-size: 16px; margin-bottom: 12px; box-sizing: border-box; }
    .card { display: flex; gap: 12px; align-items: center; background: white; border-radius: 10px; padding: 12px; margin-bottom: 12px; border: 1px solid #d9e0dc; }
    .pic { position: relative; width: 88px; height: 88px; flex: none; border-radius: 8px; background: #e3ece8; overflow: hidden; display: flex; align-items: center; justify-content: center; color: #0f6b53; font-size: 30px; font-weight: bold; }
    .pic img { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
    .info { min-width: 0; flex: 1; }
    .name { overflow-wrap: anywhere; }
    .price { font-size: 20px; font-weight: bold; }
    .out { color: #a3302a; }
  </style>
</head>
<body>
  <h1>Suez Store</h1>
  <input id="search" placeholder="دوّر على منتج">
  <div id="list"></div>

  <script>
    // img = اسم ملف الصورة اللي هترفعها على GitHub جنب index.html
    var products = [
        { name: "لمبات فينوس وسبرينت ليد (من 45 إلى 276 جنيه حسب النوع)", price: 45, qty: 10, img: "lamps-venus.jpg" },
        { name: "مفتاح سخان جي فينوس 20 أمبير", price: 149, qty: 10, img: "switch-heater.jpg" },
        { name: "مفتاح تكييف باللمبة 45 أمبير", price: 444, qty: 10, img: "switch-ac.jpg" },
        { name: "مفتاح ثلاثي عادي باللمبة 16 أمبير", price: 151, qty: 10, img: "switch-triple.jpg" },
        { name: "مفتاح مروحة جي فينوس", price: 781, qty: 10, img: "switch-fan.jpg" },
        { name: "بريزة شوكو بمفتاح وفصل ولمبة إشارة 16A", price: 260, qty: 10, img: "socket-choco.jpg" },
        { name: "بريزة قوة سمارت واي فاي", price: 1060, qty: 10, img: "socket-smart.jpg" },
        { name: "بريزة USB مجوز 2A", price: 788, qty: 10, img: "socket-usb.jpg" },
        { name: "بريزة أرضي والأمان (بيج) 16A", price: 59, qty: 10, img: "socket-earth.jpg" },
        { name: "بريزة إنترنت CAT6", price: 195, qty: 10, img: "socket-cat6.jpg" },
        { name: "وشوش جي فينوس كلاسيك / جلاكسي / سكاي (من 28 إلى 72 جنيه حسب المقاس)", price: 28, qty: 10, img: "faceplates.jpg" },
        { name: "سبوت لايت مدور متحرك 6 وات", price: 140, qty: 10, img: "spotlight.jpg" },
        { name: "سبوت لايت مدور متحرك 9 وات", price: 165, qty: 10, img: "spotlight.jpg" },
        { name: "سبوت لايت مدور متحرك 20 وات", price: 390, qty: 10, img: "spotlight.jpg" },
        { name: "سبوت لايت مدور متحرك 30 وات", price: 550, qty: 10, img: "spotlight.jpg" },
        { name: "بانيل مدور 6 وات", price: 125, qty: 10, img: "panel-round.jpg" },
        { name: "بانيل مدور 9 وات", price: 145, qty: 10, img: "panel-round.jpg" },
        { name: "بانيل مدور 12 وات", price: 175, qty: 10, img: "panel-round.jpg" },
        { name: "بانيل مدور 18 وات", price: 225, qty: 10, img: "panel-round.jpg" },
        { name: "بانيل مدور 24 وات", price: 310, qty: 10, img: "panel-round.jpg" },
        { name: "بانيل مربع 16 وات", price: 210, qty: 10, img: "panel-square.jpg" },
        { name: "لمبة إليوس ليد بلحة / شمعة 5 وات (أبيض مصنفر)", price: 59, qty: 10, img: "bulb-candle.jpg" },
        { name: "لمبة إليوس MR16 كاس 3.5 وات (ليد أصفر دافئ)", price: 70, qty: 10, img: "bulb-mr16.jpg" },
        { name: "لمبة إليوس ليد تيوب 120 سم (20 وات)", price: 158, qty: 10, img: "tube-120.jpg" },
        { name: "لمبة إليوس ليد 12 وات (عبوة متعددة)", price: 400, qty: 10, img: "bulb-12w.jpg" },
        { name: "إنرجايزر قلم (AA) قلوي - كارت 2 حجر", price: 85, qty: 10, img: "bat-aa.jpg" },
        { name: "إنرجايزر ريموت (AAA) قلوي - كارت 2 حجر", price: 85, qty: 10, img: "bat-aaa.jpg" },
        { name: "إنرجايزر ماكس برومو (AA) - عبوة 6 حجارة", price: 220, qty: 10, img: "bat-aa.jpg" },
        { name: "إنرجايزر طورش (D) قلوي ماكس - كارت 2 حجر", price: 293, qty: 10, img: "bat-d.jpg" },
        { name: "إنرجايزر مربع (9V) قلوي", price: 250, qty: 10, img: "bat-9v.jpg" },
        { name: "إنرجايزر عملة (CR2032) ليثيوم 3 فولت", price: 75, qty: 10, img: "bat-cr2032.jpg" },
        { name: "إنرجايزر شحن قلم (AA) 2300mAh - كارت 2 حجر", price: 450, qty: 10, img: "bat-rechargeable.jpg" },
        { name: "إنرجايزر شحن ريموت (AAA) 800mAh - كارت 2 حجر", price: 450, qty: 10, img: "bat-rechargeable.jpg" },
        { name: "شاحن ماكسي + 4 حجارة (AA) 2000mAh", price: 1033, qty: 10, img: "charger-maxi.jpg" }
    ];

    function show() {
      var word = document.getElementById("search").value.toLowerCase();
      var html = "";
      for (var i = 0; i < products.length; i++) {
        var p = products[i];
        if (p.name.toLowerCase().indexOf(word) >= 0) {
          var pic = '<div class="pic">' + p.name.charAt(0) +
            (p.img ? '<img src="' + p.img + '" alt="" loading="lazy" onerror="this.remove()">' : '') +
            '</div>';
          html += '<div class="card">' + pic +
            '<div class="info">' +
            '<div class="name">' + p.name + '</div>' +
            '<div class="price">' + p.price + ' جنيه</div>' +
            '<div' + (p.qty > 0 ? '>متوفر: ' + p.qty : ' class="out">خلصان') + '</div>' +
            '</div></div>';
        }
      }
      document.getElementById("list").innerHTML = html;
    }

    document.getElementById("search").addEventListener("input", show);
    show();
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("sw.js");
    }
  </script>
</body>
</html>
