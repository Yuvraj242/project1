// Set your AWS credentials and region
AWS.config.update({
  accessKeyId: 'your access id',
  secretAccessKey: 'your secret access key',
  region: 'your lambda and bucket region', // e.g., 'us-east-1'
});

const s3 = new AWS.S3();
const bucketName = 'destinationbucketname';

// Function to format the size in bytes to a human-readable format
function formatSize(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Byte';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

// Function to show a message
function showMessage(message) {
  const messageDiv = document.getElementById('message');
  messageDiv.textContent = message;
}

// Function to refresh the image list
function refreshImages() {
  listImages();
}

// Function to list images from S3 bucket
function listImages() {
  const params = {
    Bucket: bucketName,
  };

  s3.listObjectsV2(params, (err, data) => {
    if (err) {
      showMessage('Error listing images: ' + err.message);
    } else {
      const imageListDiv = document.getElementById('imageList');
      imageListDiv.innerHTML = '';

      data.Contents.forEach((item) => {
        const imageURL = `https://${bucketName}.s3.amazonaws.com/${item.Key}`;
        const imageElement = document.createElement('div');
        imageElement.innerHTML = `
          <img src="${imageURL}" alt="${item.Key}" />
          <p>${item.Key} - ${formatSize(item.Size)}</p>
          <button onclick="downloadImage('${item.Key}')">Download</button>
        `;
        imageListDiv.appendChild(imageElement);
      });
    }
  });
}

// Function to download an image
function downloadImage(imageKey) {
  const params = {
    Bucket: bucketName,
    Key: imageKey,
  };

  s3.getObject(params, (err, data) => {
    if (err) {
      showMessage('Error downloading image: ' + err.message);
    } else {
      const blob = new Blob([data.Body]);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = imageKey;
      link.click();
      URL.revokeObjectURL(url);
    }
  });
}

// ... (remaining code)

// Function to upload an image to another S3 bucket
function uploadImage() {
  const fileInput = document.getElementById('imageInput');
  const file = fileInput.files[0];

  if (!file) {
    showMessage('Please select an image.');
    return;
  }

  const targetBucketName = 'sourcebucketgroup1'; // Replace with the name of your target bucket

  const uploadParams = {
    Bucket: targetBucketName,
    Key: file.name,
    Body: file,
  };

  s3.upload(uploadParams, (err, data) => {
    if (err) {
      showMessage('Upload failed: ' + err.message);
    } else {
      showMessage('Upload successful.');
      refreshImages();
    }
  });
}

// HTML form for uploading images
const uploadForm = `
  <input type="file" id="imageInput" accept="image/*">
  <button onclick="uploadImage()">Upload Image</button>
`;

// HTML container for the message
const messageContainer = `
  <div id="message"></div>
`;

// Add the upload form and message container to your HTML
document.getElementById('uploadSection').innerHTML = uploadForm;
document.getElementById('messageSection').innerHTML = messageContainer;

// Initial loading of images
listImages();
