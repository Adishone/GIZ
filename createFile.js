function downloadFile(text) {
	var data = text;
	var fileName = "Prufer.txt";
    var file = new Blob([data], {type: "text/plain;charset=utf-8"});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, fileName);
    else { // Others
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}

var openFile = function(event) {
    var input = event.target;

    var reader = new FileReader();
    reader.onload = function(){
      var text = reader.result;
	  if (input.id == "huffmanFileChooser") {
		generateCharOccurencesMap(text);
	  }
	  else {
		readPruferSequence(text);
	  }
    };
    reader.readAsText(input.files[0]);
  };