var anim, playbtn, seekslider, counterCurrentFps, elem, vid;

function seekBarController(animationItem){
    // console.log(animationItem);

    // //show button play/pause
    // playpausebtn_onceOnVideo = document.getElementById("playpausebtn_onceOnVideo");
    //
    // if (playpausebtn_onceOnVideo) {
    //     // playpausebtn_onceOnVideo.addEventListener("click",this.playPause,true);
    // }


    this.anim = animationItem.animationItem;
    anim = animationItem.animationItem;
    this.status = true;
    // this._parent.constructor.call(this, animationItem);

    //allow click on the player to play/pause

    bodymovinDiv = document.getElementById("bodymovin");

    if (this.anim.seekBar){
        this.intializePlayer();
        bodymovinDiv.addEventListener("click",this.playPause,true);

    }

    else
    {

        if (bodymovinDiv) {
            bodymovinDiv.addEventListener("click",this.playPause,true);
        }
    }


}

seekBarController.prototype.intializePlayer = function intializePlayer(){

        counterCurrentFps = 0;
        mutedBTN.innerHTML = mutbtnImg();
        fullscreenBTN.innerHTML =fullScreenImg();

    vid = document.getElementById("bodymovin");

        // Set object references
        playbtn = document.getElementById("playpausebtn");
        playbtn.addEventListener("click",this.playPause,true);

        // fullscreenBTN = document.getElementById("fullscreenBTN");
        // fullscreenBTN.addEventListener("click",this.toggleFullScreen,true);

        // mutedBTN = document.getElementById("mutedBTN");
        // mutedBTN.addEventListener("click",this.muteUnmute,true);

        volumesliderDivWrapper = document.getElementById("volumesliderDivWrapper");
        volumeslider = document.getElementById("volumeslider");
        volumeslider.addEventListener("change",this.setvolume,false);
        volumeslider.value=100; //start with 100% volum


        mutedBTN.addEventListener("mouseover",function() {volumeslider.style.display = 'block'; },true);
        volumesliderDivWrapper.addEventListener("mouseover",function() {volumeslider.style.display = 'block'; },true);
        mutedBTN.addEventListener("mouseout",function() {volumeslider.style.display = 'none'; },true);
        volumesliderDivWrapper.addEventListener("mouseout",function() {volumeslider.style.display = 'none'; },true);

        seekSliderRange = document.getElementById("seekSliderRange");

        // Add event listeners
        seekSliderRange.addEventListener("change",this.vidSeek,false);
        // console.log(this.animationItem);
        // this.anim.addEventListener('enterFrame', seektimeupdate,false);

        elem = document.getElementById("seekslider");


    // anim.addEventListener('enterFrame', checkPlayStatus);


    anim.addEventListener('enterFrame', seektimeupdate,false);



    if(anim.autoplay){
        // console.log(anim.autoplay)
            playbtn.innerHTML = playbtnImg();

    }


    // if(this.anim.autoplay){
    //         playbtn.innerHTML = '<img src=\'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD/4QCMRXhpZgAATU0AKgAAAAgABQESAAMAAAABAAEAAAEaAAUAAAABAAAASgEbAAUAAAABAAAAUgEoAAMAAAABAAIAAIdpAAQAAAABAAAAWgAAAAAAAABIAAAAAQAAAEgAAAABAAOgAQADAAAAAQABAACgAgAEAAAAAQAAACigAwAEAAAAAQAAACgAAAAA/+0AOFBob3Rvc2hvcCAzLjAAOEJJTQQEAAAAAAAAOEJJTQQlAAAAAAAQ1B2M2Y8AsgTpgAmY7PhCfv/AABEIACgAKAMBIgACEQEDEQH/xAAfAAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgv/xAC1EAACAQMDAgQDBQUEBAAAAX0BAgMABBEFEiExQQYTUWEHInEUMoGRoQgjQrHBFVLR8CQzYnKCCQoWFxgZGiUmJygpKjQ1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4eLj5OXm5+jp6vHy8/T19vf4+fr/xAAfAQADAQEBAQEBAQEBAAAAAAAAAQIDBAUGBwgJCgv/xAC1EQACAQIEBAMEBwUEBAABAncAAQIDEQQFITEGEkFRB2FxEyIygQgUQpGhscEJIzNS8BVictEKFiQ04SXxFxgZGiYnKCkqNTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqCg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2dri4+Tl5ufo6ery8/T19vf4+fr/2wBDAAkGBxITEBESEhESFhIVEBIVFxgWFRgVFxUYFRIWGBUYFRYYHiggGBolHRgVITEhJykrLi4uFyAzODMtNygtLiv/2wBDAQoKCg4NDRUPDxUrGRUZKys3LS0tKystKysrKysrLSstLSsrLSsrLSsrKysrKysrKysrKysrKysrKysrKysrKyv/3QAEAAP/2gAMAwEAAhEDEQA/AOIrtPDnw2uLu2juBPFEsqhkDRs5Kn7rMQwxkdv/ANVef3Vz/CPxP+FfSXw8/wCQTp3/AF5W/wD6LWqbFY8Mv9CmivPsTBTOZVjXB+V9/KEE9iOfbB64rq774UXUcLSC4hdlUt5YjZSQBkqrliM/Uc+1N8UMf+EstR28y0/9FzV7Le/6uT/cf/0E0rhY+XUYEAjoQCPoRkU7NQ2f+rj/AOuaf+gipaok/9DzN/619N/Dz/kE6d/15W//AKLWvmR+v419N/Dz/kE6d/15W/8A6LWmxI808Uf8jba/9dLT/wBFzV7Ne/6uT/cf/wBBNeM+J/8Akbbb/rpaf+i5q9mvf9XJ/uP/AOgmgZ8s2n+rj/65p/6CKlqK0/1cf/XNP/QRUtUQf//R8zkr0Pwl8WJLS0jtntfOESBI3WQIdo+6HUjqBgZHXHQV57L3/wA9qalUI2NV8TTzah9v+VZxIjoACUTyxhEweWGM5PBO49OMd/c/F+aaB0S0EcjIV3mTeoyCCUXGT7ZxXk5rQs/uCgCVFAAA6AAD6AYFOoopiP/Z\'>';
    //         document.getElementById("playpausebtn_onceOnVideo").style.display = "none";
    //         // this.status = true;
    //     }
    //


}

// function checkPlayStatus(){
//     // function checkPlayStatus(){
//     //     console.log(anim);
//     if(anim.currentFrame =1) {
//         console.log('dddd');
//
//         if(!anim.autoplay){
//             if(anim.isPaused){
//                 playbtn.innerHTML =pausebtnImg();
//
//             } else {
//                 playbtn.innerHTML = playbtnImg();
//             }
//         }
//         // anim.removeEventListener('enterFrame', checkPlayStatus);
//     }
//     // anim.removeEventListener('enterFrame', checkPlayStatus);
//
// }

function fullScreenImg(){
    return '<img id="fullscreenBTNimg" src=\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAABYmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS40LjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczpleGlmPSJodHRwOi8vbnMuYWRvYmUuY29tL2V4aWYvMS4wLyI+CiAgICAgICAgIDxleGlmOlVzZXJDb21tZW50PlNjcmVlbnNob3Q8L2V4aWY6VXNlckNvbW1lbnQ+CiAgICAgIDwvcmRmOkRlc2NyaXB0aW9uPgogICA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgpuzN4uAAAB3ElEQVRYCe2UC07DMAyGCxcrnGzlZNtOBnGpI8f5kroPIaQ1UhXb+V/NHsNwrRe7ge/0vlue6PVs0RTsqMLvWuzcRWxtRTBNjaMBRbgXoHfWDGUP3mzTMZscjtovN7y7ntoPGqaZzJ90Jm/cegh/ZNbykfmowls+YiGetcJavYAPSBMWBq6OSGPSQ7/3AgrWf0dlRgYyjyzikkfWWgsoQBIgoyzaKIhD2gU9ElAIJESGhbhpCEuahvJbRgMKmgTJ2JsQhrQ8b+63BBQCCVMANaMz0lC87k8tfMAIOYJRfb9HuAXGBxTBAuAdlt5ibO3h9szWHqd9haGAAq6AqmB2wZyNM/JXed3A/7+B2x9GvLe8Wr9i+oP1GoI5G+c9BgoYNVWxHt6e2Vq5fq8wPmAF8Aqpj2CANo8i3AJjA44tVTMvyMu892dNZ6RhLMrSBixP6o6EKYBnEoa0PG/uowFJkIzRJA0JS5oVPxKQhMiwEncD4pB2QVsLSAJkVIh2GuKSB0qMaSrg3oPEHcOeh5zltXaDGZgKent7vqUOa1ngmBweDZfW3MI/bZPqm+upnWiYZjZXhkhAud49TxZxxR4t4eS15SPOJFfg2y6Y3pmT4fZowEiACIbTXdNXuIEfMJOJV9P6Ft0AAAAASUVORK5CYII=\'>';
}

function unfullScreenImg(){
    return '<img id="fullscreenBTNimg" src=\'data:image/png;base64,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\'>';
}

function mutbtnImg(){
    return '<img id="mutedBTNimg" src=\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAAlwSFlzAAALEwAACxMBAJqcGAAAActpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDUuNC4wIj4KICAgPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyI+CiAgICAgICAgIDx4bXA6Q3JlYXRvclRvb2w+QWRvYmUgSW1hZ2VSZWFkeTwveG1wOkNyZWF0b3JUb29sPgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KKS7NPQAAAutJREFUWAntl7uKVEEQho9XDFTwCmLmGihiJojmgiIquKLsGxj6DvsSBmaib6Aiouv6AqJo5A0MVFAwMPB++b899UttM70748y4E5yC/9Slq7ur/+4+Z6ZpOukY6BjoGBiEgVWDJJM7cIdBJ0j5ea7fKT4R5uqiitIvmsfjrtWwmSXPsiaMTdI3hCPhk/9fBDYyI7lI2xuUMy+wtc+EzQKS+7WR4rlsQpGfXSZfJ/wKTEsfFiiCcWk3ez9k/xSQvcLlBWuMDyY2O9tkXxEo7JyArG/VoudGea8E8sBxARnJVrsYs9YO3TQzMt4InvSkG6TZ1qvC/hQ7Ldu5cynu8VOof5POIB+HKfk3BU/2Newz0shW4b5A+wMBcRG3ZbsfRwLxUWi9IZ+X1P+TwCScre8C5xAfhhAKfCK4kIsEQ85LOz4bsYG32SvapwHuBm5JPxY8+LewKY4LQPyUYDkg47NA/JHgMXfKfhfxOWnE7LZeH0+viHeWC7L2jbTvW4zvAjl/yDWBOAs4JFhYNPHXwpYI5iMUocXn6m9QBp0RijFDbCUTwUTPwRQv5U4EyIdRy4swKG5H2D1ZNFPuaO1ktItBO+68mvYCX6aEXcn+EDZM84WpiievJqx0Q41BM4Bmi61ZkA/7UrWb6T0p6W2yt4f9RZo3QlVqBXoC2s2yC+Mc5q2vDq6GY9HIIp+mxKmwP0q/D9ukpLT6Z8bJDHAvevBa2S0cDJ9Lw7cYId+LwocZLsVZHAnvxIcLVtPwmvGF4YwyB31ZxEhk2Bf1BVXBgsBsVFTbyWheWrG6ckvZoon61Hn70N5WljUjLPdjga+RZSw/Fjx41lwYF/2vP7dOxIBDbW8uqrRLNqeV4F8n3HzaPTmay+azd1024jdE643pySR5IjPLdLb5YswLFPhc6Psnv3JHJrDkgvKgHAeETxp/mo7iSMxu663wMzNMKaVfLa/XiqvJQzbkudjqiZRc5EQW2BXVMdAxMGoG/gA9iKJoCRtnVgAAAABJRU5ErkJggg==\'>'
}

function unmutbtnImg(){
    return '<img id="mutedBTNimg" src=\'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IArs4c6QAAAAlwSFlzAAALEwAACxMBAJqcGAAAAVlpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IlhNUCBDb3JlIDUuNC4wIj4KICAgPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICAgICAgPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIKICAgICAgICAgICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iPgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KTMInWQAAAt9JREFUWAntlzlvFEEQhYczQwRcCQlygAwJiQOEhByTgiVI+APOEKEz/gKI/0AEIQQgJAJSYhwjcQkcYAPmet943rjc2zM79q6HDaakt1V9TNXr6u6a2aIYZMjAkIHWDBxoHe02eFDTAPJX+F1aM/DD4g438JjGwkvXe3UEsV8VuXnpJeGo8FV4KHwT8E1Ge5U0a8uKviZABPwQzgiIt32r1cNv3M4LivdcMLHvlf1O+pSA9EYwzdodBV8XILcpcCkA7ffCaQHphWDM2iUFfSU4az+D3YUgCx1HmnHm7RA6c4jkVjTHhJw1E0WPIxiJHdoRfbsR++P87RkZa0F9rwWTMUm3rdsIeqFH5Od4FcN9VbMwuZPukHZfQafBAT8hcBPvCSaQy5rH0E0EnQm27bGwKpwXEEgybrKLsj8K9wVL+fwHtSI46F8EE2jKmsebCDrwOfl6EfwR64qA+LzdkE2Jss9HsklaKe5MNYXYmUnH0rbnxVtM4UYI7vkUcGx25JaA3BXScdqLQik4z8EPddE5gmxPuUXS1wTXSpcoMvZUsP+Nyv4k7QyX59ATJtFNBBWrJnlZNmeMOJBzvD+yfYzeyvYZrS+JJ06i2wgqZsENRs4KbwRisc0cI0D7mXBMQDy/Xt1W9/7/1llRKF+QsVEnyZyfbcugz+FVMfks8MyuthjnOTh4F50jSLZM7rpsb2W8JGyr/fuScE47XRIcOrCdNGnPy5WZ24FELDM31Y+MLTOxSMN+2oV6Tj5fCl7crgs1rzdA5bae9quOrX4irAouI02vugeaY/ERcXtEL6inz48FvgMs9Y2HZQ5+l/LAikDdYpvQPnPeNrfjGYyrj3YdWH6ixP44P84ZsSPJ//bBOsIq6aCgRqIz9ckfuUaSFzUwM3+aIsk0m8sa3Ne/nZ3fh5GlbLJJIUfmhSVhJv64Q8iSZtP96L0uPPoo7Wk4conCIWWHkjPIkIEhA31l4B9nBZtxfG0H+AAAAABJRU5ErkJggg==\'>';
}

 function playbtnImg(){
    return '<img src=\'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD/4QCMRXhpZgAATU0AKgAAAAgABQESAAMAAAABAAEAAAEaAAUAAAABAAAASgEbAAUAAAABAAAAUgEoAAMAAAABAAIAAIdpAAQAAAABAAAAWgAAAAAAAABIAAAAAQAAAEgAAAABAAOgAQADAAAAAQABAACgAgAEAAAAAQAAACigAwAEAAAAAQAAACgAAAAA/+0AOFBob3Rvc2hvcCAzLjAAOEJJTQQEAAAAAAAAOEJJTQQlAAAAAAAQ1B2M2Y8AsgTpgAmY7PhCfv/AABEIACgAKAMBIgACEQEDEQH/xAAfAAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgv/xAC1EAACAQMDAgQDBQUEBAAAAX0BAgMABBEFEiExQQYTUWEHInEUMoGRoQgjQrHBFVLR8CQzYnKCCQoWFxgZGiUmJygpKjQ1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4eLj5OXm5+jp6vHy8/T19vf4+fr/xAAfAQADAQEBAQEBAQEBAAAAAAAAAQIDBAUGBwgJCgv/xAC1EQACAQIEBAMEBwUEBAABAncAAQIDEQQFITEGEkFRB2FxEyIygQgUQpGhscEJIzNS8BVictEKFiQ04SXxFxgZGiYnKCkqNTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqCg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2dri4+Tl5ufo6ery8/T19vf4+fr/2wBDAAkGBxITEBESEhESFhIVEBIVFxgWFRgVFxUYFRIWGBUYFRYYHiggGBolHRgVITEhJykrLi4uFyAzODMtNygtLiv/2wBDAQoKCg4NDRUPDxUrGRUZKys3LS0tKystKysrKysrLSstLSsrLSsrLSsrKysrKysrKysrKysrKysrKysrKysrKyv/3QAEAAP/2gAMAwEAAhEDEQA/AOIrtPDnw2uLu2juBPFEsqhkDRs5Kn7rMQwxkdv/ANVef3Vz/CPxP+FfSXw8/wCQTp3/AF5W/wD6LWqbFY8Mv9CmivPsTBTOZVjXB+V9/KEE9iOfbB64rq774UXUcLSC4hdlUt5YjZSQBkqrliM/Uc+1N8UMf+EstR28y0/9FzV7Le/6uT/cf/0E0rhY+XUYEAjoQCPoRkU7NQ2f+rj/AOuaf+gipaok/9DzN/619N/Dz/kE6d/15W//AKLWvmR+v419N/Dz/kE6d/15W/8A6LWmxI808Uf8jba/9dLT/wBFzV7Ne/6uT/cf/wBBNeM+J/8Akbbb/rpaf+i5q9mvf9XJ/uP/AOgmgZ8s2n+rj/65p/6CKlqK0/1cf/XNP/QRUtUQf//R8zkr0Pwl8WJLS0jtntfOESBI3WQIdo+6HUjqBgZHXHQV57L3/wA9qalUI2NV8TTzah9v+VZxIjoACUTyxhEweWGM5PBO49OMd/c/F+aaB0S0EcjIV3mTeoyCCUXGT7ZxXk5rQs/uCgCVFAAA6AAD6AYFOoopiP/Z\'>';
}

function pausebtnImg(){
    return '<img src=\'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD/4QCARXhpZgAATU0AKgAAAAgABAESAAMAAAABAAEAAAEaAAUAAAABAAAAPgEbAAUAAAABAAAARodpAAQAAAABAAAATgAAAAAAAABIAAAAAQAAAEgAAAABAAOgAQADAAAAAQABAACgAgAEAAAAAQAAACigAwAEAAAAAQAAACgAAAAA/+0AOFBob3Rvc2hvcCAzLjAAOEJJTQQEAAAAAAAAOEJJTQQlAAAAAAAQ1B2M2Y8AsgTpgAmY7PhCfv/AABEIACgAKAMBIgACEQEDEQH/xAAfAAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgv/xAC1EAACAQMDAgQDBQUEBAAAAX0BAgMABBEFEiExQQYTUWEHInEUMoGRoQgjQrHBFVLR8CQzYnKCCQoWFxgZGiUmJygpKjQ1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4eLj5OXm5+jp6vHy8/T19vf4+fr/xAAfAQADAQEBAQEBAQEBAAAAAAAAAQIDBAUGBwgJCgv/xAC1EQACAQIEBAMEBwUEBAABAncAAQIDEQQFITEGEkFRB2FxEyIygQgUQpGhscEJIzNS8BVictEKFiQ04SXxFxgZGiYnKCkqNTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqCg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2dri4+Tl5ufo6ery8/T19vf4+fr/2wBDAAkGBxITEBESEhESFhIVEBIVFxgWFRgVFxUYFRIWGBUYFRYYHiggGBolHRgVITEhJykrLi4uFyAzODMtNygtLiv/2wBDAQoKCg4NDRUPDxUrGRUZKys3LS0tKystKysrKysrLSstLSsrLSsrLSsrKysrKysrKysrKysrKysrKysrKysrKyv/3QAEAAP/2gAMAwEAAhEDEQA/AOGkcKCxOABk1paxolxasFniZN2NrdUfIB+VxwT7HB4PFc3qM25XHbY3/oJr6uayjmtxHLGkkbRqCrgMpBUdQapslI+ZaK9Q8UfCvrJYtxyTDISe/wDyzkPI7/K2R0wRXml1bvE7Ryo0ci/eRxhh+HcdeRkHHWi47EVJilopiP/Q8uuvuP8A7jf+gmvruy/1af7i/wDoIr5Eu/uP/uN/6Ca+sJ9Sit7cSzypHGsa5Z2Cj7o9e/tTYkaJrkPiDdaYIgt/tLHmNV/1+R1MW35h15PT14rifFfxbeTMWnqUU5BmkX5yMdYoz93/AHnHb7teeszMzSSO8kj8s7sWZvqT29unpQkMfOU3NsDhMnbv2l8dt+35d304plFFMR//0fMZEzkeox+fWtbVNTubp1e4leQqAFBOFQYx8iDhfr196zVq5BViJIowop9FFIAoopKBH//Z\'>';
}



seekBarController.prototype.playPause = function(e){
    e.stopPropagation();
    // console.log(e.target )
    if ( e.target.id == 'fullscreenBTNimg'){
        toggleFullScreen();
        return;

    }

    if ( e.target.id == 'mutedBTNimg'){
        muteUnmute();
        return;

    }

     if (e.target.id == 'seekSliderRange')
         return;


        if(anim.isPaused){
            anim.play();

            if(anim.seekBar) {
                playbtn.innerHTML = playbtnImg();
            }
            // anim.paused = true;
            document.getElementById("playpausebtn_onceOnVideo").style.display = "none";
            // this.anim.paused = false;
        } else {
            anim.pause();
            if(anim.seekBar) {
                playbtn.innerHTML = pausebtnImg();
            }

            document.getElementById("playpausebtn_onceOnVideo").style.display = "block";

        }
    }

// seekBarController.prototype.muteUnmute = function(){
 function muteUnmute(){

     // console.log('mutttttt');
    // function muteUnmute(){
        if(anim.muted){
            volumeslider.style.display='none';
            volumeslider.value=100;
            anim.volumeValue = 100;
            // console.log('anim.volumeValue:     '+anim.volumeValue);
            mutedBTN.innerHTML =mutbtnImg();
            anim.muted = false;
        }
        else{
            volumeslider.style.display='block';
            volumeslider.value=0;
            anim.volumeValue = 0;
            // console.log('anim.volumeValue:     '+anim.volumeValue);
            mutedBTN.innerHTML = unmutbtnImg();
            anim.muted = true;
        }
        anim.mute();
    }

seekBarController.prototype.setvolume = function(){
    // function setvolume(){
        anim.volumeValue = volumeslider.value / 100;
        anim.setVolumeRange();
    }

seekBarController.prototype.vidSeek = function(){
    // function vidSeek(){
        var seekto = anim.totalFrames * (seekSliderRange.value / 100);
        anim.removeEventListener('enterFrame', seektimeupdate);
        //check if we are playing video
        if(anim.isPaused) {
            bodymovin.goToAndStop(seekto, true);
            seektimeupdate(true);
        }
        else {
            bodymovin.goToAndStop(seekto, true);
            bodymovin.play();
            seektimeupdate(true);
        }
        anim.addEventListener('enterFrame', seektimeupdate);
    }


function seektimeupdate(forceUpdate){
//     function seektimeupdate(forceUpdate){
//     console.log('ddd');

        counterCurrentFps++;
        if (counterCurrentFps == 24 || forceUpdate==true){
            var nt = anim.currentFrame * (98 / anim.totalFrames);
            //text value -  seekslider.value = Math.round(nt/24);
            seekSliderRange.value = nt;
            elem.style.width = Math.round(nt) + '%';
            counterCurrentFps=0;
        }

        // round the number of total frames
        // in some cases the program enters this (if) twice or more.
        if((Math.round(anim.currentFrame)) == anim.totalFrames){
            elem.style.width = 100+'%';
            //text value - seekslider.value =Math.round(anim.totalFrames/24);
            console.log("finish");
            seekSliderRange.value = 100;
            anim.stop();
            if(!anim.loop){
                playbtn.innerHTML ='<img src=\'/data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD/4QCARXhpZgAATU0AKgAAAAgABAESAAMAAAABAAEAAAEaAAUAAAABAAAAPgEbAAUAAAABAAAARodpAAQAAAABAAAATgAAAAAAAABIAAAAAQAAAEgAAAABAAOgAQADAAAAAQABAACgAgAEAAAAAQAAACigAwAEAAAAAQAAACgAAAAA/+0AOFBob3Rvc2hvcCAzLjAAOEJJTQQEAAAAAAAAOEJJTQQlAAAAAAAQ1B2M2Y8AsgTpgAmY7PhCfv/AABEIACgAKAMBIgACEQEDEQH/xAAfAAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgv/xAC1EAACAQMDAgQDBQUEBAAAAX0BAgMABBEFEiExQQYTUWEHInEUMoGRoQgjQrHBFVLR8CQzYnKCCQoWFxgZGiUmJygpKjQ1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4eLj5OXm5+jp6vHy8/T19vf4+fr/xAAfAQADAQEBAQEBAQEBAAAAAAAAAQIDBAUGBwgJCgv/xAC1EQACAQIEBAMEBwUEBAABAncAAQIDEQQFITEGEkFRB2FxEyIygQgUQpGhscEJIzNS8BVictEKFiQ04SXxFxgZGiYnKCkqNTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqCg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2dri4+Tl5ufo6ery8/T19vf4+fr/2wBDAAkGBxITEBESEhESFhIVEBIVFxgWFRgVFxUYFRIWGBUYFRYYHiggGBolHRgVITEhJykrLi4uFyAzODMtNygtLiv/2wBDAQoKCg4NDRUPDxUrGRUZKys3LS0tKystKysrKysrLSstLSsrLSsrLSsrKysrKysrKysrKysrKysrKysrKysrKyv/3QAEAAP/2gAMAwEAAhEDEQA/AOGkcKCxOABk1paxolxasFniZN2NrdUfIB+VxwT7HB4PFc3qM25XHbY3/oJr6uayjmtxHLGkkbRqCrgMpBUdQapslI+ZaK9Q8UfCvrJYtxyTDISe/wDyzkPI7/K2R0wRXml1bvE7Ryo0ci/eRxhh+HcdeRkHHWi47EVJilopiP/Q8uuvuP8A7jf+gmvruy/1af7i/wDoIr5Eu/uP/uN/6Ca+sJ9Sit7cSzypHGsa5Z2Cj7o9e/tTYkaJrkPiDdaYIgt/tLHmNV/1+R1MW35h15PT14rifFfxbeTMWnqUU5BmkX5yMdYoz93/AHnHb7teeszMzSSO8kj8s7sWZvqT29unpQkMfOU3NsDhMnbv2l8dt+35d304plFFMR//0fMZEzkeox+fWtbVNTubp1e4leQqAFBOFQYx8iDhfr196zVq5BViJIowop9FFIAoopKBH//Z\'>';
                anim.paused = false;
            }
            else{
                anim.play();
                console.log("im in else of the end");
            }
        }
    }


// seekBarController.prototype.toggleFullScreen = function(){
function toggleFullScreen(){
    // function toggleFullScreen(){

        var isInFullScreen = (document.fullscreenElement && document.fullscreenElement !== null) ||
            (document.webkitFullscreenElement && document.webkitFullscreenElement !== null) ||
            (document.mozFullScreenElement && document.mozFullScreenElement !== null) ||
            (document.msFullscreenElement && document.msFullscreenElement !== null);

        var docElm = document.getElementById('bodymovin');
        if (!isInFullScreen) {
            fullscreenBTN.innerHTML =unfullScreenImg();
            if (docElm.requestFullscreen) {
                docElm.requestFullscreen();
            } else if (docElm.mozRequestFullScreen) {
                docElm.mozRequestFullScreen();
            } else if (docElm.webkitRequestFullScreen) {
                docElm.webkitRequestFullScreen();
            } else if (docElm.msRequestFullscreen) {
                docElm.msRequestFullscreen();
            }
        } else {
            fullscreenBTN.innerHTML =fullScreenImg();

            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    }

