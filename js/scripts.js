document.addEventListener('DOMContentLoaded', () => {
  const sourceList = document.getElementById('source-list');
  const selectedList = document.getElementById('selected-list');
  const selectedCodeList = document.getElementById('selected-code-list'); // Get the code list

  // --- New Download Feature Logic ---
  const downloadBtn = document.getElementById('download-mockup-btn');
  // const selectedList = document.getElementById('selected-list');

  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      // Check if the list has any items before attempting to download
      if (selectedList.children.length === 0) {
        alert("The Mockup list is empty. Add some components first!");
        return;
      }

      // Options for html2canvas
      const options = {
        // Ignore the remove buttons from the final image
        ignoreElements: (element) => {
          return element.classList.contains('remove-item');
        },
        // Use a white background (important for JPEGs)
        backgroundColor: '#ffffff',
        // Enable image cross-origin access if needed (optional)
        useCORS: true
      };

      // Convert the list content to a canvas
      html2canvas(selectedList, options).then(canvas => {
        // 1. Convert the canvas to a JPEG data URL (quality 0.9)
        const imageURL = canvas.toDataURL('image/jpeg', 0.9);

        // 2. Create a temporary link element for the download
        const link = document.createElement('a');

        // 3. Set the download filename and image source
        link.download = `mockup-${new Date().toISOString().split('T')[0]}.jpg`;
        link.href = imageURL;

        // 4. Trigger the download and clean up
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    });
  }

  // Initialize SortableJS on the target list to make it draggable
  // NOTE: SortableJS is only initialized on the Mockup list. 
  // The code list will be updated based on the Mockup list's order.
  new Sortable(selectedList, {
    animation: 150,
    ghostClass: 'sortable-ghost',
    chosenClass: 'sortable-chosen',
    dragClass: 'sortable-drag',

    // This 'onEnd' function is the key to keeping the code list mirrored
    onEnd: function (evt) {
      // Get all items in the reordered selectedList
      const mockupItems = Array.from(selectedList.children);

      // Reorder the selectedCodeList to match the new order of selectedList
      const fragment = document.createDocumentFragment();
      mockupItems.forEach(mockupItem => {
        // Get the unique ID from the mockup item (added in the 'click' listener)
        const uniqueId = mockupItem.dataset.uniqueId;

        // Find the corresponding code item using the unique ID
        const codeItem = selectedCodeList.querySelector(`[data-unique-id="${uniqueId}"]`);

        if (codeItem) {
          fragment.appendChild(codeItem);
        }
      });
      selectedCodeList.appendChild(fragment);
    }
  });

  // Variable to generate unique IDs for mirrored elements
  let uniqueItemId = 0;

  // --- Add Item Logic (Mirrors to both lists) ---
  sourceList.addEventListener('click', (event) => {
    const clickedItem = event.target.closest('.item');
    if (!clickedItem) return;

    // 1. Generate a unique ID for the pair of list items
    const currentUniqueId = uniqueItemId++;

    // --- Mockup List Item ---
    const newItemMockup = clickedItem.cloneNode(true);
    newItemMockup.classList.remove('item-selected');
    // Add the unique ID to the mockup item
    newItemMockup.dataset.uniqueId = currentUniqueId;

    // Add a visual indicator (like a trash icon) for easy removal
    const removeButton = document.createElement('span');
    removeButton.classList.add('remove-item', 'btn', 'btn-danger', 'btn-sm', 'ms-2');
    removeButton.textContent = 'X';
    // Append the button to a div/span within the clone that will be visible
    const contentContainer = document.createElement('div');
    contentContainer.style.display = 'flex';
    contentContainer.style.alignItems = 'center';
    contentContainer.innerHTML = newItemMockup.querySelector('img') ? newItemMockup.querySelector('img').outerHTML : '';
    contentContainer.appendChild(removeButton);

    // Replace the content of the list item
    newItemMockup.innerHTML = '';
    newItemMockup.appendChild(contentContainer);


    // --- Code List Item ---
    const newItemCode = document.createElement('li');
    newItemCode.classList.add('item', 'col-12'); // Use col-12 for full width in the code tab
    // Add the unique ID to the code item
    newItemCode.dataset.uniqueId = currentUniqueId;

    // Get the HTML code from the original item's <code> tag
    const codeElement = clickedItem.querySelector('code');
    if (codeElement) {
      // Create a new <code> element for the code list
      const newCodeBlock = document.createElement('code');
      newCodeBlock.textContent = codeElement.textContent.trim();
      newCodeBlock.style.display = 'block'; // Ensure the code block takes up space
      newCodeBlock.style.whiteSpace = 'pre'; // Preserve formatting
      newCodeBlock.style.backgroundColor = '#f4f4f4';
      newCodeBlock.style.padding = '5px';
      newCodeBlock.style.marginBottom = '10px';
      newItemCode.appendChild(newCodeBlock);
    } else {
      // If no <code> tag, just add a placeholder text
      newItemCode.textContent = clickedItem.textContent.trim();
    }

    // 3. Add to both lists
    selectedList.appendChild(newItemMockup);
    selectedCodeList.appendChild(newItemCode);
  });

  // --- Remove Item Logic (Mirrors to both lists) ---
  selectedList.addEventListener('click', (event) => {
    // Check if the actual remove button or the list item itself was clicked
    const clickedRemoveButton = event.target.closest('.remove-item');
    const clickedMockupItem = event.target.closest('.item');

    // Only proceed if a remove button or an item in the *selected list* was clicked
    if (!clickedMockupItem || !selectedList.contains(clickedMockupItem)) return;

    // Determine if we should remove the item
    let itemToRemove = null;
    if (clickedRemoveButton) {
      // If the explicit remove button was clicked, use its parent item
      itemToRemove = clickedRemoveButton.closest('.item');
    } else {
      // If the item itself was clicked (and no explicit button), remove it
      itemToRemove = clickedMockupItem;
    }

    if (itemToRemove) {
      const uniqueIdToRemove = itemToRemove.dataset.uniqueId;

      // 1. Remove from the Mockup list
      itemToRemove.remove();

      // 2. Find and remove the corresponding item from the Code list using the unique ID
      const codeItemToRemove = selectedCodeList.querySelector(`[data-unique-id="${uniqueIdToRemove}"]`);
      if (codeItemToRemove) {
        codeItemToRemove.remove();
      }
      // console.log(`Removed pair with ID: ${uniqueIdToRemove}`);
    }
  });
});

function copyDivText() {
  const divElement = document.getElementById("selected-code-list");
  const textToCopy = divElement.innerText; // Or divElement.textContent;

  navigator.clipboard.writeText(textToCopy)
    .then(() => {
      alert("Text copied to clipboard!");
    })
    .catch(err => {
      console.error("Failed to copy text: ", err);
      alert("Failed to copy text.");
    });
}