

// create variable to hold db connection
let db;

// establish connection 
const request = indexedDB.open('budget_tracker', 1);

request.onupgradeneeded = function(event) {
    // save reference to the database
    const db = event.target.result;
    // create an object store 
    db.createObjectStore('new_transaction', { autoIncrement: true });

};

// upon a successful
request.onsuccess = function(event) {
    db = event.target.result;

    if (navigator.onLine) {
        // function to upload transaction
    }
};

request.onerror = function(event) {
    console.log(event.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction(['new_transaction'], 'readwrite');

    // access the object store for `new_transaction`
    const transactionObjectStore = transaction.objectStore('new_transaction');

    // add record to your store with add method
    transactionObjectStore.add(record);
};

function uploadTransaction() {
    // open a transaction on db
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    
    // access object store
    const transactionObjectStore = transaction.objectStore('new_transaction');

    // get all records from store and set to a variable
    const getAll = transactionObjectStore.getAll();

    getAll.onsuccess = function() {
        // if there was data in indexedDb's store, send it to the api server
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }
                    // open one more transaction
                    const transaction = db.transaction(['new_transaction'], 'readwrite');
                    // access the new_transaction object store
                    const transactionObjectStore = transaction.objectStore('new_transaction');
                    // clear all items in your store
                    transactionObjectStore.clear();

                    alert('All transactions have been submitted!');
                    
                })
                .catch(err => {
                    console.log(err);
                });


        }
    }
};

// listen for app coming back online
window.addEventListener('online', uploadTransaction);



