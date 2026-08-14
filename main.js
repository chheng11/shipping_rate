
// ---- DATA -------------------------------------------------------
const WEIGHT_BRACKETS = [1,2,3,5,10,15,20,25,30,31]; // 31 = "31kg Up"
const BRACKET_LABELS  = ["1kg","2kg","3kg","5kg","10kg","15kg","20kg","25kg","30kg","31kg Up"];

// Each rate group carries its own Zone number so the country dropdown
// can be organized by zone, and so the same country name never appears
// twice with conflicting rates.
const RATE_GROUPS = [
  {
    zone: 1,
    rates: [27.94, 18.69, 15.55, 12.97, 10.78, 9.08, 8.23, 7.72, 7.38, 7.14],
    countries: [
      {code:"AU", name:"Australia"},
      {code:"BD", name:"Bangladesh"},
      {code:"BT", name:"Bhutan"},
      {code:"IN", name:"India"},
      {code:"KR", name:"Korea"},
      {code:"NP", name:"Nepal"},
      {code:"NZ", name:"New Zealand"},
      {code:"PK", name:"Pakistan"},
      {code:"LK", name:"Sri Lanka"}
    ]
  },
  {
    zone: 2,
    rates: [34.91, 23.39, 19.54, 16.47, 13.69, 11.30, 10.10, 9.47, 9.05, 8.78],
    countries: [
      {code:"CA", name:"Canada"},
      {code:"MX", name:"Mexico"},
      {code:"US", name:"USA"}
    ]
  },
  {
    zone: 3,
    rates: [42.89, 28.98, 24.33, 20.62, 17.24, 14.46, 13.07, 12.24, 11.68, 11.31],
    countries: [
      {code:"KW", name:"Kuwait"},
      {code:"NO", name:"Norway"},
      {code:"OM", name:"Oman"},
      {code:"QA", name:"Qatar"},
      {code:"SA", name:"Saudi Arabia"},
      {code:"TR", name:"Turkey"}
    ]
  },
  {
    zone: 4,
    rates: [22.34, 14.21, 11.40, 9.04, 7.11, 5.71, 5.00, 4.58, 4.30, 4.17],
    countries: [
      {code:"MM", name:"Myanmar"},
      {code:"TH", name:"Thailand"},
      {code:"VN", name:"Vietnam"},
      {code:"LA", name:"Laos"}
    ]
  },
  {
    zone: 5,
    rates: [24.24, 15.73, 12.82, 10.41, 8.39, 6.96, 6.24, 5.85, 5.59, 5.41],
    countries: [
      {code:"BN", name:"Brunei"},
      {code:"HK", name:"Hong Kong"},
      {code:"ID", name:"Indonesia"},
      {code:"MO", name:"Macau"},
      {code:"MY", name:"Malaysia"},
      {code:"SG", name:"Singapore"}
    ]
  },
  {
    // Zone 8: original 19-country sheet, minus Kuwait/Norway/Oman/Qatar/Saudi Arabia/Turkey,
    // which now live in Zone 3 with identical rates (see note to user).
    zone: 8,
    rates: [42.89, 28.98, 24.34, 20.63, 17.24, 14.46, 13.07, 12.24, 11.68, 11.31],
    countries: [
      {code:"AL", name:"Albania"},
      {code:"AM", name:"Armenia"},
      {code:"AZ", name:"Azerbaijan"},
      {code:"BH", name:"Bahrain"},
      {code:"BA", name:"Bosnia & Herzegovina"},
      {code:"GI", name:"Gibraltar"},
      {code:"GG", name:"Guernsey"},
      {code:"JE", name:"Jersey"},
      {code:"JO", name:"Jordan"},
      {code:"ME", name:"Montenegro, Rep"},
      {code:"MK", name:"North Macedonia"},
      {code:"RS", name:"Serbia, Rep"},
      {code:"AE", name:"United Arab Emirates"}
    ]
  }
];

const COUNTRIES = RATE_GROUPS.flatMap(g => g.countries.map(c => ({...c, rates:g.rates, zone:g.zone})));
function fmt(n){ return "$ " + n.toFixed(2); }
function flagUrl(code, width){
  return `https://flagcdn.com/w${width}/${code.toLowerCase()}.png`;
}

// ---- searchable country combobox, grouped by zone -----------------------------------
const countryInput = document.getElementById("countryInput");
const comboPanel = document.getElementById("comboPanel");
let selectedIndex = COUNTRIES.findIndex(c => c.code === "AL" && c.zone === 8); // default: Albania, Zone 8
let activeItemIndex = -1; // keyboard highlight, index into currently-rendered visible list
let visibleList = [];

function renderPanel(filterText){
  const q = (filterText || "").trim().toLowerCase();
  comboPanel.innerHTML = "";
  visibleList = [];

  RATE_GROUPS.forEach(group => {
    const matches = group.countries
      .map(c => COUNTRIES.findIndex(x => x.code === c.code && x.zone === group.zone))
      .filter(idx => COUNTRIES[idx].name.toLowerCase().includes(q));
    if(matches.length === 0) return;

    const groupLabel = document.createElement("div");
    groupLabel.className = "combo-group-label";
    groupLabel.textContent = "Zone " + group.zone;
    comboPanel.appendChild(groupLabel);

    matches.forEach(idx => {
      const c = COUNTRIES[idx];
      const item = document.createElement("div");
      item.className = "combo-item";
      item.dataset.idx = idx;
      item.innerHTML = `<img src="${flagUrl(c.code, 24)}" alt=""><span>${c.name}</span>`;
      item.addEventListener("mousedown", (e) => {
        e.preventDefault(); // keep focus so blur doesn't fire before click
        selectCountry(idx);
      });
      comboPanel.appendChild(item);
      visibleList.push(idx);
    });
  });

  if(visibleList.length === 0){
    const empty = document.createElement("div");
    empty.className = "combo-empty";
    empty.textContent = "No country matches \u201c" + filterText + "\u201d";
    comboPanel.appendChild(empty);
  }
  activeItemIndex = -1;
}

function openPanel(){
  renderPanel(countryInput.value === COUNTRIES[selectedIndex]?.name ? "" : countryInput.value);
  comboPanel.classList.add("open");
}
function closePanel(){
  comboPanel.classList.remove("open");
}

function selectCountry(idx){
  selectedIndex = idx;
  countryInput.value = COUNTRIES[idx].name;
  closePanel();
  updateResult();
}

countryInput.addEventListener("focus", () => {
  countryInput.select();
  openPanel();
});
countryInput.addEventListener("input", () => openPanel());
countryInput.addEventListener("blur", () => {
  // if user left the field without picking a match, snap back to the last valid selection
  setTimeout(() => {
    countryInput.value = COUNTRIES[selectedIndex].name;
    closePanel();
  }, 120);
});
countryInput.addEventListener("keydown", (e) => {
  const items = comboPanel.querySelectorAll(".combo-item");
  if(e.key === "ArrowDown"){
    e.preventDefault();
    activeItemIndex = Math.min(activeItemIndex + 1, items.length - 1);
    items.forEach(el => el.classList.remove("active"));
    if(items[activeItemIndex]){ items[activeItemIndex].classList.add("active"); items[activeItemIndex].scrollIntoView({block:"nearest"}); }
  } else if(e.key === "ArrowUp"){
    e.preventDefault();
    activeItemIndex = Math.max(activeItemIndex - 1, 0);
    items.forEach(el => el.classList.remove("active"));
    if(items[activeItemIndex]){ items[activeItemIndex].classList.add("active"); items[activeItemIndex].scrollIntoView({block:"nearest"}); }
  } else if(e.key === "Enter"){
    e.preventDefault();
    if(activeItemIndex >= 0 && items[activeItemIndex]){
      selectCountry(parseInt(items[activeItemIndex].dataset.idx, 10));
    } else if(visibleList.length > 0){
      selectCountry(visibleList[0]);
    }
  } else if(e.key === "Escape"){
    countryInput.value = COUNTRIES[selectedIndex].name;
    closePanel();
  }
});

// ---- weight input -----------------------
let weight = 5;
const MIN_W = 1, MAX_W = 999;
const weightInput = document.getElementById("weightInput");

function setWeight(val){
  weight = Math.min(MAX_W, Math.max(MIN_W, Math.round(val) || 1));
  updateResult();
}

weightInput.addEventListener("input", () => setWeight(parseFloat(weightInput.value)));
weightInput.addEventListener("blur", () => { weightInput.value = weight; });

// ---- category tabs ----------------------------------------------
const resultPrice = document.getElementById("resultPrice");
const perKgValue = document.getElementById("perKgValue");
const weightMultLine = document.getElementById("weightMultLine");
const resultBracket = document.getElementById("resultBracket");
const resultCountry = document.getElementById("resultCountry");
const resultZoneLine = document.getElementById("resultZoneLine");
const stampNote = document.getElementById("stampNote");
const zoneBadge = document.getElementById("zoneBadge");
const selectFlag = document.getElementById("selectFlag");
const resultFlag = document.getElementById("resultFlag");
const tabs = document.querySelectorAll("#categoryTabs button");
let activeCategory = "general";
const confirmBtn = document.getElementById("confirmBtn");
let lastQuote = null;

tabs.forEach(btn => btn.addEventListener("click", () => {
  tabs.forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  activeCategory = btn.dataset.cat;
  updateResult();
}));

function bracketIndexForWeight(w){
  for(let i=0;i<WEIGHT_BRACKETS.length-1;i++){
    if(w <= WEIGHT_BRACKETS[i]) return i;
  }
  return WEIGHT_BRACKETS.length - 1;
}

function updateResult(){
  const country = COUNTRIES[selectedIndex];
  zoneBadge.textContent = "Zone " + country.zone;
  selectFlag.src = flagUrl(country.code, 40);
  selectFlag.alt = country.name + " flag";
  resultFlag.src = flagUrl(country.code, 80);
  resultFlag.alt = country.name + " flag";
  resultCountry.textContent = country.name;

  if(activeCategory === "document"){
    resultZoneLine.textContent = `Zone ${country.zone} · ប្រភេទឯកសារ`;
    perKgValue.textContent = "—";
    weightMultLine.textContent = `\u00d7 ${weight} kg`;
    resultBracket.textContent = "no data";
    resultPrice.textContent = "—";
    stampNote.textContent = "Pending";
    stampNote.style.color = "#8B8F80";
    stampNote.style.borderColor = "#8B8F80";
    confirmBtn.disabled = true;
    lastQuote = null;
    return;
  }

  const idx = bracketIndexForWeight(weight);
  const perKgRate = country.rates[idx];
  const total = perKgRate * weight;
  const label = BRACKET_LABELS[idx];

  resultZoneLine.textContent = `Zone ${country.zone} · ប្រភេទទំនេញទូទៅ`;
  perKgValue.textContent = fmt(perKgRate);
  weightMultLine.textContent = `\u00d7 ${weight} kg`;
  resultBracket.textContent = label + " bracket";
  resultPrice.textContent = fmt(total);
  stampNote.textContent = "Rate confirmed";
  stampNote.style.color = "var(--red)";
  stampNote.style.borderColor = "var(--red)";
  confirmBtn.disabled = false;
  lastQuote = { country, weight, perKgRate, total, label };
}

countryInput.value = COUNTRIES[selectedIndex].name;
document.addEventListener("click", (e) => {
  if(!document.getElementById("comboWrap").contains(e.target)) closePanel();
});
updateResult();

// ---- confirm -> waybill view -----------------------------------
const lookupView = document.getElementById("lookupView");
const confirmView = document.getElementById("confirmView");
const waybillRef = document.getElementById("waybillRef");
const waybillDate = document.getElementById("waybillDate");
const waybillFlag = document.getElementById("waybillFlag");
const waybillCountry = document.getElementById("waybillCountry");
const waybillZone = document.getElementById("waybillZone");
const waybillWeight = document.getElementById("waybillWeight");
const waybillPerKg = document.getElementById("waybillPerKg");
const waybillBracket = document.getElementById("waybillBracket");
const waybillCategory = document.getElementById("waybillCategory");
const waybillTotal = document.getElementById("waybillTotal");

function generateRef(){
  const n = Math.floor(100000 + Math.random() * 900000);
  return "GPSL-" + n;
}

confirmBtn.addEventListener("click", () => {
  if(!lastQuote) return;
  const { country, weight, perKgRate, total, label } = lastQuote;

  waybillRef.textContent = generateRef();
  waybillDate.textContent = new Date().toLocaleString(undefined, {
    year:"numeric", month:"short", day:"numeric", hour:"2-digit", minute:"2-digit"
  });
  waybillFlag.src = flagUrl(country.code, 320);
  waybillFlag.alt = country.name + " flag";
  waybillCountry.textContent = country.name;
  waybillZone.textContent = `Zone ${country.zone} · ប្រភេទទំនេញទូទៅ`;
  waybillWeight.textContent = weight + " kg";
  waybillPerKg.textContent = fmt(perKgRate) + " /kg";
  waybillBracket.textContent = label;
  waybillCategory.textContent = "General Product";
  waybillTotal.textContent = fmt(total);

  lookupView.style.display = "none";
  confirmView.classList.add("open");
  window.scrollTo({top:0, behavior:"smooth"});
});

document.getElementById("newLookupBtn").addEventListener("click", () => {
  confirmView.classList.remove("open");
  lookupView.style.display = "";
  window.scrollTo({top:0, behavior:"smooth"});
});

function captureWaybill(){
  const actions = document.querySelector(".waybill-actions");
  actions.style.visibility = "hidden";
  return html2canvas(document.querySelector(".waybill"), {
    scale: 2.5,
    useCORS: true,
    allowTaint: true,
    backgroundColor: "#FAFAF8"
  }).finally(() => { actions.style.visibility = ""; });
}

document.getElementById("downloadBtn").addEventListener("click", () => {
  const country = COUNTRIES[selectedIndex];
  captureWaybill().then(canvas => {
    const link = document.createElement("a");
    link.download = `GPSL-${country.name.replace(/\s/g,"-")}-Rate.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
});

document.getElementById("screenshotBtn").addEventListener("click", () => {
  captureWaybill().then(canvas => {
    const win = window.open();
    win.document.write(`<title>GPSL Rate Screenshot</title><body style="margin:0;background:#1D607D;display:flex;justify-content:center;padding:30px"><img src="${canvas.toDataURL()}" style="max-width:100%;border-radius:8px;box-shadow:0 20px 50px rgba(0,0,0,0.5)"></body>`);
  });
});
