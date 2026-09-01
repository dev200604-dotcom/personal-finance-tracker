const API_URL = 'https://personal-finance-tracker-1-ih49.onrender.com/api/transactions';

// --- Theme Toggle Logic ---
const themeToggleBtn = document.getElementById('theme-toggle');
const currentTheme = localStorage.getItem('theme') || 'light';

if (currentTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
}

themeToggleBtn.addEventListener('click', () => {
    let theme = document.documentElement.getAttribute('data-theme');
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
    }
});

// ... BAAKI AAPKA PURANA GET / ADD / DELETE TRANSACTIONS WALA LOGIC WAHI REHNE DO ...
const balanceEl = document.getElementById('total-balance');
const incomeEl = document.getElementById('total-income');
const expenseEl = document.getElementById('total-expense');
const listEl = document.getElementById('transaction-list');
const form = document.getElementById('transaction-form');

let myChart = null;

async function getTransactions() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    updateUI(data);
  } catch (err) {
    console.error('Error fetching transactions:', err);
  }
}

function updateUI(transactions) {
  listEl.innerHTML = '';
  
  let incomeCount = 0;
  let expenseCount = 0;

  transactions.forEach(t => {
    const amount = Number(t.amount);
    if (t.type === 'income') {
      incomeCount += amount;
    } else {
      expenseCount += amount;
    }

    const li = document.createElement('li');
    li.classList.add(t.type);
    li.innerHTML = `
      <span>${t.description}</span>
      <span>₹${amount} 
        <button class="delete-btn" onclick="deleteTransaction('${t._id}')">X</button>
      </span>
    `;
    listEl.appendChild(li);
  });

  const total = incomeCount - expenseCount;
  balanceEl.innerText = `₹${total.toFixed(2)}`;
  incomeEl.innerText = `₹${incomeCount.toFixed(2)}`;
  expenseEl.innerText = `₹${expenseCount.toFixed(2)}`;

  renderChart(incomeCount, expenseCount);
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const description = document.getElementById('description').value;
  const amount = document.getElementById('amount').value;
  const type = document.getElementById('type').value;

  const newTransaction = { description, amount: Number(amount), type };

  try {
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTransaction)
    });
    
    form.reset();
    getTransactions();
  } catch (err) {
    console.error('Error adding transaction:', err);
  }
});

async function deleteTransaction(id) {
  try {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    getTransactions();
  } catch (err) {
    console.error('Error deleting transaction:', err);
  }
}

function renderChart(income, expense) {
  const ctx = document.getElementById('expenseChart').getContext('2d');
  
  if (myChart) {
    myChart.destroy();
  }

  myChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Income', 'Expense'],
      datasets: [{
        data: [income, expense],
        backgroundColor: ['#2ecc71', '#e74c3c']
      }]
    }
  });
}

// Initial Call
getTransactions();