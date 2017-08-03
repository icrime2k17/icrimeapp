var pictureSource;   // picture source
var destinationType; // sets the format of returned value
 
document.addEventListener("deviceready", onDeviceReady, false);
 
function onDeviceReady() {
    pictureSource = navigator.camera.PictureSourceType;
    destinationType = navigator.camera.DestinationType;
}
 
function clearCache() {
    navigator.camera.cleanup();
}
 
var retries = 0;
function onCapturePhoto(fileURI) {
    
      
    var win = function (r) {
        clearCache();
        retries = 0;
        alert('Image successfully saved.');
        dismissLoading();
        var imageHolder = document.getElementById('captured-image-holder');
        var smallImage = document.getElementById('smallImage');

        // Unhide image elements
        //
        imageHolder.style.display = 'block';

        // Show the captured photo
        // The in-line CSS rules are used to resize the image
        //
        smallImage.src = fileURI;
        imageHolder.scrollTop = imageHolder.scrollHeight;
    }
 
    var fail = function (error) {
        if (retries == 0) {
            retries ++
            setTimeout(function() {
                onCapturePhoto(fileURI)
            }, 1000)
        } else {
            retries = 0;
            clearCache();
            alert('Can not save image.');
        }
    }
 
    var options = new FileUploadOptions();
    options.fileKey = "file";
    options.fileName = fileURI.substr(fileURI.lastIndexOf('/') + 1);
    options.mimeType = "image/jpeg";
    options.params = {}; // if we need to send parameters to the server request
    var ft = new FileTransfer();
    var filename = makeid();
    IMAGE_FILE_NAME = filename;
    sp.set('temp_cam_upload',filename);
    loading();
    ft.upload(fileURI, encodeURI(config.url+"/uploadfromcam/?filename="+filename), win, fail, options);
}
 
function capturePhoto() {
    navigator.camera.getPicture(onCapturePhoto, onFail, {
        quality: 100,
        destinationType: destinationType.FILE_URI
    });
}
 
function onFail(message) {
    alert('Failed because: ' + message);
}

function makeid()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 15; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}