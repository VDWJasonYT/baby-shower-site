const giftForm = document.getElementById('gift-form');
const giftList = document.getElementById('list');
const submitButton = giftForm.querySelector('button[type="submit"]');

const giftsRef = firebase.database().ref('gifts'); // Firebase DB reference

// Listen for changes and update gift list live
giftsRef.on('value', snapshot => {
  giftList.innerHTML = ''; // clear existing list
  const gifts = snapshot.val();
  if (!gifts) return;

  Object.values(gifts).forEach(gift => addGiftToList(gift));
});

// On form submit, add new gift to Firebase
giftForm.addEventListener('submit', e => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const gift = document.getElementById('gift').value.trim();
  const message = document.getElementById('message').value.trim();

  // Check how many gifts this user already added
  giftsRef.once('value').then(snapshot => {
    const gifts = snapshot.val() || {};
    const userGiftCount = Object.values(gifts).filter(g => g.name.toLowerCase() === name.toLowerCase()).length;

    if (userGiftCount >= 3) {
      alert('You have reached the maximum of 3 gifts.');
      submitButton.disabled = true;
      return;
    }

    const giftObj = { name, gift, message };

    // Push new gift to Firebase
    giftsRef.push(giftObj)
      .then(() => {
        giftForm.reset();
        submitButton.disabled = false;
        submitButton.textContent = 'Add Gift';
      })
      .catch(err => alert('Error saving gift: ' + err.message));
  });
});

// Add a gift item to the DOM list
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
    // Find and remove matching gift in Firebase
    giftsRef.once('value').then(snapshot => {
      const gifts = snapshot.val() || {};
      for (const key in gifts) {
        const g = gifts[key];
        if (g.name === name && g.gift === gift && g.message === message) {
          giftsRef.child(key).remove();
          break;
        }
      }
    });
  });

  listItem.appendChild(deleteBtn);
  giftList.appendChild(listItem);
}

// Reset all gifts (clear Firebase database)
document.getElementById('reset-button').addEventListener('click', () => {
  if (confirm('Are you sure you want to reset the gift list?')) {
    giftsRef.remove();
    giftList.innerHTML = '';
    submitButton.disabled = false;
    submitButton.textContent = 'Add Gift';
  }
});
