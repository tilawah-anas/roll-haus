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
  const message = `Hi Roll Haus! I'd like to order: 1x ${flavours.name}`;
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
      <a href="${buildOrderLink(flavours)}" class="btn btn-small" target="_blank">Order</a>
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