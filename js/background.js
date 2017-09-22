/**
 * @title Tags tracker - Background
 * @author DENIS ROUSSEAU
 * @version 4.0
 ******************************************************************************/
/*jslint nomen: true, plusplus: true, regexp: true*/
/**
 * Background manager
 */
var wx=window.chrome||window.browser;
var bm=
{
    storage : wx.storage.local,
    winId:null,
    timeoutID:null,
    onChange : function()
    {
        if (bm.winId)
        {
            wx.windows.get(bm.winId, null, function(w)
            { 
                if (!wx.runtime.lastError && w) 
                {
                    bm.storage.set({'wTags':{'left':w.left,'top':w.top,'width':w.width,'height':w.height}});
                }
            });
        }
    },
    startHighligth :function()
    {
        if (!bm.timeoutID)
        {
            wx.windows.update(bm.winId, {"drawAttention":true});
        }        
    },
    stopHighlight : function()
    {
        bm.timeoutID=null;
        wx.windows.update(bm.winId, {"drawAttention":false});
    },
    onDimensionLoad : function(item)
    {
        var r=item.wTags||{'left':0,'top':window.screen.availHeight-200,'width':window.screen.width,'height':200};
        wx.windows.create({url: "tags.html", type:"popup", left:(r.left||0), top:r.top, width:r.width, height:r.height}, 
        function(w)
        {
            bm.winId=w.id;
        });
    }
};

/**
 * Installation Listener (check whether new version is installed)
 */
if (wx.runtime.onInstalled)
{
	wx.runtime.onInstalled.addListener(function(details)
	{
		if(details.reason === "install"/* || details.reason === "update"*/ )
		{
			wx.tabs.create( {url: "option.html"} );
		}
	});
}
/**
 * Activation listener
 */
wx.browserAction.onClicked.addListener(function() 
{
    wx.windows.getCurrent(function(win) 
    {
        if (bm.winId) 
        {
            wx.windows.update(bm.winId, {"focused":true}); 
        }
        else
        {
            bm.storage.get('wTags', bm.onDimensionLoad);
            wx.browserAction.setIcon({path: "img/19.png"});
        }
    });
});
/**
 * Focus listener
 */
wx.windows.onFocusChanged.addListener(function(windowId)
{
    bm.onChange();  
});

/**
 * Message listener
 */
wx.runtime.onMessage.addListener(function(message, sender, sendResponse) 
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
            bm.onChange();
            break;
        case 'newtag':
            bm.startHighligth();
            break ;       
        }
    }
});
/**
 * Close listener
 */
wx.windows.onRemoved.addListener(function(windowId)
{
    if (windowId === bm.winId) 
    {
        bm.winId = null;                
        wx.browserAction.setIcon({path: "img/19bw.png"});
    }  
});

