document.addEventListener('DOMContentLoaded', () => {
  const sourceList = document.getElementById('source-list');
  const selectedList = document.getElementById('selected-list');

  // Initialize SortableJS on the target list to make it draggable
  new Sortable(selectedList, {
    animation: 150,
    ghostClass: 'sortable-ghost',
    chosenClass: 'sortable-chosen',
    dragClass: 'sortable-drag'
  });

  // Listen for clicks on the source list
  sourceList.addEventListener('click', (event) => {
    const clickedItem = event.target.closest('.item');
    if (!clickedItem) return;

    // Clone the clicked item to add to the new list
    const newItem = clickedItem.cloneNode(true);
    newItem.classList.remove('item-selected'); // Clear any selected state
   
    // Check if the item already exists to prevent duplicates
    if (!itemExistsInList(selectedList, newItem.textContent)) {
      selectedList.appendChild(newItem);
    }
  });

  // Helper function to check for duplicates
  function itemExistsInList(list, textContent) {
    const items = list.querySelectorAll('.item');
    for (let item of items) {
      if (item.textContent.trim() === textContent.trim()) {
        return true;
      }
    }
    return false;
  }
});