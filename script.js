document.addEventListener('DOMContentLoaded', function () {
  const studentForm = document.getElementById('studentForm');
  const cardsContainer = document.getElementById('cardsContainer');
  const cardCount = document.getElementById('cardCount');
  const photoUrlInput = document.getElementById('photoUrl');
  const photoPreview = document.getElementById('photoPreview');
  const searchInput = document.getElementById('search');
  const tbody = document.querySelector('#summary tbody');
  const live = document.getElementById('live');
  const submitBtn = document.getElementById('submitBtn');

  let students = [];
  let editingId = null;

  const saved = localStorage.getItem('students');
  if (saved) {
    try {
      students = JSON.parse(saved) || [];
    } catch {
      students = [];
    }
  }

  function persist() {
    localStorage.setItem('students', JSON.stringify(students));
  }

  students.forEach(s => {
    createStudentCard(s);
    createTableRow(s);
  });
  updateCardCount();

  // Photo URL preview
  photoUrlInput.addEventListener('blur', function () {
    updatePhotoPreview(this.value);
  });

  function updatePhotoPreview(url) {
    const previewUrl = (url || '').trim();
    photoPreview.innerHTML = '';

    if (previewUrl) {
      const img = document.createElement('img');
      img.src = previewUrl;
      img.alt = 'Profile preview';
      img.onerror = function () {
        photoPreview.innerHTML = 'Invalid URL';
      };
      photoPreview.appendChild(img);
    } else {
      photoPreview.textContent = 'No Image';
    }
  }

  function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.(com|na)$/i.test(value);
}
function isEmailUnique(email, editingId) {
  return !students.some(student => 
    student.email.toLowerCase() === email.toLowerCase() && 
    student.id !== editingId
  );
}

  function clearErrors() {
    ['firstName', 'lastName', 'email', 'programme', 'year', 'photoUrl'].forEach(id => {
      const err = document.getElementById('err-' + id);
      if (err) err.textContent = '';
      const field = document.getElementById(id);
      if (field) field.removeAttribute('aria-invalid');
    });
  }

  function setError(id, message) {
    const err = document.getElementById('err-' + id);
    if (err) err.textContent = message;
    const field = document.getElementById(id);
    if (field) field.setAttribute('aria-invalid', 'true');
  }

  function validateForm() {
    clearErrors();
    let ok = true;

    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const programme = document.getElementById('programme').value;
    const yearEl = document.querySelector('input[name="year"]:checked');
    const photoUrl = document.getElementById('photoUrl').value.trim();

    if (!firstName) {
      setError('firstName', 'First name is required.');
      ok = false;
    }
    if (!lastName) {
      setError('lastName', 'Last name is required.');
      ok = false;
    }
    if (!email || !validateEmail(email)) {
      setError('email', 'Please enter a valid email.');
      ok = false;
    }
    if (!email || !validateEmail(email)) {
  setError('email', 'Please enter a valid email.');
  ok = false;
} else if (!isEmailUnique(email, editingId)) { // Add this check
  setError('email', 'This email is already registered.');
  ok = false;
}
    if (!programme) {
      setError('programme', 'Please select a programme.');
      ok = false;
    }
    if (!yearEl) {
      const errYear = document.getElementById('err-year');
      if (errYear) errYear.textContent = 'Please select a year.';
      ok = false;
    } else {
      const errYear = document.getElementById('err-year');
      if (errYear) errYear.textContent = '';
    }
    if (photoUrl && !/^https?:\/\//i.test(photoUrl)) {
      setError('photoUrl', 'Please enter a valid URL starting with http:// or https://');
      ok = false;
    }

    return ok;
  }

  // Submit handler (Add or Update)
  studentForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validateForm()) {
      live.textContent = 'Fix errors before submitting.';
      // focus the first field with error
      const firstErr = document.querySelector('.error:not(:empty)');
      if (firstErr) {
        const forId = firstErr.id.replace('err-', '');
        const field = document.getElementById(forId);
        if (field) field.focus();
      }
      return;
    }

    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const programme = document.getElementById('programme').value;
    const year = document.querySelector('input[name="year"]:checked').value;
    const interests = document.getElementById('interests').value
      .split(',')
      .map(i => i.trim())
      .filter(i => i);
    const photoUrl = document.getElementById('photoUrl').value.trim();

    if (editingId) {
      // Update existing
      const idx = students.findIndex(s => s.id === editingId);
      if (idx !== -1) {
        const updated = {
          ...students[idx],
          firstName, lastName, email, programme, year, interests, photoUrl,
          initials: firstName.charAt(0) + lastName.charAt(0)
        };
        students[idx] = updated;
      
        replaceCard(updated);
        replaceTableRow(updated);
        persist();
        live.textContent = `Updated ${firstName} ${lastName}.`;
      }
      editingId = null;
      submitBtn.textContent = 'Add Student';
    } else {
      const student = {
        id: Date.now(),
        firstName,
        lastName,
        email,
        programme,
        year,
        interests,
        photoUrl,
        initials: firstName.charAt(0) + lastName.charAt(0)
      };
      students.push(student);
      createStudentCard(student);
      createTableRow(student);
      persist();
      live.textContent = `Added ${firstName} ${lastName}.`;
    }

    updateCardCount();
    studentForm.reset();
    photoPreview.textContent = 'No Image';
  });

  function createStudentCard(student) {
  const card = document.createElement('div');
  card.className = 'profile-card';
  card.dataset.id = String(student.id);

  card.innerHTML = `
    <div class="card-header">
      <div class="avatar">
        ${student.photoUrl ? 
          `<img src="${student.photoUrl}" alt="${student.firstName} ${student.lastName}">` : 
          student.initials}
      </div>
      <h2 class="student-name">${student.firstName} ${student.lastName}</h2>
      <p class="student-email">${student.email}</p>
    </div>

    <div class="card-body">
      <div class="details">
        <div class="detail-item">
          <div class="detail-text"><strong>Programme:</strong> ${student.programme}</div>
        </div>

        <div class="detail-item">
          <div class="detail-text"><strong>Year:</strong> ${student.year}</div>
        </div>

        ${student.interests && student.interests.length ? `
        <div class="detail-item">
          <div class="detail-text"><strong>Interests:</strong></div>
        </div>` : ''}
      </div>

      ${student.interests && student.interests.length ? `
      <div class="interests">
        ${student.interests.map(interest => `<span class="interest-tag">${interest}</span>`).join('')}
      </div>` : ''}
    </div>

    <div class="card-actions">
      <button class="edit-btn" data-id="${student.id}">Edit</button>
      <button class="remove-btn" data-id="${student.id}">Remove</button>
    </div>
  `;

  // Attach listeners
  card.querySelector('.remove-btn').addEventListener('click', () => removeStudent(student.id));
  card.querySelector('.edit-btn').addEventListener('click', () => editStudent(student.id));

  cardsContainer.appendChild(card);
}

  function replaceCard(student) {
    const card = document.querySelector(`.profile-card[data-id="${student.id}"]`);
    if (card) {
      card.remove();
    }
    createStudentCard(student);
  }

  function createTableRow(student) {
    const tr = document.createElement('tr');
    tr.dataset.id = String(student.id);
    tr.innerHTML = `
      <td>${student.firstName} ${student.lastName}</td>
      <td>${student.programme}</td>
      <td>Year ${student.year}</td>
      <td>${(student.interests || []).join(', ')}</td>
      <td class="table-actions">
        <button class="edit-btn" data-id="${student.id}">Edit</button>
        <button class="remove-btn" data-id="${student.id}">Remove</button>
      </td>
    `;
    tr.querySelector('.remove-btn').addEventListener('click', () => removeStudent(student.id));
    tr.querySelector('.edit-btn').addEventListener('click', () => editStudent(student.id));
    tbody.prepend(tr);
  }

  function replaceTableRow(student) {
    const tr = document.querySelector(`#summary tbody tr[data-id="${student.id}"]`);
    if (tr) tr.remove();
    createTableRow(student);
  }

  function removeStudent(id) {
    const idx = students.findIndex(s => s.id === id);
    if (idx === -1) return;
    const removed = students[idx];
    students.splice(idx, 1);
    // DOM: remove card
    const card = document.querySelector(`.profile-card[data-id="${id}"]`);
    if (card) card.remove();
    // DOM: remove row
    const tr = document.querySelector(`#summary tbody tr[data-id="${id}"]`);
    if (tr) tr.remove();
    persist();
    updateCardCount();
    live.textContent = `Removed ${removed.firstName} ${removed.lastName}.`;
  }

  function editStudent(id) {
    const s = students.find(x => x.id === id);
    if (!s) return;
    document.getElementById('firstName').value = s.firstName;
    document.getElementById('lastName').value = s.lastName;
    document.getElementById('email').value = s.email;
    document.getElementById('programme').value = s.programme;
    const yearRadio = document.querySelector(`input[name="year"][value="${s.year}"]`);
    if (yearRadio) yearRadio.checked = true;
    document.getElementById('interests').value = (s.interests || []).join(', ');
    document.getElementById('photoUrl').value = s.photoUrl || '';
    updatePhotoPreview(s.photoUrl || '');
    editingId = id;
    submitBtn.textContent = 'Update Student';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function updateCardCount() {
    const visible = Array.from(document.querySelectorAll('.profile-card')).filter(c => c.style.display !== 'none').length;
    const total = students.length;
    const count = searchInput.value.trim() ? visible : total;
    cardCount.textContent = `Displaying ${count} student profile${count !== 1 ? 's' : ''}`;
  }

  // Search / filter
  function filterView(query) {
    const q = (query || '').toLowerCase();
    
    Array.from(document.querySelectorAll('.profile-card')).forEach(card => {
      const id = Number(card.dataset.id);
      const s = students.find(x => x.id === id);
      const hay = [
        s.firstName, s.lastName, s.programme, 'Year ' + s.year, (s.interests || []).join(' ')
      ].join(' ').toLowerCase();
      card.style.display = hay.includes(q) ? '' : 'none';
    });
    // Table rows
    Array.from(tbody.querySelectorAll('tr')).forEach(tr => {
      const id = Number(tr.dataset.id);
      const s = students.find(x => x.id === id);
      const hay = [
        s.firstName, s.lastName, s.programme, 'Year ' + s.year, (s.interests || []).join(' ')
      ].join(' ').toLowerCase();
      tr.style.display = hay.includes(q) ? '' : 'none';
    });
    updateCardCount();
  }

  searchInput.addEventListener('input', e => filterView(e.target.value));
});