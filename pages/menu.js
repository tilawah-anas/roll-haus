const supabaseUrl = "https://inzbcwyfynzbauiaztvh.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImluemJjd3lmeW56YmF1aWF6dHZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0OTAyNjcsImV4cCI6MjEwNjA2NjI2N30.u0V75PXlrvr-aVwoxUw_Xhn6Y1R4q6LVHMpB3LkSWtc";


const db = window.supabase.createClient(supabaseUrl, supabaseKey);


async function getFlavours() {
  const { data, error } = await db
    .from("flavours")
    .select("*")
    .eq("available", true)
    .eq("is_special", false)
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}


async function getSpecial() {
  const { data, error } = await db
    .from("flavours")
    .select("*")
    .eq("is_special", true)
    .eq("available", true)
    .limit(1);

  if (error || !data || data.length === 0) {
    return null;
  }

  return data[0];
}


function createCard(flavour) {
  const image = flavour.image_url || "../assets/menu-preview-img.jpg";

  return `
    <div class="menu-card">
      <div class="menu-card-img">
        <img src="${image}" alt="${flavour.name}">
      </div>
      <div class="menu-card-info">
        <h4>${flavour.name}</h4>
        <p>${flavour.description}</p>
        <span>₦${flavour.price}</span>
      </div>
      <div class="menu-card-actions">
        <div class="quantity-picker">
          <button class="qty-btn" data-action="minus">−</button>
          <span class="qty-value">0</span>
          <button class="qty-btn" data-action="plus">+</button>
        </div>
      </div>
    </div>
  `;
}


function createSpecialCard(flavour) {
  const image = flavour.image_url || "../assets/menu-preview-img.jpg";

  return `
    <div class="special-card-img">
      <img src="${image}" alt="${flavour.name}">
    </div>
    <div class="special-card-info">
      <h4>${flavour.name}</h4>
      <p>${flavour.description}</p>
      <span class="special-price">₦${flavour.price}</span>
      <div class="quantity-picker">
        <button class="qty-btn" data-action="minus">−</button>
        <span class="qty-value">0</span>
        <button class="qty-btn" data-action="plus">+</button>
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


async function renderSpecial() {
  const special = await getSpecial();

  if (!special) {
    return; // section stays hidden
  }

  const container = document.getElementById("special-card");
  const section = document.getElementById("specials");

  container.innerHTML = createSpecialCard(special);
  section.removeAttribute("hidden");
}

renderSpecial();
renderMenu();


document.addEventListener("click", function (event) {
  const qtyBtn = event.target.closest(".qty-btn");
  if (qtyBtn) {
    const picker = qtyBtn.closest(".quantity-picker");
    const valueSpan = picker.querySelector(".qty-value");
    let current = parseInt(valueSpan.textContent);

    if (qtyBtn.dataset.action === "plus") {
      current++;
    } else if (qtyBtn.dataset.action === "minus" && current > 0) {
      current--;
    }

    valueSpan.textContent = current;
    updateOrderButton();
    return;
  }

  const orderBtn = event.target.closest("#order-now");
  if (orderBtn) {
    const cards = document.querySelectorAll(".menu-card, .special-card");
    const lines = [];

    cards.forEach(function (card) {
      const qty = parseInt(card.querySelector(".qty-value").textContent);
      if (qty > 0) {
        const name = card.querySelector("h4").textContent;
        lines.push(`${qty}x ${name}`);
      }
    });

    const number = "2347079733184";
    const message = `Hi Roll Haus! I'd like to order:\n${lines.join("\n")}`;
    const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");
  }
});


function updateOrderButton() {
  const cards = document.querySelectorAll(".menu-card, .special-card");
  let total = 0;

  cards.forEach(function (card) {
    const qty = parseInt(card.querySelector(".qty-value").textContent);
    if (qty > 0) total += qty;
  });

  const btn = document.getElementById("order-now");

  if (total === 0) {
    btn.disabled = true;
    btn.textContent = "Order now (0 items)";
  } else {
    btn.disabled = false;
    btn.textContent = `Order now (${total} item${total === 1 ? "" : "s"})`;
  }
}