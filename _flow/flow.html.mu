<html>
  <head>
    <title>Page Flow {{name}}</title>
    <link href="/_flow/style.css" rel="stylesheet" type="text/css">
    <link href='/lib/prettify.css' rel='stylesheet' type='text/css' />
    <script src="/lib/prettify.js" type="text/javascript" charset="utf-8"></script>
    <script src="/lib/jquery.js" type="text/javascript" charset="utf-8"></script>
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
    <div id="divider"></div>
    <div id="editor">{{{content}}}</div>
    <script src="/lib/markdown/showdown.js" type="text/javascript"></script>
    <script src="/lib/ace/ace.js" type="text/javascript" charset="utf-8"></script>
    <script src="/lib/jisp.js" type="text/javascript" charset="utf-8"></script>
    <script src="/channel/bcsocket.js"></script>
    <script src="/share/share.uncompressed.js"></script>
    <script src="/share/ace.js"></script>

    <!--
    <script src="http://code.jquery.com/jquery-latest.js"></script>
    -->
    <script>
window.onload = function() {

  var view = document.getElementById('view');

  var editor = ace.edit("editor");
  editor.setReadOnly(true);
  editor.session.setUseWrapMode(true);
  editor.setShowPrintMargin(false);
  editor.getSession().setMode("ace/mode/lisp");

  var leftWidth = 50;
  $('#editButton').click(function(){
    var editOrNot = $(this).hasClass("editing");
    if(editOrNot){
        $('#editor').animate({ width: "0%"}, 300 );
        $('#left').animate({ width: "100%"}, 300 );
        $('#editButton').text("show editor");
        $('#divider').animate({right: "0%"}, 300);
    } else {
        $('#editor').animate({ width: 100-leftWidth + "%"}, 300 );
        $('#left').animate({ width: leftWidth + "%"}, 300 );
        $('#editButton').text("hide editor");
        $('#divider').animate({right: 100-(leftWidth+0.4) + "%"}, 300);
    }
    $(this).toggleClass("editing");

    editor.resize();

    return false;
  });

  $('#divider').mousedown(function(e){
      e.preventDefault();
      $(document).mousemove(function(e){
        var width = $('body').width();
        leftWidth = (e.pageX/width)*100
        $('#left').css("width",leftWidth + "%");
        $('#divider').css("right",100-(leftWidth+0.4) + "%");
        $('#editor').css("width",100-leftWidth + "%");
        editor.resize();
     })
     console.log("leaving mouseDown");
  });
  $(document).mouseup(function(e){
     $(document).unbind('mousemove');
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
      $('#view').html("");
      try{
      evalLisp(doc.snapshot, function(id, result){
        if(result){
          var html = result.toString();
          if(id == null){
            $('#view').append(html);
          } else {
            $('#view').find('#' + id).append(html);
          }
        }
      });
      } catch (err) {
        view.innerHTML += "... and a parse error: " + err.message;
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

