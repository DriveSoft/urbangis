$( document ).ready(function() {
   $('#saveButton').click(function(){
   	// Get the file from frontend
   	var myFile = $('#fileToUpload').prop('files');
   	// Send a get request to generate signed url
   	var config = {
         params: {
            file_name : myFile.name,
            username : 'Username'
         },
         headers : {'Accept' : 'application/json'}
        };


    $.ajax({
        type: "GET",
        url: 'generate_signed_url/',
              data: data,
              success: function(response){
                console.log(response);
              },
    });


    $http.get('generate_signed_url/', config).then(
        function(response) {
            self.signed_data = response.data
            var url = response.data.signed_request
            console.log(url);
            // Upload file directly to amazon s3
            var xhr = new XMLHttpRequest();
            xhr.open("PUT", url);
            xhr.setRequestHeader('Access-Control-Allow-Headers', '*');
            xhr.upload.onprogress = updateProgress;
            xhr.onerror = function() {
                alert("Could not upload file.");
            };
            xhr.send(self.video);

            function updateProgress (ev) {
                    if (ev.lengthComputable) {
                        var percentComplete = Math.round((ev.loaded / ev.total) * 100);
                        console.log(percentComplete);
                    }
                }

            // Make posted url / video as public
            var s3_config = {
                params : response.data,
                headers : {'Accept' : 'application/json'}
            }
            var data = {
                signed_request : response.data.signed_request,
                s3_key : response.data.s3_key,
                status : response.data.status,
                url : response.data.url,
            }
            $.ajax({
              type: "POST",
              url: 'make_video_public/',
              data: data,
              success: function(response){
                console.log(response);
              },
            });

         },function(response) {}
         );

   })

})