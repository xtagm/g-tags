document.addEventListener('DOMContentLoaded', function() 
{
    chrome.runtime.sendMessage({type: "bm_popup"});
    document.getElementById('update').addEventListener('click', function() 
    {
      chrome.runtime.sendMessage({type: "bm_update"});
    });  
    //setTimeout(window.close, 15000) ;
});
