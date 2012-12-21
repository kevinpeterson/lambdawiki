<html>
  <head>
    <title>Page Flow {{name}}</title>
    <link href="/_flow/style.css" rel="stylesheet" type="text/css">
  </head>

  <body>
    <div id="header">
      <div id="htext">
        Page Flow <strong>{{name}}</strong>
        <div id="editButtonDiv">
          <button id="editButton" class="editing">hide editor</button>
        </div>
      </div>
    </div>
    <div id="left">
      <div id="view" class="content">{{{markdown}}}</div>
    </div>
    <div id="editor">{{{content}}}</div>
    <script src="/lib/markdown/showdown.js" type="text/javascript"></script>
  
    <script src="/lib/ace/ace.js" type="text/javascript" charset="utf-8"></script>
 
    <script src="/lib/jisp.js" type="text/javascript" charset="utf-8"></script>
    <script src="/channel/bcsocket.js"></script>
    <script src="/share/share.uncompressed.js"></script>
  
    <script src="/share/ace.js"></script>
    <script src="http://code.jquery.com/jquery-latest.js"></script>
    <script>
window.onload = function() {

  var converter = new Showdown.converter();
  var view = document.getElementById('view');

  var editor = ace.edit("editor");
  editor.setReadOnly(true);
  editor.session.setUseWrapMode(true);
  editor.setShowPrintMargin(false);
  editor.getSession().setMode("ace/mode/lisp");

  $('#editButton').click(function(){
    var editOrNot = $(this).hasClass("editing");
    if(editOrNot){
        $('#editor').animate({ width: "0%"}, 300 );
        $('#left').animate({ width: "100%"}, 300 );
        $('#editButton').text("show editor");
    } else {
        $('#editor').animate({ width: "50%"}, 300 );
        $('#left').animate({ width: "50%"}, 300 );
        $('#editButton').text("hide editor");
    }
    $(this).toggleClass("editing");

    return false;
  });

  // This could instead be written simply as:
  // sharejs.open('{{{docName}}}', function(doc, error) {
  //   ...

  var connection = new sharejs.Connection('http://' + window.location.hostname + ':' + 8000 + '/channel');

  connection.open('{{{docName}}}', function(error, doc) {
    if (error) {
      console.error(error);
      return;
    }
    doc.attach_ace(editor);
    editor.setReadOnly(false);

    var render = function() {
      view.innerHTML = "";
      try{
      evalLisp(doc.snapshot, function(result){
        if(result){
          view.innerHTML += ("<p>" + result + "</p");
        }
      });
      } catch (err) {
        view.innerHTML += "... and a parse error.";
      }
    };

    window.doc = doc;

    render();
    doc.on('change', render);
  });
};
    </script>
  </body>
</html>  

