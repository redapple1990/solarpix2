/*
photoDatabase:

indexedDB used for storing actual image data

data structure: { photoId: x, dataURL: y, uploadStatus: z }
*/

if(window.IndexedDB){
    console.log('IndexedDB is supported');
}

window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

//Open/Create a database
var request = window.indexedDB.open("photoDatabase", 1),
  db,
  tx,
  store,
  index;

request.onupgradeneeded = (e) => {
  const db = request.result,
    //2nd argument chooses the key for this store
    store = db.createObjectStore("photoStore", { keyPath: "photoId" });
    index = store.createIndex("uploadStatus", "uploadStatus", {unique: false});
};

request.onerror = (e) => {
  console.log("There was an error: ", e.target.errorCode);
};

//onsuccess is where you work with your data
request.onsuccess = (e) => {
  db = request.result;
  //we get the transaction obj from our photoStore to insert/do any operations on database
  tx = db.transaction("photoStore", "readwrite");
  //We get the object store from transaction to get the ability to perform operations
  store = tx.objectStore("photoStore");
  index = store.index("uploadStatus");

  db.onerror = (e) => {
    console.log("ERROR", e.target.errorCode);
  }

  //This is how you put data into the index store
  //store.put()

  //When transactions complete, close database?
  /*
  tx.oncomplete = () => {
    db.close();
  }
  */
};
