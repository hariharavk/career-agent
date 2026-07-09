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
  // Look for any button or link that acts as Apply, Easy Apply, Save, or Saved
  // This bypasses LinkedIn's strict class/aria-label obfuscation which changes based on native state
  const allButtons = document.querySelectorAll('button, a');
  
  allButtons.forEach(nativeBtn => {
    const text = nativeBtn.innerText ? nativeBtn.innerText.trim().toLowerCase() : '';
    
    // Target the primary action buttons
    if (text === 'apply' || text.includes('easy apply') || text === 'save' || text === 'saved') {
      
      const nativeWrapper = nativeBtn.parentElement;
      const outerContainer = nativeWrapper?.parentElement;
      
      // Ensure we haven't already injected into this specific action row
      if (outerContainer && !outerContainer.querySelector('.ca-save-btn')) {
        
        // We only want to inject in actual action bars, which typically have multiple children or flex layout
        if (outerContainer.children.length > 0) {
          const caWrapper = document.createElement('div');
          // Inherit LinkedIn's exact wrapper classes for perfect margin/padding
          caWrapper.className = nativeWrapper.className;
          caWrapper.style.display = 'inline-flex';
          
          const btn = createSaveButton('Save to CareerAgent', getLinkedInJobData);
          caWrapper.appendChild(btn);
          
          checkQueueState(cleanUrl(window.location.href), btn);
          
          // Append to the end of the action bar row
          outerContainer.appendChild(caWrapper);
          
          console.log("CareerAgent: Button injected on Job Page!");
        }
      }
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
        btn.style.color = '#22c55e'; // Vibrant Green
        const textSpan = btn.querySelector('span > span');
        if (textSpan) textSpan.innerText = 'Evaluated';
      } else {
        btn.innerText = 'Evaluated';
        btn.style.backgroundColor = '#22c55e'; // Vibrant Green
      }
      btn.style.pointerEvents = 'none';
      // Removed opacity: 0.8 so it stays vibrantly green
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
  // Like the Job page, bypass brittle CSS classes/aria-labels and look for the visible "Comment" or "Send" buttons
  const allButtons = document.querySelectorAll('button, a');
  
  allButtons.forEach(nativeBtn => {
    const text = nativeBtn.innerText ? nativeBtn.innerText.trim().toLowerCase() : '';
    const aria = nativeBtn.getAttribute('aria-label') ? nativeBtn.getAttribute('aria-label').toLowerCase() : '';
    
    if (text === 'comment' || text === 'send' || aria === 'comment' || aria === 'send' || aria.includes('comment on this post')) {
      // Find the flex container holding the action buttons
      let actionBar = nativeBtn.parentElement;
      
      // If the immediate parent is just a single-item wrapper, go up one more level
      if (actionBar && actionBar.children.length < 3 && actionBar.parentElement) {
        actionBar = actionBar.parentElement;
      }
      
      // If it looks like an action bar and we haven't injected yet
      if (actionBar && actionBar.children.length >= 3 && !actionBar.querySelector('.ca-save-btn')) {
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
        
        // Append our button to the end of the action bar row
        actionBar.appendChild(btn);
        
        console.log("CareerAgent: Button injected on Feed Post");
      }
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

function injectToastStyles() {
  if (!document.getElementById('ca-toast-styles')) {
    const link = document.createElement('link');
    link.id = 'ca-google-sans';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&display=swap';
    document.head.appendChild(link);
    
    const style = document.createElement('style');
    style.id = 'ca-toast-styles';
    style.innerHTML = `
      .ca-checkmark-circle {
        stroke-dasharray: 166;
        stroke-dashoffset: 166;
        stroke-width: 4;
        stroke-miterlimit: 10;
        stroke: #22c55e;
        fill: none;
        animation: ca-stroke 0.4s cubic-bezier(0.65, 0, 0.45, 1) forwards;
      }
      .ca-checkmark-check {
        transform-origin: 50% 50%;
        stroke-dasharray: 48;
        stroke-dashoffset: 48;
        stroke-width: 4;
        stroke: #22c55e;
        fill: none;
        animation: ca-stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.3s forwards;
      }
      @keyframes ca-stroke {
        100% { stroke-dashoffset: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}

function showToast(message) {
  injectToastStyles();
  
  const toast = document.createElement('div');
  const cleanMessage = message.replace('✅ ', '');
  
  toast.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px;">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52" style="width: 20px; height: 20px; display: block;">
        <circle class="ca-checkmark-circle" cx="26" cy="26" r="25" />
        <path class="ca-checkmark-check" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
      </svg>
      <span>${cleanMessage}</span>
    </div>
  `;
  
  toast.style.position = 'fixed';
  toast.style.bottom = '24px';
  toast.style.left = '24px';
  toast.style.backgroundColor = '#1e293b'; // Slate 800
  toast.style.color = '#ffffff';
  toast.style.padding = '12px 24px';
  toast.style.borderRadius = '8px'; // Standard shape
  toast.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)';
  toast.style.fontFamily = '"Google Sans", "Product Sans", sans-serif';
  toast.style.fontSize = '14px';
  toast.style.fontWeight = '500';
  toast.style.zIndex = '999999';
  toast.style.transition = 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
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
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}
