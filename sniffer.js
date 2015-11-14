
var $ = jQuery;
var items = 0;
var json_ld_Text = null;
var turtle_Text = null;

var data = {
             docURL: "http://",
             micro :{ jsonText:null }, 
             jsonld :{ text:null },
             rdfa :{  },
             turtle :{ text:null }
           };


$(window).load(function() {


  items = $('[itemscope]').not($('[itemscope] [itemscope]'));

  data.docURL = document.location.href;

  var all = document.getElementsByTagName("script");
  for( var i = 0; i < all.length; i++ ) {
    if ( all[i].hasAttribute('type') 
           && all[i].getAttribute('type') == "application/ld+json")
       {
         var htmlText = all[i].innerHTML;
         json_ld_Text = htmlText.replace("<![CDATA[", "").replace("]]>", ""); 
         break;
       }
  }

  for( var i = 0; i < all.length; i++ ) {
    if ( all[i].hasAttribute('type') 
           && all[i].getAttribute('type') == "text/turtle")
       {
         var htmlText = all[i].innerHTML;
         turtle_Text = htmlText.replace("<![CDATA[", "").replace("]]>", ""); 
         break;
       }
  }


  try {

    // Add the listener for messages from the chrome extension.
    chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
      if (request.property == "items.json") 
      {
        var microdata_Text = jQuery.microdata.json(items, function(o) { return JSON.stringify(o, undefined, 2); });

        data.micro.jsonText = microdata_Text;
        data.jsonld.text = json_ld_Text;
        data.turtle.text = turtle_Text;

        chrome.extension.sendMessage(null, 
            { property: 'items.json', 
              data: JSON.stringify(data, undefined, 2)
            }, 
            function(response) {
            });
      } 
      else
      {
        sendResponse({});  /* stop */
      }
    });

    // Tell the chrome extension that we're ready to receive messages
    var exists = false;
    if (items.length > 0 
        || (json_ld_Text!=null && json_ld_Text.length>0)
        || (turtle_Text!=null && turtle_Text.length>0)
       )
      exists = true;

    chrome.extension.sendMessage(null, {
               property: 'status', 
               status: 'ready',
               data_exists: exists
           }, 
           function(response) {
           });

  } catch (e) {

    alert(e);
  }
});