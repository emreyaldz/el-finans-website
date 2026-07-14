# EL Finans — Website

EL Finans kişisel finans uygulamasının tanıtım ve yasal sayfaları.

## Sayfalar

- [index.html](index.html) — Ana sayfa (özellikler, güvenlik, indirme)
- [support.html](support.html) — Destek ve SSS
- [privacy-policy.html](privacy-policy.html) — Gizlilik Politikası
- [terms.html](terms.html) — Kullanım Şartları
- [account-deletion.html](account-deletion.html) — Hesap ve veri silme adımları

Statik HTML/CSS/JS — derleme adımı yoktur. TR/EN dil desteği sayfa içi dil
değiştiriciyle sağlanır.

## URL Kuralı

- Canlı sitedeki kullanıcıya açık sayfa adresleri .html uzantısı içermez:
  /support, /privacy-policy, /terms ve /account-deletion.
- Navigasyon ve içerik bağlantılarında daima bu temiz yollar kullanılmalıdır.
- Fiziksel .html dosyaları GitHub Pages kaynağı olarak korunur; yeniden adlandırılmaz.
- script.js, file://, localhost ve 127.0.0.1 önizlemelerinde temiz yolları
  otomatik olarak fiziksel .html dosyalarına eşler.
- Yeni bir sayfa eklenirse hem temiz bağlantısı hem de localizeStaticRoutes
  içindeki yerel dosya eşlemesi birlikte güncellenmelidir.