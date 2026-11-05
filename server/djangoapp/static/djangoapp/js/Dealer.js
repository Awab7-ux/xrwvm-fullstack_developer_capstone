const SENTIMENT_EMOJI = { positive: '😊', neutral: '😐', negative: '🙁' };
const dealerPage = document.getElementById('dealerPage');
const dealerId = dealerPage.dataset.dealerId;
const dealerError = document.getElementById('dealerError');
const reviewCards = document.getElementById('reviewCards');
const reviewCount = document.getElementById('reviewCount');
const reviewDealerLink = document.getElementById('reviewDealerLink');

function addDetail(id, value) {
  document.getElementById(id).textContent = value || 'Not provided';
}

function addReviewCard(review) {
  const column = document.createElement('div');
  column.className = 'col-12 col-md-6 col-xl-4';
  const card = document.createElement('article');
  card.className = 'review-card';
  const top = document.createElement('div');
  top.className = 'd-flex justify-content-between align-items-start gap-2 mb-3';
  const reviewer = document.createElement('h3');
  reviewer.className = 'h6 mb-0';
  reviewer.textContent = review.name || 'Anonymous driver';
  const sentiment = document.createElement('span');
  const sentimentValue = (review.sentiment || '').toLowerCase();
  const label = ['positive', 'neutral', 'negative'].includes(sentimentValue) ? sentimentValue : 'neutral';
  sentiment.className = `sentiment sentiment-${label}`;
  sentiment.textContent = `${SENTIMENT_EMOJI[label] || ''} ${label}`.trim();
  top.append(reviewer, sentiment);
  const text = document.createElement('p');
  text.className = 'mb-3';
  text.textContent = review.review || '';
  const vehicle = document.createElement('p');
  vehicle.className = 'small subtle mb-1';
  vehicle.textContent = [review.car_make, review.car_model].filter(Boolean).join(' ') || 'Vehicle not provided';
  const date = document.createElement('p');
  date.className = 'small subtle mb-0';
  date.textContent = review.purchase_date ? `Purchased ${review.purchase_date}` : 'Purchase date not provided';
  card.append(top, text, vehicle, date);
  column.append(card);
  reviewCards.append(column);
}

async function loadDealer() {
  dealerError.hidden = true;
  try {
    const [dealerResponse, reviewResponse] = await Promise.all([
      fetch(`/djangoapp/dealer/${dealerId}`),
      fetch(`/djangoapp/reviews/dealer/${dealerId}`)
    ]);
    if (!dealerResponse.ok || !reviewResponse.ok) throw new Error('Could not load this dealership.');
    const [dealer, reviews] = await Promise.all([dealerResponse.json(), reviewResponse.json()]);
    document.title = `${dealer.full_name} | Cars Dealership`;
    addDetail('dealerName', dealer.full_name);
    addDetail('dealerLocation', [dealer.city, dealer.state].filter(Boolean).join(', '));
    addDetail('dealerAddress', dealer.address);
    addDetail('dealerCity', dealer.city);
    addDetail('dealerZip', dealer.zip);
    addDetail('dealerState', dealer.state);
    reviewCount.textContent = `${reviews.length} reviews`;
    reviewCards.replaceChildren();
    if (!reviews.length) {
      reviewCards.textContent = 'No reviews yet.';
    } else {
      reviews.forEach(addReviewCard);
    }
    reviewDealerLink.hidden = dealerPage.dataset.authenticated !== 'true';
  } catch (error) {
    dealerError.textContent = error.message;
    dealerError.hidden = false;
    reviewCards.replaceChildren();
  }
}

loadDealer();