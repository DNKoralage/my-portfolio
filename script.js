document.addEventListener("DOMContentLoaded", function() {
    
    // 1. Settings (Logo සහ Colors) වෙබ් අඩවියට लोड කිරීම
    fetch('/content/settings.json')
        .then(res => res.json())
        .then(data => {
            if(data.logo_text) {
                document.querySelector('.logo').innerText = data.logo_text;
            }
            if(data.primary_color) {
                document.documentElement.style.setProperty('--primary-color', data.primary_color);
            }
        });

    // 2. Home Page Content (Headings, Images, Links) වෙබ් අඩවියට load කිරීම
    fetch('/content/home.json')
        .then(res => res.json())
        .then(data => {
            if(data.heading) document.querySelector('.hero h1').innerText = data.heading;
            if(data.badge) document.querySelector('.hero-badge').innerText = data.badge;
            if(data.hero_image) document.querySelector('.hero img').src = data.hero_image;
            if(data.btn_text) document.querySelector('.hero-btn').innerText = data.btn_text;
            if(data.btn_link) document.querySelector('.hero-btn').href = data.btn_link;
        });
});
