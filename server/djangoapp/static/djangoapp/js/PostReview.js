const reviewForm = document.getElementById('reviewForm');
const dealerId = reviewForm.dataset.dealerId;
const makeSelect = document.getElementById('carMake');
const modelSelect = document.getElementById('carModel');
const reviewError = document.getElementById('reviewError');
const submitReview = document.getElementById('submitReview');
let cars = [];

function readCookie(name) {
  const prefix = `${name}=`;
  const cookie = document.cookie.split(';').map((item) => item.trim()).find((item) => item.startsWith(prefix));
  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : '';
}

async function loadDealerAndCars() {
  try {
    const [dealerResponse, carsResponse] = await Promise.all([
      fetch(`/djangoapp/dealer/${dealerId}`),
      fetch('/djangoapp/get_cars')
    ]);
    if (!dealerResponse.ok || !carsResponse.ok) throw new Error('Could not load dealership details or car list.');
    const [dealer, carData] = await Promise.all([dealerResponse.json(), carsResponse.json()]);
    document.getElementById('dealerName').textContent = dealer.full_name;
    document.title = `Post Review | ${dealer.full_name}`;
    cars = carData.Cars || [];
    const makes = [...new Set(cars.map((car) => car.CarMake))].sort();
    makes.forEach((make) => makeSelect.add(new Option(make, make)));
  } catch (error) {
    reviewError.textContent = error.message;
    reviewError.hidden = false;
    submitReview.disabled = true;
  }
}

makeSelect.addEventListener('change', () => {
  modelSelect.replaceChildren(new Option('Choose a model', ''));
  const models = cars.filter((car) => car.CarMake === makeSelect.value).map((car) => car.CarModel);
  models.forEach((model) => modelSelect.add(new Option(model, model)));
  modelSelect.disabled = models.length === 0;
});

reviewForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  reviewError.hidden = true;
  submitReview.disabled = true;
  const reviewText = document.getElementById('review').value.trim();
  let sentiment = 'neutral';
  try {
    const sentimentResponse = await fetch(`/djangoapp/analyze/${encodeURIComponent(reviewText)}`);
    if (sentimentResponse.ok) sentiment = (await sentimentResponse.json()).sentiment || sentiment;
  } catch (error) {
    sentiment = 'neutral';
  }
  const payload = {
    dealerId: Number(dealerId),
    name: reviewForm.dataset.reviewer,
    review: reviewText,
    purchase: document.getElementById('purchased').checked,
    purchase_date: document.getElementById('purchaseDate').value,
    car_make: makeSelect.value,
    car_model: modelSelect.value,
    car_year: Number(document.getElementById('carYear').value),
    sentiment
  };
  const headers = { 'Content-Type': 'application/json' };
  const csrfToken = readCookie('csrftoken');
  if (csrfToken) headers['X-CSRFToken'] = csrfToken;
  try {
    const response = await fetch('/djangoapp/add_review', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Could not post review.');
    window.location.assign(`/dealer/${dealerId}`);
  } catch (error) {
    reviewError.textContent = error.message;
    reviewError.hidden = false;
    submitReview.disabled = false;
  }
});

loadDealerAndCars();