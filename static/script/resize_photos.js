//(function () {
//  'use strict';


let reducer = new window.ImageBlobReduce({
    pica: window.ImageBlobReduce.pica({ features: [ 'js', 'wasm', 'ww' ] })
});


function OnChangeInputFileElementForResize(inputElement, maxWidth, idImagePreview, idSaveButton){
    SetStateSaveButton(idSaveButton, false, 'Запази');

    reducer
        .toBlob(
          inputElement.files[0],
          {
            max: maxWidth,
            unsharpAmount: 80,
            unsharpRadius: 0.6,
            unsharpThreshold: 2
          }
        )
        .then(function (blob) {
          document.getElementById(idImagePreview).src = URL.createObjectURL(blob);

          const resizedFile = new File([blob], inputElement.files[0].name, inputElement.files[0])
          let listFile = [];
          listFile.push(resizedFile)

          const fileList = new FileListItem(listFile)

          let changeEvent = inputElement.onchange
          inputElement.onchange = null
          inputElement.files = fileList
          inputElement.onchange = changeEvent

          SetStateSaveButton(idSaveButton, true, 'Запази');
        });

};


  
// Used for creating a new FileList in a round-about way
function FileListItem(a) {
  a = [].slice.call(Array.isArray(a) ? a : arguments)
  for (var c, b = c = a.length, d = !0; b-- && d;) d = a[b] instanceof File
  if (!d) throw new TypeError("expected argument to FileList is File or array of File objects")
  for (b = (new ClipboardEvent("")).clipboardData || new DataTransfer; c--;) b.items.add(a[c])
  return b.files
}  

function SetStateSaveButton (idName, enabled, caption) {
    if (enabled) {
        $('#'+idName).html(caption);
        $('#'+idName).prop('disabled', false);
    } else {
        $('#'+idName).prop('disabled', true);
        $('#'+idName).html('<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>'+caption);
    }
}






//}());