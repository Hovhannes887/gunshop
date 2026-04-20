// 1. Տվյալների բեռնում
let products = JSON.parse(localStorage.getItem('gunProducts')) || [
    { id: 1, title: "SVD Դիպուկահար", price: "1,500,000", img: "https://via.placeholder.com/250x150?text=SVD" },
    { id: 2, title: "Sayga MK 30", price: "480,000", img: "https://via.placeholder.com/250x150?text=Sayga" },
    { id: 3, title: "Makarov 9mm", price: "180,000", img: "https://via.placeholder.com/250x150?text=Makarov" }
];

let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let users = JSON.parse(localStorage.getItem('registeredUsers')) || []; // Պահում ենք բոլոր գրանցվածներին
let favorites = [];
let isLoginMode = true;

// Եթե օգտատերը մուտք է գործած, բեռնում ենք հենց ԻՐ հավանածները
if (currentUser) {
    loadUserFavorites();
}

function loadUserFavorites() {
    favorites = JSON.parse(localStorage.getItem('favs_' + currentUser.username)) || [];
}

function showSection(sectionName) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(sec => sec.style.display = 'none');
    document.getElementById(sectionName + '-section').style.display = 'block';
    if(sectionName === 'profile') updateProfileUI();
}

function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    document.getElementById('auth-title').innerText = isLoginMode ? "Մուտք" : "Գրանցում";
    document.getElementById('auth-submit').innerText = isLoginMode ? "Մուտք գործել" : "Գրանցվել";
    document.getElementById('auth-toggle-text').innerText = isLoginMode ? "Չունե՞ք հաշիվ։ Գրանցվեք" : "Արդեն ունե՞ք հաշիվ։ Մուտք գործեք";
}

function handleAuth() {
    const user = document.getElementById('auth-username').value;
    const pass = document.getElementById('auth-password').value;

    if (!user || !pass) return alert("Լրացրեք դաշտերը");

    if (isLoginMode) {
        // ՄՈՒՏՔ: Ստուգում ենք արդյոք կա նման օգտատեր
        const foundUser = users.find(u => u.username === user && u.password === pass);
        if (foundUser) {
            currentUser = foundUser;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            loadUserFavorites();
            updateUIForLoggedInUser();
            showSection('home');
            displayProducts();
        } else {
            alert("Սխալ անուն կամ գաղտնաբառ");
        }
    } else {
        // ԳՐԱՆՑՈՒՄ: Ավելացնում ենք նոր օգտատեր
        if (users.some(u => u.username === user)) return alert("Այս անունով օգտատեր արդեն կա");
        
        const newUser = { username: user, password: pass };
        users.push(newUser);
        localStorage.setItem('registeredUsers', JSON.stringify(users));
        alert("Գրանցումը հաջողվեց: Հիմա մուտք գործեք:");
        toggleAuthMode();
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    location.reload();
}

function updateUIForLoggedInUser() {
    if (currentUser) {
        document.getElementById('auth-btn').style.display = 'none';
        document.getElementById('nav-fav').style.display = 'inline-block';
        document.getElementById('nav-add').style.display = 'inline-block';
        document.getElementById('nav-msg').style.display = 'inline-block';
        document.getElementById('nav-profile').style.display = 'inline-block';
        updateFavoritesUI();
    }
}

function displayProducts(filteredData = products) {
    const grid = document.getElementById('productGrid');
    grid.innerHTML = '';
    filteredData.forEach(prod => {
        const isFav = favorites.some(f => f.id === prod.id);
        const favClass = isFav ? 'btn-fav active' : 'btn-fav';
        grid.innerHTML += `
            <div class="product-card">
                <img src="${prod.img}">
                <h3>${prod.title}</h3>
                <p class="price">${prod.price} ֏</p>
                <div style="display: flex;">
                    <button class="${favClass}" onclick="toggleFav(${prod.id})">❤</button>
                    <button class="btn-msg">Գրել տիրոջը</button>
                </div>
            </div>`;
    });
}

function toggleFav(id) {
    if(!currentUser) return alert("Նախ մուտք գործեք");

    const index = favorites.findIndex(p => p.id === id);
    if (index === -1) {
        favorites.push(products.find(p => p.id === id));
    } else {
        favorites.splice(index, 1);
    }
    
    // ՊԱՀՊԱՆՈՒՄ ԵՆՔ ՏՎՅԱԼ ՕԳՏԱՏԻՐՈՋ ՀԱՄԱՐ
    localStorage.setItem('favs_' + currentUser.username, JSON.stringify(favorites));
    displayProducts();
    updateFavoritesUI();
}

function updateFavoritesUI() {
    const favGrid = document.getElementById('favoritesGrid');
    favGrid.innerHTML = favorites.length ? '' : '<p>Հավանածներ չկան:</p>';
    favorites.forEach(prod => {
        favGrid.innerHTML += `
            <div class="product-card">
                <h3>${prod.title}</h3>
                <p class="price">${prod.price} ֏</p>
                <button class="btn-fav active" onclick="toggleFav(${prod.id})">❤ Հեռացնել</button>
            </div>`;
    });
}

function updateProfileUI() {
    document.getElementById('profile-data').innerHTML = `
        <p><strong>Անուն:</strong> ${currentUser.username}</p>
        <p><strong>Հավանած զենքեր:</strong> ${favorites.length}</p>
    `;
}

function handleSearch() {
    const q = document.getElementById('searchInput').value.toLowerCase();
    displayProducts(products.filter(p => p.title.toLowerCase().includes(q)));
}

function addNewProduct() {
    const t = document.getElementById('newTitle').value;
    const p = document.getElementById('newPrice').value;
    if(t && p) {
        const n = { id: Date.now(), title: t, price: parseInt(p).toLocaleString(), img: "https://via.placeholder.com/250x150?text=New" };
        products.unshift(n);
        localStorage.setItem('gunProducts', JSON.stringify(products));
        displayProducts();
        showSection('home');
    }
}

updateUIForLoggedInUser();
displayProducts();