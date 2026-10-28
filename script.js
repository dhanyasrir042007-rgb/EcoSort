// EcoSort Stage 1: frontend demo. Stage 2 will replace browser storage with a C backend.
const STORAGE_KEY = 'ecosort-stage1-records';
let wasteItems = loadItems();
let sortAscending = true;

const form = document.getElementById('waste-form');
const nameInput = document.getElementById('waste-name');
const quantityInput = document.getElementById('waste-quantity');
const unitInput = document.getElementById('waste-unit');
const categoryInput = document.getElementById('waste-category');
const message = document.getElementById('form-message');
const tableBody = document.getElementById('waste-table-body');
const searchInput = document.getElementById('search-input');
const filterInput = document.getElementById('filter-category');
const emptyState = document.getElementById('empty-state');

function loadItems() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    return [];
  }
}

function saveItems() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(wasteItems));
}

function categoryClass(category) {
  if (category === 'Recyclable') return 'tag-recyclable';
  if (category === 'Organic') return 'tag-organic';
  return 'tag-non-recyclable';
}

function categorySymbol(category) {
  if (category === 'Recyclable') return '♻';
  if (category === 'Organic') return '♧';
  return '↗';
}

function renderDashboard() {
  document.getElementById('total-items').textContent = wasteItems.length;
  document.getElementById('recyclable-items').textContent = wasteItems.filter(item => item.category === 'Recyclable').length;
  document.getElementById('organic-items').textContent = wasteItems.filter(item => item.category === 'Organic').length;
  document.getElementById('other-items').textContent = wasteItems.filter(item => item.category === 'Non-recyclable').length;
  document.getElementById('record-count').textContent = `${wasteItems.length} record${wasteItems.length === 1 ? '' : 's'}`;
}

function renderList() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const chosenCategory = filterInput.value;
  let visibleItems = wasteItems.filter(item => {
    const matchesName = item.name.toLowerCase().includes(searchTerm);
    const matchesCategory = chosenCategory === 'All' || item.category === chosenCategory;
    return matchesName && matchesCategory;
  });

  visibleItems.sort((a, b) => {
    const result = a.name.localeCompare(b.name);
    return sortAscending ? result : -result;
  });

  tableBody.innerHTML = '';
  emptyState.style.display = visibleItems.length === 0 ? 'block' : 'none';
  if (visibleItems.length === 0) {
    emptyState.querySelector('h3').textContent = wasteItems.length === 0 ? 'Your list is ready' : 'No matching items';
    emptyState.querySelector('p').textContent = wasteItems.length === 0 ? 'Add your first waste item above to see it here.' : 'Try a different search or category filter.';
  }

  visibleItems.forEach(item => {
    const row = document.createElement('tr');
    const nameCell = document.createElement('td');
    nameCell.textContent = item.name;
    const categoryCell = document.createElement('td');
    const tag = document.createElement('span');
    tag.className = `category-tag ${categoryClass(item.category)}`;
    tag.textContent = `${categorySymbol(item.category)} ${item.category}`;
    categoryCell.appendChild(tag);
    const quantityCell = document.createElement('td');
    quantityCell.textContent = `${item.quantity} ${item.unit}`;
    const actionCell = document.createElement('td');
    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-button';
    deleteButton.type = 'button';
    deleteButton.textContent = 'Remove';
    deleteButton.addEventListener('click', () => removeItem(item.id));
    actionCell.appendChild(deleteButton);
    row.append(nameCell, categoryCell, quantityCell, actionCell);
    tableBody.appendChild(row);
  });
}

function render() {
  renderDashboard();
  renderList();
}

function removeItem(id) {
  wasteItems = wasteItems.filter(item => item.id !== id);
  saveItems();
  render();
  message.textContent = 'Waste item removed.';
}

form.addEventListener('submit', event => {
  event.preventDefault();
  const name = nameInput.value.trim();
  const quantity = Number(quantityInput.value);
  const category = categoryInput.value;
  if (!name || !Number.isInteger(quantity) || quantity < 1 || !category) {
    message.textContent = 'Please enter a name, valid quantity, and category.';
    return;
  }

  wasteItems.push({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name,
    quantity,
    unit: unitInput.value,
    category
  });
  saveItems();
  render();
  form.reset();
  quantityInput.value = '1';
  message.textContent = `${name} added successfully!`;
  nameInput.focus();
});

searchInput.addEventListener('input', renderList);
filterInput.addEventListener('change', renderList);
document.getElementById('sort-button').addEventListener('click', event => {
  sortAscending = !sortAscending;
  event.currentTarget.textContent = sortAscending ? 'Sort A–Z ↕' : 'Sort Z–A ↕';
  renderList();
});
document.getElementById('clear-button').addEventListener('click', () => {
  if (wasteItems.length === 0) {
    message.textContent = 'There are no records to clear.';
    return;
  }
  if (confirm('Clear every EcoSort record saved in this browser?')) {
    wasteItems = [];
    saveItems();
    render();
    message.textContent = 'All records cleared.';
  }
});

render();
