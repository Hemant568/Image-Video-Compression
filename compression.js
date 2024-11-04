export const compressImage = async (imageFile) => {
  return new Promise((resolve, reject) => {
    try {
      const imageURL = URL.createObjectURL(imageFile);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const quality = 0.5;
        canvas.toBlob(
          (blob) => {
            if (blob) {
              URL.revokeObjectURL(imageURL);
              resolve(blob);
            } else {
              reject(new Error('Image compression failed.'));
            }
          },
          'image/jpeg',
          quality,
        );
      };
      img.onerror = reject;
      img.src = imageURL;
    } catch (error) {
      reject(error);
    }
  });
};

export const compressVideo = async (videoFile) => {
  return new Promise((resolve, reject) => {
    try {
      const videoURL = URL.createObjectURL(videoFile);
      const videoElement = document.createElement('video');
      videoElement.src = videoURL;
      videoElement.onloadedmetadata = () => {
        if (typeof videoElement.captureStream !== 'function') {
          alert('Browser does not support video capture.');
          URL.revokeObjectURL(videoURL);
          reject(new Error('Browser does not support video capture.'));
          return;
        }
        const stream = videoElement.captureStream();
        const compressedChunks = [];
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'video/webm; codecs=vp8',
        });
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            compressedChunks.push(event.data);
          }
        };
        mediaRecorder.onstop = () => {
          const compressedBlob = new Blob(compressedChunks, {
            type: 'video/webm',
          });
          URL.revokeObjectURL(videoURL);
          resolve(compressedBlob);
        };
        mediaRecorder.start();
        videoElement.play();
        setTimeout(() => {
          mediaRecorder.stop();
          videoElement.pause();
        }, videoElement.duration * 1000);
      };
      videoElement.onerror = reject;
    } catch (error) {
      reject(error);
    }
  });
};
