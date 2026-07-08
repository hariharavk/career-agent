document.addEventListener('DOMContentLoaded', () => {
  const apiUrlInput = document.getElementById('apiUrl');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const backBtn = document.getElementById('backBtn');
  const profileBtn = document.getElementById('profileBtn');
  
  const loginView = document.getElementById('loginView');
  const actionView = document.getElementById('actionView');
  const settingsView = document.getElementById('settingsView');
  const whitelistInput = document.getElementById('whitelistInput');
  
  const activeUserSpan = document.getElementById('activeUser');
  const statusDiv = document.getElementById('status');

  const queueList = document.getElementById('queueList');
  const queueCount = document.getElementById('queueCount');
  const addBtn = document.getElementById('addBtn');
  const processBtn = document.getElementById('processBtn');

  let jobQueue = [];
  let allowedSites = ['linkedin.com', 'naukri.com', 'indeed.com'];

  // Check auth status on load
  chrome.storage.local.get(['token', 'apiUrl', 'username', 'jobQueue', 'allowedSites'], (result) => {
    if (result.apiUrl) apiUrlInput.value = result.apiUrl;
    jobQueue = result.jobQueue || [];
    if (result.allowedSites) allowedSites = result.allowedSites;
    whitelistInput.value = allowedSites.join(', ');
    
    if (result.token) {
      showActionView(result.username || 'admin');
    } else {
      showLoginView();
    }
  });

  function showLoginView() {
    loginView.classList.remove('hidden');
    actionView.classList.add('hidden');
    settingsView.classList.add('hidden');
    profileBtn.classList.add('hidden');
    statusDiv.className = "";
    statusDiv.innerText = "";
  }

  function showActionView(username) {
    loginView.classList.add('hidden');
    settingsView.classList.add('hidden');
    actionView.classList.remove('hidden');
    profileBtn.classList.remove('hidden');
    
    activeUserSpan.innerText = `Connected as ${username}`;
    statusDiv.className = "";
    statusDiv.innerText = "";
    
    renderQueue();
  }
  
  function showSettingsView() {
    actionView.classList.add('hidden');
    settingsView.classList.remove('hidden');
    statusDiv.className = "";
    statusDiv.innerText = "";
  }

  profileBtn.addEventListener('click', showSettingsView);
  backBtn.addEventListener('click', () => {
    chrome.storage.local.get(['username'], (result) => {
      showActionView(result.username || 'admin');
    });
  });

  whitelistInput.addEventListener('change', (e) => {
    const raw = e.target.value;
    allowedSites = raw.split(',').map(s => s.trim().toLowerCase()).filter(s => s);
    chrome.storage.local.set({ allowedSites });
  });

  function renderQueue() {
    queueList.innerHTML = '';
    queueCount.innerText = jobQueue.length;
    
    if (jobQueue.length > 0) {
      processBtn.disabled = false;
    } else {
      processBtn.disabled = true;
    }

    jobQueue.forEach((job, index) => {
      const li = document.createElement('li');
      li.className = 'queue-item';
      
      const span = document.createElement('span');
      span.innerText = job.page_title;
      span.title = job.page_title;
      
      const rmBtn = document.createElement('button');
      rmBtn.className = 'remove-btn';
      rmBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      `;
      rmBtn.onclick = () => {
        jobQueue.splice(index, 1);
        chrome.storage.local.set({ jobQueue }, renderQueue);
      };

      li.appendChild(span);
      li.appendChild(rmBtn);
      queueList.appendChild(li);
    });
  }

  // Handle Login
  loginBtn.addEventListener('click', async () => {
    const apiUrl = apiUrlInput.value.replace(/\/$/, "");
    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!username || !password) {
      showStatus("Please enter credentials", "error");
      return;
    }

    loginBtn.disabled = true;
    loginBtn.innerText = "Authenticating...";
    statusDiv.className = "";
    statusDiv.innerText = "";

    try {
      const response = await fetch(`${apiUrl}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        throw new Error("Invalid username or password");
      }

      const data = await response.json();
      
      chrome.storage.local.set({ 
        token: data.token, 
        apiUrl: apiUrl,
        username: username
      }, () => {
        showActionView(username);
      });
    } catch (err) {
      showStatus(err.message || "Failed to log in", "error");
    } finally {
      loginBtn.disabled = false;
      loginBtn.innerText = "Log In & Sync";
    }
  });

  // Handle Add to Queue
  addBtn.addEventListener('click', async () => {
    addBtn.disabled = true;
    const originalText = addBtn.innerHTML;
    addBtn.innerText = "Extracting...";

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.url) throw new Error("No active tab found");

      try {
        const tabUrl = new URL(tab.url);
        const isAllowed = allowedSites.some(site => tabUrl.hostname.includes(site));
        if (!isAllowed) {
          throw new Error("Current site is not in your allowed whitelist");
        }
      } catch (e) {
        if (e.message.includes("whitelist")) throw e;
        throw new Error("Invalid URL");
      }

      const [{ result }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          return {
            url: window.location.href,
            page_title: document.title,
            description: document.body.innerText.substring(0, 15000)
          };
        }
      });

      // Avoid duplicates based on URL
      if (jobQueue.find(j => j.url === result.url)) {
        showStatus("Already in queue!", "success");
      } else {
        jobQueue.push({
          url: result.url,
          page_title: result.page_title,
          description: result.description,
          id: Date.now().toString()
        });
        chrome.storage.local.set({ jobQueue }, () => {
          renderQueue();
          showStatus("Added to Queue", "success");
        });
      }
    } catch (err) {
      showStatus(err.message || "Failed to extract page", "error");
    } finally {
      addBtn.disabled = false;
      addBtn.innerHTML = originalText;
      setTimeout(() => {
        if (statusDiv.innerText === "Added to Queue" || statusDiv.innerText === "Already in queue!") {
          statusDiv.className = "";
          statusDiv.innerText = "";
        }
      }, 2000);
    }
  });

  // Handle Process Queue
  processBtn.addEventListener('click', async () => {
    chrome.storage.local.get(['token', 'apiUrl'], async (stored) => {
      const { token, apiUrl } = stored;
      
      if (!token) {
        showStatus("Session expired. Please log in again.", "error");
        showLoginView();
        return;
      }

      if (jobQueue.length === 0) return;

      processBtn.disabled = true;
      addBtn.disabled = true;
      
      let successCount = 0;
      let failCount = 0;

      // Copy queue to iterate, we will modify the real queue as we go
      const queueCopy = [...jobQueue];

      processBtn.innerHTML = `
        <svg class="pulse" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
          <polyline points="17 6 23 6 23 12"></polyline>
        </svg>
        Processing Batch...
      `;
      
      try {
        const payload = {
          jobs: queueCopy.map(job => ({
            url: job.url,
            page_title: job.page_title,
            description: job.description
          }))
        };

        const response = await fetch(`${apiUrl}/api/jobs/extension/batch`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          if (response.status === 401) {
            chrome.storage.local.remove(['token']);
            showLoginView();
            throw new Error("Session expired.");
          }
          throw new Error("Server error");
        }

        successCount = queueCopy.length;
        // Clear queue completely immediately
        jobQueue = [];
        await new Promise(resolve => chrome.storage.local.set({ jobQueue }, resolve));
        renderQueue();
        
      } catch (err) {
        failCount = queueCopy.length;
        console.error("Failed to process batch:", err);
      }

      processBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        Process Queue
      `;
      processBtn.disabled = jobQueue.length === 0;
      addBtn.disabled = false;
      
      if (failCount === 0) {
        showStatus(`Successfully processed ${successCount} job(s)`, "success");
      } else {
        showStatus(`Processed ${successCount}, Failed ${failCount}`, "error");
      }
    });
  });

  // Handle Logout
  logoutBtn.addEventListener('click', () => {
    chrome.storage.local.remove(['token', 'username', 'jobQueue'], () => {
      jobQueue = [];
      showLoginView();
    });
  });

  function showStatus(message, className) {
    statusDiv.className = className;
    statusDiv.innerText = message;
  }
});
