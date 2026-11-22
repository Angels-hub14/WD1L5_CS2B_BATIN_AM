// check whether a user is currently logged in
const currentUname = localStorage.getItem("groceryKoCurrentUser");

// redirecting users who are not logged in
if (!currentUname) {
    window.location.href = "login.html";
} else {
    document.getElementById("welcomeMessage").textContent =
        "Hello. Welcome, " + currentUname + "!";
}

// get HTML elements
const itemForm = document.getElementById("itemForm");
const groceryList = document.getElementById("groceryList");
const emptyMessage = document.getElementById("emptyMessage");
const itemCount = document.getElementById("itemCount");
const clearButton = document.getElementById("clearButton");
const logoutButton = document.getElementById("logoutButton");

// Data storage functions - retrieve all grocery items from localStorage.
function getAllItems() {
    return JSON.parse(
        localStorage.getItem("groceryKoItems")
    ) || [];
}

// retrieve only the current user's grocery items
function getUserItems() {
    return getAllItems().filter(function(item) {
        return item.owner === currentUname;
    });
}

// save all grocery items to localStorage
function saveAllItems(items) {
    localStorage.setItem(
        "groceryKoItems",
        JSON.stringify(items)
    );
}

// Display grocery items
function renderItems() {
    const items = getUserItems();

    // clear the existing displayed list
    groceryList.innerHTML = "";

    // display each grocery item
    items.forEach(function(item) {
        const listItem = document.createElement("li");
        listItem.className = "grocery-item" +
            (item.completed ? "completed" : "");
        
        // create item info container
        const itemInfo = document.createElement("div");
        itemInfo.className = "item-info";

        // create checkbox
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "item-check";
        checkbox.checked = item.completed;
        checkbox.setAttribute(
            "aria-label", "Mark" + item.name + "as completed"
        );

        checkbox.addEventListener("change", function() {
            updateItem(item.id, {
                completed: checkbox.checked
            });
        });

        // display grocery item name
        const name = document.createElement("span");
        name.className = "item-name";
        name.textContent = item.name;

        // display item quantity
        const quantity = document.createElement("span");
        quantity.className = "item-quantity";
        quantity.textContent = "Qty: " + item.quantity;
        itemInfo.append(checkbox, name, quantity);

        // create action buttons
        const actions = document.createElement("div");
        actions.className = "item-actions";
        
        // edit button
        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "small-action";
        editButton.textContent = "Edit";
        editButton.addEventListener("click", function() {
            editItem(item);
        });

        // delete button
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "small-action delete";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", function() {
            deleteItem(item.id);
        });

        actions.append(editButton, deleteButton);
        listItem.append(itemInfo, actions);
        groceryList.appendChild(listItem);
    });
    // update empty message and item counter
    emptyMessage.hidden = items.length > 0;
    itemCount.textContent = items.length + (items.length === 1 ? "item" : "items");
}

// Add grocery item
itemForm.addEventListener("submit", function(event) {
    event.preventDefault();
    const nameInput = document.getElementById("item_name");
    const quantityInput = document.getElementById("item_qty");
    const name = nameInput.value;
    const quantity = Number(quantityInput.value);

    // validate grovery item details
    if (!name || !Number.isInteger(quantity) || quantity < 1) {
        alert("Please enter a valid item name and quantity.");
        return;
    }

    // get existing grocery items
    const items = getAllItems();

    // create new grocery item object
    const newItem = {
        id: Date.now().toString(),
        owner: currentUname,
        name: name,
        quantity: quantity,
        completed: false
    };

    // add object to the array
    items.push(newItem);

    // save updated grocery list
    saveAllItems(items);

    // reset form
    itemForm.reset();
    quantityInput.value = 1;

    // refresh displayed grocery list
    renderItems();
});

// update grocery items
function updateItem(itemId, changes) {
    const items = getAllItems().map(function(item) {
        if ( item.id === itemId && item.owner === currentUname) {
            return Object.assign({}, item, changes);
        }
        return item;
    });

    saveAllItems(items);
    renderItems();
}

// Edit grocery item
function editItem(item) {
    const newName = prompt("Update item name: ", item.name);
    if (newName === null) return;
    const cleanedName = newName.trim();
    if (!cleanedName) {
        alert("Item name cannot be emopty.");
        return;
    }

    const quantityText = prompt(
        "update quantity: ", item.quantity
    );
    if (quantityText === null) return;
    const newQuantity = Number(quantityText);
    if (!Number.isInteger(newQuantity) || newQuantity < 1) {
        alert("Quantity must be a whole number greater than zero.");
        return;
    }

    // save updated item details
    updateItem(item.id, {
        name: cleanedName,
        quantity: newQuantity
    });
}

// Delete grocery item
function deleteItem(itemId) {
    const updatedItems = getAllItems().filter(function(item) {
        return !(item.id === itemId && item.owner === currentUname);
    });
    saveAllItems(updatedItems);
    renderItems();
}

// clear all grocery items
clearButton.addEventListener("click", function() {
    if (!getUserItems().length) return;
    const confirmation = confirm("Are you sure you want to clear your entire grocery list?");

    if (confirmation) {
        // preserve other user's grocery items
        const remainingItems = getAllItems().filter(function(item) {
            return item.owner !== currentUname;
        });
        saveAllItems(remainingItems);
        renderItems();
    }
});

// Log Out
logoutButton.addEventListener("click", function() {
    localStorage.removeItem("groceryKoCurrentUser");
    window.location.href = "login.html";
});

// display saved grovery itmes when the page loads
renderItems();