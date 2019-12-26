/*
CategoryEdit - Individual Category look

Purpose:
User able to take photos and edit existing photos for this category.

Code from:
//https://gist.github.com/HaNdTriX/7704632
//Encodes image into base64 for localstorage

*/

export const toDataUrl = (src, callback) => {
  // Create an Image object
  var img = new Image();
  // Add CORS approval to prevent a tainted canvas
  img.crossOrigin = 'Anonymous';
  img.onload = () => {
    //console.log('onload function entered');
    // Create an html canvas element
    var canvas = document.createElement('CANVAS');
    // Create a 2d context
    var ctx = canvas.getContext('2d');
    var dataURL;
    // Resize the canavas to the original image dimensions
    canvas.height = img.naturalHeight;
    canvas.width = img.naturalWidth;
    // Draw the image to a canvas
    ctx.drawImage(img, 0, 0);
    // Convert the canvas to a data url
    dataURL = canvas.toDataURL('image/jpeg',0.2);
    // Return the data url via callback
    callback(dataURL);
    // Mark the canvas to be ready for garbage
    // collection
    canvas = null;
  };
  // Load the image
  img.src = src;
  // make sure the load event fires for cached images too
  if (img.complete || img.complete === undefined) {
    // Flush cache
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
    // Try again
    console.log('Image was cached, try to load again');
    img.src = src;
  }
}
