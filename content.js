// Function to check if a post contains images
function hasImages(postElement) {
    return postElement.querySelector('.post-image, .gallery') !== null;
}

// Function to extract image URLs from a post
function getImageUrls(postElement) {
    const gallery = postElement.querySelector('.gallery');
    if (gallery) {
        const images = gallery.querySelectorAll('img');
        return Array.from(images).map(img => img.src);
    } else {
        const img = postElement.querySelector('.post-image img');
        if (img) {
            return [img.src];
        }
        return [];
    }
}

// Function to add a download button to a post
function addDownloadIcon(postElement) {
    // Find the share button (adjust selector based on Reddit's actual HTML)
    const shareButton = postElement.querySelector('[data-click-id="share"], .share');
    if (!shareButton || postElement.querySelector('.download-button')) {
        return; // Skip if no share button or button already exists
    }

    // Create the download button
    const downloadButton = document.createElement('a');
    downloadButton.href = '#';
    downloadButton.textContent = 'Download Images';
    downloadButton.className = 'download-button';
    downloadButton.style.marginLeft = '10px';
    downloadButton.style.textDecoration = 'none';
    downloadButton.style.color = '#0079d3'; // Match Reddit's link color

    // Add click event listener
    downloadButton.addEventListener('click', (e) => {
        e.preventDefault();
        const imageUrls = getImageUrls(postElement);
        imageUrls.forEach(url => {
            chrome.runtime.sendMessage({ action: 'download', url: url });
        });
    });

    // Insert the button to the right of the share button
    shareButton.parentNode.insertBefore(downloadButton, shareButton.nextSibling);
}

// Function to process existing and new posts
function processPosts() {
    const posts = document.querySelectorAll('[data-testid="post-container"], .post');
    posts.forEach(post => {
        if (hasImages(post)) {
            addDownloadIcon(post);
        }
    });
}

// Run on page load
document.addEventListener('DOMContentLoaded', processPosts);

// Observe DOM changes for Reddit's dynamic loading
const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE && 
                    (node.matches('[data-testid="post-container"], .post') || 
                     node.querySelector('[data-testid="post-container"], .post'))) {
                    const post = node.matches('[data-testid="post-container"], .post') 
                        ? node 
                        : node.querySelector('[data-testid="post-container"], .post');
                    if (post && hasImages(post)) {
                        addDownloadIcon(post);
                    }
                }
            });
        }
    });
});

observer.observe(document.body, { childList: true, subtree: true });