const supabaseUrl = "https://inzbcwyfynzbauiaztvh.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImluemJjd3lmeW56YmF1aWF6dHZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0OTAyNjcsImV4cCI6MjEwNjA2NjI2N30.u0V75PXlrvr-aVwoxUw_Xhn6Y1R4q6LVHMpB3LkSWtc";

// Create the client
const db = window.supabase.createClient(supabaseUrl, supabaseKey);

// Functions that use db
async function getFlavours() {
  const { data, error } = await db
    .from("flavours")
    .select("*")
    .eq("available", true)
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}

function buildOrderLink(flavours) {
  const number = "2347079733184";
  const message = `Hi Roll Haus! I'd like to order: ${flavours.name}, quantity: `;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

function createCard(flavours) {
  const image = flavours.image_url || "../assets/menu-preview-img.jpg";

  return `
    <div class="menu-card">
      <div class="menu-card-img">
        <img src="${image}" alt="${flavours.name}">
      </div>
      <div class="menu-card-info">
        <h4>${flavours.name}</h4>
        <p>${flavours.description}</p>
        <span>₦${flavours.price}</span>
      </div>
      <div class="menu-card-actions">
        <div class="quantity-picker">
          <button class="qty-btn" data-action="minus">−</button>
          <span class="qty-value">1</span>
          <button class="qty-btn" data-action="plus">+</button>
        </div>
        <a href="#" class="btn btn-small order-btn" data-flavor="${flavours.name}">Order</a>
      </div>
    </div>
  `;
}

async function renderMenu() {
  const flavours = await getFlavours();
  const container = document.getElementById("menu-cards");

  let html = "";

  for (let i = 0; i < flavours.length; i++) {
    html += createCard(flavours[i]);
  }

  container.innerHTML = html;
}

renderMenu();

document.addEventListener("click", function (event) {
  const qtyBtn = event.target.closest(".qty-btn");
  if (qtyBtn) {
    const picker = qtyBtn.closest(".quantity-picker");
    const valueSpan = picker.querySelector(".qty-value");
    let current = parseInt(valueSpan.textContent);

    if (qtyBtn.dataset.action === "plus") {
      current++;
    } else if (qtyBtn.dataset.action === "minus" && current > 1) {
      current--;
    }

    valueSpan.textContent = current;
    return;
  }

  const orderBtn = event.target.closest(".order-btn");
  if (orderBtn) {
    event.preventDefault();

    const card = orderBtn.closest(".menu-card");
    const qty = card.querySelector(".qty-value").textContent;
    const flavourName = orderBtn.dataset.flavours;

    const number = "2347079733184";
    const message = `Hi Roll Haus! I'd like to order: ${qty}x ${flavourName}`;
    const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");
  }
});