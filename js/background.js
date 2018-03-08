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
    persist : wx.storage.local,
    winid:null,//Id Tag Window
    timeoutID:null,
    loaded:null,
    charts:null,
    tabid : null,//Id Current tracked tab
    clipboard:'',
    /**
     * Initialization
     */
    initTab:function(tab, fn)
    {
        if (!bm.isTabChild(tab))
        {
            bm.tabid=bm.isTabValid(tab)?tab.id:null ;
            if (fn)
            {
                fn();
            }
        }
    },    
    tabChanged : function(tid, fn)
    {
        wx.tabs.get(tid, function(tab) 
        {   
            bm.initTab(tab, fn);
        });        
    },
    reInit : function()
    {
       bm.resetControl();
       bm.loaded=null;
       bm.charts=null;
    },   
    isTabValid : function(tab)
    {
        return (tab.url.indexOf("https://chrome.google.com") !== 0 && tab.url.indexOf("chrome://") !== 0  && tab.url.indexOf("chrome-extension://") !== 0);
    },   
    isTabChild : function(tab)
    {
        return (tab.url.indexOf(wx.runtime.id)>0);
    },
    /**
     * Reset Control
     */
    resetControl : function()
    {
        wx.runtime.sendMessage({type: 'tc_disableView'});
    },             
    /**
     * Content calls
     */
    doEnableViewChart : function()
    {        
        if (bm.tabid)
        {
            if (bm.charts===bm.tabid)
            {
                bm.doEnableView();
            }
            else
            {
                wx.tabs.sendMessage(bm.tabid, {type: 'cc_charts'}, function(response) 
                {
                    if (response)
                    {
                        bm.charts = response.status?bm.tabid:null;
                    }
                    if (bm.charts===bm.tabid)
                    {
                        bm.doEnableView();
                    }
                    else
                    {
                        bm.charts=bm.tabid;
                        wx.tabs.executeScript(bm.tabid, {file:'js/lib/Chart.min.js'}, bm.doEnableView);                                    
                    }                  
                });
            }
        }
    },      
    /**
     * Content calls
     */
    doEnableView : function()
    {        
        if (bm.tabid)
        {
            if (bm.loaded===bm.tabid)         
            {
                bm.enableView();
            }
            else
            {
                wx.tabs.sendMessage(bm.tabid, {type: 'cc_loaded'}, function(response) 
                {
                    if (response)
                    {
                        bm.loaded = response.status?bm.tabid:null;                
                    }               
                    if (bm.loaded===bm.tabid)
                    {
                        bm.enableView() ;
                    }                
                    else
                    {
                        bm.loaded=bm.tabid;
                        wx.tabs.insertCSS(bm.tabid, {file:'css/content.css'}); 
                        wx.tabs.executeScript(bm.tabid, {file: "js/ccomp/ch.js" },function() 
                        {
                            wx.tabs.executeScript(bm.tabid, {file:'js/wap/ccomp/cp.js'},function()
                            {
                                wx.tabs.executeScript(bm.tabid, {file:'js/ccomp/cc.js'}, bm.enableView);
                            });
                        });                                                        
                    }  
                });
            }
        }
    },    
    enableView : function()
    {
        wx.tabs.executeScript(bm.tabid, {code:'cc.enableView('+bm.tabid+','+bm.charts+')'}, 
        function(result)
        {
            var lastErr = chrome.runtime.lastError;
            if (lastErr) 
            {
                console.log('bm.enableView tab: ' + bm.tabid + ' lastError: ' + JSON.stringify(lastErr));
            }
            else
            {
                bm.clipboard='';
                setTimeout(function()
                {
                    wx.tabs.get(bm.tabid, function(tab) 
                    {   
                        wx.windows.update(tab.windowId, {"focused":true}); 
                    });
                },200);                
            }
        });
    },
    disableView : function()
    {
        if (bm.tabid && bm.loaded)
        {
            wx.tabs.executeScript(bm.tabid, {code:'cc.disableView('+bm.tabid+')'}, function(result){
            var lastErr = chrome.runtime.lastError;
            if (lastErr) 
            {
                console.log('bm.disableView tab: ' + bm.tabid + ' lastError: ' + JSON.stringify(lastErr));
            }});
        }     
    },    
    onCopy : function(text)
    {
        var input = document.createElement('textarea');
        document.body.appendChild(input);
        input.value = text;
        input.focus();
        input.select();
        document.execCommand('Copy');
        input.remove();        
    },
    onAddCopy : function(text)
    {
        bm.clipboard+=text;
        bm.onCopy(bm.clipboard);
    },
    onTabChanged : function(tabid)
    {
        bm.tabChanged(tabid, function()
        {
            bm.disableView() ;
            bm.resetControl();           
        });        
    },
    onSizeChanged : function()
    {
        if (bm.winid)
        {
            wx.windows.get(bm.winid, null, function(w)
            { 
                if (!wx.runtime.lastError && w) 
                {
                    bm.persist.set({'wTags':{'left':w.left,'top':w.top,'width':w.width,'height':w.height}});
                }
            });
        }
    },
    startHighligth :function()
    {
        if (!bm.timeoutID)
        {
            wx.windows.update(bm.winid, {"drawAttention":true});
        }        
    },
    stopHighlight : function()
    {
        bm.timeoutID=null;
        wx.windows.update(bm.winid, {"drawAttention":false});
    },
    createWindow : function(item)
    {
        var r=item.wTags||{'left':0,'top':window.screen.availHeight-200,'width':window.screen.width,'height':200};
        wx.windows.create({url: "tags.html", type:"popup", left:(r.left||0), top:r.top, width:r.width, height:r.height}, 
        function(w)
        {
            bm.winid=w.id;
        });
    }
};
/*****************************************************************
 * Browser action listeners
 */
/**
 * Extension activation listener
 */
wx.browserAction.onClicked.addListener(function(tab) 
{     
    wx.windows.getCurrent(function(win) 
    {
        if (bm.winid) 
        {
            wx.windows.update(bm.winid, {"focused":true}); 
        }
        else
        {       
            bm.tabid=bm.isTabValid(tab)?tab.id:null;    
            bm.persist.get('wTags', bm.createWindow);// initialize bm.winid
            wx.browserAction.setIcon({path: "img/19.png"});
            bm.loaded = false;
        }
    });
});

/*****************************************************************
 * Runtime listeners
 */
/**
 * Installation Listener (check whether new version is installed)
 */
if (wx.runtime.onInstalled)
{
	wx.runtime.onInstalled.addListener(function(details)
	{
        if(details.reason === "install" /*|| details.reason === "update"*/)
        {
            wx.tabs.create( {url: bps.url[details.reason]} );
        }
	});
}
/**
 * Message listener
 */
wx.runtime.onMessage.addListener(function(message, sender, sendResponse) 
{
    if (message)
    {    
        switch (message.type)
        {
        case 'bm_copy':
            bm.onCopy(message.text);
            break;
        case 'bm_addcopy':
            bm.onAddCopy(message.text);
            break;            
        case 'bm_resize':
            bm.onSizeChanged();
            break;
        case 'bm_newtag':
            bm.startHighligth();
            wx.windows.update(bm.winid, {"focused":true}); 
            break ;   
        case 'bm_enableView':   
            if (bm.tabid)
            {
                bm.charts=null;                
                bm.doEnableView() ;
            }
            else
            {
                bm.reInit();
            }                               
            break ;    
        case 'bm_enableViewChart':   
            if (bm.tabid)
            {
                bm.doEnableViewChart() ;
            }
            else
            {
                bm.reInit();
            }                               
            break ;                       
        case 'bm_disableView':       
            bm.disableView() ;                
            break ;
        }
    }
});


/*****************************************************************
 * Windows listeners
 */
/**
 * Close Tag window listener
 */
wx.windows.onRemoved.addListener(function(windowId)
{
    if (windowId === bm.winid) 
    {
        bm.disableView() ;
        bm.tabid = null;
        bm.winid = null;                
        wx.browserAction.setIcon({path: "img/19bw.png"});
    }  
});
/**
 * Focus listener
 */
wx.windows.onFocusChanged.addListener(function(windowId)
{
   if (bm.winid && bm.winid!==windowId)
   {
        bm.onSizeChanged();       
        wx.tabs.getSelected(windowId, function(tab)
        {
            if (tab.id!==bm.tabid)
            {
                bm.onTabChanged(tab.id);
            }
        }); 
   }    
});

/*****************************************************************
 * Tabs listeners
 */
/**
 * Tab activation listener
 */
wx.tabs.onActivated.addListener(function(activeInfo) 
{
    if (bm.tabid!==activeInfo.tabId && bm.winid && bm.winid!==activeInfo.windowId)
    {
        bm.onTabChanged(activeInfo.tabId);
    }   
});
/**
 * Tab removal listener
 */
wx.tabs.onRemoved.addListener(function(tabId) 
{
   if (bm.tabid === tabId)
   {
       bm.tabid=null;        
       bm.reInit();        
   }
});
/**
 * Tab load listener
 */
wx.tabs.onUpdated.addListener(function(tabid, changeInfo, tab) 
{
   if (changeInfo.status==='loading')
   {
       /* Current tab reload */
       if (bm.tabid === tabid)
       {
           bm.reInit();
       }
       /* New tab load */
       else if (!bm.tabid)
       {
           bm.tabChanged(tabid);
       }
    }
});

