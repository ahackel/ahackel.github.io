//marmoset.noUserInterface = true;
var gallery = document.getElementsByClassName('gallery')[0];
var msetViewers = [];
for (model of msetModels) {
  var li = document.createElement('li');
  //li.classList.add("item");

  if (gallery.firstChild)
    gallery.insertBefore(li, gallery.firstChild);
  else
    gallery.appendChild(li);

  var size = calculateSize(li);
  //var myviewer = new marmoset.WebViewer( size.w, size.h, model );
  //msetViewers.push(myviewer);
  //li.appendChild( myviewer.domRoot );

  marmoset.fetchThumbnail( model,
    function(img){
      console.log(img);
    },
    function(msg){
      console.log(msg);
    },
  );

  //myviewer.loadScene();
}

function calculateSize(li) {
  var size = {};
  var style = window.getComputedStyle(li);

  size.w = gallery.clientWidth - parseInt(style.marginRight) - parseInt(style.marginLeft);
  size.h = size.w * 9 / 16;
  return size;
}

function resizeViewers() {
  for (viewer of msetViewers) {
    if (viewer.scene != null)
      var size = calculateSize(viewer.domRoot.parentElement);
      viewer.resize(size.w, size.h);
  }
}

//window.addEventListener('resize', resizeViewers);
//marmoset.embed( '{{ model }}', { width: 800, height: 600, autoStart: true, fullFrame: false, pagePreset: false } );
