const accountPanel = document.getElementById('accountPanel');
const loginForm = document.getElementById('loginForm');
const signedInPanel = document.getElementById('signedInPanel');
const signedInUsername = document.getElementById('signedInUsername');
const loginMessage = document.getElementById('loginMessage');
const logoutButton = document.getElementById('logoutButton');
const stateFilter = document.getElementById('stateFilter');
const dealerRows = document.getElementById('dealerRows');
const dealerHeaders = document.getElementById('dealerHeaders');
const dealerCount = document.getElementById('dealerCount');
const dealerError = document.getElementById('dealerError');
let loggedIn = accountPanel.dataset.authenticated === 'true';

function setAccountState(isLoggedIn, username) {
  loggedIn = isLoggedIn;
  loginForm.hidden = isLoggedIn;
  signedInPanel.hidden = !isLoggedIn;
  signedInUsername.textContent = username || '';
  renderDealers(window.currentDealers || []);
}

function makeCell(value) {
  const cell = document.createElement('td');
  cell.textContent = value || '';
  return cell;
}

function renderDealers(dealers) {
  dealerRows.replaceChildren();
  dealerHeaders.querySelector('[data-review-column]')?.remove();
  if (loggedIn) {
    const heading = document.createElement('th');
    heading.scope = 'col';
    heading.dataset.reviewColumn = 'true';
    heading.textContent = 'Review Dealer';
    dealerHeaders.append(heading);
  }
  if (!dealers.length) {
    const row = document.createElement('tr');
    const cell = makeCell('No dealerships found.');
    cell.colSpan = loggedIn ? 7 : 6;
    row.append(cell);
    dealerRows.append(row);
    return;
  }
  dealers.forEach((dealer) => {
    const row = document.createElement('tr');
    row.append(makeCell(dealer._id));
    const nameCell = document.createElement('td');
    const dealerLink = document.createElement('a');
    dealerLink.href = `/dealer/${dealer._id}`;
    dealerLink.textContent = dealer.full_name;
    nameCell.append(dealerLink);
    row.append(nameCell, makeCell(dealer.city), makeCell(dealer.address), makeCell(dealer.zip), makeCell(dealer.state));
    if (loggedIn) {
      const reviewCell = document.createElement('td');
      const reviewLink = document.createElement('a');
      reviewLink.href = `/postreview/${dealer._id}`;
      reviewLink.textContent = 'Write a review';
      reviewCell.append(reviewLink);
      row.append(reviewCell);
    }
    dealerRows.append(row);
  });
}

async function loadDealers(state) {
  dealerError.hidden = true;
  dealerCount.textContent = 'Loading dealerships…';
  const path = state ? `/djangoapp/get_dealers/${encodeURIComponent(state)}` : '/djangoapp/get_dealers';
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error('Unable to load dealerships. Please try again.');
    const dealers = await response.json();
    window.currentDealers = dealers;
    if (!state) {
      const states = [...new Set(dealers.map((dealer) => dealer.state).filter(Boolean))].sort();
      stateFilter.replaceChildren(new Option('All', ''));
      states.forEach((dealerState) => stateFilter.add(new Option(dealerState, dealerState)));
    }
    dealerCount.textContent = `${dealers.length} dealerships`;
    renderDealers(dealers);
  } catch (error) {
    dealerCount.textContent = '';
    dealerError.textContent = error.message;
    dealerError.hidden = false;
    renderDealers([]);
  }
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  loginMessage.textContent = '';
  const formData = new FormData(loginForm);
  try {
    const response = await fetch('/djangoapp/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: formData.get('username'), password: formData.get('password') })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Login failed.');
    loginForm.reset();
    setAccountState(true, result.user.username);
  } catch (error) {
    loginMessage.textContent = error.message;
  }
});

logoutButton.addEventListener('click', async () => {
  try {
    const response = await fetch('/djangoapp/logout', { method: 'POST' });
    if (!response.ok) throw new Error('Logout failed.');
    setAccountState(false, '');
  } catch (error) {
    loginMessage.textContent = error.message;
  }
});

stateFilter.addEventListener('change', () => loadDealers(stateFilter.value));
setAccountState(loggedIn, accountPanel.dataset.username);
loadDealers('');