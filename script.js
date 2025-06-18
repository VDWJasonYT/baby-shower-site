const giftForm = document.getElementById('gift-form');
const giftList = document.getElementById('list');
const submitButton = giftForm.querySelector('button[type="submit"]');

// Load gifts from localStorage on page load
window.addEventListener('DOMContentLoaded', () => {
  const gifts = JSON.parse(localStorage.getItem('gifts')) || [];
  gifts.forEach(gift => addGiftToList(gift));
});

// Add gift on form submit
giftForm.addEventListener('submit', e => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const gift = document.getElementById('gift').value.trim();
  const message = document.getElementById('message').value.trim();

  if (countGiftsByUser(name) >= 3) {
    alert('You have reached the maximum of 3 gifts.');
    submitButton.disabled = true;
    return;
  }

  const giftObj = { name, gift, message };
  saveGift(giftObj);
  addGiftToList(giftObj);

  // Reset form
  giftForm.reset();

  // Disable add button if max gifts reached
  if (countGiftsByUser(name) >= 3) {
    submitButton.disabled = true;
    submitButton.textContent = 'Max 3 Gifts Added';
  }
});

// Functions from your snippet, integrated and slightly polished

function addGiftToList({ name, gift, message }) {
  const listItem = document.createElement('li');

  listItem.innerHTML = `
    <strong>${name}</strong> bought <em>${gift}</em>
    ${message ? `<br/><small>"${message}"</small>` : ''}
  `;

  const deleteBtn = document.createElement('button');
  deleteBtn.classList.add('delete-btn');
  deleteBtn.textContent = '🗑️';

  deleteBtn.addEventListener('click', () => {
    listItem.remove();

    let gifts = JSON.parse(localStorage.getItem('gifts')) || [];
    gifts = gifts.filter(g => !(g.name === name && g.gift === gift && g.message === message));
    localStorage.setItem('gifts', JSON.stringify(gifts));

    // Check if current user can add again
    const currentName = document.getElementById('name').value.trim();
    if (countGiftsByUser(currentName) < 3) {
      submitButton.disabled = false;
      submitButton.textContent = 'Add Gift';
    }
  });

  listItem.appendChild(deleteBtn);
  giftList.appendChild(listItem);
}

function saveGift(giftObj) {
  const gifts = JSON.parse(localStorage.getItem('gifts')) || [];
  gifts.push(giftObj);
  localStorage.setItem('gifts', JSON.stringify(gifts));
}

function countGiftsByUser(name) {
  const gifts = JSON.parse(localStorage.getItem('gifts')) || [];
  return gifts.filter(g => g.name.toLowerCase() === name.toLowerCase()).length;
}

// Reset all
document.getElementById('reset-button').addEventListener('click', () => {
  if (confirm('Are you sure you want to reset the gift list?')) {
    localStorage.removeItem('gifts');
    giftList.innerHTML = '';
    submitButton.disabled = false;
    submitButton.textContent = 'Add Gift';
  }
});
