/**
 * @title X-Tags - Background
 * @author DENIS ROUSSEAU
 * @version 2.5
 ******************************************************************************/
/*jslint nomen: true, plusplus: true, regexp: true*/
/**
 * Background manager
 */
var xtb=
{
    browser : window.chrome||window.browser,
    winId:null,
    timeoutID:null,
    onChange : function()
    {
        if (xtb.winId)
        {
            xtb.browser.windows.get(xtb.winId, null, function(w)
            { 
                if (!xtb.browser.runtime.lastError && w) 
                {
                    localStorage.xTags=JSON.stringify({'left':w.left,'top':w.top,'width':w.width,'height':w.height});
                }
            });
        }
    },
    startHighligth :function()
    {
        if (!xtb.timeoutID)
        {
            xtb.browser.windows.update(xtb.winId, {"drawAttention":true});
        }        
    },
    stopHighlight : function()
    {
        xtb.timeoutID=null;
        xtb.browser.windows.update(xtb.winId, {"drawAttention":false});
    }
};

/**
 * Installation Listener (check whether new version is installed)
 */
if (xtb.browser.runtime.onInstalled)
{
	xtb.browser.runtime.onInstalled.addListener(function(details)
	{
		if(details.reason === "install"/* || details.reason === "update"*/ )
		{
			xtb.browser.tabs.create( {url: "option.html"} );
		}
	});
}
/**
 * Activation listener
 */
xtb.browser.browserAction.onClicked.addListener(function() 
{
    xtb.browser.windows.getCurrent(function(win) 
    {
        if (xtb.winId) 
        {
            xtb.browser.windows.update(xtb.winId, {"focused":true}); 
        }
        else
        {
            var r=localStorage.xTags? JSON.parse(localStorage.xTags) : {'left':0,'top':window.screen.availHeight-200,'width':window.screen.width,'height':200};
            xtb.browser.windows.create({url: "g-tags.html", type:"popup", left:(r.left||0), top:r.top, width:r.width, height:r.height}, function(w)
            {
                xtb.winId=w.id;
            });
            xtb.browser.browserAction.setIcon({path: "img/on.png"});
        }
    });
});
/**
 * Focus listener
 */
xtb.browser.windows.onFocusChanged.addListener(function(windowId)
{
    xtb.onChange();  
});

/**
 * Message listener
 */
xtb.browser.runtime.onMessage.addListener(function(message, sender, sendResponse) 
{
    if (message)
    {    
        switch (message.type)
        {
        case 'copy':
            var input = document.createElement('textarea');
            document.body.appendChild(input);
            input.value = message.text;
            input.focus();
            input.select();
            document.execCommand('Copy');
            input.remove();
            break;
        case 'resize':
            xtb.onChange();
            break;
        case 'newtag':
            xtb.startHighligth();
            break ;       
        }
    }
});
/**
 * Close listener
 */
xtb.browser.windows.onRemoved.addListener(function(windowId)
{
    if (windowId === xtb.winId) 
    {
        xtb.winId = null;                
        xtb.browser.browserAction.setIcon({path: "img/off.png"});
    }  
});

