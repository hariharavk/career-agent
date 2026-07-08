console.log("CareerAgent: Content script initialized on", window.location.href);

function injectCareerAgentButton() {
  const url = window.location.href;
  
  // LinkedIn Job Pages (both direct view and search split-view)
  if (url.includes('linkedin.com/jobs') || url.includes('linkedin.com/collections')) {
    injectLinkedInJobPage();
  } 
  // LinkedIn Feed (home page) and ANY other LinkedIn page (since posts can appear anywhere)
  if (url.includes('linkedin.com')) {
    injectLinkedInFeed();
  } 
  // Naukri
  if (url.includes('naukri.com')) {
    injectNaukriJobPage();
  }
}

function injectLinkedInJobPage() {
  // Use aggressive attribute selectors to find ANY button that says Save or Apply (even if already saved natively)
  const nativeButtons = document.querySelectorAll('.jobs-save-button, .jobs-saved-button, .jobs-apply-button, button[aria-label*="Save"], button[aria-label*="Saved"], button[aria-label*="Apply"]');
  
  nativeButtons.forEach(nativeBtn => {
    // On heavily obfuscated LinkedIn pages, the native button is wrapped in a strictly styled div.
    // If we inject inside that div, it overlaps. We must inject AFTER the div.
    const nativeWrapper = nativeBtn.parentElement;
    const outerContainer = nativeWrapper?.parentElement;
    
    if (outerContainer && !outerContainer.querySelector('.ca-save-btn')) {
      // Create our own wrapper and copy the exact classes of the native wrapper
      // so we inherit all their margin and flex styling automatically
      const caWrapper = document.createElement('div');
      caWrapper.className = nativeWrapper.className;
      
      const btn = createSaveButton('Save to CareerAgent', getLinkedInJobData);
      caWrapper.appendChild(btn);
      
      // Check if already saved
      checkQueueState(cleanUrl(window.location.href), btn);
      
      // Insert our wrapper strictly after the native button's wrapper
      nativeWrapper.after(caWrapper);
      
      console.log("CareerAgent: Button injected on Job Page!");
    }
  });
}

function checkQueueState(url, btn) {
  chrome.storage.local.get(['jobQueue', 'processedJobs'], (result) => {
    const queue = result.jobQueue || [];
    const processed = result.processedJobs || [];
    const isNative = btn.classList.contains('ca-feed-native-btn');
    
    if (processed.includes(url)) {
      if (isNative) {
        btn.style.color = '#059669'; // Green
        const textSpan = btn.querySelector('span > span');
        if (textSpan) textSpan.innerText = 'Evaluated';
      } else {
        btn.innerText = 'Evaluated';
        btn.style.backgroundColor = '#059669'; // Emerald 600
      }
      btn.style.pointerEvents = 'none';
      btn.style.opacity = '0.8';
    } else if (queue.find(j => j.url === url)) {
      if (isNative) {
        btn.style.color = '#ea580c'; // Orange
        const textSpan = btn.querySelector('span > span');
        if (textSpan) textSpan.innerText = 'Queued';
      } else {
        btn.innerText = 'Saved to Queue';
        btn.style.backgroundColor = '#ea580c'; // Vibrant Orange indicating queued/pending
      }
      btn.style.pointerEvents = 'none';
      btn.style.opacity = '0.8';
    }
  });
}

function injectLinkedInFeed() {
  // Instead of relying on obfuscated post container classes, 
  // globally find all Comment buttons on the page.
  const commentBtns = document.querySelectorAll('button[aria-label="Comment"], button[aria-label="Comment on this post"]');
  
  commentBtns.forEach(commentBtn => {
    const actionBar = commentBtn.parentElement;
    if (actionBar && !actionBar.querySelector('.ca-save-btn')) {
      const postUrl = getPostUrl(actionBar);
      
      const btn = createFeedNativeButton(() => {
        const post = actionBar.closest('.feed-shared-update-v2, [data-urn^="urn:li:activity"]') || actionBar.parentElement?.parentElement;
        return { 
          url: postUrl, 
          description: post ? post.innerText : '', 
          page_title: document.title 
        };
      });
      checkQueueState(postUrl, btn);
      
      // Insert right after the "Send" button if possible, otherwise just append
      const sendBtn = actionBar.querySelector('button[aria-label="Send"], a[aria-label="Send"]');
      if (sendBtn) {
        sendBtn.after(btn);
      } else {
        actionBar.appendChild(btn);
      }
      
      console.log("CareerAgent: Button injected on Feed Post");
    }
  });
}

function createFeedNativeButton(dataGetter) {
  const btn = document.createElement('button');
  // Use exact LinkedIn classes so it perfectly inherits padding, fonts, sizes, and hover states
  btn.className = 'artdeco-button artdeco-button--muted artdeco-button--4 artdeco-button--tertiary ember-view ca-save-btn ca-feed-native-btn';
  
  // Custom margin to separate slightly from 'Send'
  btn.style.marginLeft = '4px';
  btn.style.transition = 'color 0.2s';
  btn.style.border = 'none';
  btn.style.background = 'transparent';
  
  // Unsaved: Blue
  btn.style.color = '#0a66c2';
  
  // Standard Bookmark / Save SVG
  const bookmarkSvg = `<svg role="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" data-supported-dps="24x24" fill="currentColor">
    <path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
  </svg>`;

  btn.innerHTML = `
    <span class="artdeco-button__text" style="display: flex; align-items: center; color: inherit;">
      ${bookmarkSvg}
      <span aria-hidden="true" class="artdeco-button__text" style="margin-left: 4px; font-weight: 600;">
          Save
      </span>
    </span>
  `;

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Queuing state (Orange)
    btn.style.color = '#ea580c';
    btn.style.pointerEvents = 'none';
    btn.style.opacity = '0.8';
    
    const textSpan = btn.querySelector('span > span');
    if (textSpan) textSpan.innerText = 'Queued';
    
    showToast('✅ Saved to CareerAgent Queue!');
    
    const jobData = typeof dataGetter === 'function' ? dataGetter() : dataGetter;
    
    chrome.storage.local.get(['jobQueue'], (result) => {
      const queue = result.jobQueue || [];
      if (!queue.find(j => j.url === jobData.url)) {
        queue.push({
          url: jobData.url,
          page_title: jobData.page_title,
          description: jobData.description,
          id: Date.now().toString()
        });
        chrome.storage.local.set({ jobQueue: queue });
      }
    });
  });
  
  return btn;
}

function injectNaukriJobPage() {
  // Naukri apply button container
  const actionContainers = document.querySelectorAll('.apply-button-container, .job-apply');
  
  actionContainers.forEach(container => {
    if (!container.querySelector('.ca-save-btn')) {
      const btn = createSaveButton('Save to CareerAgent', () => {
        return { url: cleanUrl(window.location.href), description: document.body.innerText, page_title: document.title };
      });
      checkQueueState(cleanUrl(window.location.href), btn);
      container.appendChild(btn);
    }
  });
}

function createSaveButton(text, dataGetter) {
  const btn = document.createElement('button');
  btn.className = 'ca-save-btn';
  btn.innerText = text;
  btn.style.backgroundColor = '#0a66c2'; // LinkedIn Blue
  btn.style.color = 'white';
  btn.style.border = 'none';
  btn.style.borderRadius = '16px';
  btn.style.height = '32px';
  btn.style.padding = '0 16px';
  btn.style.fontWeight = '600';
  btn.style.cursor = 'pointer';
  btn.style.marginLeft = '0px'; // Wrapper already has margin
  btn.style.fontSize = '14px';
  btn.style.display = 'inline-flex';
  btn.style.alignItems = 'center';
  btn.style.justifyContent = 'center';
  btn.style.boxSizing = 'border-box';
  
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    btn.innerText = 'Queuing...';
    btn.style.pointerEvents = 'none';
    btn.style.opacity = '0.8';
    
    showToast('✅ Saved to CareerAgent Queue!');
    
    const jobData = dataGetter();
    
    chrome.storage.local.get(['jobQueue'], (result) => {
      const queue = result.jobQueue || [];
      if (!queue.find(j => j.url === jobData.url)) {
        queue.push({
          url: jobData.url,
          page_title: jobData.page_title,
          description: jobData.description,
          id: Date.now().toString()
        });
        chrome.storage.local.set({ jobQueue: queue }, () => {
          btn.innerText = 'Saved to Queue';
          btn.style.backgroundColor = '#ea580c'; // Vibrant Orange
        });
      } else {
        btn.innerText = 'Saved to Queue';
        btn.style.backgroundColor = '#ea580c'; // Vibrant Orange
      }
    });
  });
  
  return btn;
}

function getLinkedInJobData() {
  // Extract visible text from the job description
  const jdContainer = document.querySelector('.jobs-description');
  let text = document.body.innerText;
  if (jdContainer) {
     text = jdContainer.innerText;
  }
  return {
    url: cleanUrl(window.location.href),
    description: text,
    page_title: document.title
  };
}

function cleanUrl(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('linkedin.com')) {
      // If it's a search page with a selected job, construct a clean view URL
      const currentJobId = parsed.searchParams.get('currentJobId');
      if (currentJobId) {
        return `https://www.linkedin.com/jobs/view/${currentJobId}/`;
      }
      // If it's a direct job view, remove all tracking params
      if (parsed.pathname.includes('/jobs/view/')) {
        return `https://www.linkedin.com${parsed.pathname}`;
      }
    }
    // Default fallback: just remove query params to ensure consistent state
    return parsed.origin + parsed.pathname;
  } catch(e) {
    return url;
  }
}

function getPostUrl(actionBar) {
  // 1. Try to find the URN
  const urnNode = actionBar.closest('[data-urn]');
  if (urnNode) {
    const urn = urnNode.getAttribute('data-urn');
    return `https://www.linkedin.com/feed/update/${urn}/`;
  }
  
  // 2. Try to find a link to the post (usually the timestamp)
  const post = actionBar.closest('.feed-shared-update-v2') || actionBar.parentElement?.parentElement;
  if (post) {
     const links = post.querySelectorAll('a[href*="/feed/update/"], a[href*="/posts/"]');
     if (links.length > 0) {
       return links[0].href.split('?')[0]; // clean tracking
     }
     
     // 3. Hash the text as a fallback
     const text = post.innerText;
     if (text) {
        let hash = 0;
        for (let i = 0; i < text.length; i++) hash = Math.imul(31, hash) + text.charCodeAt(i) | 0;
        return `https://www.linkedin.com/feed/post/${Math.abs(hash)}`;
     }
  }
  
  return `https://www.linkedin.com/feed/post/${Math.random().toString().substring(2)}`;
}



// Run periodically to catch dynamic DOM changes (infinite scrolling)
setInterval(injectCareerAgentButton, 2000);

// Initial run
injectCareerAgentButton();

function showToast(message) {
  const toast = document.createElement('div');
  toast.innerText = message;
  toast.style.position = 'fixed';
  toast.style.bottom = '24px';
  toast.style.left = '24px';
  toast.style.backgroundColor = '#1e293b'; // Slate 800
  toast.style.color = '#ffffff';
  toast.style.padding = '12px 24px';
  toast.style.borderRadius = '8px';
  toast.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
  toast.style.fontFamily = '-apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif';
  toast.style.fontSize = '14px';
  toast.style.fontWeight = '500';
  toast.style.zIndex = '999999';
  toast.style.transition = 'opacity 0.3s, transform 0.3s';
  toast.style.opacity = '0';
  toast.style.transform = 'translateY(20px)';
  
  document.body.appendChild(toast);
  
  // Trigger animation
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });
  });
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
