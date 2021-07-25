let db;

const dbRequest = indexedDB.open("budget", 1);

dbRequest.onupgradeneeded = function(event){
    //new object store pending, autoincrement true.
    const db = event.target.result;
    db.createObjectStore("pending", {autoincrement: true});
};

dbRequest.onsuccess = function(event){
    const db = event.target.result;
//checks if app is online before reading from db.
    if(navigator.onLine){
        checkDatabase();
    }
};

dbRequest.onerror = function(event){
    console.log("sorry again" + event.target.errorCode);
};

const saveRecord = (recordData) => {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    store.add(recordData);
}

const checkDatabase = function (){
    //open up a transaction
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    const getAll = store.getAll();
    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
          fetch("/api/transaction/bulk", {
            method: "POST",
            body: JSON.stringify(getAll.result),
            headers: {
              Accept: "application/json, text/plain, */*",
              "Content-Type": "application/json"
            }
          })
          .then(response => response.json())
          .then(() => {
            // if successful, open a transaction on your pending db
            const transaction = db.transaction(["pending"], "readwrite");
    
            // access your pending object store
            const store = transaction.objectStore("pending");
    
            // clear all items in your store
            store.clear();
          });
        }
      };

}

// listen for app coming back online
window.addEventListener("online", checkDatabase);

