(function () {
  'use strict';

  
// Used for creating a new FileList in a round-about way
function FileListItem(a) {
  a = [].slice.call(Array.isArray(a) ? a : arguments)
  for (var c, b = c = a.length, d = !0; b-- && d;) d = a[b] instanceof File
  if (!d) throw new TypeError("expected argument to FileList is File or array of File objects")
  for (b = (new ClipboardEvent("")).clipboardData || new DataTransfer; c--;) b.items.add(a[c])
  return b.files
}  
  

    window.addEventListener('DOMContentLoaded', function () {

        let reducer = new window.ImageBlobReduce({
            pica: window.ImageBlobReduce.pica({ features: [ 'js', 'wasm', 'ww' ] })
        });





        document.getElementById('id_first_insp_photo1').addEventListener('change', function changeTreePhoto1 () {
            let inputElement = this;
            reducer
                .toBlob(
                  this.files[0],
                  {
                    max: 1280,
                    unsharpAmount: 80,
                    unsharpRadius: 0.6,
                    unsharpThreshold: 2
                  }
                )
                .then(function (blob) {
                  document.getElementById('id_first_insp_img_photo1').src = URL.createObjectURL(blob);

                  const resizedFile = new File([blob], inputElement.files[0].name, inputElement.files[0])
                  let listFile = [];
                  listFile.push(resizedFile)

                  const fileList = new FileListItem(listFile)

                  inputElement.onchange = null
                  inputElement.files = fileList
                  inputElement.onchange = changePhoto1

                });
        });

        document.getElementById('id_first_insp_photo2').addEventListener('change', function changeTreePhoto2 () {
            let inputElement = this;
            reducer
                .toBlob(
                  this.files[0],
                  {
                    max: 1280,
                    unsharpAmount: 80,
                    unsharpRadius: 0.6,
                    unsharpThreshold: 2
                  }
                )
                .then(function (blob) {
                  document.getElementById('id_first_insp_img_photo2').src = URL.createObjectURL(blob);

                  const resizedFile = new File([blob], inputElement.files[0].name, inputElement.files[0])
                  let listFile = [];
                  listFile.push(resizedFile)

                  const fileList = new FileListItem(listFile)

                  inputElement.onchange = null
                  inputElement.files = fileList
                  inputElement.onchange = changePhoto1

                });
        });

        document.getElementById('id_first_insp_photo3').addEventListener('change', function changeTreePhoto3 () {
            let inputElement = this;
            reducer
                .toBlob(
                  this.files[0],
                  {
                    max: 1280,
                    unsharpAmount: 80,
                    unsharpRadius: 0.6,
                    unsharpThreshold: 2
                  }
                )
                .then(function (blob) {
                  document.getElementById('id_first_insp_img_photo3').src = URL.createObjectURL(blob);

                  const resizedFile = new File([blob], inputElement.files[0].name, inputElement.files[0])
                  let listFile = [];
                  listFile.push(resizedFile)

                  const fileList = new FileListItem(listFile)

                  inputElement.onchange = null
                  inputElement.files = fileList
                  inputElement.onchange = changePhoto1

                });
        });





        document.getElementById('id_insp_photo1').addEventListener('change', function changeInspPhoto1 () {
            let inputElement = this;
            reducer
                .toBlob(
                  this.files[0],
                  {
                    max: 1280,
                    unsharpAmount: 80,
                    unsharpRadius: 0.6,
                    unsharpThreshold: 2
                  }
                )
                .then(function (blob) {
                  document.getElementById('id_insp_img_photo1').src = URL.createObjectURL(blob);

                  const resizedFile = new File([blob], inputElement.files[0].name, inputElement.files[0])
                  let listFile = [];
                  listFile.push(resizedFile)

                  const fileList = new FileListItem(listFile)

                  inputElement.onchange = null
                  inputElement.files = fileList
                  inputElement.onchange = changeInspPhoto1

                });
        });

        document.getElementById('id_insp_photo2').addEventListener('change', function changeInspPhoto2 () {
            let inputElement = this;
            reducer
                .toBlob(
                  this.files[0],
                  {
                    max: 1280,
                    unsharpAmount: 80,
                    unsharpRadius: 0.6,
                    unsharpThreshold: 2
                  }
                )
                .then(function (blob) {
                  document.getElementById('id_insp_img_photo2').src = URL.createObjectURL(blob);

                  const resizedFile = new File([blob], inputElement.files[0].name, inputElement.files[0])
                  let listFile = [];
                  listFile.push(resizedFile)

                  const fileList = new FileListItem(listFile)

                  inputElement.onchange = null
                  inputElement.files = fileList
                  inputElement.onchange = changeInspPhoto2

                });
        });

        document.getElementById('id_insp_photo3').addEventListener('change', function changeInspPhoto3 () {
            let inputElement = this;
            reducer
                .toBlob(
                  this.files[0],
                  {
                    max: 1280,
                    unsharpAmount: 80,
                    unsharpRadius: 0.6,
                    unsharpThreshold: 2
                  }
                )
                .then(function (blob) {
                  document.getElementById('id_insp_img_photo3').src = URL.createObjectURL(blob);

                  const resizedFile = new File([blob], inputElement.files[0].name, inputElement.files[0])
                  let listFile = [];
                  listFile.push(resizedFile)

                  const fileList = new FileListItem(listFile)

                  inputElement.onchange = null
                  inputElement.files = fileList
                  inputElement.onchange = changeInspPhoto3

                });
        });





    });

}());